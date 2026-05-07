import { NextResponse } from "next/server"
import { saveResult } from "@/lib/storage"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { degradationIndex, tierLabel, aiUsageLevel } = body

    if (typeof degradationIndex !== "number") {
      return NextResponse.json({ error: "invalid payload" }, { status: 400 })
    }

    await saveResult({
      degradationIndex,
      tierLabel,
      aiUsageLevel: aiUsageLevel ?? null,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("POST /api/results error:", err)
    return NextResponse.json({ error: "internal error" }, { status: 500 })
  }
}
