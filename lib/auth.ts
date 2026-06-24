import crypto from "crypto";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import type { TelegramUser } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET!;
const COOKIE_NAME = "tgdrive_token";

export function validateTelegramAuth(data: TelegramUser): boolean {
  const { hash, ...params } = data;

  const dataCheckString = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key as keyof typeof params]}`)
    .join("\n");

  const secretKey = crypto
    .createHash("sha256")
    .update(process.env.TELEGRAM_BOT_TOKEN!)
    .digest();

  const computedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  const isHashValid = computedHash === hash;
  const isRecent = Date.now() / 1000 - Number(params.auth_date) < 86400;

  return isHashValid && isRecent;
}

export function signJWT(payload: {
  userId: string;
  telegramId: number;
}): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyJWT(
  token: string
): { userId: string; telegramId: number } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as {
      userId: string;
      telegramId: number;
    };
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function getAuthFromCookie(): Promise<{
  userId: string;
  telegramId: number;
} | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyJWT(token);
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
