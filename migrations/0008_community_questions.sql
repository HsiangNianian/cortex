-- Community Question Submission & Admin System
-- 2026-06-21

CREATE TABLE IF NOT EXISTS community_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('logic','math','vocab','event','event-cause','event-argument')),
  question TEXT NOT NULL,
  options TEXT NOT NULL,  -- JSON array of strings
  correct_answer INTEGER NOT NULL,
  explanation TEXT DEFAULT '',
  submitter_email TEXT NOT NULL,
  submitter_name TEXT DEFAULT '',  -- empty string = "匿名"
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
  admin_notes TEXT DEFAULT '',
  reviewed_by INTEGER,
  reviewed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,  -- "salt:hash" format, PBKDF2-SHA256
  role TEXT NOT NULL DEFAULT 'reviewer' CHECK(role IN ('super_admin','reviewer')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,  -- UUID v4
  admin_id INTEGER NOT NULL REFERENCES admins(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
