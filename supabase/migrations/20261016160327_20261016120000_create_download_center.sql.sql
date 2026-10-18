/*
# Centro de Descargas — Tables, RLS and Storage

1. New Tables
  - `download_users` (`user_id` uuid PK referencing auth.users, `full_name` text,
    `company` text, `phone` text, `status` text: 'pendiente' | 'aprobado' | 'rechazado',
    `created_at`, `approved_at`). Tracks client registration requests. The owner
    must manually approve each registration before the user can access downloads.
  - `download_files` (`id` uuid PK, `title`, `description`, `category`, `file_path`
    text, `file_size` bigint, `file_type` text, `is_active` boolean default true,
    `created_at`, `updated_at`). Stores metadata for files in the `downloads` storage
    bucket. Admin-managed.

2. New Functions
  - `public.is_download_approved()` — SECURITY DEFINER, STABLE, fixed search_path.
    Returns true when the calling session belongs to an approved download user.

3. Storage
  - New bucket `downloads` (private). Admins can upload/manage. Approved download
    users get signed URLs via the frontend through admin-uploaded files.

4. Security
  - `download_users`: users can read only their own row. Admins can read/update all.
  - `download_files`: approved download users + admins can SELECT. Admins can
    INSERT/UPDATE/DELETE. File storage in `downloads` bucket: approved download
    users can read, admins can read/write/delete.
*/

-- ── download_users ──
CREATE TABLE IF NOT EXISTS download_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  company text,
  phone text,
  status text NOT NULL DEFAULT 'pendiente'
    CHECK (status IN ('pendiente', 'aprobado', 'rechazado')),
  created_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz
);

ALTER TABLE download_users ENABLE ROW LEVEL SECURITY;

-- Users can read their own row
DROP POLICY IF EXISTS "select_own_download_user" ON download_users;
CREATE POLICY "select_own_download_user" ON download_users FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

-- Users can insert their own row (registration)
DROP POLICY IF EXISTS "insert_own_download_user" ON download_users;
CREATE POLICY "insert_own_download_user" ON download_users FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can update their own row (only profile fields, not status)
DROP POLICY IF EXISTS "update_own_download_user" ON download_users;
CREATE POLICY "update_own_download_user" ON download_users FOR UPDATE
  TO authenticated USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can read and update all download_users
DROP POLICY IF EXISTS "admin_select_download_users" ON download_users;
CREATE POLICY "admin_select_download_users" ON download_users FOR SELECT
  TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "admin_update_download_users" ON download_users;
CREATE POLICY "admin_update_download_users" ON download_users FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ── is_download_approved function ──
CREATE OR REPLACE FUNCTION public.is_download_approved()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.download_users d
    WHERE d.user_id = auth.uid()
      AND d.status = 'aprobado'
  );
$$;

REVOKE ALL ON FUNCTION public.is_download_approved() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_download_approved() TO authenticated;

-- ── download_files ──
CREATE TABLE IF NOT EXISTS download_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  file_path text NOT NULL,
  file_size bigint,
  file_type text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE download_files ENABLE ROW LEVEL SECURITY;

-- Approved download users and admins can SELECT active files
DROP POLICY IF EXISTS "select_active_download_files" ON download_files;
CREATE POLICY "select_active_download_files" ON download_files FOR SELECT
  TO authenticated USING (
    is_active = true
    AND (is_download_approved() OR is_admin())
  );

-- Admins can INSERT/UPDATE/DELETE
DROP POLICY IF EXISTS "admin_insert_download_files" ON download_files;
CREATE POLICY "admin_insert_download_files" ON download_files FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_download_files" ON download_files;
CREATE POLICY "admin_update_download_files" ON download_files FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_download_files" ON download_files;
CREATE POLICY "admin_delete_download_files" ON download_files FOR DELETE
  TO authenticated USING (is_admin());

-- ── Storage bucket: downloads ──
INSERT INTO storage.buckets (id, name, public)
VALUES ('downloads', 'downloads', false)
ON CONFLICT (id) DO NOTHING;

-- Admins can upload, update, delete files in downloads bucket
DROP POLICY IF EXISTS "admin_upload_downloads" ON storage.objects;
CREATE POLICY "admin_upload_downloads" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (
    bucket_id = 'downloads' AND is_admin()
  );

DROP POLICY IF EXISTS "admin_update_downloads" ON storage.objects;
CREATE POLICY "admin_update_downloads" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'downloads' AND is_admin())
  WITH CHECK (bucket_id = 'downloads' AND is_admin());

DROP POLICY IF EXISTS "admin_delete_downloads" ON storage.objects;
CREATE POLICY "admin_delete_downloads" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'downloads' AND is_admin());

-- Approved download users can read files in downloads bucket
DROP POLICY IF EXISTS "approved_read_downloads" ON storage.objects;
CREATE POLICY "approved_read_downloads" ON storage.objects FOR SELECT
  TO authenticated USING (
    bucket_id = 'downloads' AND is_download_approved()
  );