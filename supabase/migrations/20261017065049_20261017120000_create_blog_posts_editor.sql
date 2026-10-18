/*
# Create the manual blog editor

1. New Tables
- `blog_posts` stores editable articles for the public blog and the administrator panel.
- `id` is the generated primary key.
- `slug` is the public URL identifier and is unique.
- `title`, `meta_title`, `meta_description`, `keywords`, and `excerpt` store editorial and SEO text.
- `content` stores an ordered JSON array of headings and paragraphs.
- `date`, `read_time`, `category`, and `related_services` store the article presentation data.
- `status` is either `draft` or `published`.
- `published_at`, `created_at`, and `updated_at` store publication and audit dates.

2. Security
- Row level security is enabled.
- Anonymous and signed-in visitors can read published articles only.
- Administrators can read drafts and create, update, or delete articles.
- Anonymous users cannot write blog content.
- Administrator checks use the existing `public.is_admin()` function.

3. Important Notes
- Existing code-based articles remain available while the administrator imports them into this editor.
- Drafts never appear on the public blog.
- No existing table, column, or user data is removed or changed.
*/

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  meta_title text NOT NULL,
  meta_description text NOT NULL,
  keywords text NOT NULL DEFAULT '',
  excerpt text NOT NULL,
  content jsonb NOT NULL DEFAULT '[]'::jsonb,
  date date NOT NULL DEFAULT CURRENT_DATE,
  read_time text NOT NULL DEFAULT '5 min',
  category text NOT NULL DEFAULT 'General',
  related_services jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.blog_posts FROM anon;

DROP POLICY IF EXISTS "public_read_published_blog_posts" ON public.blog_posts;
CREATE POLICY "public_read_published_blog_posts" ON public.blog_posts
  FOR SELECT TO anon, authenticated
  USING (status = 'published' OR public.is_admin());

DROP POLICY IF EXISTS "admin_insert_blog_posts" ON public.blog_posts;
CREATE POLICY "admin_insert_blog_posts" ON public.blog_posts
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_blog_posts" ON public.blog_posts;
CREATE POLICY "admin_update_blog_posts" ON public.blog_posts
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_blog_posts" ON public.blog_posts;
CREATE POLICY "admin_delete_blog_posts" ON public.blog_posts
  FOR DELETE TO authenticated
  USING (public.is_admin());

CREATE INDEX IF NOT EXISTS blog_posts_status_date_idx
  ON public.blog_posts (status, date DESC);
