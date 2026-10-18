/*
# Create page_views table for visitor analytics

1. New Tables
- `page_views`
  - `id` (uuid, primary key)
  - `session_id` (text, not null) — anonymous session identifier stored in localStorage
  - `path` (text, not null) — the page/section viewed
  - `referrer` (text) — where the visitor came from
  - `user_agent` (text) — browser/device info
  - `country` (text) — visitor country (derived from request headers)
  - `city` (text) — visitor city
  - `device_type` (text) — mobile/tablet/desktop
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `page_views`.
- Allow anon + authenticated INSERT only (public can track visits but cannot read).
- No SELECT/UPDATE/DELETE for anon — analytics data is private to the admin.
- authenticated role gets SELECT to power the admin dashboard.
*/

CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  path text NOT NULL,
  referrer text,
  user_agent text,
  country text,
  city text,
  device_type text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_page_views" ON page_views;
CREATE POLICY "anon_insert_page_views"
ON page_views FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_select_page_views" ON page_views;
CREATE POLICY "authenticated_select_page_views"
ON page_views FOR SELECT
TO authenticated
USING (true);

CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views (created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views (session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views (path);
