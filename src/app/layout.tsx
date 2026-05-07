import type { Metadata } from "next"
import "./globals.css"
import { ThemeToggle } from "@/components/theme-toggle"
import { ServiceWorkerRegister } from "@/components/service-worker-register"
import { QUESTIONS_PER_TEST } from "@/lib/questions"

const metaDesc = `${QUESTIONS_PER_TEST} 道题给你的认知能力拍一张快照。定期测量，看清趋势——认知能力就像肌肉，用进废退。`
const ogImgUrl = `/api/og?i=50&t=%E4%B8%AD%E5%BA%A6%E9%80%80%E5%8C%96&c=0&n=${QUESTIONS_PER_TEST}`

export const metadata: Metadata = {
  metadataBase: new URL("https://cortex.hydroroll.team"),
  title: "认知防锈 | 你的认知状态怎么样？",
  description: metaDesc,
  icons: {
    icon: "/favicon.svg",
  },
  manifest: "/manifest.json",
  other: {
    "theme-color": "#1a1a1a",
  },
  openGraph: {
    title: "认知防锈 · 基线测试",
    description: metaDesc,
    type: "website",
    images: [
      {
        url: ogImgUrl,
        width: 1200,
        height: 630,
        alt: "认知防锈 · 基线测试",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "认知防锈 · 基线测试",
    description: metaDesc,
    images: [ogImgUrl],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className="antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('cortex-theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-dvh bg-gradient-to-b from-background to-muted/30">
        <div className="fixed right-4 top-4 z-50">
          <ThemeToggle />
        </div>
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  )
}
