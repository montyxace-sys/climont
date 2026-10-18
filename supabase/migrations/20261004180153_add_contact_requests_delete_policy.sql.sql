/*
  # Add DELETE privilege and policy for authenticated on contact_requests

  Allows admin users to delete closed contact requests from the panel.
  anon remains INSERT-only.
*/

GRANT DELETE ON public.contact_requests TO authenticated;

DROP POLICY IF EXISTS "authenticated_delete_contact_requests" ON contact_requests;
CREATE POLICY "authenticated_delete_contact_requests"
ON contact_requests FOR DELETE
TO authenticated
USING (true);