"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";

interface QQUser {
  id: number;
  openid: string;
  nickname: string | null;
  avatar: string | null;
}

const QQ_ICON = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="#1EBAFC"
    className="inline h-3.5 w-3.5 sm:mr-0.5"
  >
    <path d="M21.395 15.035a40 40 0 0 0-.803-2.264l-1.079-2.695c.001-.032.014-.562.014-.836C19.526 4.632 17.351 0 12 0S4.474 4.632 4.474 9.241c0 .274.013.804.014.836l-1.08 2.695a39 39 0 0 0-.802 2.264c-1.021 3.283-.69 4.643-.438 4.673.54.065 2.103-2.472 2.103-2.472 0 1.469.756 3.387 2.394 4.771-.612.188-1.363.479-1.845.835-.434.32-.379.646-.301.778.343.578 5.883.369 7.482.189 1.6.18 7.14.389 7.483-.189.078-.132.132-.458-.301-.778-.483-.356-1.233-.646-1.846-.836 1.637-1.384 2.393-3.302 2.393-4.771 0 0 1.563 2.537 2.103 2.472.251-.03.581-1.39-.438-4.673" />
  </svg>
);

export function QQLoginButton() {
  const [user, setUser] = useState<QQUser | null | "loading">("loading");
  const [dropdown, setDropdown] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/qq/status")
      .then((r) => (r.ok ? r.json() : Promise.resolve(null)))
      .then((data) => setUser(data?.authenticated ? data.user : null))
      .catch(() => setUser(null));
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    if (!dropdown) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdown]);

  const handleLogout = async () => {
    await fetch("/api/auth/qq/logout", { method: "POST" });
    setUser(null);
    setDropdown(false);
  };

  if (user === "loading") {
    return null;
  }

  if (!user) {
    return (
      <Link
        href="/api/auth/qq"
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {QQ_ICON}
        <span className="hidden sm:inline">QQ登录</span>
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setDropdown(!dropdown)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt=""
            className="h-5 w-5 rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          QQ_ICON
        )}
        <span className="hidden sm:inline max-w-[80px] truncate">{user.nickname || "QQ用户"}</span>
      </button>

      {dropdown && (
        <div className="absolute right-0 top-full mt-1 w-40 rounded-md border border-input bg-background shadow-lg z-50">
          <div className="px-3 py-2 text-xs text-muted-foreground border-b border-input truncate">
            {user.nickname || "QQ用户"}
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <LogOut className="h-3 w-3" />
            退出登录
          </button>
        </div>
      )}
    </div>
  );
}
