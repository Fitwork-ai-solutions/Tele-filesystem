-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_id BIGINT UNIQUE NOT NULL,
  telegram_username TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT,
  photo_url TEXT,
  channel_id TEXT,
  bot_chat_id TEXT,
  total_storage_bytes BIGINT DEFAULT 0,
  file_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Folders table (supports nesting)
CREATE TABLE folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, parent_id, name)
);

-- Files table
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  telegram_file_id TEXT NOT NULL,
  telegram_message_id INTEGER,
  telegram_file_unique_id TEXT,
  thumbnail_file_id TEXT,
  is_starred BOOLEAN DEFAULT FALSE,
  is_trashed BOOLEAN DEFAULT FALSE,
  trashed_at TIMESTAMPTZ,
  share_token TEXT UNIQUE,
  share_expires_at TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_folder_id ON files(folder_id);
CREATE INDEX idx_files_is_trashed ON files(is_trashed);
CREATE INDEX idx_files_is_starred ON files(is_starred);
CREATE INDEX idx_files_name_search ON files USING GIN(to_tsvector('english', name));
CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_folders_parent_id ON folders(parent_id);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own data" ON users
  FOR ALL USING (id = auth.uid()::uuid);

CREATE POLICY "Users can only see their own folders" ON folders
  FOR ALL USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can only see their own files" ON files
  FOR ALL USING (user_id = auth.uid()::uuid);

-- Storage stats trigger
CREATE OR REPLACE FUNCTION update_user_storage()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users SET
      total_storage_bytes = total_storage_bytes + NEW.size_bytes,
      file_count = file_count + 1,
      updated_at = NOW()
    WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users SET
      total_storage_bytes = GREATEST(0, total_storage_bytes - OLD.size_bytes),
      file_count = GREATEST(0, file_count - 1),
      updated_at = NOW()
    WHERE id = OLD.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_storage
  AFTER INSERT OR DELETE ON files
  FOR EACH ROW EXECUTE FUNCTION update_user_storage();

-- Helper function for cascading path updates when folders are renamed/moved
CREATE OR REPLACE FUNCTION cascade_update_folder_paths(
  old_path TEXT,
  new_path TEXT,
  user_id_param UUID
)
RETURNS void AS $$
BEGIN
  UPDATE folders
  SET path = new_path || SUBSTRING(path FROM LENGTH(old_path) + 1),
      updated_at = NOW()
  WHERE user_id = user_id_param
    AND path LIKE old_path || '/%';
END;
$$ LANGUAGE plpgsql;
