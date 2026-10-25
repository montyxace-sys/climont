-- ── Storage bucket: product-images ──
-- Bucket público para las imágenes de los productos del catálogo.
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Admins can upload, update, delete files in product-images bucket
DROP POLICY IF EXISTS "admin_upload_product_images" ON storage.objects;
CREATE POLICY "admin_upload_product_images" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (
    bucket_id = 'product-images' AND is_admin()
  );

DROP POLICY IF EXISTS "admin_update_product_images" ON storage.objects;
CREATE POLICY "admin_update_product_images" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'product-images' AND is_admin())
  WITH CHECK (bucket_id = 'product-images' AND is_admin());

DROP POLICY IF EXISTS "admin_delete_product_images" ON storage.objects;
CREATE POLICY "admin_delete_product_images" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'product-images' AND is_admin());

-- Public read for product images (catálogo público)
DROP POLICY IF EXISTS "public_read_product_images" ON storage.objects;
CREATE POLICY "public_read_product_images" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'product-images');

-- ── Storage bucket: product-docs ──
-- Bucket público para fichas técnicas (PDF) y documentación de productos.
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-docs', 'product-docs', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "admin_upload_product_docs" ON storage.objects;
CREATE POLICY "admin_upload_product_docs" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (
    bucket_id = 'product-docs' AND is_admin()
  );

DROP POLICY IF EXISTS "admin_update_product_docs" ON storage.objects;
CREATE POLICY "admin_update_product_docs" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'product-docs' AND is_admin())
  WITH CHECK (bucket_id = 'product-docs' AND is_admin());

DROP POLICY IF EXISTS "admin_delete_product_docs" ON storage.objects;
CREATE POLICY "admin_delete_product_docs" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'product-docs' AND is_admin());

DROP POLICY IF EXISTS "public_read_product_docs" ON storage.objects;
CREATE POLICY "public_read_product_docs" ON storage.objects FOR SELECT
  TO anon, authenticated USING (bucket_id = 'product-docs');

-- ── Columna ficha técnica en products ──
ALTER TABLE products ADD COLUMN IF NOT EXISTS tech_sheet_url text;