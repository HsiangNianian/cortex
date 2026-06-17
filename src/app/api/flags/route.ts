import { NextResponse } from "next/server"
import { getCloudflareContext } from "@opennextjs/cloudflare"

async function getKV() {
  const { env } = await getCloudflareContext()
  return (env as any).CORTEX_KV
}

// GET: return flag counts for all questions or a specific one
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const qid = searchParams.get("qid")

  try {
    const kv = await getKV()
    if (!kv) return NextResponse.json(qid ? { qid, count: 0 } : {})

    if (qid) {
      const raw = await kv.get(`flag:v1:${qid}`)
      return NextResponse.json({ qid, count: parseInt(String(raw ?? "0"), 10) || 0 })
    }
    // List all flagged questions
    const result: Record<string, number> = {}
    const list = await kv.list({ prefix: "flag:v1:" })
    for (const key of list.keys) {
      const raw = await kv.get(key.name)
      result[key.name.replace("flag:v1:", "")] = parseInt(String(raw ?? "0"), 10) || 0
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

    const kv = await getKV()
    if (!kv) return NextResponse.json({ error: "kv unavailable" }, { status: 500 })

    const key = `flag:v1:${questionId}`
    const prev = await kv.get(key)
    const next = (parseInt(String(prev ?? "0"), 10) || 0) + 1
    await kv.put(key, String(next))

    return NextResponse.json({ questionId, count: next })
  } catch (err) {
    console.error("[flags] POST error:", err)
    return NextResponse.json({ error: "failed" }, { status: 500 })
  }
}
