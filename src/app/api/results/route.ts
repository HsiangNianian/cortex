import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { saveResult } = await import("@/lib/storage")
    const { degradationIndex, tierLabel, aiUsageLevel, estimationMethod } = body

    if (typeof degradationIndex !== "number") {
      return NextResponse.json({ error: "invalid payload" }, { status: 400 })
    }

    await saveResult({
      degradationIndex,
      tierLabel,
      aiUsageLevel: aiUsageLevel ?? null,
      estimationMethod: estimationMethod === "irt" ? "irt" : "percentage",
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("POST /api/results error:", err)
    return NextResponse.json({ error: "internal error" }, { status: 500 })
  }
}
