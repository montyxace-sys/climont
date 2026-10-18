/*
# Create seo_suggestions table

1. New Tables
- `seo_suggestions`
  - `id` (text, primary key) — matches the suggestion ID from the SeoPanel (e.g. 'gsc', 'gmb', 'backlinks')
  - `completed` (boolean, default false) — whether the user has marked this suggestion as done
  - `completed_at` (timestamptz, nullable) — when the user marked it as done
  - `notes` (text, nullable) — optional notes the user can add when completing
  - `updated_at` (timestamptz, default now()) — last modification timestamp
  - `created_at` (timestamptz, default now()) — creation timestamp

2. Purpose
- Stores the completion state of each SEO suggestion shown in the admin panel.
- When a suggestion is marked as completed, the corresponding SEO check
  (linked by ID) automatically changes from 'warning' to 'pass', and the
  overall SEO score recalculates.
- The checklist items in the Tools tab also persist their checked state
  via this table.

3. Security
- Enable RLS on `seo_suggestions`.
- Allow anon + authenticated CRUD because the admin panel uses the
  anon key (single-tenant app, no per-user isolation needed for this data).
*/

CREATE TABLE IF NOT EXISTS seo_suggestions (
  id text PRIMARY KEY,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  notes text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE seo_suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_seo_suggestions" ON seo_suggestions;
CREATE POLICY "anon_select_seo_suggestions"
ON seo_suggestions FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_seo_suggestions" ON seo_suggestions;
CREATE POLICY "anon_insert_seo_suggestions"
ON seo_suggestions FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_seo_suggestions" ON seo_suggestions;
CREATE POLICY "anon_update_seo_suggestions"
ON seo_suggestions FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_seo_suggestions" ON seo_suggestions;
CREATE POLICY "anon_delete_seo_suggestions"
ON seo_suggestions FOR DELETE
TO anon, authenticated USING (true);
