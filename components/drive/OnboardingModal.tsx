"use client";

import { useEffect, useRef } from "react";
import { ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";

export function OnboardingModal() {
  const { user, mutate } = useAuth();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME || "telegramdrive_bot";

  const needsOnboarding = user && !user.bot_chat_id;

  useEffect(() => {
    if (!needsOnboarding) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }

    pollRef.current = setInterval(() => {
      mutate();
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [needsOnboarding, mutate]);

  if (!needsOnboarding) return null;

  const botUrl = `https://t.me/${botUsername}?start=${user?.id}`;

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl">One more step! 🚀</DialogTitle>
          <DialogDescription className="text-center mt-2">
            Connect our bot to enable file storage on Telegram
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="bg-[#0f0f0f] rounded-xl p-4 border border-[#2a2a2a]">
            <div className="space-y-3">
              {[
                { step: "1", text: "Click the button below to open the bot" },
                { step: "2", text: 'Send /start to the bot in Telegram' },
                { step: "3", text: "Come back here — setup completes automatically" },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center shrink-0 font-bold mt-0.5">
                    {item.step}
                  </div>
                  <p className="text-sm text-gray-300">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <a
            href={botUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full h-12 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.93 6.47l-1.62 7.64c-.12.54-.44.67-.89.42l-2.46-1.81-1.19 1.14c-.13.13-.24.24-.5.24l.18-2.51 4.61-4.16c.2-.18-.04-.28-.31-.1L7.92 14.42l-2.42-.75c-.53-.16-.54-.53.11-.79l9.48-3.66c.44-.16.82.11.84.45z" />
            </svg>
            Open @{botUsername}
            <ExternalLink className="h-4 w-4 opacity-70" />
          </a>

          <div className="flex items-center gap-2 justify-center">
            <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            <p className="text-xs text-gray-500">Waiting for bot connection...</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
