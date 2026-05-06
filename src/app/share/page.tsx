import { type Metadata } from "next"
import Link from "next/link"
import { AutoRedirect } from "@/components/share-redirect"

const TIERS = [
  { min: 0, max: 20, label: "认知巅峰", color: "#16a34a" },
  { min: 21, max: 40, label: "轻度退化", color: "#65a30d" },
  { min: 41, max: 60, label: "中度退化", color: "#d97706" },
  { min: 61, max: 80, label: "明显退化", color: "#ea580c" },
  { min: 81, max: 100, label: "严重退化", color: "#dc2626" },
]

function getTier(index: number) {
  return TIERS.find((t) => index >= t.min && index <= t.max) ?? TIERS[0]
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>
}): Promise<Metadata> {
  const params = await searchParams
  const ref = params.ref
  const index = ref ? Math.min(100, Math.max(0, Number(ref) || 50)) : 50
  const tier = getTier(index)

  const ogUrl = `/api/og?i=${index}&t=${encodeURIComponent(tier.label)}&c=?&n=5`

  return {
    openGraph: {
      title: `退化指数 ${index} — ${tier.label}`,
      description: `${index}/100 · 你的朋友在做认知防锈基线测试，你能超过 TA 吗？`,
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `退化指数 ${index} — ${tier.label}`,
      description: `${index}/100 · 你的朋友在做认知防锈基线测试，你能超过 TA 吗？`,
      images: [ogUrl],
    },
  }
}

export default async function SharePage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>
}) {
  const params = await searchParams
  const ref = params.ref ?? ""

  return (
    <>
      <AutoRedirect ref={ref} />
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-4 text-center">
        <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-primary/5">
          <span className="text-2xl font-bold text-primary">?</span>
        </div>
        <p className="text-sm text-muted-foreground">正在跳转...</p>
        <Link
          href={"/?ref=" + ref}
          className="text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          点击这里
        </Link>
      </div>
    </>
  )
}
