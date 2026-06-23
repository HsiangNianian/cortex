import { cookies } from "next/headers";
import { getAdminById, getSession as getDbSession } from "./d1";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "admin_session";

const BCRYPT_ROUNDS = 12;

/**
 * Verify the password against the stored hash.
 * Supports both bcrypt (new) and SHA-256 (legacy) hashes.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  // bcrypt hashes always start with "$2"
  if (stored.startsWith("$2")) {
    return bcrypt.compare(password, stored);
  }

  // Legacy SHA-256 hash (stored without prefix)
  const pepper = "cortex-admin-v1";
  const encoder = new TextEncoder();
  const data = encoder.encode(password + pepper);
  const hash = await crypto.subtle.digest("SHA-256", data).then((h) => {
    const bytes = new Uint8Array(h);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  });
  return hash === stored;
}

/**
 * Hash a password for storage using bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Generate a UUID v4 session ID.
 */
export function generateSessionId(): string {
  return crypto.randomUUID();
}

/**
 * Get the current admin from the session cookie.
 * Returns { id, username, role } or null if not authenticated.
 */
export async function getCurrentAdmin(): Promise<{
  id: number;
  username: string;
  role: string;
  nickname: string | null;
} | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
    if (!sessionId) return null;

    const session = await getDbSession(sessionId);
    if (!session) return null;

    const admin = await getAdminById(session.admin_id);
    if (!admin) return null;

    return {
      id: admin.id,
      username: admin.username,
      role: admin.role,
      nickname: admin.nickname,
    };
  } catch {
    return null;
  }
}
