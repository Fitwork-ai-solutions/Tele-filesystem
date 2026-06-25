import { NextRequest, NextResponse } from "next/server";
import { validateTelegramAuth, signJWT, setAuthCookie } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase";
import { telegramAuthSchema } from "@/lib/validators";
import type { TelegramUser } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = telegramAuthSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: "Invalid request data" },
        { status: 400 }
      );
    }

    const telegramData = parsed.data as TelegramUser;

    if (!validateTelegramAuth(telegramData)) {
      return NextResponse.json(
        { data: null, error: "Invalid Telegram authentication" },
        { status: 401 }
      );
    }

    const db = createServerClient();

    const { data: user, error } = await db
      .from("users")
      .upsert(
        {
          telegram_id: telegramData.id,
          telegram_username: telegramData.username,
          first_name: telegramData.first_name,
          last_name: telegramData.last_name,
          photo_url: telegramData.photo_url,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "telegram_id" }
      )
      .select()
      .single();

    if (error || !user) {
      console.error("DB upsert error:", error);
      return NextResponse.json(
        { data: null, error: "Failed to create user" },
        { status: 500 }
      );
    }

    const token = signJWT({ userId: user.id, telegramId: telegramData.id });
    await setAuthCookie(token);

    return NextResponse.json({ data: user, error: null });
  } catch (err) {
    console.error("Telegram auth error:", err);
    return NextResponse.json(
      { data: null, error: "Internal server error" },
      { status: 500 }
    );
  }
}
