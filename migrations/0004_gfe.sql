-- Good Faith Estimate generator: one small row per therapist who downloads an estimate. Only the therapist's first name, email, practice name
-- and city are stored. The client's name, date of birth, diagnosis code and fees never reach the server. Apply with:
--   npx wrangler d1 execute wwisermind-scorecard --remote --file=migrations/0004_gfe.sql
-- (Daily limits reuse the lm_limits table from 0002_local_map.sql.)

CREATE TABLE IF NOT EXISTS gfe_leads (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  email      TEXT NOT NULL,
  practice   TEXT NOT NULL,
  city       TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  notified   INTEGER NOT NULL DEFAULT 0,   -- the alert to wwisermind went out
  welcomed   INTEGER NOT NULL DEFAULT 0    -- the therapist's "here is the tool" email went out
);
CREATE INDEX IF NOT EXISTS gfe_leads_email ON gfe_leads (email);
