// Detecta texto doble-codificado (mojibake) en el codigo fuente.
// Un archivo guardado como UTF-8 y releido como Windows-1252 produce secuencias
// del tipo "A-tilde + caracter acentuado" (por ejemplo, "instalaci" con la o
// acentuada partida en dos bytes) que se ven rotas en produccion.
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SKIP = new Set(['node_modules', '.git', 'dist', '.temp', '.wrangler', '.bolt', 'build']);
const EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css', '.html', '.json', '.xml', '.sql', '.txt', '.md', '.webmanifest']);

// Solo patrones inequivocos: un lead byte UTF-8 seguido de su continuacion.
const PATTERNS = [
  { re: /\u00c3[\u0080-\u00bf]/g, name: 'latin1-doble' },   // latin-1 -> utf8
  { re: /\u00c2[\u0080-\u00bf]/g, name: 'latin1-doble' },
  { re: /\u00e2[\u20ac\u2013\u2014\u2018\u2019\u201c\u201d\u2020\u2021\u2026\u2122\u2030]/g, name: 'cp1252-doble' }, // cp1252 -> utf8
  { re: /[\u0080-\u009f]/g, name: 'control-c1' },
];

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

const problems = [];
for await (const file of walk(ROOT)) {
  if (!EXTS.has(file.slice(file.lastIndexOf('.')))) continue;
  const raw = await readFile(file, 'utf8');
  raw.split(/\r?\n/).forEach((line, i) => {
    for (const { re, name } of PATTERNS) {
      const m = line.match(re);
      if (m) problems.push({ file: relative(ROOT, file), line: i + 1, name, text: line.trim().slice(0, 120) });
    }
  });
}

if (problems.length === 0) {
  console.log('check:encoding OK - sin texto corrupto');
} else {
  console.error(`check:encoding FALLO - ${problems.length} lineas con texto corrupto:`);
  for (const p of problems) console.error(`  ${p.file}:${p.line}  [${p.name}] ${p.text}`);
  process.exit(1);
}
