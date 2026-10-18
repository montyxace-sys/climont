/*
# Add Proton Drive and Proton Mail credentials to app_secrets

1. Data
- Insert PROTON_DRIVE_USERNAME, PROTON_DRIVE_PASSWORD, and PROTON_DRIVE_2FA
  into app_secrets table for Proton Drive access.
- Insert PROTON_MAIL_USERNAME, PROTON_MAIL_PASSWORD, and PROTON_MAIL_2FA
  into app_secrets table for Proton Mail access.
- These credentials allow the admin panel to verify connection status and
  manage credentials securely from the edge function.

2. Security
- No changes to existing RLS policies.
- app_secrets is only accessible via the service role key (bypasses RLS).
- Credentials are never exposed to the frontend directly.

3. Notes
- The values are placeholders — the user must update them with their real
  Proton credentials from the admin panel.
- The edge function proton-proxy reads these from the database at runtime.
*/

INSERT INTO app_secrets (key, value)
VALUES
  ('PROTON_DRIVE_USERNAME', 'tu-email@proton.me'),
  ('PROTON_DRIVE_PASSWORD', 'tu-password-proton'),
  ('PROTON_DRIVE_2FA', ''),
  ('PROTON_MAIL_USERNAME', 'tu-email@proton.me'),
  ('PROTON_MAIL_PASSWORD', 'tu-password-proton'),
  ('PROTON_MAIL_2FA', '')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
