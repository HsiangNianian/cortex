import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminByUsername, createSession, updateAdmin } from "@/lib/community/d1";
import { verifyPassword, hashPassword, generateSessionId } from "@/lib/community/auth";
import { createRateLimiter } from "@/lib/rate-limit";

const SESSION_COOKIE = "admin_session";

// 10 login attempts per IP per 15 minutes
const loginLimiter = createRateLimiter({ maxRequests: 10, windowMs: 15 * 60_000 });

export async function POST(request: Request) {
  try {
    // Rate limit by IP
    const ip =
      request.headers.get("cf-connecting-ip") ??
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    if (loginLimiter.check(`login:${ip}`)) {
      return NextResponse.json({ error: "too many requests" }, { status: 429 });
    }

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "username and password required" }, { status: 400 });
    }

    const admin = await getAdminByUsername(username);
    if (!admin) {
      return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
    }

    const valid = await verifyPassword(password, admin.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
    }

    // Migrate legacy SHA-256 hash to bcrypt on successful login
    if (!admin.password_hash.startsWith("$2")) {
      const newHash = await hashPassword(password);
      await updateAdmin(admin.id, { passwordHash: newHash });
    }

    const sessionId = generateSessionId();
    await createSession(sessionId, admin.id);

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({
      ok: true,
      admin: { id: admin.id, username: admin.username, role: admin.role },
    });
  } catch (err) {
    console.error("POST /api/admin/login error:", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
