# Despliegue y hosting

La web se publica en dos sitios con el mismo contenido:

| Entorno | Dominio | Plataforma | Uso |
| --- | --- | --- | --- |
| Producción | <https://climont.es> | Netlify | Hosting principal |
| Respaldo | <https://respaldo.climont.es> | GitHub Pages | Copia de seguridad |

`www.climont.es` redirige con un 301 a `climont.es`.

## Publicación automática

Cada push a `main` lanza el workflow **Publicar web**
(`.github/workflows/deploy.yml`), que compila el proyecto y lo sube a los dos
destinos. También se puede lanzar a mano desde la pestaña *Actions*.

Secretos del repositorio que usa el workflow:

| Secreto | Para qué sirve |
| --- | --- |
| `NETLIFY_AUTH_TOKEN` | Token personal de Netlify (API) |
| `NETLIFY_SITE_ID` | ID del sitio `climont-web` en Netlify |
| `PAGES_TOKEN` | Token de GitHub con permiso de escritura en `climont-web` |

## Publicación manual

```bash
npm ci
npm run build

# Netlify (principal)
python nf_push.py            # script local con el token de Netlify

# GitHub Pages (respaldo)
python scripts/deploy_pages.py
```

`scripts/deploy_pages.py` toma el token de la variable `PAGES_TOKEN` o de
`%TEMP%\opencode\gh_token.txt` en local.

## DNS (Cloudflare, zona `climont.es`)

| Tipo | Nombre | Valor |
| --- | --- | --- |
| A | `climont.es` | `75.2.60.5` (Netlify) |
| CNAME | `www` | `climont-web.netlify.app` |
| CNAME | `respaldo` | `montyxace-sys.github.io` |

Los registros van **sin proxy** de Cloudflare (nube gris): Netlify y GitHub
Pages emiten y renuevan sus propios certificados TLS.

El correo (`MX`, `SPF`, `DKIM`, `DMARC`) vive en los mismos registros de
`climont.es`; no se toca al cambiar el hosting.

## Redirecciones

- `public/_redirects` se copia tal cual a `dist/` y Netlify lo aplica:
  URLs antiguas de osCommerce (`/index.php`, `/web/*`, `/EUR/*`…) → `/catalogo`.
- Las URLs antiguas de producto (`/productos/<uuid>`) se añaden solas en cada
  build desde `scripts/prerender.mjs`.
- En GitHub Pages esas mismas redirecciones se resuelven con un pequeño script
  insertado en `404.html`.
