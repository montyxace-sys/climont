/*
# Add authenticated SELECT and UPDATE policies to contact_requests

1. Security Changes
- Add SELECT policy for authenticated users (admin dashboard reads contact requests).
- Add UPDATE policy for authenticated users (admin can change status of requests).
- anon remains INSERT-only — public visitors can submit forms but never read or modify data.

2. Notes
- The existing anon_insert_contact_requests policy remains unchanged.
- These new policies allow any authenticated user to read and update contact_requests.
- Access is gated by Supabase Auth — only users with valid credentials reach the admin panel.
*/

DROP POLICY IF EXISTS "authenticated_select_contact_requests" ON contact_requests;
CREATE POLICY "authenticated_select_contact_requests"
ON contact_requests FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "authenticated_update_contact_requests" ON contact_requests;
CREATE POLICY "authenticated_update_contact_requests"
ON contact_requests FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
