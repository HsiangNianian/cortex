import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { env } = await import("@opennextjs/cloudflare").then((m) =>
      m.getCloudflareContext(),
    )
    if (!env.CORTEX_KV) {
      return NextResponse.json({})
    }

    const raw = await env.CORTEX_KV.get("calibrated_params:all")
    if (!raw) {
      return NextResponse.json({})
    }

    const params = JSON.parse(raw)
    return NextResponse.json(params)
  } catch {
    // KV binding not available (local dev, etc.)
    return NextResponse.json({})
  }
}
