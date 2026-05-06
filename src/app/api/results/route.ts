import { NextResponse } from "next/server"
import { saveResultAndUpdateStats } from "@/lib/blob"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { degradationIndex, tierLabel, correctCount, totalQuestions } = body

    if (typeof degradationIndex !== "number") {
      return NextResponse.json({ error: "invalid payload" }, { status: 400 })
    }

    await saveResultAndUpdateStats({
      degradationIndex,
      tierLabel,
      correctCount,
      totalQuestions,
      timestamp: Date.now(),
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "internal error" }, { status: 500 })
  }
}
