export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface User {
  id: string;
  telegram_id: number;
  telegram_username?: string;
  first_name: string;
  last_name?: string;
  photo_url?: string;
  channel_id?: string;
  bot_chat_id?: string;
  total_storage_bytes: number;
  file_count: number;
  created_at: string;
}

export interface Folder {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  path: string;
  color: string;
  created_at: string;
  updated_at: string;
  children?: Folder[];
  file_count?: number;
}

export interface DriveFile {
  id: string;
  user_id: string;
  folder_id: string | null;
  name: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  telegram_file_id: string;
  telegram_message_id?: number;
  thumbnail_file_id?: string;
  is_starred: boolean;
  is_trashed: boolean;
  trashed_at?: string;
  share_token?: string;
  share_expires_at?: string;
  tags: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface UploadTask {
  id: string;
  file: File;
  progress: number;
  status: 'queued' | 'uploading' | 'processing' | 'done' | 'error';
  error?: string;
  result?: DriveFile;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export type ViewMode = 'grid' | 'list';
export type SortField = 'name' | 'created_at' | 'size_bytes' | 'mime_type';
export type SortDirection = 'asc' | 'desc';
