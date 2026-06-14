-- Collect per-question response data for IRT item parameter calibration
-- Run: wrangler d1 execute CORTEX_DB --file=migrations/0005_item_responses.sql

CREATE TABLE IF NOT EXISTS item_responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  correct INTEGER NOT NULL DEFAULT 0,
  theta REAL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_item_responses_qid ON item_responses(question_id, created_at);
CREATE INDEX IF NOT EXISTS idx_item_responses_created ON item_responses(created_at);
