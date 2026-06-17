import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"
import StatusClient from "./status-client"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "status" })
  return {
    title: t("pageTitle") + " · Cognitive Rustproof",
    description: t("pageSubtitle"),
    openGraph: {
      title: t("pageTitle") + " · Cognitive Rustproof",
      description: t("pageSubtitle"),
    },
    twitter: {
      card: "summary",
      title: t("pageTitle"),
      description: t("pageSubtitle"),
    },
  }
}

export default function StatusPage() {
  return <StatusClient />
}
