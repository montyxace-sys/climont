/*
# Create job_applications table for CV submissions

1. New Tables
- `job_applications`
  - `id` (uuid, primary key)
  - `name` (text, not null) — applicant full name, 2–100 chars
  - `email` (text, not null) — applicant email, valid format
  - `phone` (text, not null) — applicant phone, 6–20 chars
  - `position` (text, not null) — position they are applying for, e.g. "Técnico en climatización", "Administrativo"
  - `experience_years` (integer) — years of experience in the field
  - `message` (text) — cover letter / message from the applicant, max 3000 chars
  - `cv_file_path` (text) — path to the uploaded CV file in Supabase Storage
  - `cv_file_name` (text) — original file name of the CV
  - `status` (text, not null, default 'pendiente') — one of: pendiente, revisado, descartado, contratado
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `job_applications`.
- INSERT: allow anon + authenticated (public form submissions, no login required).
- SELECT/UPDATE/DELETE: authenticated only (admin panel access).
- CV files stored in Supabase Storage bucket `cvs` — public upload via anon key, read via authenticated.

3. Constraints
- email CHECK constraint: valid email format
- name length 2–100
- phone length 6–20
- position length 2–100
- message max 3000
- experience_years >= 0
- status CHECK: pendiente, revisado, descartado, contratado
*/

CREATE TABLE IF NOT EXISTS job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
  email text NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  phone text NOT NULL CHECK (char_length(phone) >= 6 AND char_length(phone) <= 20),
  position text NOT NULL CHECK (char_length(position) >= 2 AND char_length(position) <= 100),
  experience_years integer CHECK (experience_years IS NULL OR experience_years >= 0),
  message text CHECK (message IS NULL OR char_length(message) <= 3000),
  cv_file_path text,
  cv_file_name text,
  status text NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'revisado', 'descartado', 'contratado')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_job_applications" ON job_applications;
CREATE POLICY "anon_insert_job_applications"
ON job_applications FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_select_job_applications" ON job_applications;
CREATE POLICY "authenticated_select_job_applications"
ON job_applications FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "authenticated_update_job_applications" ON job_applications;
CREATE POLICY "authenticated_update_job_applications"
ON job_applications FOR UPDATE
TO authenticated
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_delete_job_applications" ON job_applications;
CREATE POLICY "authenticated_delete_job_applications"
ON job_applications FOR DELETE
TO authenticated
USING (true);

CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_created_at ON job_applications(created_at DESC);