/*
  # Bound the size of contact_requests text fields

  1. Security
  - Add length CHECK constraints to every text column so a crafted request cannot store
    multi-megabyte values through the public insert endpoint.
  - Also require name, phone and service_type to be non-empty after trimming, matching the
    browser-side validation that an attacker skipping the form would never run.

  2. Notes
  - Limits are set generously above realistic use so no legitimate submission is rejected.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'contact_requests_lengths_check'
      AND conrelid = 'public.contact_requests'::regclass
  ) THEN
    ALTER TABLE public.contact_requests
      ADD CONSTRAINT contact_requests_lengths_check
      CHECK (
        char_length(btrim(name)) BETWEEN 1 AND 120
        AND char_length(email) <= 255
        AND char_length(btrim(phone)) BETWEEN 1 AND 40
        AND (city IS NULL OR char_length(city) <= 120)
        AND char_length(btrim(service_type)) BETWEEN 1 AND 60
        AND (installation_type IS NULL OR char_length(installation_type) <= 60)
        AND (message IS NULL OR char_length(message) <= 5000)
      );
  END IF;
END $$;
