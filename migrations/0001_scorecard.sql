-- website scorecard: reports, leads, scan cache and rate limits.
-- Apply with: npx wrangler d1 migrations apply wwisermind-scorecard --remote

CREATE TABLE IF NOT EXISTS reports (
  id            TEXT PRIMARY KEY,           -- unguessable, 22 characters of base64url (128 bits)
  website_url   TEXT NOT NULL,
  scan_json     TEXT,                       -- the scan as it was when the report was made
  answers_json  TEXT NOT NULL,
  report_json   TEXT NOT NULL,              -- the finished report the results page shows
  rules_version INTEGER NOT NULL,
  created_at    INTEGER NOT NULL            -- unix ms
);

CREATE TABLE IF NOT EXISTS leads (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id     TEXT NOT NULL REFERENCES reports(id),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  practice_name TEXT NOT NULL,
  city_state    TEXT NOT NULL,
  website_url   TEXT NOT NULL,
  summary_sent  INTEGER NOT NULL DEFAULT 0, -- 1 once the email to the visitor went out
  notified      INTEGER NOT NULL DEFAULT 0, -- 1 once the lead email to wwisermind went out
  created_at    INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS leads_created_idx ON leads (created_at);
CREATE INDEX IF NOT EXISTS leads_email_idx ON leads (email);

-- One scan per site per 24 hours. The key is the host without "www.".
CREATE TABLE IF NOT EXISTS scan_cache (
  url_key    TEXT PRIMARY KEY,
  scan_json  TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

-- Counts per hashed IP per hour, for scans and for submissions.
CREATE TABLE IF NOT EXISTS rate_limits (
  bucket_key TEXT NOT NULL,                 -- "scan:<ip hash>" or "submit:<ip hash>"
  hour       INTEGER NOT NULL,              -- unix ms divided by an hour
  count      INTEGER NOT NULL,
  PRIMARY KEY (bucket_key, hour)
);
