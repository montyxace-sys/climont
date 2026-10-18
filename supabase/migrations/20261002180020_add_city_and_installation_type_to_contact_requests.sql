/*
# Add city and installation_type columns to contact_requests

1. Modified Tables
- `contact_requests`
  - `city` (text) — optional city where the installation/maintenance is needed
  - `installation_type` (text) — optional type of installation (e.g. splits de pared, conductos, cassettes, suelo/techo, airzone)

2. Security
- No policy changes. Existing INSERT policy already allows anon + authenticated inserts with WITH CHECK (true).

3. Notes
- Both columns are nullable so existing rows and inserts that omit them continue to work.
- The frontend form will send these values when the user selects them.
*/

ALTER TABLE contact_requests
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS installation_type text;
