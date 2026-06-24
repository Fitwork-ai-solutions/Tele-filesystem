"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HardDrive,
  Star,
  Clock,
  Trash2,
  FolderPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FolderTree } from "@/components/drive/FolderTree";
import { StorageBar } from "@/components/layout/StorageBar";
import { useFolders } from "@/hooks/useFolders";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { NewFolderModal } from "@/components/drive/NewFolderModal";

const navItems = [
  { href: "/drive", label: "My Drive", icon: HardDrive },
  { href: "/drive?starred=true", label: "Starred", icon: Star },
  { href: "/drive?sort=created_at&direction=desc", label: "Recent", icon: Clock },
  { href: "/drive?trashed=true", label: "Trash", icon: Trash2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { folders } = useFolders();
  const { user } = useAuth();
  const [showNewFolder, setShowNewFolder] = useState(false);

  return (
    <>
      <aside className="flex flex-col h-full bg-[#111] border-r border-[#2a2a2a] w-60 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-5 border-b border-[#2a2a2a]">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.93 6.47l-1.62 7.64c-.12.54-.44.67-.89.42l-2.46-1.81-1.19 1.14c-.13.13-.24.24-.5.24l.18-2.51 4.61-4.16c.2-.18-.04-.28-.31-.1L7.92 14.42l-2.42-.75c-.53-.16-.54-.53.11-.79l9.48-3.66c.44-.16.82.11.84.45z" />
            </svg>
          </div>
          <span className="font-bold text-white text-base">TelegramDrive</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 scrollbar-hide">
          <div className="space-y-0.5 mb-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href === "/drive" && pathname === "/drive");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-brand-500/20 text-white font-medium"
                      : "text-gray-400 hover:bg-[#2a2a2a] hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Folders section */}
          <div className="mt-4">
            <div className="flex items-center justify-between px-3 mb-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Folders</span>
              <button
                onClick={() => setShowNewFolder(true)}
                className="text-gray-500 hover:text-white transition-colors p-0.5 rounded"
                title="New folder"
              >
                <FolderPlus className="h-3.5 w-3.5" />
              </button>
            </div>
            {folders.length === 0 ? (
              <p className="px-3 py-2 text-xs text-gray-600">No folders yet</p>
            ) : (
              <FolderTree folders={folders} />
            )}
          </div>
        </nav>

        {/* Bottom: storage */}
        {user && <StorageBar user={user} />}
      </aside>

      <NewFolderModal
        open={showNewFolder}
        onClose={() => setShowNewFolder(false)}
      />
    </>
  );
}
