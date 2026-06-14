import { NextResponse } from "next/server"
import { saveResult } from "@/lib/storage"
import { d1Run } from "@/lib/auth/d1-client"
import { TIER_KEYS } from "@/lib/scoring"
import { AI_CANONICAL_LEVELS } from "@/lib/constants"

export async function POST(request: Request) {
  try {
    // Reject automated requests (Vercel BotID)
    if (request.headers.get("x-vercel-bot") === "1") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { degradationIndex, tierLabel, aiUsageLevel, estimationMethod, elapsedMs } = body

    if (
      typeof degradationIndex !== "number" ||
      !Number.isInteger(degradationIndex) ||
      degradationIndex < 0 ||
      degradationIndex > 100 ||
      !(TIER_KEYS as readonly string[]).includes(tierLabel) ||
      (aiUsageLevel !== null &&
        aiUsageLevel !== undefined &&
        !(AI_CANONICAL_LEVELS as readonly string[]).includes(aiUsageLevel)) ||
      (estimationMethod !== undefined &&
        estimationMethod !== "percentage" &&
        estimationMethod !== "irt") ||
      (elapsedMs !== undefined && elapsedMs !== null && typeof elapsedMs !== "number")
    ) {
      return NextResponse.json({ error: "invalid payload" }, { status: 400 })
    }

    // Minimum test duration check (60 seconds)
    if (typeof elapsedMs === "number" && elapsedMs < 60_000) {
      return NextResponse.json({ error: "too fast" }, { status: 400 })
    }

    await saveResult({
      degradationIndex,
      tierLabel,
      aiUsageLevel: aiUsageLevel ?? null,
      estimationMethod: estimationMethod === "irt" ? "irt" : "percentage",
    })

    // Store per-question response records for IRT calibration (best-effort, silent fail)
    if (body.responses && Array.isArray(body.responses) && body.responses.length > 0) {
      const userId = typeof body.deviceId === "string" ? body.deviceId : "anon"
      const thetaVal = typeof body.theta === "number" ? body.theta : null
      for (const r of body.responses) {
        if (typeof r?.questionId !== "number") continue
        try {
          await d1Run(
            "INSERT INTO item_responses (question_id, user_id, correct, theta) VALUES (?, ?, ?, ?)",
            [r.questionId, userId, r.correct ? 1 : 0, thetaVal],
          )
        } catch {
          // Silently skip individual insert failures
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("POST /api/results error:", err)
    return NextResponse.json({ error: "internal error" }, { status: 500 })
  }
}
