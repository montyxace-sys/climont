/*
  # Enforce a canonical email format on contact_requests

  1. Security
  - Add a format CHECK on `email` so the public insert endpoint cannot store values that are
    not addresses. Previously the only check was a regex running in the browser.
  - Require the stored value to be lowercase so the same address cannot be recorded in
    several forms that follow-up lookups would treat as different leads.

  2. Notes
  - The contact form lowercases the address before sending, so legitimate submissions pass.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'contact_requests_email_format_check'
      AND conrelid = 'public.contact_requests'::regclass
  ) THEN
    ALTER TABLE public.contact_requests
      ADD CONSTRAINT contact_requests_email_format_check
      CHECK (
        email = lower(email)
        AND email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
      );
  END IF;
END $$;
