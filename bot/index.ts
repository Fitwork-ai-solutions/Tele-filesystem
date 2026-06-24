import "dotenv/config";
import { Bot } from "grammy";
import { handleCommands } from "./handlers/commands";

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);

handleCommands(bot);

bot.on("message:document", async (ctx) => {
  await ctx.reply(
    "📁 File received! Use the TelegramDrive web app to organize your files."
  );
});

bot.on("message:photo", async (ctx) => {
  await ctx.reply(
    "🖼 Photo received! Use the TelegramDrive web app to view and organize your photos."
  );
});

bot.on("message:video", async (ctx) => {
  await ctx.reply(
    "🎥 Video received! Use the TelegramDrive web app to view and manage your videos."
  );
});

bot.catch((err) => {
  console.error("Bot error:", err);
});

bot.start({
  onStart: () => console.log("TelegramDrive bot is running"),
});

export { bot };
