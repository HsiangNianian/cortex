import { d1Query, d1First, d1Run } from "@/lib/auth/d1-client";

export interface QQUserRow {
  id: number;
  openid: string;
  unionid: string | null;
  nickname: string | null;
  avatar: string | null;
  created_at: string;
  last_login_at: string;
}

export interface QQSessionRow {
  id: string;
  qq_user_id: number;
  created_at: string;
}

export async function findOrCreateQQUser(data: {
  openid: string;
  unionid?: string | null;
  nickname?: string | null;
  avatar?: string | null;
}): Promise<QQUserRow> {
  const existing = await d1First<QQUserRow>("SELECT * FROM qq_users WHERE openid = ?", [
    data.openid,
  ]);
  if (existing) return existing;

  await d1Run(
    `INSERT INTO qq_users (openid, unionid, nickname, avatar)
     VALUES (?, ?, ?, ?)`,
    [data.openid, data.unionid ?? null, data.nickname ?? null, data.avatar ?? null],
  );

  const created = await d1First<QQUserRow>("SELECT * FROM qq_users WHERE openid = ?", [
    data.openid,
  ]);
  if (!created) throw new Error("failed to create qq_user");
  return created;
}

export async function updateQQUserLogin(id: number): Promise<void> {
  await d1Run("UPDATE qq_users SET last_login_at = datetime('now') WHERE id = ?", [id]);
}

export async function createQQSession(sessionId: string, qqUserId: number): Promise<void> {
  await d1Run("INSERT INTO qq_sessions (id, qq_user_id) VALUES (?, ?)", [sessionId, qqUserId]);
}

export async function getQQSession(sessionId: string): Promise<QQSessionRow | null> {
  return d1First<QQSessionRow>("SELECT * FROM qq_sessions WHERE id = ?", [sessionId]);
}

export async function getQQUserById(id: number): Promise<QQUserRow | null> {
  return d1First<QQUserRow>("SELECT * FROM qq_users WHERE id = ?", [id]);
}

export async function deleteQQSession(sessionId: string): Promise<void> {
  await d1Run("DELETE FROM qq_sessions WHERE id = ?", [sessionId]);
}
