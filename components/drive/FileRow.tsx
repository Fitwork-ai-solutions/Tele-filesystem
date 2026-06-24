"use client";

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

interface FileRowProps {
  file: DriveFile;
  onPreview: (file: DriveFile) => void;
  onRename: (file: DriveFile) => void;
  onDelete: (file: DriveFile) => void;
  onStar: (file: DriveFile) => void;
  onDownload: (file: DriveFile) => void;
}

export function FileRow({
  file,
  onPreview,
  onRename,
  onDelete,
  onStar,
  onDownload,
}: FileRowProps) {
  const { icon, color } = getMimeIcon(file.mime_type);
  const Icon = iconMap[icon] || File;

  return (
    <div
      className="group flex items-center gap-3 px-4 py-2.5 hover:bg-[#1a1a1a] transition-colors rounded-lg cursor-pointer border border-transparent hover:border-[#2a2a2a]"
      onDoubleClick={() => onPreview(file)}
    >
      <div className="w-8 h-8 flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5" style={{ color }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-white font-medium truncate" title={file.name}>
          {file.name}
        </p>
        <p className="text-xs text-gray-500 truncate">{file.mime_type}</p>
      </div>

      <div className="hidden sm:block w-24 text-right">
        <span className="text-sm text-gray-400">{formatBytes(file.size_bytes)}</span>
      </div>

      <div className="hidden md:block w-36 text-right">
        <span className="text-sm text-gray-500">
          {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
        </span>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStar(file);
          }}
          className={`p-1.5 rounded-md transition-colors ${
            file.is_starred
              ? "text-yellow-400"
              : "text-gray-500 hover:text-yellow-400"
          }`}
        >
          <Star className={`h-4 w-4 ${file.is_starred ? "fill-current" : ""}`} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDownload(file);
          }}
          className="p-1.5 rounded-md text-gray-500 hover:text-white transition-colors"
        >
          <Download className="h-4 w-4" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 rounded-md text-gray-500 hover:text-white transition-colors"
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
    </div>
  );
}
