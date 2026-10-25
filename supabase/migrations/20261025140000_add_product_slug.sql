-- URLs amigables para los productos: /productos/<slug> en lugar de /productos/<uuid>
--
-- 1) Columna slug unica en products.
-- 2) Funcion slugify (minusculas, sin acentos, guiones).
-- 3) Trigger que genera el slug al crear o renombrar un producto.
-- 4) Slugs limpios para los productos existentes.

CREATE OR REPLACE FUNCTION public.slugify(txt text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT trim(both '-' from regexp_replace(
    lower(translate(
      coalesce(txt, ''),
      'áàäâãéèëêíìïîóòöôõúùüûñçÁÀÄÂÃÉÈËÊÍÌÏÎÓÒÖÔÕÚÙÜÛÑÇ',
      'aaaaaeeeeiiiiooooouuuuncAAAAAEEEEIIIIOOOOOUUUUNC'
    )),
    '[^a-z0-9]+', '-', 'g'
  ));
$$;

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug text;

CREATE OR REPLACE FUNCTION public.products_set_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  base text;
  cand text;
  n integer := 1;
BEGIN
  IF NEW.slug IS NULL OR btrim(NEW.slug) = '' THEN
    base := public.slugify(NEW.name);
    IF base = '' THEN
      base := 'producto';
    END IF;
    cand := base;
    WHILE EXISTS (
      SELECT 1 FROM public.products p WHERE p.slug = cand AND p.id <> NEW.id
    ) LOOP
      n := n + 1;
      cand := base || '-' || n;
    END LOOP;
    NEW.slug := cand;
  ELSE
    NEW.slug := public.slugify(NEW.slug);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_set_slug_trigger ON public.products;
CREATE TRIGGER products_set_slug_trigger
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.products_set_slug();

UPDATE public.products
SET slug = CASE id
  WHEN 'e7cd74da-6327-426b-abf7-c2ddc6dfa216' THEN 'split-panasonic-3000-frg-h-kit-bz35-zke'
  WHEN '6b69894f-77bf-4029-a569-0171d238058d' THEN 'split-panasonic-2000-frg-h-kit-bz25-zke'
  WHEN '8d903dfd-718b-4494-ad19-8f319c264dd5' THEN 'split-haier-geos-r-plus-25-2000-frg-h'
  WHEN '77d5306a-af85-45a7-a60f-0af066bd698d' THEN 'split-haier-geos-r-plus-35-3000-frg-h'
END
WHERE id IN (
  'e7cd74da-6327-426b-abf7-c2ddc6dfa216',
  '6b69894f-77bf-4029-a569-0171d238058d',
  '8d903dfd-718b-4494-ad19-8f319c264dd5',
  '77d5306a-af85-45a7-a60f-0af066bd698d'
);

UPDATE public.products
SET slug = public.slugify(name)
WHERE slug IS NULL OR btrim(slug) = '';

CREATE UNIQUE INDEX IF NOT EXISTS products_slug_key ON public.products (slug);

SELECT id, slug, name FROM public.products ORDER BY name;
