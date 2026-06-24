"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Folder, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Folder as FolderType } from "@/types";

interface FolderTreeProps {
  folders: FolderType[];
  level?: number;
}

function FolderNode({
  folder,
  level = 0,
}: {
  folder: FolderType & { children?: FolderType[] };
  level: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isActive = pathname === `/drive/${folder.id}`;
  const hasChildren = folder.children && folder.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors cursor-pointer",
          isActive
            ? "bg-brand-500/20 text-white"
            : "text-gray-400 hover:bg-[#2a2a2a] hover:text-white"
        )}
        style={{ paddingLeft: `${(level + 1) * 12}px` }}
      >
        {hasChildren ? (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="shrink-0 text-gray-500 hover:text-white"
          >
            <ChevronRight
              className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-90")}
            />
          </button>
        ) : (
          <span className="w-3.5 shrink-0" />
        )}

        <Link
          href={`/drive/${folder.id}`}
          className="flex items-center gap-2 flex-1 min-w-0"
        >
          {isActive || isOpen ? (
            <FolderOpen className="h-4 w-4 shrink-0" style={{ color: folder.color }} />
          ) : (
            <Folder className="h-4 w-4 shrink-0" style={{ color: folder.color }} />
          )}
          <span className="truncate">{folder.name}</span>
        </Link>
      </div>

      {isOpen && hasChildren && (
        <FolderTree folders={folder.children!} level={level + 1} />
      )}
    </div>
  );
}

export function FolderTree({ folders, level = 0 }: FolderTreeProps) {
  return (
    <div className="space-y-0.5">
      {folders.map((folder) => (
        <FolderNode key={folder.id} folder={folder} level={level} />
      ))}
    </div>
  );
}
