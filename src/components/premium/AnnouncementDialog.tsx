"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { usePremium } from "./usePremium";

export function AnnouncementDialog() {
  const n = useTranslations();
  const { isPremium, licenseKey } = usePremium();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isPremium) return;
    const key = "premium:announcement:ai_interpret:seen";
    if (localStorage.getItem(key)) return;
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShow(true);
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/premium/ack-announcement?announcement=ai_interpret", {
          headers: { Authorization: `Bearer ${licenseKey}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.seen) {
          localStorage.setItem(key, "true");
          return;
        }
        setShow(true);
      } catch {
        setShow(true);
      }
    })();
  }, [isPremium, licenseKey]);

  async function handleDismiss() {
    const key = "premium:announcement:ai_interpret:seen";
    localStorage.setItem(key, "true");
    setShow(false);
    if (process.env.NODE_ENV === "development") return;
    try {
      await fetch("/api/premium/ack-announcement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${licenseKey}`,
        },
        body: JSON.stringify({ announcement: "ai_interpret" }),
      });
    } catch {
      /* silent */
    }
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-2xl">
        <h3 className="text-lg font-semibold">{n("result.aiInterpretAnnounceTitle")}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {n("result.aiInterpretAnnounceDesc")}
        </p>
        <Button className="mt-5 w-full" onClick={handleDismiss}>
          {n("result.aiInterpretAnnounceCta")}
        </Button>
      </div>
    </div>
  );
}
