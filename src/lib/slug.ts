/**
 * Convierte un texto en un slug apto para URL: minúsculas, sin acentos ni
 * signos, separado por guiones. Ej.: "Split Haier Geos R+ 25 (2.000 frg/h)"
 * -> "split-haier-geos-r-25-2-000-frg-h".
 */
export function slugify(value: string, maxLength = 70): string {
  const base = String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (base.length <= maxLength) return base;

  // Corta por palabra completa para no dejar guiones ni palabras a medias.
  const cut = base.slice(0, maxLength);
  const lastDash = cut.lastIndexOf('-');
  return (lastDash > 20 ? cut.slice(0, lastDash) : cut).replace(/-+$/g, '');
}

/** Devuelve el slug base si está libre, o base-2, base-3... si ya existe. */
export function uniqueSlug(base: string, taken: Iterable<string>): string {
  const used = new Set(Array.from(taken, (s) => s.toLowerCase()));
  if (!used.has(base)) return base;
  let i = 2;
  while (used.has(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
