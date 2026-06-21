import { NextResponse } from "next/server"
import { getCurrentAdmin } from "@/lib/community/auth"

export async function GET() {
  try {
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }
    return NextResponse.json({ authenticated: true, admin })
  } catch (err) {
    console.error("GET /api/admin/check error:", err)
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}
