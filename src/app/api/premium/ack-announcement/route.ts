import { NextResponse } from "next/server"
import { validateLicense } from "@/lib/auth/license"

export async function GET(request: Request) {
  try {
    const auth = request.headers.get("Authorization") ?? ""
    const licenseKey = auth.startsWith("Bearer ") ? auth.slice(7) : ""
    if (!licenseKey) {
      return NextResponse.json({ error: "missing_license" }, { status: 401 })
    }
    const license = await validateLicense(licenseKey)
    if (!license.valid) {
      return NextResponse.json({ error: "invalid_license" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const announcement = searchParams.get("announcement")
    if (!announcement) {
      return NextResponse.json({ error: "missing_announcement" }, { status: 400 })
    }

    const { env } = await import("@opennextjs/cloudflare").then((m) =>
      m.getCloudflareContext(),
    )

    const value = await env.CORTEX_KV.get(`announcement_ack:${licenseKey}:${announcement}`)

    return NextResponse.json({ seen: value !== null })
  } catch (err) {
    console.error("[premium/ack-announcement] Error:", err)
    return NextResponse.json({ error: "internal_error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const auth = request.headers.get("Authorization") ?? ""
    const licenseKey = auth.startsWith("Bearer ") ? auth.slice(7) : ""
    if (!licenseKey) {
      return NextResponse.json({ error: "missing_license" }, { status: 401 })
    }
    const license = await validateLicense(licenseKey)
    if (!license.valid) {
      return NextResponse.json({ error: "invalid_license" }, { status: 403 })
    }

    const { announcement } = await request.json()
    if (!announcement) {
      return NextResponse.json({ error: "missing_announcement" }, { status: 400 })
    }

    const { env } = await import("@opennextjs/cloudflare").then((m) =>
      m.getCloudflareContext(),
    )

    await env.CORTEX_KV.put(`announcement_ack:${licenseKey}:${announcement}`, new Date().toISOString())

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[premium/ack-announcement] Error:", err)
    return NextResponse.json({ error: "internal_error" }, { status: 500 })
  }
}
