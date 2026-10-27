// Genera, después del build, una versión HTML propia para cada ruta pública.
//
// Motivo: la web es una SPA. Sin este paso, TODAS las URLs (servicios, ciudades,
// marcas, blog...) devuelven exactamente el mismo HTML y la misma etiqueta
// <link rel="canonical" href="https://climont.es/">. Google lo interpreta como
// decenas de páginas duplicadas de la portada y no las indexa.
//
// Aquí se escribe dist/<ruta>/index.html con su propio title, description,
// canonical y Open Graph. El cuerpo sigue siendo el de la SPA: React arranca
// igual y el usuario no nota ninguna diferencia.
//
// Además se genera sitemap.xml a partir de las rutas reales, para que nunca
// incluya URLs que no existen (causa de errores 404 en Search Console).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');
const distDir = path.join(projectRoot, 'dist');
const SITE = 'https://climont.es';
const DEFAULT_OG_IMAGE = '/og-image.webp';

const escAttr = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const escXml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

// ---------------------------------------------------------------------------
// 1. Leer los datos de la propia app (servicios, ciudades, marcas y blog)
// ---------------------------------------------------------------------------
// services.ts importa iconos de lucide-react, que no hacen falta aquí y
// arrastrarían React entero al script. Se sustituyen por un stub.
const servicesSource = fs.readFileSync(
  path.join(projectRoot, 'src/data/services.ts'),
  'utf8',
);
const iconImport = servicesSource.match(
  /import\s*\{([\s\S]*?)\}\s*from\s*'lucide-react'/,
);
const iconNames = iconImport
  ? iconImport[1]
      .split(',')
      .map((name) => name.trim().replace(/^type\s+/, ''))
      .filter((name) => /^[A-Za-z_$][\w$]*$/.test(name))
  : [];

const lucideStubPlugin = {
  name: 'lucide-stub',
  setup(buildApi) {
    buildApi.onResolve({ filter: /^lucide-react$/ }, () => ({
      path: 'lucide-react',
      namespace: 'lucide-stub',
    }));
    buildApi.onLoad({ filter: /.*/, namespace: 'lucide-stub' }, () => ({
      contents:
        iconNames.map((name) => `export const ${name} = () => null;`).join('\n') +
        '\nexport default {};\n',
      loader: 'js',
    }));
  },
};

const tmpModule = path.join(projectRoot, '.prerender-data.mjs');

await build({
  stdin: {
    contents: `
      import { SERVICES } from './src/data/services.ts';
      import { CITIES } from './src/data/cities.ts';
      import { BRANDS } from './src/data/brands.ts';
      import { BLOG_POSTS } from './src/data/blog.ts';
      export const DATA = { SERVICES, CITIES, BRANDS, BLOG_POSTS };
    `,
    resolveDir: projectRoot,
    loader: 'ts',
  },
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile: tmpModule,
  plugins: [lucideStubPlugin],
  logLevel: 'error',
});

const { DATA } = await import(
  `${pathToFileURL(tmpModule).href}?v=${Date.now()}`
);
fs.rmSync(tmpModule, { force: true });

// ---------------------------------------------------------------------------
// 2. Construir el catálogo de rutas con sus metadatos
// ---------------------------------------------------------------------------
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://xvhyclucrnxplsanspaj.supabase.co';
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2aHljbHVjcm54cGxzYW5zcGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI5MTMyODQsImV4cCI6MjEwODQ4OTI4NH0.QFHdgQNNk8L-fSQ__cbKHK807QHXbGDhjk5Cxfs8csM';

const routes = [];

const addRoute = (route) => {
  routes.push({
    path: route.path === '/' ? '/' : route.path.replace(/\/+$/, ''),
    title: route.title,
    description: route.description,
    image: route.image,
    priority: route.priority ?? 0.6,
    changefreq: route.changefreq ?? 'monthly',
    lastmod: route.lastmod,
    noindex: route.noindex ?? false,
  });
};

// Portada
addRoute({
  path: '/',
  title: 'Aire acondicionado en Sevilla | Climatizaciones Montaño',
  description:
    'Instalación, mantenimiento y reparación de aire acondicionado en Sevilla y provincia. Aerotermia, conductos, ventilación y presupuestos sin compromiso.',
  image: DEFAULT_OG_IMAGE,
  priority: 1.0,
  changefreq: 'weekly',
});

// Servicios
for (const service of DATA.SERVICES) {
  addRoute({
    path: `/servicios/${service.slug}`,
    title: service.metaTitle,
    description: service.metaDescription,
    image: service.heroImage || DEFAULT_OG_IMAGE,
    priority: 0.9,
  });
}

// Ciudades
for (const city of DATA.CITIES) {
  addRoute({
    path: `/ciudades/${city.slug}`,
    title: city.metaTitle,
    description: city.metaDescription,
    priority: 0.8,
  });
}

// Marcas
for (const brand of DATA.BRANDS) {
  addRoute({
    path: `/marcas/${brand.slug}`,
    title: brand.metaTitle,
    description: brand.metaDescription,
    image: brand.logo || DEFAULT_OG_IMAGE,
    priority: 0.7,
  });
}

// Blog (entradas estáticas; las publicadas desde el panel se añaden más abajo)
for (const post of DATA.BLOG_POSTS) {
  addRoute({
    path: `/blog/${post.slug}`,
    title: post.metaTitle,
    description: post.metaDescription,
    priority: 0.6,
    lastmod: post.date,
  });
}

// Páginas fijas (mismos textos que src/App.tsx)
const STATIC_PAGES = [
  {
    path: '/blog',
    title: 'Blog de Climatización en Sevilla | Climatizaciones Montaño, S.L.',
    description:
      'Consejos, guías y novedades sobre aire acondicionado, aerotermia, eficiencia energética y mantenimiento en Sevilla.',
    priority: 0.7,
  },
  {
    path: '/catalogo',
    title: 'Catálogo de productos de climatización | Climatizaciones Montaño, S.L.',
    description:
      'Catálogo de productos de aire acondicionado, aerotermia y climatización en Sevilla. Equipos de Daikin, Mitsubishi, Samsung, LG, Panasonic, Fujitsu, Hisense, Hitachi y Johnson.',
    priority: 0.7,
  },
  {
    path: '/codigos-de-errores',
    title: 'Códigos de errores de aire acondicionado | Climatizaciones Montaño',
    description:
      'Consulta códigos de error de aire acondicionado por marca, categoría y significado en la biblioteca profesional de Climatizaciones Montaño.',
    priority: 0.6,
  },
  {
    path: '/calculadora-frigorias',
    title:
      'Calculadora de Frigorías y Potencia de Aire Acondicionado | Climatizaciones Montaño',
    description:
      'Calcula cuántas frigorías y potencia de aire acondicionado necesita tu espacio. Herramienta gratuita profesional con orientación, aislamiento y más factores.',
    priority: 0.6,
  },
  {
    path: '/empleo',
    title:
      '¿Eres profesional del aire acondicionado? Trabaja con nosotros | Climatizaciones Montaño',
    description:
      'Únete al equipo de Climatizaciones Montaño. Buscamos técnicos certificados en climatización, aerotermia y ventilación. Estabilidad, formación continua y buen ambiente. Envíanos tu CV.',
    priority: 0.5,
  },
  {
    path: '/aviso-legal',
    title: 'Aviso Legal | Climatizaciones Montaño, S.L.',
    description:
      'Aviso legal y condiciones de uso del sitio web de Climatizaciones Montaño, S.L.',
    priority: 0.3,
    changefreq: 'yearly',
  },
  {
    path: '/politica-de-cookies',
    title: 'Política de Cookies | Climatizaciones Montaño, S.L.',
    description:
      'Política de cookies de Climatizaciones Montaño, S.L. Información sobre el uso de cookies en nuestro sitio web.',
    priority: 0.2,
    changefreq: 'yearly',
    noindex: true,
  },
  {
    path: '/descargar-logo',
    title: 'Descarga el logotipo | Climatizaciones Montaño, S.L.',
    description: 'Descarga el logotipo de Climatizaciones Montaño, S.L.',
    priority: 0.2,
    changefreq: 'yearly',
    noindex: true,
  },
  {
    path: '/centro-de-descargas',
    title: 'Centro de descargas para clientes | Climatizaciones Montaño',
    description:
      'Accede a certificados, fichas técnicas, manuales y documentación de climatización para clientes registrados.',
    priority: 0.2,
    changefreq: 'yearly',
    noindex: true,
  },
  {
    path: '/admin',
    title: 'Panel de Administración | Climatizaciones Montaño, S.L.',
    description: 'Acceso privado al panel de administración.',
    priority: 0.1,
    changefreq: 'yearly',
    noindex: true,
  },
];

for (const page of STATIC_PAGES) addRoute(page);

// Productos (dinámicos desde Supabase)
const PRODUCT_LINKS = [];
try {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/products?select=id,slug,name,description,price,image_url,tech_sheet_url,featured,category&is_active=eq.true`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    },
  );
  if (res.ok) {
    const products = await res.json();
    // Mapa id -> slug: el Worker lo usa para redirigir con 301 las URLs
    // antiguas /productos/<uuid> a la URL amigable /productos/<slug>.
    const slugMap = {};
    for (const product of products) {
      const desc = (product.description || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      const slug = product.slug || product.id;
      slugMap[product.id] = slug;
      PRODUCT_LINKS.push([`/productos/${slug}`, product.name]);
      addRoute({
        path: `/productos/${slug}`,
        title: `${product.name} | Climatizaciones Montaño, S.L.`,
        description: desc.slice(0, 160) || `Producto de climatización: ${product.name}.`,
        image: product.image_url || DEFAULT_OG_IMAGE,
        priority: 0.6,
      });
    }
    fs.writeFileSync(
      path.join(distDir, 'product-slugs.json'),
      JSON.stringify(slugMap, null, 2),
      'utf8',
    );
    console.log(`  Productos: ${products.length}`);
  } else {
    console.log(`  Productos: no se pudieron cargar (${res.status})`);
  }
} catch (err) {
  console.log(`  Productos: error al cargar (${err.message})`);
}

// Artículos publicados desde el panel (viven en Supabase, no en el código).
// Sin esta parte, /blog/<slug> respondería 404 en la primera carga y no
// aparecería en el sitemap.
try {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/blog_posts?select=slug,title,meta_title,meta_description,excerpt,date&status=eq.published`,
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    },
  );
  if (res.ok) {
    const posts = await res.json();
    const staticSlugs = new Set(DATA.BLOG_POSTS.map((post) => post.slug));
    const extra = posts.filter((post) => post.slug && !staticSlugs.has(post.slug));
    for (const post of extra) {
      addRoute({
        path: `/blog/${post.slug}`,
        title: post.meta_title || post.title,
        description:
          post.meta_description ||
          post.excerpt ||
          `Artículo sobre climatización: ${post.title}.`,
        priority: 0.6,
        lastmod: (post.date || '').slice(0, 10) || undefined,
      });
    }
    console.log(`  Artículos del panel: ${extra.length}`);
  } else {
    console.log(`  Artículos del panel: no se pudieron cargar (${res.status})`);
  }
} catch (err) {
  console.log(`  Artículos del panel: error al cargar (${err.message})`);
}

// ---------------------------------------------------------------------------
// 3. Escribir un index.html por ruta
// ---------------------------------------------------------------------------
const baseHtmlPath = path.join(distDir, 'index.html');
if (!fs.existsSync(baseHtmlPath)) {
  throw new Error(
    'No existe dist/index.html. Ejecuta "vite build" antes de prerenderizar.',
  );
}
const baseHtml = fs.readFileSync(baseHtmlPath, 'utf8');

const tag = (regex, replacement, html, label) => {
  if (!regex.test(html)) {
    throw new Error(`No se encontró la etiqueta ${label} en dist/index.html`);
  }
  return html.replace(regex, replacement);
};

// --- Enlaces y texto de respaldo para navegadores sin JavaScript ------------
// Google renderiza la SPA, pero Bing, los rastreadores de IA y los usuarios con
// JS desactivado solo ven el HTML inicial. Antes ese HTML no tenía ni un enlace
// interno; ahora cada página lleva su propio título, descripción y un mapa
// completo del sitio.
const SERVICE_LINKS = DATA.SERVICES.map((service) => [
  `/servicios/${service.slug}`,
  service.title,
]);
const CITY_LINKS = DATA.CITIES.map((city) => [`/ciudades/${city.slug}`, city.name]);
const BRAND_LINKS = DATA.BRANDS.map((brand) => [`/marcas/${brand.slug}`, brand.name]);
const BLOG_LINKS = DATA.BLOG_POSTS.map((post) => [`/blog/${post.slug}`, post.title]);
const PAGE_LINKS = [
  ['/', 'Inicio'],
  ['/catalogo', 'Catálogo de productos'],
  ['/blog', 'Blog de climatización'],
  ['/calculadora-frigorias', 'Calculadora de frigorías'],
  ['/codigos-de-errores', 'Códigos de errores'],
  ['/empleo', 'Trabaja con nosotros'],
  ['/aviso-legal', 'Aviso legal'],
];

function linkList(title, items) {
  if (!items.length) return '';
  const lis = items
    .map(([href, label]) => `<li><a href="${escAttr(href)}">${escAttr(label)}</a></li>`)
    .join('');
  return `<h2 style="font-size:1.05rem;margin:1.4rem 0 .4rem;">${escAttr(title)}</h2><ul style="margin:0;padding-left:1.2rem;">${lis}</ul>`;
}

function seoFallback(route) {
  const h1 = route.title.split(' | ')[0];
  return `<noscript>
      <div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:840px;margin:40px auto;padding:24px;color:#1e293b;line-height:1.6;">
        <h1 style="font-size:1.6rem;margin:0 0 .5rem;">${escAttr(h1)}</h1>
        <p style="margin:0 0 1rem;">${escAttr(route.description)}</p>
        <p style="margin:0;">
          <strong>Teléfono:</strong> <a href="tel:+34676628348">676 628 348</a> ·
          <strong>WhatsApp:</strong> <a href="tel:+34691680706">691 680 706</a> ·
          <strong>Email:</strong> <a href="mailto:info@climont.es">info@climont.es</a>
        </p>
        ${linkList('Servicios', SERVICE_LINKS)}
        ${linkList('Zonas de cobertura', CITY_LINKS)}
        ${linkList('Marcas', BRAND_LINKS)}
        ${linkList('Productos', PRODUCT_LINKS)}
        ${linkList('Blog', BLOG_LINKS)}
        ${linkList('Páginas', PAGE_LINKS)}
        <p style="margin-top:1.6rem;font-size:.85rem;color:#64748b;">
          Climatizaciones Montaño, S.L. · C/ Hacienda Guadalupe 35, Alcalá de Guadaíra (Sevilla)
        </p>
      </div>
    </noscript>`;
}

function renderHtml(route) {
  const url = `${SITE}${route.path === '/' ? '/' : route.path}`;
  const image = `${SITE}${route.image || DEFAULT_OG_IMAGE}`;
  const robots = route.noindex
    ? 'noindex, follow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  let html = baseHtml;

  html = tag(/<title>[^<]*<\/title>/, `<title>${escAttr(route.title)}</title>`, html, 'title');
  html = tag(
    /<meta name="title" content="[^"]*" \/>/,
    `<meta name="title" content="${escAttr(route.title)}" />`,
    html,
    'meta title',
  );
  html = tag(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${escAttr(route.description)}" />`,
    html,
    'meta description',
  );
  html = tag(
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${url}" />`,
    html,
    'canonical',
  );
  html = tag(
    /<meta name="robots" content="[^"]*" \/>/,
    `<meta name="robots" content="${robots}" />`,
    html,
    'robots',
  );
  html = tag(
    /<meta name="googlebot" content="[^"]*" \/>/,
    `<meta name="googlebot" content="${robots}" />`,
    html,
    'googlebot',
  );
  html = tag(
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${url}" />`,
    html,
    'og:url',
  );
  html = tag(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${escAttr(route.title)}" />`,
    html,
    'og:title',
  );
  html = tag(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${escAttr(route.description)}" />`,
    html,
    'og:description',
  );
  html = tag(
    /<meta property="og:image" content="[^"]*" \/>/,
    `<meta property="og:image" content="${image}" />`,
    html,
    'og:image',
  );
  html = tag(
    /<meta name="twitter:url" content="[^"]*" \/>/,
    `<meta name="twitter:url" content="${url}" />`,
    html,
    'twitter:url',
  );
  html = tag(
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${escAttr(route.title)}" />`,
    html,
    'twitter:title',
  );
  html = tag(
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${escAttr(route.description)}" />`,
    html,
    'twitter:description',
  );
  html = tag(
    /<meta name="twitter:image" content="[^"]*" \/>/,
    `<meta name="twitter:image" content="${image}" />`,
    html,
    'twitter:image',
  );

  if (/<noscript>[\s\S]*?<\/noscript>/.test(html)) {
    html = html.replace(/<noscript>[\s\S]*?<\/noscript>/, seoFallback(route));
  }

  return { html, url };
}

for (const route of routes) {
  if (route.path === '/') {
    fs.writeFileSync(baseHtmlPath, renderHtml(route).html, 'utf8');
    continue;
  }

  // Se escribe <ruta>.html (no <ruta>/index.html) para que Workers Assets
  // sirva la URL limpia con un 200 directo, sin redirección de barra final.
  const file = path.join(distDir, `${route.path}.html`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, renderHtml(route).html, 'utf8');
}

// Página 404 real: se usa index.html para que React arranque y muestre su
// pantalla de error, pero con estado HTTP 404 y sin canonical.
{
  const html404 = renderHtml({
    path: '/',
    title: 'Página no encontrada | Climatizaciones Montaño, S.L.',
    description: 'La página que buscas no existe.',
    noindex: true,
  }).html.replace(/\s*<link rel="canonical" href="[^"]*" \/>/, '');
  fs.writeFileSync(path.join(distDir, '404.html'), html404, 'utf8');
}

// ---------------------------------------------------------------------------
// 4. Generar sitemap.xml solo con las rutas que existen de verdad
// ---------------------------------------------------------------------------
const today = new Date().toISOString().slice(0, 10);
const indexable = routes.filter((route) => !route.noindex);

const sitemapEntries = indexable
  .map((route) => {
    const url = `${SITE}${route.path === '/' ? '/' : route.path}`;
    const lastmod = route.lastmod || today;
    const image = route.image
      ? `\n    <image:image>\n      <image:loc>${escXml(`${SITE}${route.image}`)}</image:loc>\n      <image:title>${escXml(route.title)}</image:title>\n    </image:image>`
      : '';
    return `  <url>
    <loc>${escXml(url)}</loc>
    <lastmod>${escXml(lastmod)}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>${image}
  </url>`;
  })
  .join('\n\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

${sitemapEntries}

</urlset>
`;

fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap, 'utf8');
// Se mantiene también la copia fuente para que el repositorio no se quede atrás.
fs.writeFileSync(path.join(projectRoot, 'public/sitemap.xml'), sitemap, 'utf8');

// ---------------------------------------------------------------------------
// 5. Resumen
// ---------------------------------------------------------------------------
const countBy = (prefix) =>
  indexable.filter((route) => route.path.startsWith(prefix)).length;

console.log('Prerender OK');
console.log(`  Rutas con HTML propio : ${routes.length}`);
console.log(`  URLs en el sitemap    : ${indexable.length}`);
console.log(
  `  Servicios ${countBy('/servicios/')} | Ciudades ${countBy('/ciudades/')} | Marcas ${countBy('/marcas/')} | Blog ${countBy('/blog/')} | Productos ${countBy('/productos/')}`,
);
