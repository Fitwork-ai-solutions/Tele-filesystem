# TelegramDrive

Use Telegram as free unlimited cloud storage with a clean Google Drive-like web UI.

## Features

- 📁 Drag & drop file upload (up to 2GB per file)
- 🗂 Folder organization with nested folders
- ⭐ Star important files for quick access
- 🔍 Full-text search across all files
- 👁 In-browser preview for images, PDFs, video, and audio
- 🔗 Public sharing links with optional expiry
- 📊 Storage usage dashboard
- 🔒 Secure — files on Telegram's servers, metadata in Supabase
- ⚡ Telegram CDN speeds for all file downloads

## Setup

### 1. Create a Telegram bot

- Message [@BotFather](https://t.me/BotFather) on Telegram
- `/newbot` → follow prompts → copy the token
- `/setdomain` → set your app URL (required for Login Widget)

### 2. Set up Supabase

- Create a project at [supabase.com](https://supabase.com)
- Run `schema.sql` in the SQL editor
- Copy your project URL and keys

### 3. Configure environment

```bash
cp .env.local.example .env.local
# Fill in all values in .env.local
```

Required env vars:
- `TELEGRAM_BOT_TOKEN` — from @BotFather
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key
- `JWT_SECRET` — run `openssl rand -hex 32`
- `NEXT_PUBLIC_BOT_USERNAME` — bot username without @

### 4. Run locally

```bash
npm install
npm run dev          # starts Next.js + bot concurrently
# or separately:
npm run dev:next     # Next.js only
npm run dev:bot      # bot only
```

### 5. Deploy to Railway

1. Push to GitHub
2. Create a new Railway project → connect your repo
3. Add all environment variables in the Railway dashboard
4. Set `NEXT_PUBLIC_APP_URL` to your Railway URL
5. Deploy — Railway auto-runs `npm run start` and `npm run bot`

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌───────────────┐
│   Web Browser   │────▶│  Next.js App │────▶│   Supabase    │
│  (React + SWR)  │     │  (API Routes)│     │  (PostgreSQL) │
└─────────────────┘     └──────┬───────┘     └───────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │ Telegram Bot │
                        │   (grammy)   │
                        └──────┬───────┘
                               │
                               ▼
                        ┌──────────────┐
                        │   Telegram   │
                        │   Servers    │
                        │  (Storage)   │
                        └──────────────┘
```

- **Frontend**: Next.js 14 App Router + Tailwind CSS (custom dark theme)
- **Backend**: Next.js API Routes (Node.js)
- **Bot**: grammy (Node.js) — receives and stores files via Telegram API
- **Database**: Supabase (PostgreSQL) — stores file metadata, folders, users
- **Storage**: Telegram Bot API — stores actual file data, 2GB per file
- **Auth**: Telegram Login Widget + JWT in httpOnly cookies
- **Deployment**: Railway (two services: web + bot)

## File Upload Flow

1. User drags a file onto the web UI
2. File is POSTed to `/api/files` as multipart form data
3. API reads the file buffer and user's `bot_chat_id` from DB
4. API calls `sendDocument` on Telegram Bot API to send file to user's chat
5. Telegram stores the file, returns a permanent `file_id`
6. API saves file metadata + `file_id` to Supabase
7. UI refreshes — file appears in the grid

## Download Flow

1. User clicks Download (or double-clicks to preview)
2. Browser requests `/api/files/[fileId]/download`
3. API calls Telegram `getFile` to get a temporary CDN URL (~1 hour valid)
4. API proxies the response to the browser with correct headers
5. Bot token is never exposed to the client

## Security

- JWT stored in httpOnly cookies (not accessible to JavaScript)
- Telegram login hash verified with HMAC-SHA256 on every auth
- Every API call verifies file ownership via `.eq('user_id', userId)`
- Supabase service key used only server-side
- Filenames sanitized before storage
- Downloads proxied through API (bot token never exposed)
