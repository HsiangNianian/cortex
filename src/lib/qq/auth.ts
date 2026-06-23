import { cookies } from "next/headers";
import { getQQUserById, getQQSession as getDbSession } from "./d1";

const SESSION_COOKIE = "qq_session";

/**
 * Generate a UUID v4 session ID.
 */
export function generateSessionId(): string {
  return crypto.randomUUID();
}

/**
 * Get the current QQ user from the session cookie.
 * Returns { id, openid, nickname, avatar } or null if not authenticated.
 */
export async function getCurrentQQUser(): Promise<{
  id: number;
  openid: string;
  nickname: string | null;
  avatar: string | null;
} | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
    if (!sessionId) return null;

    const session = await getDbSession(sessionId);
    if (!session) return null;

    const user = await getQQUserById(session.qq_user_id);
    if (!user) return null;

    return { id: user.id, openid: user.openid, nickname: user.nickname, avatar: user.avatar };
  } catch {
    return null;
  }
}

export { SESSION_COOKIE };
