"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutGrid,
  List,
  Upload,
  LogOut,
  Settings,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ViewMode } from "@/types";

interface TopBarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onUpload: () => void;
  onSearch: (q: string) => void;
}

export function TopBar({ viewMode, onViewModeChange, onUpload, onSearch }: TopBarProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Logged out");
    router.push("/login");
  };

  const initials = user
    ? `${user.first_name[0]}${user.last_name?.[0] ?? ""}`.toUpperCase()
    : "?";

  return (
    <header className="flex items-center gap-4 px-6 py-3 border-b border-[#2a2a2a] bg-[#0f0f0f]">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              if (!e.target.value) onSearch("");
            }}
            className="w-full h-9 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg pl-9 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
      </form>

      <div className="flex items-center gap-2">
        {/* View toggle */}
        <div className="flex items-center bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-1 gap-1">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "grid"
                ? "bg-[#2a2a2a] text-white"
                : "text-gray-500 hover:text-white"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "list"
                ? "bg-[#2a2a2a] text-white"
                : "text-gray-500 hover:text-white"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        {/* Upload button */}
        <button
          onClick={onUpload}
          className="flex items-center gap-2 h-9 px-4 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Upload className="h-4 w-4" />
          Upload
        </button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-9 h-9 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-400 text-sm font-semibold flex items-center justify-center hover:bg-brand-500/30 transition-colors overflow-hidden">
              {user?.photo_url ? (
                <img
                  src={user.photo_url}
                  alt={user.first_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <div className="font-medium text-white truncate">
                {user?.first_name} {user?.last_name}
              </div>
              {user?.telegram_username && (
                <div className="text-xs text-gray-500 font-normal">
                  @{user.telegram_username}
                </div>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <UserIcon className="h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="gap-2 cursor-pointer text-red-400 focus:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
