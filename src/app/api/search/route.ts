import { NextResponse } from "next/server"
import { search } from "@/lib/search"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q") ?? ""
  const locale = searchParams.get("locale") ?? "zh-CN"
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10) || 20, 50)

  if (!q.trim()) {
    return NextResponse.json({ results: [], query: q })
  }

  try {
    // Fetch calibrated IRT params (best-effort)
    let calibratedParams: Record<string, { a: number; b: number }> = {}
    try {
      const { env } = await import("@opennextjs/cloudflare").then((m) =>
        m.getCloudflareContext(),
      )
      if (env.CORTEX_KV) {
        const raw = await env.CORTEX_KV.get("calibrated_params:all")
        if (raw) calibratedParams = JSON.parse(raw)
      }
    } catch {}

    const results = search(q, locale, limit)
    return NextResponse.json({
      results: results.map((r) => ({
        id: r.question.id,
        type: r.question.type,
        category: r.question.category,
        question: r.question.question,
        options: r.question.options,
        answer: r.question.answer,
        explanation: r.question.explanation,
        difficulty: r.question.difficulty,
        calibratedDifficulty: calibratedParams[r.question.id]?.b ?? null,
        score: r.score,
      })),
      query: q,
      total: results.length,
    })
  } catch (err) {
    console.error("[search] Error:", err)
    return NextResponse.json({ error: "search failed" }, { status: 500 })
  }
}
