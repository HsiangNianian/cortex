import { type Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { AutoRedirect } from "@/components/share-redirect"
import { getTierByIndex, getChallengeCopy } from "@/lib/scoring"
import { buildOgImageUrl, buildShareMetadataText } from "@/lib/metadata-utils"
import { parseRefParam } from "@/lib/url-utils"

export async function generateMetadata({
  searchParams,
  params,
}: {
  searchParams: Promise<{ ref?: string }>
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const sp = await searchParams
  const index = parseRefParam(sp.ref) ?? 50
  const tier = getTierByIndex(index)
  const challengeCopy = getChallengeCopy(tier.tierKey, index)
  const t = await getTranslations({ locale, namespace: "site" })
  const tierT = await getTranslations({ locale, namespace: "tier" })
  const { title, description } = buildShareMetadataText({
    siteTitle: t("title"),
    tierKey: tier.tierKey,
    tierLabel: tierT(tier.tierKey),
    index,
  })

  const ogUrl = buildOgImageUrl({
    index,
    tierKey: tier.tierKey,
    correct: "?",
    challenge: challengeCopy,
  })

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
  }
}

export default async function SharePage({
  searchParams,
  params: pageParams,
}: {
  searchParams: Promise<{ ref?: string }>
  params: Promise<{ locale: string }>
}) {
  const { locale } = await pageParams
  const t = await getTranslations({ locale, namespace: "share" })
  const params = await searchParams
  const ref = parseRefParam(params.ref)
  const refStr = ref !== null ? String(ref) : ""

  return (
    <>
      <AutoRedirect queryRef={refStr} />
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-4 text-center">
        <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-primary/5">
          <span className="text-2xl font-bold text-primary">?</span>
        </div>
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
        {ref !== null && (
          <Link
            href={"/?ref=" + ref}
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            {t("clickHere")}
          </Link>
        )}
      </div>
    </>
  )
}
