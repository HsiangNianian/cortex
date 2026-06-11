import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import { buildOgImageUrl } from "@/lib/metadata-utils"

const ARTICLES = [
  "ai-making-you-dumber",
  "brain-fitness-guide",
  "how-cognitive-test-works",
] as const

const BASE_URL = "https://cortex.hydroroll.team"

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = []
  for (const locale of ["zh-CN", "en", "ja"]) {
    for (const slug of ARTICLES) {
      params.push({ locale, slug })
    }
  }
  return params
}

function articleJsonLd(title: string, excerpt: string, locale: string, slug: string) {
  const inLanguage = locale === "zh-CN" ? "zh-Hans" : locale === "ja" ? "ja" : "en"
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: excerpt,
    author: { "@type": "Person", name: "Hsiang Nianian" },
    datePublished: "2026-06-08",
    dateModified: "2026-06-08",
    url: `${BASE_URL}${locale === "zh-CN" ? "" : `/${locale}`}/articles/${slug}`,
    inLanguage,
    publisher: { "@type": "Organization", name: "Cognitive Rustproof", url: BASE_URL },
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  if (!ARTICLES.includes(slug as (typeof ARTICLES)[number])) return {}

  const t = await getTranslations({ locale, namespace: "articles" })
  const title = t.raw(`${slug}.title`) as string
  const excerpt = t.raw(`${slug}.excerpt`) as string

  const ogUrl = buildOgImageUrl({ index: 50, tierKey: "moderateDecline", correct: "?" })

  return {
    title: title + " · Cognitive Rustproof",
    description: excerpt,
    alternates: {
      canonical: `${BASE_URL}${locale === "zh-CN" ? "" : `/${locale}`}/articles/${slug}`,
      languages: {
        "zh-Hans": `${BASE_URL}/articles/${slug}`,
        en: `${BASE_URL}/en/articles/${slug}`,
        ja: `${BASE_URL}/ja/articles/${slug}`,
      },
    },
    openGraph: {
      title: title + " · Cognitive Rustproof",
      description: excerpt,
      type: "article",
      publishedTime: "2026-06-08",
      authors: ["Hsiang Nianian"],
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: title + " · Cognitive Rustproof",
      description: excerpt,
      images: [ogUrl],
    },
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!ARTICLES.includes(slug as (typeof ARTICLES)[number])) notFound()

  const t = await getTranslations({ locale, namespace: "articles" })
  const listT = await getTranslations({ locale, namespace: "articles.list" })
  const title = t.raw(`${slug}.title`) as string
  const excerpt = t.raw(`${slug}.excerpt`) as string
  const body = t.raw(`${slug}.body`) as string[]

  return (
    <div className="min-h-dvh bg-gradient-to-b from-background to-muted/30">
      <div className="mx-auto max-w-2xl p-4 md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/articles">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          </div>
        </div>

        <article className="prose prose-neutral dark:prose-invert max-w-none">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(articleJsonLd(title, excerpt, locale, slug)),
            }}
          />
          <div
            dangerouslySetInnerHTML={{
              __html: body.join("\n"),
            }}
          />
        </article>

        <div className="mt-12 rounded-xl border bg-card p-6 text-center">
          <h2 className="text-base font-semibold">
            {t.raw("list.cta") as string}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {excerpt}
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium h-9 px-4"
          >
            {t.raw("list.cta") as string}
          </Link>
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          <Link href="/articles" className="hover:underline underline-offset-4">
            ← {listT("title")}
          </Link>
        </div>
      </div>
    </div>
  )
}
