import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookie } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";
import { deleteMessage } from "@/lib/telegram";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = await params;
    const db = createServerClient();
    const { data: file, error } = await db
      .from("files")
      .select("*")
      .eq("id", fileId)
      .eq("user_id", auth.userId)
      .single();

    if (error || !file) {
      return NextResponse.json({ data: null, error: "File not found" }, { status: 404 });
    }

    return NextResponse.json({ data: file, error: null });
  } catch (err) {
    console.error("GET /api/files/[fileId] error:", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = await params;
    const body = await request.json();
    const { name, folderId, isStarred, tags } = body;

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (folderId !== undefined) updates.folder_id = folderId;
    if (isStarred !== undefined) updates.is_starred = isStarred;
    if (tags !== undefined) updates.tags = tags;

    const db = createServerClient();
    const { data: file, error } = await db
      .from("files")
      .update(updates)
      .eq("id", fileId)
      .eq("user_id", auth.userId)
      .select()
      .single();

    if (error || !file) {
      return NextResponse.json({ data: null, error: "File not found or update failed" }, { status: 404 });
    }

    return NextResponse.json({ data: file, error: null });
  } catch (err) {
    console.error("PATCH /api/files/[fileId] error:", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = await params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get("permanent") === "true";

    const db = createServerClient();
    const { data: file, error: fetchError } = await db
      .from("files")
      .select("*")
      .eq("id", fileId)
      .eq("user_id", auth.userId)
      .single();

    if (fetchError || !file) {
      return NextResponse.json({ data: null, error: "File not found" }, { status: 404 });
    }

    if (permanent) {
      if (file.telegram_message_id) {
        const { data: user } = await db
          .from("users")
          .select("bot_chat_id")
          .eq("id", auth.userId)
          .single();
        if (user?.bot_chat_id) {
          await deleteMessage(user.bot_chat_id, file.telegram_message_id).catch(console.error);
        }
      }

      const { error: deleteError } = await db
        .from("files")
        .delete()
        .eq("id", fileId)
        .eq("user_id", auth.userId);

      if (deleteError) {
        return NextResponse.json({ data: null, error: "Failed to delete file" }, { status: 500 });
      }
    } else {
      const { error: updateError } = await db
        .from("files")
        .update({
          is_trashed: true,
          trashed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", fileId)
        .eq("user_id", auth.userId);

      if (updateError) {
        return NextResponse.json({ data: null, error: "Failed to trash file" }, { status: 500 });
      }
    }

    return NextResponse.json({ data: { id: fileId }, error: null });
  } catch (err) {
    console.error("DELETE /api/files/[fileId] error:", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
