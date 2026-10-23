-- Local Map Assessment: reports, leads, DataForSEO spend and daily limits. Same database as the scorecard (binding DB).
-- Apply with: npx wrangler d1 migrations apply wwisermind-scorecard --remote

CREATE TABLE IF NOT EXISTS lm_reports (
  id             TEXT PRIMARY KEY,           -- unguessable, 22 characters of base64url (128 bits)
  cache_key      TEXT NOT NULL,              -- place + keywords + radius: the same key within 7 days reuses the report
  listing_json   TEXT NOT NULL,
  keywords_json  TEXT NOT NULL,
  radius_mi      INTEGER NOT NULL,
  centre_json    TEXT NOT NULL,
  points_json    TEXT NOT NULL,
  status         TEXT NOT NULL,              -- scanning | profiles | done | failed
  error          TEXT,
  tasks_json     TEXT NOT NULL,              -- the DataForSEO task ids and whether each has come back
  results_json   TEXT NOT NULL,              -- what has come back so far
  competitors_json TEXT,
  report_json    TEXT,                       -- the finished report the page shows
  timings_json   TEXT NOT NULL,              -- unix ms for each stage, so we can see how long a scan takes
  retries        INTEGER NOT NULL DEFAULT 0,
  lock_until     INTEGER NOT NULL DEFAULT 0, -- one status poll at a time does the work
  total_cost     REAL NOT NULL DEFAULT 0,    -- USD, as DataForSEO reports it
  rules_version  INTEGER NOT NULL,
  created_at     INTEGER NOT NULL,           -- unix ms
  finished_at    INTEGER
);
CREATE INDEX IF NOT EXISTS lm_reports_cache_idx ON lm_reports (cache_key, created_at);

CREATE TABLE IF NOT EXISTS lm_leads (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id   TEXT NOT NULL REFERENCES lm_reports(id),
  first_name  TEXT NOT NULL,
  email       TEXT NOT NULL,
  website     TEXT,
  practice    TEXT NOT NULL,
  notified    INTEGER NOT NULL DEFAULT 0, -- 1 once the lead email to wwisermind went out
  report_sent INTEGER NOT NULL DEFAULT 0, -- 1 once the "your report is ready" email went out
  created_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS lm_leads_report_idx ON lm_leads (report_id);
CREATE INDEX IF NOT EXISTS lm_leads_email_idx ON lm_leads (email);

-- One row per batch of DataForSEO calls, so spend and timing can be watched.
--   select sum(cost), count(distinct report_id) from lm_cost_log;
--   select step, count(*), avg(ms), sum(cost) from lm_cost_log group by step;
CREATE TABLE IF NOT EXISTS lm_cost_log (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id TEXT,                           -- null for a lookup
  step      TEXT NOT NULL,                  -- lookup | post_grid | poll_grid | post_profiles | poll_profiles
  calls     INTEGER NOT NULL,               -- DataForSEO requests in the batch
  tasks     INTEGER NOT NULL,               -- tasks posted or collected
  cost      REAL NOT NULL,                  -- USD
  ms        INTEGER NOT NULL,               -- longest single request in the batch
  note      TEXT,
  at        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS lm_cost_report_idx ON lm_cost_log (report_id);

-- Counts per hashed IP, per hashed email and per day (lookups and reports).
CREATE TABLE IF NOT EXISTS lm_limits (
  bucket_key TEXT NOT NULL,                 -- "report-ip:<hash>", "report-email:<hash>" or "lookup-ip:<hash>"
  day        INTEGER NOT NULL,              -- unix ms divided by a day
  count      INTEGER NOT NULL,
  PRIMARY KEY (bucket_key, day)
);
