/*
  # Admin allowlist and policy lockdown

  1. New Tables
    - `admin_users` (`user_id` uuid PK referencing auth.users) — the explicit list of
      operator accounts. Seeded with every account that exists today so the current
      admin keeps working.

  2. New Functions
    - `public.is_admin()` — SECURITY DEFINER, STABLE, fixed search_path. Returns true
      when the calling session belongs to an account in `admin_users`. EXECUTE granted
      to `authenticated` only.

  3. Security
    - Every policy that previously granted operator capabilities to the whole
      `authenticated` role is rewritten to require `is_admin()`.
    - `seo_suggestions` loses its anonymous CRUD policies.
    - `bolt_skills` keeps public SELECT (non-sensitive project config) but writes
      now require an admin.
    - Public read paths (`products`, `reviews`, `hvac_error_codes`) and public write
      paths (`contact_requests` insert, `job_applications` insert, `page_views`
      insert, `chatbot_unanswered_queries` insert) are left untouched.
*/

CREATE TABLE IF NOT EXISTS admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON admin_users FROM anon, authenticated;

INSERT INTO admin_users (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users a WHERE a.user_id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- contact_requests
DROP POLICY IF EXISTS "authenticated_select_contact_requests" ON contact_requests;
CREATE POLICY "admin_select_contact_requests" ON contact_requests FOR SELECT
  TO authenticated USING (is_admin());
DROP POLICY IF EXISTS "authenticated_update_contact_requests" ON contact_requests;
CREATE POLICY "admin_update_contact_requests" ON contact_requests FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS "authenticated_delete_contact_requests" ON contact_requests;
CREATE POLICY "admin_delete_contact_requests" ON contact_requests FOR DELETE
  TO authenticated USING (is_admin());

-- job_applications
DROP POLICY IF EXISTS "authenticated_select_job_applications" ON job_applications;
CREATE POLICY "admin_select_job_applications" ON job_applications FOR SELECT
  TO authenticated USING (is_admin());
DROP POLICY IF EXISTS "authenticated_update_job_applications" ON job_applications;
CREATE POLICY "admin_update_job_applications" ON job_applications FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS "authenticated_delete_job_applications" ON job_applications;
CREATE POLICY "admin_delete_job_applications" ON job_applications FOR DELETE
  TO authenticated USING (is_admin());

-- products (public SELECT stays)
DROP POLICY IF EXISTS "admin_insert_products" ON products;
CREATE POLICY "admin_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (is_admin());
DROP POLICY IF EXISTS "admin_update_products" ON products;
CREATE POLICY "admin_update_products" ON products FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS "admin_delete_products" ON products;
CREATE POLICY "admin_delete_products" ON products FOR DELETE
  TO authenticated USING (is_admin());

-- reviews (public SELECT of visible rows stays)
DROP POLICY IF EXISTS "Admin can insert reviews" ON reviews;
CREATE POLICY "admin_insert_reviews" ON reviews FOR INSERT
  TO authenticated WITH CHECK (is_admin());
DROP POLICY IF EXISTS "Admin can update reviews" ON reviews;
CREATE POLICY "admin_update_reviews" ON reviews FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS "Admin can delete reviews" ON reviews;
CREATE POLICY "admin_delete_reviews" ON reviews FOR DELETE
  TO authenticated USING (is_admin());

-- jobs
DROP POLICY IF EXISTS "authenticated_select_jobs" ON jobs;
CREATE POLICY "admin_select_jobs" ON jobs FOR SELECT
  TO authenticated USING (is_admin());
DROP POLICY IF EXISTS "authenticated_insert_jobs" ON jobs;
CREATE POLICY "admin_insert_jobs" ON jobs FOR INSERT
  TO authenticated WITH CHECK (is_admin());
DROP POLICY IF EXISTS "authenticated_update_jobs" ON jobs;
CREATE POLICY "admin_update_jobs" ON jobs FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS "authenticated_delete_jobs" ON jobs;
CREATE POLICY "admin_delete_jobs" ON jobs FOR DELETE
  TO authenticated USING (is_admin());

-- hvac_error_codes (public SELECT of active rows stays)
DROP POLICY IF EXISTS "Signed-in users can insert HVAC error codes" ON hvac_error_codes;
CREATE POLICY "admin_insert_hvac_error_codes" ON hvac_error_codes FOR INSERT
  TO authenticated WITH CHECK (is_admin());
DROP POLICY IF EXISTS "Signed-in users can update HVAC error codes" ON hvac_error_codes;
CREATE POLICY "admin_update_hvac_error_codes" ON hvac_error_codes FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS "Signed-in users can delete HVAC error codes" ON hvac_error_codes;
CREATE POLICY "admin_delete_hvac_error_codes" ON hvac_error_codes FOR DELETE
  TO authenticated USING (is_admin());

-- seo_suggestions
DROP POLICY IF EXISTS "anon_select_seo_suggestions" ON seo_suggestions;
DROP POLICY IF EXISTS "anon_insert_seo_suggestions" ON seo_suggestions;
DROP POLICY IF EXISTS "anon_update_seo_suggestions" ON seo_suggestions;
DROP POLICY IF EXISTS "anon_delete_seo_suggestions" ON seo_suggestions;
CREATE POLICY "admin_select_seo_suggestions" ON seo_suggestions FOR SELECT
  TO authenticated USING (is_admin());
CREATE POLICY "admin_insert_seo_suggestions" ON seo_suggestions FOR INSERT
  TO authenticated WITH CHECK (is_admin());
CREATE POLICY "admin_update_seo_suggestions" ON seo_suggestions FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete_seo_suggestions" ON seo_suggestions FOR DELETE
  TO authenticated USING (is_admin());

-- bolt_skills: keep public read, admin-only writes
DROP POLICY IF EXISTS "anon_insert_bolt_skills" ON bolt_skills;
DROP POLICY IF EXISTS "anon_update_bolt_skills" ON bolt_skills;
DROP POLICY IF EXISTS "anon_delete_bolt_skills" ON bolt_skills;
CREATE POLICY "admin_insert_bolt_skills" ON bolt_skills FOR INSERT
  TO authenticated WITH CHECK (is_admin());
CREATE POLICY "admin_update_bolt_skills" ON bolt_skills FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "admin_delete_bolt_skills" ON bolt_skills FOR DELETE
  TO authenticated USING (is_admin());

-- chatbot_unanswered_queries (anon insert stays)
DROP POLICY IF EXISTS "auth_select_unanswered_queries" ON chatbot_unanswered_queries;
CREATE POLICY "admin_select_unanswered_queries" ON chatbot_unanswered_queries FOR SELECT
  TO authenticated USING (is_admin());
DROP POLICY IF EXISTS "auth_update_unanswered_queries" ON chatbot_unanswered_queries;
CREATE POLICY "admin_update_unanswered_queries" ON chatbot_unanswered_queries FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());
DROP POLICY IF EXISTS "auth_delete_unanswered_queries" ON chatbot_unanswered_queries;
CREATE POLICY "admin_delete_unanswered_queries" ON chatbot_unanswered_queries FOR DELETE
  TO authenticated USING (is_admin());

-- page_views (anon insert stays)
DROP POLICY IF EXISTS "authenticated_select_page_views" ON page_views;
CREATE POLICY "admin_select_page_views" ON page_views FOR SELECT
  TO authenticated USING (is_admin());

-- storage: CV bucket readable/deletable only by admins
DROP POLICY IF EXISTS "authenticated_read_cvs" ON storage.objects;
CREATE POLICY "admin_read_cvs" ON storage.objects FOR SELECT
  TO authenticated USING (bucket_id = 'cvs' AND is_admin());
DROP POLICY IF EXISTS "authenticated_delete_cvs" ON storage.objects;
CREATE POLICY "admin_delete_cvs" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'cvs' AND is_admin());

-- F21: applicants must not choose their own application status
REVOKE INSERT (status) ON job_applications FROM anon, authenticated;

-- F13: enforce CV upload limits server-side
UPDATE storage.buckets
SET file_size_limit = 5242880,
    allowed_mime_types = ARRAY[
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
WHERE id = 'cvs';
