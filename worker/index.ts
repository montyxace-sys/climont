// Worker de Cloudflare para climont.es
//
// 1) Redirige www.climont.es -> climont.es con un 301 permanente
//    (dominio canónico, evita contenido duplicado en SEO).
// 2) Sirve la web estática (Workers Assets) para climont.es.
// 3) Fallback SPA defensivo: cualquier ruta desconocida sirve index.html.

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

const CANONICAL_HOST = "climont.es";
const REDIRECT_HOSTS = new Set(["www.climont.es"]);

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
    const response = await env.ASSETS.fetch(request);

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
        return new Response(indexResponse.body, {
          status: 200,
          headers: indexResponse.headers,
        });
      }
    }

    return response;
  },
};
