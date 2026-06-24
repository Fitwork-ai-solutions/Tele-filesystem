"use client";

import Link from "next/link";
import { ChevronRight, HardDrive } from "lucide-react";
import type { Folder } from "@/types";

interface BreadcrumbProps {
  folder: Folder | null;
  ancestors?: Folder[];
}

export function Breadcrumb({ folder, ancestors = [] }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1 px-6 py-3 border-b border-[#2a2a2a]">
      <Link
        href="/drive"
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <HardDrive className="h-4 w-4" />
        My Drive
      </Link>

      {ancestors.map((ancestor) => (
        <div key={ancestor.id} className="flex items-center gap-1">
          <ChevronRight className="h-4 w-4 text-gray-600" />
          <Link
            href={`/drive/${ancestor.id}`}
            className="text-sm text-gray-400 hover:text-white transition-colors truncate max-w-[120px]"
          >
            {ancestor.name}
          </Link>
        </div>
      ))}

      {folder && (
        <div className="flex items-center gap-1">
          <ChevronRight className="h-4 w-4 text-gray-600" />
          <span className="text-sm text-white font-medium truncate max-w-[200px]">
            {folder.name}
          </span>
        </div>
      )}
    </nav>
  );
}
