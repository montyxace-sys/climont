# Despliegue y hosting

La web se publica en **GitHub Pages** como hosting principal:

- Producción: https://climont.es
- (Temporal) Copia de respaldo en https://respaldo.climont.es cuando el dominio esté en otra plataforma.

## Publicación automática

- Cada `push` a `main` lanza `.github/workflows/deploy.yml`.
- Este compila la web y la publica en GitHub Pages. Si Netlify (opcional) falla por créditos, el step de Pages sigue.
- Los secrets del repo son solo necesarios para los destinos opcionales:
  - `PAGES_TOKEN` (GitHub).
  - `NETLIFY_AUTH_TOKEN` y `NETLIFY_SITE_ID` (si Netlify vuelve a estar disponible).

## Publicación manual

```bash
npm ci
npm run build
python scripts/deploy_pages.py   # publica dist/ en el repositorio clmont-web (CNAME = climont.es)
```

## DNS (Cloudflare)

| Tipo | Nombre | Valor |
| --- | --- | --- |
| A | `@` | 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153 (GitHub Pages) |
| CNAME | `www` | `montyxace-sys.github.io` |

- Mantener registros `MX`, `TXT`, `CNAME` de correo intactos.
- Cloudflare proxy debe estar **DNS-only** (gris) para que GitHub Pages pueda servir y emitir el certificado.

## Redirecciones

- `/servicios/<uuid>` → `/servicios/<slug>` mediante `404.html` (cliente) y `_redirects` cuando el host lo soporta.
- Las URLs heredadas de osCommerce se emiten desde `worker/index.ts` cuando se sirve mediante Cloudflare Workers.

## Notas

- El proyecto se construye con `npm run build` (Vite + prerender).
- Los catálogos de fabricantes se publican ahora en `/catalogos` (enlaces externos).
