"use client";

import { useState, useCallback, use } from "react";
import { CloudUpload } from "lucide-react";
import { toast } from "sonner";
import { useFiles } from "@/hooks/useFiles";
import { useFolders } from "@/hooks/useFolders";
import { FileGrid } from "@/components/drive/FileGrid";
import { FileList } from "@/components/drive/FileList";
import { Breadcrumb } from "@/components/drive/Breadcrumb";
import { FilePreview } from "@/components/drive/FilePreview";
import { RenameModal } from "@/components/drive/RenameModal";
import { DeleteConfirm } from "@/components/drive/DeleteConfirm";
import type { DriveFile, Folder, ViewMode } from "@/types";

interface FolderPageProps {
  params: Promise<{ folderId: string }>;
}

export default function FolderPage({ params }: FolderPageProps) {
  const { folderId } = use(params);
  const { files, isLoading, mutate } = useFiles({ folderId });
  const { folders } = useFolders();

  const [viewMode] = useState<ViewMode>("grid");
  const [previewFile, setPreviewFile] = useState<DriveFile | null>(null);
  const [renameFile, setRenameFile] = useState<DriveFile | null>(null);
  const [deleteFile, setDeleteFile] = useState<DriveFile | null>(null);

  const currentFolder = folders.find((f: Folder) => f.id === folderId) ?? null;

  const handleDownload = useCallback((file: DriveFile) => {
    const a = document.createElement("a");
    a.href = `/api/files/${file.id}/download`;
    a.download = file.name;
    a.click();
  }, []);

  const handleStar = useCallback(
    async (file: DriveFile) => {
      try {
        const res = await fetch(`/api/files/${file.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isStarred: !file.is_starred }),
        });
        if (!res.ok) throw new Error();
        toast.success(file.is_starred ? "Removed from starred" : "Added to starred");
        mutate();
      } catch {
        toast.error("Failed to update file");
      }
    },
    [mutate]
  );

  const fileActions = {
    onPreview: setPreviewFile,
    onRename: setRenameFile,
    onDelete: setDeleteFile,
    onStar: handleStar,
    onDownload: handleDownload,
  };

  return (
    <div className="flex flex-col h-full">
      <Breadcrumb folder={currentFolder} />

      <div className="px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white">
          {currentFolder?.name ?? "Folder"}
        </h1>
        <span className="text-sm text-gray-500">{files.length} items</span>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : files.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
          <div className="w-20 h-20 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
            <CloudUpload className="h-10 w-10 text-gray-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white mb-1">
              This folder is empty
            </h3>
            <p className="text-sm text-gray-500">
              Drop files here or click Upload in the top bar
            </p>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <FileGrid files={files} {...fileActions} />
      ) : (
        <FileList files={files} {...fileActions} />
      )}

      <FilePreview
        file={previewFile}
        allFiles={files}
        onClose={() => setPreviewFile(null)}
        onNavigate={setPreviewFile}
      />

      <RenameModal
        file={renameFile}
        onClose={() => setRenameFile(null)}
        onRename={() => mutate()}
      />

      <DeleteConfirm
        file={deleteFile}
        onClose={() => setDeleteFile(null)}
        onDelete={() => mutate()}
      />
    </div>
  );
}
