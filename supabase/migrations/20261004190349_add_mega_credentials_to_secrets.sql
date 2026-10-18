/*
# Add MEGA credentials to app_secrets

1. Data
- Insert MEGA_EMAIL and MEGA_PASSWORD into app_secrets table.
- These credentials allow the edge function to connect to the MEGA account
  and list/download files from the cloud storage.

2. Security
- No changes to existing RLS policies.
- app_secrets is only accessible via the service role key (bypasses RLS).
- Credentials are never exposed to the frontend.

3. Notes
- The values are placeholders — the user must update them with their real MEGA credentials.
- The edge function mega-proxy reads these from the database at runtime.
*/

INSERT INTO app_secrets (key, value)
VALUES
  ('MEGA_EMAIL', 'tu-email@mega.nz'),
  ('MEGA_PASSWORD', 'tu-password-mega')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();