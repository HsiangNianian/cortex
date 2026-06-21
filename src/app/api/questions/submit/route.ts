import { NextResponse } from "next/server"
import { submitQuestion } from "@/lib/community/d1"

const VALID_TYPES = ["logic", "math", "vocab", "event", "event-cause", "event-argument"]
const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@(qq\.com|gmail\.com)$/

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, question, options, correctAnswer, explanation, submitterEmail, submitterName } = body

    // --- Validation ---
    const errors: string[] = []

    if (!VALID_TYPES.includes(type)) {
      errors.push("Invalid question type")
    }
    if (!question || typeof question !== "string" || question.trim().length < 2) {
      errors.push("Question text must be at least 2 characters")
    }
    if (!Array.isArray(options) || options.length < 2 || options.some((o: unknown) => typeof o !== "string" || !o.trim())) {
      errors.push("At least 2 non-empty options are required")
    }
    if (typeof correctAnswer !== "number" || !Number.isInteger(correctAnswer) || correctAnswer < 0 || correctAnswer >= (options?.length ?? 0)) {
      errors.push("Invalid correct answer index")
    }
    if (!submitterEmail || !EMAIL_RE.test(submitterEmail)) {
      errors.push("Submitter email must be a valid @qq.com address")
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: "validation_failed", details: errors }, { status: 400 })
    }

    await submitQuestion({
      type,
      question: question.trim(),
      options: options.map((o: string) => o.trim()),
      correctAnswer,
      explanation: (explanation || "").trim(),
      submitterEmail: submitterEmail.trim(),
      submitterName: (submitterName || "").trim(),
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("POST /api/questions/submit error:", err)
    return NextResponse.json({ error: "internal error" }, { status: 500 })
  }
}
