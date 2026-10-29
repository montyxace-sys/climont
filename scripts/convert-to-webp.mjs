// scripts/convert-to-webp.mjs
import { readdirSync, statSync, writeFileSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(process.argv[2] || 'public');
async function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else if (/\.(jpe?g|png)$/i.test(e.name) && !/__\d+x\d+/.test(e.name)) {
      const out = p.replace(/\.(jpe?g|png)$/i, '.webp');
      const info = statSync(p);
      if (info.size < 10 * 1024) return;
      const buf = await sharp(p).webp({ quality: 80, effort: 4 }).toBuffer();
      if (buf.length < info.size) {
        writeFileSync(out, buf);
        unlinkSync(p); // replace
        console.log(`${path.basename(p)}: ${(info.size/1024).toFixed(0)} KB -> ${(buf.length/1024).toFixed(0)} KB`);
      }
    }
  }
}
walk(root).catch(err => { console.error(err); process.exit(1); });

