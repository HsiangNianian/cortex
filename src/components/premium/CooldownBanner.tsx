"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

interface CooldownBannerProps {
  cooldownEndsAt: number
  onClose: () => void
}

function formatRemaining(ms: number, t: ReturnType<typeof useTranslations>): string {
  const totalHours = Math.ceil(ms / (1000 * 60 * 60))
  const days = Math.floor(totalHours / 24)
  const hours = totalHours % 24
  if (days > 0 && hours > 0) return t("remainingDaysHours", { days, hours })
  if (days > 0) return t("remainingDays", { days })
  return t("remainingHours", { totalHours })
}

export function CooldownBanner({ cooldownEndsAt, onClose }: CooldownBannerProps) {
  const remainingMs = cooldownEndsAt - Date.now()
  const t = useTranslations("cooldown")
  const remaining = formatRemaining(remainingMs, t)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative w-full max-w-sm rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-2xl text-center dark:border-amber-800 dark:bg-amber-950">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute right-2 top-2 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
          aria-label={t("closeAria")}
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <p className="text-4xl font-bold text-amber-800 dark:text-amber-200 mt-2 tabular-nums">
          {remaining}
        </p>
        <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
          {t("cooldownLabel")}
        </p>
        <p className="mt-4 text-sm text-amber-700 dark:text-amber-300">
          {t("upgradePrompt")}
        </p>

        <div className="mt-4 flex flex-col gap-2">
          <Link
            href="/unlock"
            className="rounded-full bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
          >
            {t("unlockCta")}
          </Link>
          <a
            href="https://ifdian.net/a/HsiangNianian"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-amber-300 px-6 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-100 transition-colors dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900"
          >
            {t("afdianLink")}
          </a>
        </div>

        <p className="mt-3 text-xs text-amber-500/70 dark:text-amber-500/50">
          {t("warningText")}
        </p>
      </div>
    </div>
  )
}
