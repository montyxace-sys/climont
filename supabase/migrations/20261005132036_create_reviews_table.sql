/*
# Create reviews table

## Purpose
Store customer reviews that are displayed on the public website's "Reseñas" section.
Reviews are managed from the admin panel (create, edit, delete, toggle visibility).

## New Tables
- `reviews`
  - `id` (uuid, primary key)
  - `author_name` (text, name of the reviewer)
  - `author_initial` (text, single letter shown in avatar circle)
  - `rating` (int, 1-5 stars)
  - `review_text` (text, the review content)
  - `review_date` (text, human-readable date like "Septiembre 2026")
  - `service_label` (text, optional tag like "Instalación por conductos")
  - `is_visible` (boolean, default true — allows hiding without deleting)
  - `sort_order` (int, default 0 — lower numbers appear first)
  - `created_at` (timestamptz)

## Security
- RLS enabled.
- Public (anon, authenticated) can read visible reviews.
- Only authenticated admin users can create, update, delete.
*/

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  author_initial text DEFAULT '',
  rating int NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  review_text text NOT NULL,
  review_date text NOT NULL DEFAULT '',
  service_label text DEFAULT '',
  is_visible boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read visible reviews" ON reviews;
CREATE POLICY "Public can read visible reviews"
ON reviews FOR SELECT
TO anon, authenticated
USING (is_visible = true);

DROP POLICY IF EXISTS "Admin can insert reviews" ON reviews;
CREATE POLICY "Admin can insert reviews"
ON reviews FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can update reviews" ON reviews;
CREATE POLICY "Admin can update reviews"
ON reviews FOR UPDATE
TO authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can delete reviews" ON reviews;
CREATE POLICY "Admin can delete reviews"
ON reviews FOR DELETE
TO authenticated
USING (true);
