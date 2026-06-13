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
