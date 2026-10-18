/*
  # Restrict public privileges on contact_requests to INSERT only

  1. Security
  - Revoke SELECT, UPDATE and DELETE on `contact_requests` from `anon` and `authenticated`.
    The public contact form only ever inserts; no client code reads or modifies rows.
  - RLS already denies these operations (no policy exists for them). This removes the
    underlying table privilege as well, so an accidental permissive policy or a disabled
    RLS flag no longer exposes customer personal data.

  2. Notes
  - INSERT is deliberately preserved so the contact form keeps working.
*/

REVOKE SELECT, UPDATE, DELETE ON public.contact_requests FROM anon;
REVOKE SELECT, UPDATE, DELETE ON public.contact_requests FROM authenticated;
