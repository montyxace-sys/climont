-- ── Tabla: product_images (galería de imágenes por producto) ──
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_sort ON product_images(product_id, sort_order);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Lectura pública (catálogo)
DROP POLICY IF EXISTS "public_read_product_images" ON product_images;
CREATE POLICY "public_read_product_images" ON product_images FOR SELECT
  TO anon, authenticated USING (true);

-- Admin CRUD
DROP POLICY IF EXISTS "admin_insert_product_images" ON product_images;
CREATE POLICY "admin_insert_product_images" ON product_images FOR INSERT
  TO authenticated WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_update_product_images" ON product_images;
CREATE POLICY "admin_update_product_images" ON product_images FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_delete_product_images" ON product_images;
CREATE POLICY "admin_delete_product_images" ON product_images FOR DELETE
  TO authenticated USING (is_admin());
