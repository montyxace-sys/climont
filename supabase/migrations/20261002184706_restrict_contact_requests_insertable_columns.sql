/*
  # Prevent the public from writing internal columns on contact_requests

  1. Security
  - Replace the table-wide INSERT privilege with a column-level INSERT privilege covering
    only the fields the contact form legitimately sends: name, email, phone, city,
    service_type, installation_type, message.
  - `id`, `status` and `created_at` are internal: they are no longer insertable by the
    public, so their column defaults (gen_random_uuid(), 'pendiente', now()) always apply
    and a crafted request can no longer mark a brand-new enquiry as already handled.
  - Add a CHECK constraint restricting `status` to the known internal tracking values.

  2. Notes
  - The existing INSERT policy (anon, authenticated) is unchanged, so the form keeps working.
*/

REVOKE INSERT ON public.contact_requests FROM anon;
REVOKE INSERT ON public.contact_requests FROM authenticated;

GRANT INSERT (name, email, phone, city, service_type, installation_type, message)
  ON public.contact_requests TO anon;
GRANT INSERT (name, email, phone, city, service_type, installation_type, message)
  ON public.contact_requests TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'contact_requests_status_check'
      AND conrelid = 'public.contact_requests'::regclass
  ) THEN
    ALTER TABLE public.contact_requests
      ADD CONSTRAINT contact_requests_status_check
      CHECK (status IN ('pendiente', 'contactado', 'presupuestado', 'completado', 'descartado'));
  END IF;
END $$;
