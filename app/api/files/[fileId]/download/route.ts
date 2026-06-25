import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookie } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";
import { getFileDownloadUrl } from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    const db = createServerClient();
    const { searchParams } = new URL(request.url);
    const shareToken = searchParams.get("token");

    let file;

    if (shareToken) {
      const { data, error } = await db
        .from("files")
        .select("*")
        .eq("id", fileId)
        .eq("share_token", shareToken)
        .single();

      if (error || !data) {
        return NextResponse.json({ data: null, error: "File not found or link expired" }, { status: 404 });
      }

      if (data.share_expires_at && new Date(data.share_expires_at) < new Date()) {
        return NextResponse.json({ data: null, error: "Share link has expired" }, { status: 410 });
      }

      file = data;
    } else {
      const auth = await getAuthFromCookie();
      if (!auth) {
        return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
      }

      const { data, error } = await db
        .from("files")
        .select("*")
        .eq("id", fileId)
        .eq("user_id", auth.userId)
        .single();

      if (error || !data) {
        return NextResponse.json({ data: null, error: "File not found" }, { status: 404 });
      }

      file = data;
    }

    const downloadUrl = await getFileDownloadUrl(file.telegram_file_id);

    const tgResponse = await fetch(downloadUrl);
    if (!tgResponse.ok) {
      return NextResponse.json({ data: null, error: "Failed to retrieve file from storage" }, { status: 502 });
    }

    const headers = new Headers();
    headers.set(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(file.name)}"`
    );
    headers.set("Content-Type", file.mime_type);
    if (tgResponse.headers.get("content-length")) {
      headers.set("Content-Length", tgResponse.headers.get("content-length")!);
    }
    headers.set("Cache-Control", "private, max-age=3600");

    return new NextResponse(tgResponse.body, {
      status: 200,
      headers,
    });
  } catch (err) {
    console.error("Download error:", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
