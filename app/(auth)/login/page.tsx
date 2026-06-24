"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { TelegramUser } from "@/types";

declare global {
  interface Window {
    onTelegramAuth: (user: TelegramUser) => void;
    Telegram?: unknown;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const botUsername = process.env.NEXT_PUBLIC_BOT_USERNAME || "telegramdrive_bot";

  useEffect(() => {
    window.onTelegramAuth = async (user: TelegramUser) => {
      try {
        const res = await fetch("/api/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(user),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          toast.error(data.error || "Authentication failed");
          return;
        }

        toast.success(`Welcome, ${user.first_name}!`);
        router.push("/drive");
      } catch {
        toast.error("Failed to authenticate. Please try again.");
      }
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    script.async = true;

    const container = document.getElementById("telegram-login-btn");
    if (container) {
      container.innerHTML = "";
      container.appendChild(script);
    }
    scriptRef.current = script;

    return () => {
      if (scriptRef.current?.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
      }
    };
  }, [router, botUsername]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0f0f0f] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-brand-500 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-7 h-7 text-white fill-current"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.93 6.47l-1.62 7.64c-.12.54-.44.67-.89.42l-2.46-1.81-1.19 1.14c-.13.13-.24.24-.5.24l.18-2.51 4.61-4.16c.2-.18-.04-.28-.31-.1L7.92 14.42l-2.42-.75c-.53-.16-.54-.53.11-.79l9.48-3.66c.44-.16.82.11.84.45z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white">TelegramDrive</h1>
          </div>
          <p className="text-lg text-gray-400 font-medium">
            Your files. Powered by Telegram.
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Free unlimited storage · Up to 2GB per file · No credit card
          </p>
        </div>

        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-8">
          <h2 className="text-xl font-semibold text-white text-center mb-2">
            Sign in to get started
          </h2>
          <p className="text-gray-500 text-sm text-center mb-8">
            Use your Telegram account — no password needed
          </p>

          <div className="flex justify-center mb-6">
            <div id="telegram-login-btn" className="min-h-[48px] flex items-center justify-center">
              <div className="text-gray-600 text-sm">Loading login button...</div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-600">
            No account needed. Just your Telegram.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: "🔒", label: "Secure", desc: "Encrypted by Telegram" },
            { icon: "∞", label: "Unlimited", desc: "No storage cap" },
            { icon: "⚡", label: "Fast", desc: "Telegram CDN" },
          ].map((item) => (
            <div key={item.label} className="p-4 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a]">
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="text-white text-sm font-medium">{item.label}</div>
              <div className="text-gray-500 text-xs mt-1">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
