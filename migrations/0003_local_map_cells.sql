-- Local Map Assessment, free-plan rework: each finished grid check is its own small row instead of one big JSON blob on the report,
-- so a status poll never has to read or rewrite the whole set. Apply with:
--   npx wrangler d1 execute wwisermind-scorecard --remote --file=migrations/0003_local_map_cells.sql

CREATE TABLE IF NOT EXISTS lm_cells (
  report_id TEXT NOT NULL,
  p         INTEGER NOT NULL,   -- grid point 0 to 24
  k         INTEGER NOT NULL,   -- search term 0 to 3
  rows_json TEXT NOT NULL,      -- the first 20 results, in rank order: [key, name, rating, reviews, photos, category] each
  PRIMARY KEY (report_id, p, k)
);
