import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://cortex.hydroroll.team"),
  icons: {
    icon: "/favicon.svg",
  },
  other: {
    "theme-color": "#1a1a1a",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <script
        id="theme-init"
        dangerouslySetInnerHTML={{
          __html: `(function(){var t=localStorage.getItem('cortex-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}})()`,
        }}
      />
      {children}
    </>
  )
}
