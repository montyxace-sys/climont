/*
# Create document vault for invoices and quotes

1. New Tables
- `document_vault`: stores metadata for uploaded business documents (facturas, presupuestos, etc.)
  - `id` (uuid, primary key)
  - `file_name` (text, original file name)
  - `file_path` (text, storage path within the `documents` bucket)
  - `file_type` (text, MIME type)
  - `file_size` (bigint, size in bytes)
  - `category` (text: 'factura' | 'presupuesto' | 'otro')
  - `description` (text, optional description)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

2. Storage
- Creates private bucket `documents` for Excel and PDF files.
- INSERT: authenticated only (admin uploads).
- SELECT: authenticated only (admin downloads).
- DELETE: authenticated only (admin deletes).

3. Security
- RLS enabled on `document_vault`.
- All CRUD scoped to `authenticated` (admin-only access).
- Storage bucket `documents` is private, policies restrict to authenticated.
*/

CREATE TABLE IF NOT EXISTS document_vault (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'otro' CHECK (category IN ('factura', 'presupuesto', 'otro')),
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE document_vault ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_document_vault" ON document_vault;
CREATE POLICY "select_document_vault"
ON document_vault FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_document_vault" ON document_vault;
CREATE POLICY "insert_document_vault"
ON document_vault FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_document_vault" ON document_vault;
CREATE POLICY "update_document_vault"
ON document_vault FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_document_vault" ON document_vault;
CREATE POLICY "delete_document_vault"
ON document_vault FOR DELETE
TO authenticated USING (true);

-- Create private storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: authenticated only (admin)
DROP POLICY IF EXISTS "authenticated_upload_documents" ON storage.objects;
CREATE POLICY "authenticated_upload_documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');

DROP POLICY IF EXISTS "authenticated_read_documents" ON storage.objects;
CREATE POLICY "authenticated_read_documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'documents');

DROP POLICY IF EXISTS "authenticated_delete_documents" ON storage.objects;
CREATE POLICY "authenticated_delete_documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'documents');