import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/\.\./g, "-")
    .trim()
    .slice(0, 255);
}

type MimeIconResult = {
  icon: string;
  color: string;
  bg: string;
};

export function getMimeIcon(mimeType: string): MimeIconResult {
  if (mimeType.startsWith("image/"))
    return { icon: "image", color: "#9333ea", bg: "#f3e8ff" };
  if (mimeType.startsWith("video/"))
    return { icon: "video", color: "#ea580c", bg: "#fff7ed" };
  if (mimeType.startsWith("audio/"))
    return { icon: "music", color: "#db2777", bg: "#fdf2f8" };
  if (mimeType === "application/pdf")
    return { icon: "file-text", color: "#dc2626", bg: "#fef2f2" };
  if (
    mimeType.includes("word") ||
    mimeType.includes("document") ||
    mimeType === "application/msword"
  )
    return { icon: "file-text", color: "#2563eb", bg: "#eff6ff" };
  if (mimeType.includes("sheet") || mimeType.includes("excel"))
    return { icon: "table", color: "#16a34a", bg: "#f0fdf4" };
  if (mimeType.includes("zip") || mimeType.includes("archive") || mimeType.includes("tar") || mimeType.includes("gz"))
    return { icon: "archive", color: "#ca8a04", bg: "#fefce8" };
  if (
    mimeType.includes("javascript") ||
    mimeType.includes("typescript") ||
    mimeType.includes("json") ||
    mimeType.includes("html") ||
    mimeType.includes("css") ||
    mimeType.startsWith("text/")
  )
    return { icon: "code", color: "#0891b2", bg: "#ecfeff" };
  return { icon: "file", color: "#6b7280", bg: "#f9fafb" };
}

export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

export function buildFolderTree(
  folders: Array<{
    id: string;
    parent_id: string | null;
    [key: string]: unknown;
  }>
) {
  const map = new Map<string, (typeof folders)[0] & { children: typeof folders }>();
  const roots: typeof folders = [];

  folders.forEach((f) => {
    map.set(f.id, { ...f, children: [] });
  });

  folders.forEach((f) => {
    if (f.parent_id && map.has(f.parent_id)) {
      map.get(f.parent_id)!.children.push(map.get(f.id)!);
    } else {
      roots.push(map.get(f.id)!);
    }
  });

  return roots;
}
