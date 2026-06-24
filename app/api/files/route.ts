import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookie } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";
import { sendFileToChatId } from "@/lib/telegram";
import { sanitizeFilename } from "@/lib/utils";
import { fileQuerySchema } from "@/lib/validators";

const MAX_FILE_SIZE = (Number(process.env.MAX_FILE_SIZE_MB) || 2000) * 1024 * 1024;

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = fileQuerySchema.parse({
      folderId: searchParams.get("folderId") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      starred: searchParams.get("starred") ?? undefined,
      trashed: searchParams.get("trashed") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
      direction: searchParams.get("direction") ?? undefined,
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 50,
    });

    const db = createServerClient();
    let dbQuery = db
      .from("files")
      .select("*", { count: "exact" })
      .eq("user_id", auth.userId);

    if (query.trashed) {
      dbQuery = dbQuery.eq("is_trashed", true);
    } else {
      dbQuery = dbQuery.eq("is_trashed", false);
    }

    if (query.folderId !== undefined) {
      dbQuery = dbQuery.eq("folder_id", query.folderId);
    } else if (!query.trashed && !query.starred && !query.search) {
      dbQuery = dbQuery.is("folder_id", null);
    }

    if (query.starred) {
      dbQuery = dbQuery.eq("is_starred", true);
    }

    if (query.search) {
      dbQuery = dbQuery.textSearch("name", query.search, { type: "websearch" });
    }

    const sortField = query.sort || "created_at";
    const ascending = query.direction === "asc";
    dbQuery = dbQuery.order(sortField, { ascending });

    const offset = (query.page - 1) * query.limit;
    dbQuery = dbQuery.range(offset, offset + query.limit - 1);

    const { data: files, error, count } = await dbQuery;

    if (error) {
      console.error("List files error:", error);
      return NextResponse.json({ data: null, error: "Failed to list files" }, { status: 500 });
    }

    return NextResponse.json({
      data: files,
      total: count ?? 0,
      page: query.page,
      limit: query.limit,
      error: null,
    });
  } catch (err) {
    console.error("GET /api/files error:", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
      return NextResponse.json(
        { data: null, error: `File size exceeds maximum of ${process.env.MAX_FILE_SIZE_MB || 2000}MB` },
        { status: 413 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ data: null, error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { data: null, error: "File too large" },
        { status: 413 }
      );
    }

    const folderId = formData.get("folderId") as string | null;
    const tagsRaw = formData.get("tags") as string | null;
    const tags = tagsRaw ? JSON.parse(tagsRaw) : [];

    const db = createServerClient();
    const { data: user, error: userError } = await db
      .from("users")
      .select("bot_chat_id")
      .eq("id", auth.userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ data: null, error: "User not found" }, { status: 404 });
    }

    if (!user.bot_chat_id) {
      return NextResponse.json(
        { data: null, error: "Please start a chat with the bot first to enable file storage" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const safeName = sanitizeFilename(file.name);

    const tgResult = await sendFileToChatId(
      user.bot_chat_id,
      buffer,
      safeName,
      file.type || "application/octet-stream"
    );

    const { data: driveFile, error: insertError } = await db
      .from("files")
      .insert({
        user_id: auth.userId,
        folder_id: folderId || null,
        name: safeName,
        original_name: file.name,
        mime_type: file.type || "application/octet-stream",
        size_bytes: file.size,
        telegram_file_id: tgResult.file_id,
        telegram_message_id: tgResult.message_id,
        telegram_file_unique_id: tgResult.file_unique_id,
        thumbnail_file_id: tgResult.thumbnail_file_id || null,
        tags,
      })
      .select()
      .single();

    if (insertError || !driveFile) {
      console.error("Insert file error:", insertError);
      return NextResponse.json({ data: null, error: "Failed to save file" }, { status: 500 });
    }

    return NextResponse.json({ data: driveFile, error: null }, { status: 201 });
  } catch (err) {
    console.error("POST /api/files error:", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
