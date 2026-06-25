import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookie } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";
import { createFolderSchema } from "@/lib/validators";
import { buildFolderTree } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const db = createServerClient();
    const { data: folders, error } = await db
      .from("folders")
      .select("*")
      .eq("user_id", auth.userId)
      .order("name");

    if (error) {
      console.error("List folders error:", error);
      return NextResponse.json({ data: null, error: "Failed to list folders" }, { status: 500 });
    }

    const tree = buildFolderTree(folders || []);
    return NextResponse.json({ data: tree, error: null });
  } catch (err) {
    console.error("GET /api/folders error:", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createFolderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, parentId, color } = parsed.data;
    const db = createServerClient();

    let parentPath = "";
    if (parentId) {
      const { data: parent, error: parentError } = await db
        .from("folders")
        .select("path")
        .eq("id", parentId)
        .eq("user_id", auth.userId)
        .single();

      if (parentError || !parent) {
        return NextResponse.json({ data: null, error: "Parent folder not found" }, { status: 404 });
      }
      parentPath = parent.path;
    }

    const path = `${parentPath}/${name}`;

    const { data: folder, error } = await db
      .from("folders")
      .insert({
        user_id: auth.userId,
        name,
        parent_id: parentId || null,
        path,
        color: color || "#6366f1",
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { data: null, error: "A folder with that name already exists here" },
          { status: 409 }
        );
      }
      console.error("Create folder error:", error);
      return NextResponse.json({ data: null, error: "Failed to create folder" }, { status: 500 });
    }

    return NextResponse.json({ data: folder, error: null }, { status: 201 });
  } catch (err) {
    console.error("POST /api/folders error:", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
