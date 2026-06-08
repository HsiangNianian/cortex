import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

const ARTICLES = [
  { slug: "ai-making-you-dumber", date: "2026-06-08" },
  { slug: "brain-fitness-guide", date: "2026-06-08" },
  { slug: "how-cognitive-test-works", date: "2026-06-08" },
]

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "articles.list" })

  return {
    title: t("title") + " · Cognitive Rustproof",
    description: t("intro"),
    openGraph: {
      title: t("title") + " · Cognitive Rustproof",
      description: t("intro"),
      type: "website",
    },
  }
}

export default async function ArticlesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "articles.list" })
  const articleT = await getTranslations({ locale, namespace: "articles" })

  return (
    <div className="min-h-dvh bg-gradient-to-b from-background to-muted/30">
      <div className="mx-auto max-w-2xl p-4 md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              {t("title")}
            </h1>
            <p className="text-xs text-muted-foreground">{t("intro")}</p>
          </div>
        </div>

        <div className="space-y-4">
          {ARTICLES.map((article) => {
            const title = articleT.raw(`${article.slug}.title`) as string
            const excerpt = articleT.raw(`${article.slug}.excerpt`) as string
            return (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}`}
                className="block rounded-xl border bg-card p-5 transition-shadow hover:shadow-md"
              >
                <h2 className="text-base font-semibold text-foreground">
                  {title}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {excerpt}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {t("publishedOn")} {article.date}
                  </span>
                  <span className="text-xs font-medium text-primary">
                    {t("readMore")} →
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-medium h-9 px-4"
          >
            {t("cta")}
          </Link>
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:underline underline-offset-4">
            {t("backToTest")}
          </Link>
        </div>
      </div>
    </div>
  )
}
