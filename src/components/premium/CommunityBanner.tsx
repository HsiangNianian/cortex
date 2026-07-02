"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ExternalLink, Gamepad2, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GAME_SITE_URL, QQ_GROUP_URL, DISCORD_INVITE_URL } from "@/lib/site-config";

export function CommunityBanner() {
  const n = useTranslations();
  const locale = useLocale();
  const isChinese = locale === "zh-CN";
  const [show, setShow] = useState(true);

  if (!show) return null;
  if (!QQ_GROUP_URL && !DISCORD_INVITE_URL && !GAME_SITE_URL) return null;

  const communityUrl = isChinese ? QQ_GROUP_URL : DISCORD_INVITE_URL;

  return (
    <div className="rounded-lg border border-primary/15 bg-primary/5 p-3 text-left">
      <div className="flex gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background text-primary shadow-sm">
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-foreground">{n("landing.communityTitle")}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {n("landing.communityDesc")}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="-mr-1 -mt-1 text-muted-foreground hover:text-foreground"
              aria-label={n("landing.communityDismiss")}
              onClick={() => setShow(false)}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {communityUrl && (
              <a
                href={communityUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-8 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {n("landing.communityJoinCta")}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
            {isChinese && GAME_SITE_URL && (
              <a
                href={GAME_SITE_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Gamepad2 className="h-3.5 w-3.5" aria-hidden="true" />
                {n("landing.communityGameCta")}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
