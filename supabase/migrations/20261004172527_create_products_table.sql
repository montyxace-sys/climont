/*
# Create products table (catalog without cart)

1. New Tables
- `products`
  - `id` (uuid, primary key)
  - `name` (text, not null) — nombre del producto
  - `description` (text, not null) — descripcion del producto
  - `price` (numeric(10,2), not null) — precio en euros
  - `category` (text, not null) — categoria del producto (ej. "Splits", "Conductos", "Aerotermia", "Accesorios")
  - `image_url` (text, nullable) — URL de la imagen del producto
  - `featured` (boolean, default false) — producto destacado en el catalogo
  - `sort_order` (integer, default 0) — orden de visualizacion
  - `is_active` (boolean, default true) — producto visible/oculto en el catalogo publico
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

2. Security
- Enable RLS on `products`.
- Public read (anon + authenticated) for active products so visitors can browse the catalog.
- Only authenticated users (admin) can insert, update, and delete products.
- 4 separate policies: SELECT, INSERT, UPDATE, DELETE.
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL,
  category text NOT NULL DEFAULT 'General',
  image_url text,
  featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Public can read active products
DROP POLICY IF EXISTS "public_select_products" ON products;
CREATE POLICY "public_select_products"
ON products FOR SELECT
TO anon, authenticated
USING (true);

-- Only authenticated (admin) can insert
DROP POLICY IF EXISTS "admin_insert_products" ON products;
CREATE POLICY "admin_insert_products"
ON products FOR INSERT
TO authenticated
WITH CHECK (true);

-- Only authenticated (admin) can update
DROP POLICY IF EXISTS "admin_update_products" ON products;
CREATE POLICY "admin_update_products"
ON products FOR UPDATE
TO authenticated
USING (true) WITH CHECK (true);

-- Only authenticated (admin) can delete
DROP POLICY IF EXISTS "admin_delete_products" ON products;
CREATE POLICY "admin_delete_products"
ON products FOR DELETE
TO authenticated
USING (true);
