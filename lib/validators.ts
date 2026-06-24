import { z } from "zod";

export const telegramAuthSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  photo_url: z.string().optional(),
  auth_date: z.number(),
  hash: z.string(),
});

export const createFolderSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name too long")
    .refine((n) => !n.includes("/") && !n.includes("\\"), {
      message: "Folder name cannot contain slashes",
    }),
  parentId: z.string().uuid().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export const updateFolderSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  parentId: z.string().uuid().nullable().optional(),
});

export const fileQuerySchema = z.object({
  folderId: z.string().uuid().optional(),
  search: z.string().optional(),
  starred: z.coerce.boolean().optional(),
  trashed: z.coerce.boolean().optional(),
  sort: z.enum(["name", "created_at", "size_bytes", "mime_type"]).optional(),
  direction: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
