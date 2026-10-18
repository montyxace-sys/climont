// Optimiza imágenes de public/: recompresa WebP/JPEG manteniendo dimensiones
import { readdir, stat, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = fileURLToPath(new URL('../public', import.meta.url));

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

let saved = 0;
for await (const file of walk(ROOT)) {
  if (/\.(webp|jpe?g)$/i.test(file) === false) continue;
  const before = (await stat(file)).size;
  if (before < 150 * 1024) continue;
  const ext = file.split('.').pop().toLowerCase();
  const input = await readFile(file); // leer en memoria: evita que sharp mantenga el archivo abierto
  const img = sharp(input);
  const out = ext === 'webp'
    ? await img.webp({ quality: 80, effort: 4 }).toBuffer()
    : await img.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  if (out.length < before) {
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        await writeFile(file, out);
        break;
      } catch (e) {
        if (attempt === 5) throw e;
        await new Promise((r) => setTimeout(r, 300 * attempt));
      }
    }
    saved += before - out.length;
    console.log(`${file.split(/[\\/]/).pop()}: ${(before / 1024).toFixed(0)} KB -> ${(out.length / 1024).toFixed(0)} KB`);
  }
}
console.log(`\nTotal ahorrado: ${(saved / 1024 / 1024).toFixed(2)} MB`);
