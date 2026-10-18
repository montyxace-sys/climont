/*
# Create app_secrets table for storing third-party API keys

1. New Tables
- `app_secrets`
  - `key` (text, primary key) — identifier for the secret (e.g. 'RESEND_API_KEY')
  - `value` (text, not null) — the secret value
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- RLS enabled on `app_secrets`.
- No policies for anon or authenticated roles — only the service role (which bypasses RLS) can read/write.
- This ensures API keys are never exposed to the frontend.

3. Data
- Insert RESEND_API_KEY with the provided value.
*/

CREATE TABLE IF NOT EXISTS app_secrets (
  key text PRIMARY KEY,
  value text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_secrets ENABLE ROW LEVEL SECURITY;

INSERT INTO app_secrets (key, value)
VALUES ('RESEND_API_KEY', 're_QcDN1Zgc_PJd1rXPuS98KQnoGxkKrqc4i')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();