import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import StatsClient from "./stats-client"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "stats" })
  const ogUrl = `/api/og?i=50&t=moderateDecline&c=?&n=5`

  return {
    title: t("pageTitle") + " · Cognitive Rustproof",
    description: t("pageSubtitle"),
    openGraph: {
      title: t("pageTitle") + " · Cognitive Rustproof",
      description: t("pageSubtitle"),
      type: "website",
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("pageTitle") + " · Cognitive Rustproof",
      description: t("pageSubtitle"),
      images: [ogUrl],
    },
  }
}

export default function StatsPage() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-background to-muted/30">
      <div className="mx-auto max-w-2xl p-4 md:p-8">
        <StatsClient />
      </div>
    </div>
  )
}
