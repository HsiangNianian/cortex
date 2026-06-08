import type { MetadataRoute } from "next"

const BASE_URL = "https://cortex.hydroroll.team"

const LOCALES = ["zh-CN", "en", "ja"] as const

const STATIC_PATHS: { path: string; priority: number; changeFreq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1.0, changeFreq: "monthly" as const },
  { path: "/about", priority: 0.5, changeFreq: "monthly" as const },
  { path: "/stats", priority: 0.7, changeFreq: "daily" as const },
  { path: "/share", priority: 0.8, changeFreq: "weekly" as const },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  for (const { path, priority, changeFreq } of STATIC_PATHS) {
    const alternates: Record<string, string> = {}
    for (const locale of LOCALES) {
      const localePath = locale === "zh-CN" ? path : `/${locale}${path}`
      alternates[locale] = `${BASE_URL}${localePath}`
    }

    for (const locale of LOCALES) {
      const localePath = locale === "zh-CN" ? path : `/${locale}${path}`
      entries.push({
        url: `${BASE_URL}${localePath}`,
        lastModified: new Date(),
        changeFrequency: changeFreq,
        priority,
        alternates: {
          languages: alternates,
        },
      })
    }
  }

  return entries
}
