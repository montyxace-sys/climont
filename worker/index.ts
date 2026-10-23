// Worker de Cloudflare para climont.es
//
// 1) Redirige www.climont.es -> climont.es con un 301 permanente
//    (dominio canónico, evita contenido duplicado en SEO).
// 2) Sirve la web estática (Workers Assets) para climont.es.
// 3) Fallback SPA defensivo: cualquier ruta desconocida sirve index.html.
// 4) Añade charset=utf-8 a HTML/JSON/JS/CSS si el asset no lo declara.

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

const CANONICAL_HOST = "climont.es";
const REDIRECT_HOSTS = new Set(["www.climont.es"]);

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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 1) Dominio canónico: www -> apex (301)
    if (REDIRECT_HOSTS.has(url.hostname.toLowerCase())) {
      const target = new URL(request.url);
      target.protocol = "https:";
      target.hostname = CANONICAL_HOST;
      return Response.redirect(target.toString(), 301);
    }

    // 2) Servir la web estática
    let response = await env.ASSETS.fetch(request);

    // 3) Fallback SPA defensivo (por si el asset no existe)
    if (
      response.status === 404 &&
      (request.method === "GET" || request.method === "HEAD")
    ) {
      const indexUrl = new URL("/index.html", url.origin);
      const indexResponse = await env.ASSETS.fetch(
        new Request(indexUrl.toString(), request),
      );
      if (indexResponse.status === 200) {
        const headers = new Headers(indexResponse.headers);
        headers.set("Content-Type", "text/html; charset=utf-8");
        return new Response(indexResponse.body, {
          status: 200,
          headers,
        });
      }
    }

    // 4) Forzar charset UTF-8 en tipos de texto
    response = withUtf8(response);

    return response;
  },
};
