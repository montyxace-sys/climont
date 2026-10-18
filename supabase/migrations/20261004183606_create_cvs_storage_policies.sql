/*
# Storage policies for CV bucket

1. Security
- `cvs` bucket is private (not public).
- INSERT: allow anon + authenticated to upload CV files.
- SELECT: authenticated only (admin can download CVs).
- DELETE: authenticated only.
- Files stored with random UUID prefix to avoid collisions.
*/

DROP POLICY IF EXISTS "anon_upload_cvs" ON storage.objects;
CREATE POLICY "anon_upload_cvs"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'cvs');

DROP POLICY IF EXISTS "authenticated_read_cvs" ON storage.objects;
CREATE POLICY "authenticated_read_cvs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'cvs');

DROP POLICY IF EXISTS "authenticated_delete_cvs" ON storage.objects;
CREATE POLICY "authenticated_delete_cvs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'cvs');