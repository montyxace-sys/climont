-- Hace publico el bucket `downloads` y permite a anon leer los archivos activos.
-- Aplicar cuando se desee acceso publico a los documentos del centro de descargas.

-- 1. Bucket publico
UPDATE storage.buckets SET public = true WHERE id = 'downloads';

-- 2. Lectura publica de download_files activos
DROP POLICY IF EXISTS "public_select_active_download_files" ON download_files;
CREATE POLICY "public_select_active_download_files" ON download_files FOR SELECT
  TO anon USING (is_active = true);

-- 3. Lectura publica de objetos en el bucket downloads
DROP POLICY IF EXISTS "public_read_downloads" ON storage.objects;
CREATE POLICY "public_read_downloads" ON storage.objects FOR SELECT
  TO anon USING (bucket_id = 'downloads');
