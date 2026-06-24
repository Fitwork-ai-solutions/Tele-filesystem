import type { Bot } from "grammy";
import { createServerClient } from "../../lib/supabase";

export function handleCommands(bot: Bot) {
  bot.command("start", async (ctx) => {
    const startParam = ctx.match;
    const chatId = String(ctx.chat.id);

    if (startParam) {
      const db = createServerClient();
      const { error } = await db
        .from("users")
        .update({
          bot_chat_id: chatId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", startParam);

      if (!error) {
        await ctx.reply(
          `🎉 <b>Welcome to TelegramDrive!</b>\n\nYour account is now connected. Head back to the web app to start uploading files.\n\n<b>Your storage is ready — drop any file in the web app!</b>`,
          { parse_mode: "HTML" }
        );
        return;
      }
    }

    await ctx.reply(
      `👋 <b>Welcome to TelegramDrive!</b>\n\nTo get started:\n1. Visit the web app\n2. Log in with Telegram\n3. Follow the setup instructions\n\nI'll store all your files securely on Telegram's servers!`,
      { parse_mode: "HTML" }
    );
  });

  bot.command("help", async (ctx) => {
    await ctx.reply(
      `📖 <b>TelegramDrive Help</b>\n\n` +
        `<b>Commands:</b>\n` +
        `/start — Connect your account\n` +
        `/stats — View your storage stats\n` +
        `/help — Show this message\n\n` +
        `<b>Upload files</b> via the web app at the URL provided during setup.\n\n` +
        `Files up to <b>2GB</b> are supported!`,
      { parse_mode: "HTML" }
    );
  });

  bot.command("stats", async (ctx) => {
    const chatId = String(ctx.chat.id);
    const db = createServerClient();

    const { data: user } = await db
      .from("users")
      .select("first_name, total_storage_bytes, file_count")
      .eq("bot_chat_id", chatId)
      .single();

    if (!user) {
      await ctx.reply(
        "❌ Account not connected. Please visit the web app to link your account."
      );
      return;
    }

    const storageGB = (user.total_storage_bytes / (1024 ** 3)).toFixed(2);

    await ctx.reply(
      `📊 <b>Storage Stats for ${user.first_name}</b>\n\n` +
        `📁 Files: <b>${user.file_count}</b>\n` +
        `💾 Storage used: <b>${storageGB} GB</b>\n` +
        `∞ Storage limit: <b>Unlimited</b>`,
      { parse_mode: "HTML" }
    );
  });
}
