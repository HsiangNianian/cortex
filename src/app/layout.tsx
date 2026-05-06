import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "认知防锈 | 你的认知状态怎么样？",
  description: "5 道题给你的认知能力拍一张快照。定期测量，看清趋势——认知能力就像肌肉，用进废退。",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className="antialiased">
      <body className="min-h-dvh bg-gradient-to-b from-background to-muted/30">
        {children}
      </body>
    </html>
  )
}
