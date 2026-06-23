"use client";

import Link from "next/link";

const MSG: Record<string, { heading: string; message: string; home: string }> = {
  "zh-CN": {
    heading: "页面不存在",
    message: "你找的页面不存在，可能已被删除或链接有误。",
    home: "返回首页",
  },
  en: {
    heading: "Page not found",
    message: "The page you are looking for does not exist.",
    home: "Go back home",
  },
  ja: {
    heading: "ページが見つかりません",
    message: "お探しのページは存在しません。",
    home: "トップに戻る",
  },
};

export default function NotFound() {
  const locale = typeof window !== "undefined" ? document.documentElement.lang || "en" : "en";
  const msg = MSG[locale] ?? MSG.en;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-4 text-center">
      <p className="text-6xl font-bold text-muted-foreground/30">404</p>
      <h1 className="text-lg font-semibold">{msg.heading}</h1>
      <p className="text-sm text-muted-foreground">{msg.message}</p>
      <Link
        href="/"
        className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium h-9 px-4"
      >
        {msg.home}
      </Link>
    </div>
  );
}
