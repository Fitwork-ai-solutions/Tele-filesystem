"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Star,
  Download,
  Pencil,
  Trash2,
  Image as ImageIcon,
  FileText,
  Video,
  Music,
  Archive,
  Code,
  Table,
  File,
} from "lucide-react";
import { formatBytes, getMimeIcon } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DriveFile } from "@/types";

const iconMap: Record<string, React.ElementType> = {
  image: ImageIcon,
  "file-text": FileText,
  video: Video,
  music: Music,
  archive: Archive,
  code: Code,
  table: Table,
  file: File,
};

interface FileCardProps {
  file: DriveFile;
  onPreview: (file: DriveFile) => void;
  onRename: (file: DriveFile) => void;
  onDelete: (file: DriveFile) => void;
  onStar: (file: DriveFile) => void;
  onDownload: (file: DriveFile) => void;
}

export function FileCard({
  file,
  onPreview,
  onRename,
  onDelete,
  onStar,
  onDownload,
}: FileCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { icon, color, bg } = getMimeIcon(file.mime_type);
  const Icon = iconMap[icon] || File;
  const isImage = file.mime_type.startsWith("image/");

  return (
    <div
      className="group relative bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden hover:border-[#3a3a3a] transition-all cursor-pointer"
      onDoubleClick={() => onPreview(file)}
    >
      {/* Thumbnail / Icon */}
      <div
        className="h-36 flex items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: bg + "22" }}
      >
        {isImage && file.telegram_file_id ? (
          <img
            src={`/api/files/${file.id}/download`}
            alt={file.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <Icon className="h-14 w-14 opacity-80" style={{ color }} />
        )}

        {/* Star button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStar(file);
          }}
          className={`absolute top-2 right-2 p-1.5 rounded-lg transition-all ${
            file.is_starred
              ? "opacity-100 text-yellow-400"
              : "opacity-0 group-hover:opacity-100 text-gray-400 hover:text-yellow-400"
          }`}
        >
          <Star className={`h-4 w-4 ${file.is_starred ? "fill-current" : ""}`} />
        </button>

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview(file);
            }}
            className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium"
          >
            Open
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start gap-2">
          <p
            className="text-sm text-white font-medium truncate flex-1 leading-tight"
            title={file.name}
          >
            {file.name}
          </p>

          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 p-1 rounded-md text-gray-500 hover:text-white hover:bg-[#2a2a2a] opacity-0 group-hover:opacity-100 transition-all -mr-1 -mt-0.5"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onClick={() => onDownload(file)} className="gap-2">
                <Download className="h-4 w-4" /> Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRename(file)} className="gap-2">
                <Pencil className="h-4 w-4" /> Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onStar(file)} className="gap-2">
                <Star className="h-4 w-4" />
                {file.is_starred ? "Unstar" : "Star"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(file)}
                className="gap-2 text-red-400 focus:text-red-400"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs text-gray-500">{formatBytes(file.size_bytes)}</span>
          <span className="text-xs text-gray-600">
            {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
}
