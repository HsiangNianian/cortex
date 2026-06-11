import { getRequestConfig } from "next-intl/server"
import { cookies, headers } from "next/headers"
import { routing } from "./routing"

const ACCEPT_LANG_MAP: Record<string, string> = {
  zh: "zh-CN",
  en: "en",
  ja: "ja",
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  // Fallback 1: NEXT_LOCALE cookie (set by locale layout on previous requests)
  if (!locale) {
    try {
      const cookieStore = await cookies()
      locale = cookieStore.get("NEXT_LOCALE")?.value
    } catch { /* not available yet */ }
  }

  // Fallback 2: accept-language header (best-effort for first request)
  if (!locale) {
    try {
      const headersList = await headers()
      const acceptLang = headersList.get("accept-language")
      if (acceptLang) {
        for (const lang of acceptLang.split(",")) {
          const code = lang.split(";")[0].trim().slice(0, 2)
          const mapped = ACCEPT_LANG_MAP[code]
          if (mapped) {
            locale = mapped
            break
          }
        }
      }
    } catch { /* not available */ }
  }

  // Final fallback
  if (!locale || !routing.locales.includes(locale as never)) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
