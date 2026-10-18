/*
# Update Google Places API key and add sync fields to reviews

1. Changes to app_secrets
- Update GOOGLE_PLACES_API_KEY with the new key provided by the user.
2. Changes to reviews table
- Add `google_review_id` (text, nullable) — stores the Google review's unique ID to avoid duplicate imports.
- Add `auto_synced` (boolean, default false) — marks reviews imported automatically from Google.
- Add `synced_at` (timestamptz, nullable) — last sync timestamp.
3. Index
- Unique index on google_review_id to prevent duplicate auto-imports.
4. Security
- No RLS policy changes. The table already has existing policies.
*/

UPDATE app_secrets SET value = 'AIzaSyC0qDyen6llRaUWLfPRayLsLxsepW0USew' WHERE key = 'GOOGLE_PLACES_API_KEY';

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS google_review_id text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS auto_synced boolean NOT NULL DEFAULT false;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS synced_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_google_review_id ON reviews (google_review_id) WHERE google_review_id IS NOT NULL;
