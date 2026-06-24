import FormData from "form-data";
import fetch from "node-fetch";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TG_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const TG_FILE_API = `https://api.telegram.org/file/bot${BOT_TOKEN}`;

interface TelegramFile {
  file_id: string;
  file_unique_id: string;
  file_size?: number;
  file_path?: string;
}

export interface SendFileResult {
  file_id: string;
  file_unique_id: string;
  message_id: number;
  thumbnail_file_id?: string;
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error = new Error("Unknown error");
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;
      if (i < maxRetries - 1) {
        await new Promise((r) => setTimeout(r, Math.pow(2, i) * 1000));
      }
    }
  }
  throw lastError;
}

export async function sendFileToChatId(
  chatId: string,
  buffer: Buffer,
  filename: string,
  mimeType: string,
  caption?: string
): Promise<SendFileResult> {
  return retryWithBackoff(async () => {
    const form = new FormData();
    form.append("chat_id", chatId);
    form.append("document", buffer, { filename, contentType: mimeType });
    if (caption) form.append("caption", caption);

    const fetchOptions = {
      method: "POST",
      body: form,
      headers: form.getHeaders() as Record<string, string>,
      timeout: Number(process.env.UPLOAD_TIMEOUT_MS) || 300000,
    };

    const response = await fetch(`${TG_API}/sendDocument`, fetchOptions as Parameters<typeof fetch>[1]);

    if (response.status === 429) {
      const retryAfter =
        parseInt(response.headers.get("retry-after") || "5") * 1000;
      await new Promise((r) => setTimeout(r, retryAfter));
      throw new Error("Rate limited — retrying");
    }

    if (!response.ok) {
      const error = (await response.json()) as { description: string };
      throw new Error(`Telegram API error: ${error.description}`);
    }

    const result = (await response.json()) as {
      ok: boolean;
      result: {
        message_id: number;
        document?: {
          file_id: string;
          file_unique_id: string;
          thumbnail?: { file_id: string };
        };
        photo?: Array<{ file_id: string; file_unique_id: string }>;
        video?: {
          file_id: string;
          file_unique_id: string;
          thumbnail?: { file_id: string };
        };
      };
    };

    if (!result.ok) throw new Error("Telegram API returned not ok");

    const msg = result.result;
    const fileObj =
      msg.document ||
      msg.video ||
      (msg.photo && msg.photo[msg.photo.length - 1]);

    if (!fileObj) throw new Error("No file object in Telegram response");

    return {
      file_id: fileObj.file_id,
      file_unique_id: fileObj.file_unique_id,
      message_id: msg.message_id,
      thumbnail_file_id:
        (msg.document as { thumbnail?: { file_id: string } })?.thumbnail
          ?.file_id ||
        (msg.video as { thumbnail?: { file_id: string } })?.thumbnail?.file_id,
    };
  });
}

export async function getFileDownloadUrl(fileId: string): Promise<string> {
  const response = await fetch(`${TG_API}/getFile?file_id=${fileId}`);
  const result = (await response.json()) as {
    ok: boolean;
    result: TelegramFile;
  };

  if (!result.ok || !result.result.file_path) {
    throw new Error("Could not get file path from Telegram");
  }

  return `${TG_FILE_API}/${result.result.file_path}`;
}

export async function deleteMessage(
  chatId: string,
  messageId: number
): Promise<void> {
  await fetch(`${TG_API}/deleteMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, message_id: messageId }),
  });
}

export async function sendMessage(chatId: string, text: string): Promise<void> {
  await fetch(`${TG_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}
