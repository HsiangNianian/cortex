-- Store latest ability profile per license for cross-session theta persistence
-- Run: wrangler d1 execute CORTEX_DB --file=migrations/0006_ability_profiles.sql

CREATE TABLE IF NOT EXISTS ability_profiles (
  license_key TEXT PRIMARY KEY,
  overall_theta REAL NOT NULL,
  overall_se REAL NOT NULL,
  logic_theta REAL,
  logic_se REAL,
  math_theta REAL,
  math_se REAL,
  vocab_theta REAL,
  vocab_se REAL,
  event_theta REAL,
  event_se REAL,
  questions_answered INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
