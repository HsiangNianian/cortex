import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { deleteSession } from "@/lib/community/d1"

const SESSION_COOKIE = "admin_session"

export async function POST() {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value
    if (sessionId) {
      await deleteSession(sessionId)
    }
    cookieStore.delete(SESSION_COOKIE)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("POST /api/admin/logout error:", err)
    return NextResponse.json({ error: "internal error" }, { status: 500 })
  }
}
