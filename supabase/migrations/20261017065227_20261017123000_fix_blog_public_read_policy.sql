/*
# Separate public and administrator blog reads

1. Modified Table
- `blog_posts` keeps the same columns and data.
- Public visitors read only rows whose status is `published`.
- Authenticated administrators can also read draft rows.

2. Security
- Replaces the combined read policy so anonymous visitors never need to execute the administrator-check function.
- Keeps administrator-only insert, update, and delete policies unchanged.
- No data is removed or modified.
*/

DROP POLICY IF EXISTS "public_read_published_blog_posts" ON public.blog_posts;
DROP POLICY IF EXISTS "authenticated_read_blog_posts" ON public.blog_posts;

CREATE POLICY "public_read_published_blog_posts" ON public.blog_posts
  FOR SELECT TO anon
  USING (status = 'published');

CREATE POLICY "authenticated_read_blog_posts" ON public.blog_posts
  FOR SELECT TO authenticated
  USING (status = 'published' OR public.is_admin());
