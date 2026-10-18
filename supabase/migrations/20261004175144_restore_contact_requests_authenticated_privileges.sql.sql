/*
  # Restore SELECT and UPDATE privileges for authenticated on contact_requests

  An earlier migration (20261002184644) revoked SELECT, UPDATE and DELETE
  from both anon and authenticated. A later migration (20261004121240) added
  RLS policies for authenticated SELECT and UPDATE, but never re-granted the
  underlying table privileges. Without these GRANTs the admin panel cannot
  read or update contact requests even though the RLS policies allow it.

  This migration restores the minimum privileges the admin panel needs:
  - SELECT: to list and view contact requests
  - UPDATE: to change request status (pendiente → contactado → cerrado)

  anon remains INSERT-only — public visitors can submit forms but never
  read or modify existing data.
*/

GRANT SELECT, UPDATE ON public.contact_requests TO authenticated;