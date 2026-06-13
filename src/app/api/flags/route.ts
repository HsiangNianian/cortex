import { NextResponse } from "next/server"

// GET: return flag counts for all questions or a specific one
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const qid = searchParams.get("qid")

  try {
    if (qid) {
      const raw = await (process.env as any).CORTEX_KV?.get?.(`flag:v1:${qid}`) ?? "0"
      return NextResponse.json({ qid, count: parseInt(String(raw), 10) || 0 })
    }
    // List all flagged questions
    const result: Record<string, number> = {}
    const list = await (process.env as any).CORTEX_KV?.list?.({ prefix: "flag:v1:" }) ?? { keys: [] }
    for (const key of list.keys || []) {
      const raw = await (process.env as any).CORTEX_KV?.get?.(key.name) ?? "0"
      result[key.name.replace("flag:v1:", "")] = parseInt(String(raw), 10) || 0
    }
    return NextResponse.json(result)
  } catch (err) {
    console.error("[flags] GET error:", err)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}

// POST: increment flag counter for a question
export async function POST(request: Request) {
  try {
    const { questionId } = (await request.json()) as { questionId?: string }
    if (!questionId || !questionId.includes(":")) {
      return NextResponse.json({ error: "invalid questionId" }, { status: 400 })
    }

    const key = `flag:v1:${questionId}`
    // Atomic increment — KV supports string-based counters
    const prev = await (process.env as any).CORTEX_KV?.get?.(key)
    const next = (parseInt(String(prev ?? "0"), 10) || 0) + 1
    await (process.env as any).CORTEX_KV?.put?.(key, String(next))

    return NextResponse.json({ questionId, count: next })
  } catch (err) {
    console.error("[flags] POST error:", err)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
