import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';

const SITE = process.env.SITE_URL || 'https://climont.es';
const SERVICE_FILE = process.env.GOOGLE_SERVICE_ACCOUNT_JSON || 'google-service.json';

console.log('sync-search-console: verificando sitemap en', SITE);

try {
  // Intento con googleapis si existe un service account
  try {
    const { google } = await import('googleapis');
    let creds = null;
    const jsonPath = path.resolve(SERVICE_FILE);
    if (fs.existsSync(jsonPath)) {
      const json = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      creds = json;
    }
    if (creds && creds.client_email) {
      const auth = new google.auth.GoogleAuth({ credentials: creds, scopes: ['https://www.googleapis.com/auth/webmasters.readonly'] });
      const searchconsole = google.searchconsole({ version: 'v1', auth });
      const res = await searchconsole.sites.get({ siteUrl: SITE });
      console.log('GSC site:', res.data.siteUrl, res.data.permissionLevel);
      // try load sitemaps
      const maps = await searchconsole.sitemaps.list({ siteUrl: SITE });
      console.log('GSC sitemaps:', maps.data.sitemap?.length || 0);
    } else {
      console.log('Sin credenciales: imprimiendo solo sitemap.xml por HTTP.');
    }
  } catch (e) {
    console.warn('googleapis no disponible o error:', (e && e.message) || e);
  }

  const res = await fetch(SITE + '/sitemap.xml');
  const txt = await res.text();
  console.log('sitemap finalUrl:', SITE, 'longitud:', txt.length, 'entradas:', (txt.match(/<loc>/g) || []).length);
} catch (err) {
  console.warn('WARN: no se pudo acceder al sitemap: ', (err && err.message) || err);
  process.exitCode = 0; // no interrumpir build
}
console.log('Sincronización GC lista (para métricas reales, define GOOGLE_SERVICE_ACCOUNT_JSON).');
