// Worker de Cloudflare para climont.es
//
// 1) Redirige www.climont.es -> climont.es con un 301 permanente
//    (dominio canónico, evita contenido duplicado en SEO).
// 2) Redirige con 301 las URLs heredadas del sitio antiguo (osCommerce) que
//    siguen apareciendo en Search Console.
// 3) Sirve la web estática (Workers Assets). Cada ruta pública tiene su propio
//    HTML generado por `npm run prerender`, con title/canonical propios.
// 4) Devuelve un 404 real (no un 200 con la portada) para URLs inexistentes.
// 5) Excepción: /blog/<slug> admite entradas publicadas desde el panel que no
//    existen como fichero estático; en ese caso sirve la SPA con un 200.
// 6) Añade charset=utf-8 a HTML/JSON/JS/CSS si el asset no lo declara.

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

const CANONICAL_HOST = "climont.es";
const REDIRECT_HOSTS = new Set(["www.climont.es"]);

// URL heredadas del sitio antiguo -> destino actual (301 permanente).
// Se resuelven en el Worker y no en _redirects para poder descartar la
// query string original (?main_page=...) del destino.
function legacyRedirect(pathname: string, search: string): string | null {
  const path = pathname.toLowerCase();

  if (path === "/index.php" || path.startsWith("/index.php/")) {
    // El catálogo antiguo estaba sobre index.php?main_page=...; la página
    // equivalente hoy es el catálogo.
    return "/catalogo";
  }
  if (path.startsWith("/web/") || path.startsWith("/eur/")) {
    return "/catalogo";
  }
  if (path === "/index.html") {
    return "/";
  }
  if (path.startsWith("/tel:")) {
    return "/";
  }
  // Cualquier otra URL antigua con parámetros de osCommerce ya no existe.
  if (search.includes("main_page=") || search.includes("cPath=")) {
    return "/catalogo";
  }
  return null;
}

const CHARSET_BY_TYPE: Array<[string, string]> = [
  ["text/html", "text/html; charset=utf-8"],
  ["application/ld+json", "application/ld+json; charset=utf-8"],
  ["application/json", "application/json; charset=utf-8"],
  ["text/javascript", "text/javascript; charset=utf-8"],
  ["application/javascript", "application/javascript; charset=utf-8"],
  ["text/css", "text/css; charset=utf-8"],
];

function withUtf8(response: Response): Response {
  if (response.status === 304 || response.status === 204) return response;

  const contentType = (response.headers.get("content-type") || "").toLowerCase();
  if (!contentType || contentType.includes("charset")) return response;

  const match = CHARSET_BY_TYPE.find(([type]) => contentType.includes(type));
  if (!match) return response;

  const headers = new Headers(response.headers);
  headers.set("Content-Type", match[1]);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function fetchAsset(
  env: Env,
  request: Request,
  pathname: string,
): Promise<Response> {
  const url = new URL(request.url);
  url.pathname = pathname;
  url.search = "";
  return env.ASSETS.fetch(new Request(url.toString(), request));
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const hostname = url.hostname.toLowerCase();

    // 1) Dominio canónico: www -> apex (301)
    if (REDIRECT_HOSTS.has(hostname)) {
      const target = new URL(request.url);
      target.protocol = "https:";
      target.hostname = CANONICAL_HOST;
      return Response.redirect(target.toString(), 301);
    }

    // 2) URLs heredadas del sitio antiguo (301)
    const legacyTarget = legacyRedirect(url.pathname, url.search);
    if (legacyTarget) {
      return Response.redirect(
        new URL(legacyTarget, `https://${CANONICAL_HOST}`).toString(),
        301,
      );
    }

    // 3) Normaliza la barra final con 301 (mejor que el 307 de Workers Assets)
    if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
      const target = new URL(request.url);
      target.pathname = url.pathname.replace(/\/+$/, "");
      return Response.redirect(target.toString(), 301);
    }

    // 3) Servir el asset correspondiente.
    //    Con not_found_handling = "404-page", Workers Assets ya devuelve el
    //    cuerpo de 404.html y el estado 404 cuando la ruta no existe.
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) return withUtf8(response);

    // 4) Entradas de blog publicadas desde el panel (no prerenderizadas):
    //    se sirve la SPA para que React pinte el artículo.
    if (url.pathname.startsWith("/blog/")) {
      const indexResponse = await fetchAsset(env, request, "/");
      if (indexResponse.status === 200) {
        const headers = new Headers(indexResponse.headers);
        headers.set("Content-Type", "text/html; charset=utf-8");
        return new Response(indexResponse.body, { status: 200, headers });
      }
    }

    // 5) 404 real (no un 200 con la portada) y fuera del índice.
    const headers = new Headers(response.headers);
    headers.set("Content-Type", "text/html; charset=utf-8");
    headers.set("X-Robots-Tag", "noindex");
    return new Response(response.body, { status: 404, statusText: "Not Found", headers });
  },
};
