import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookie } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";
import { updateFolderSchema } from "@/lib/validators";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const { folderId } = await params;
    const body = await request.json();
    const parsed = updateFolderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ data: null, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const db = createServerClient();
    const { data: existing, error: fetchError } = await db
      .from("folders")
      .select("*")
      .eq("id", folderId)
      .eq("user_id", auth.userId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ data: null, error: "Folder not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    let newPath = existing.path;

    if (parsed.data.name !== undefined || parsed.data.parentId !== undefined) {
      const newName = parsed.data.name ?? existing.name;
      const newParentId = parsed.data.parentId !== undefined ? parsed.data.parentId : existing.parent_id;

      let parentPath = "";
      if (newParentId) {
        const { data: parent } = await db
          .from("folders")
          .select("path")
          .eq("id", newParentId)
          .eq("user_id", auth.userId)
          .single();
        parentPath = parent?.path ?? "";
      }

      newPath = `${parentPath}/${newName}`;
      updates.name = newName;
      updates.parent_id = newParentId;
      updates.path = newPath;
    }

    if (parsed.data.color !== undefined) {
      updates.color = parsed.data.color;
    }

    const { data: folder, error: updateError } = await db
      .from("folders")
      .update(updates)
      .eq("id", folderId)
      .eq("user_id", auth.userId)
      .select()
      .single();

    if (updateError || !folder) {
      return NextResponse.json({ data: null, error: "Failed to update folder" }, { status: 500 });
    }

    if (updates.path && updates.path !== existing.path) {
      try {
        await db.rpc("cascade_update_folder_paths", {
          old_path: existing.path,
          new_path: newPath,
          user_id_param: auth.userId,
        });
      } catch {
        // Non-fatal: path cascade failed, but main rename succeeded
      }
    }

    return NextResponse.json({ data: folder, error: null });
  } catch (err) {
    console.error("PATCH /api/folders/[folderId] error:", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ folderId: string }> }
) {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const { folderId } = await params;
    const { searchParams } = new URL(request.url);
    const moveFilesTo = searchParams.get("moveFilesTo");

    const db = createServerClient();

    const { data: folder, error: fetchError } = await db
      .from("folders")
      .select("*")
      .eq("id", folderId)
      .eq("user_id", auth.userId)
      .single();

    if (fetchError || !folder) {
      return NextResponse.json({ data: null, error: "Folder not found" }, { status: 404 });
    }

    await db
      .from("files")
      .update({ folder_id: moveFilesTo || null, updated_at: new Date().toISOString() })
      .eq("folder_id", folderId)
      .eq("user_id", auth.userId);

    const { data: childFolders } = await db
      .from("folders")
      .select("id")
      .eq("parent_id", folderId)
      .eq("user_id", auth.userId);

    if (childFolders?.length) {
      await db
        .from("folders")
        .delete()
        .in("id", childFolders.map((f) => f.id))
        .eq("user_id", auth.userId);
    }

    const { error: deleteError } = await db
      .from("folders")
      .delete()
      .eq("id", folderId)
      .eq("user_id", auth.userId);

    if (deleteError) {
      return NextResponse.json({ data: null, error: "Failed to delete folder" }, { status: 500 });
    }

    return NextResponse.json({ data: { id: folderId }, error: null });
  } catch (err) {
    console.error("DELETE /api/folders/[folderId] error:", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
