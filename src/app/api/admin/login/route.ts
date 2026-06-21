import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getAdminByUsername, createSession } from "@/lib/community/d1"
import { verifyPassword, generateSessionId } from "@/lib/community/auth"

const SESSION_COOKIE = "admin_session"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "username and password required" }, { status: 400 })
    }

    const admin = await getAdminByUsername(username)
    if (!admin) {
      return NextResponse.json({ error: "invalid credentials" }, { status: 401 })
    }

    const valid = await verifyPassword(password, admin.password_hash)
    if (!valid) {
      return NextResponse.json({ error: "invalid credentials" }, { status: 401 })
    }

    const sessionId = generateSessionId()
    await createSession(sessionId, admin.id)

    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return NextResponse.json({
      ok: true,
      admin: { id: admin.id, username: admin.username, role: admin.role },
    })
  } catch (err) {
    console.error("POST /api/admin/login error:", err)
    return NextResponse.json({ error: "internal error" }, { status: 500 })
  }
}
