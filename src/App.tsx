import { lazy, Suspense, useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Services } from '@/components/Services';
import { WhyUs } from '@/components/WhyUs';
import { GoogleReviews } from '@/components/GoogleReviews';
import { Brands } from '@/components/Brands';
import { HomeSeoContent } from '@/components/HomeSeoContent';
import { Constructors } from '@/components/Constructors';
import { Contact } from '@/components/Contact';
import { FaqCoverage } from '@/components/FaqCoverage';
import { BlogCTA } from '@/components/BlogCTA';
import { Footer } from '@/components/Footer';
import { CookieConsent } from '@/components/CookieConsent';
import { FloatingPhoneButton } from '@/components/FloatingPhoneButton';
import { usePageTracking } from '@/hooks/usePageTracking';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useSeo } from '@/hooks/useSeo';
import { getServiceBySlug } from '@/data/services';
import { getCityBySlug } from '@/data/cities';
import { getBrandBySlug } from '@/data/brands';
import { BLOG_POSTS } from '@/data/blog';
import { navigate } from '@/lib/navigate';

const AdminPanel = lazy(() =>
  import('@/components/admin/AdminPanel').then((m) => ({ default: m.AdminPanel }))
);

// Paginas internas: se cargan solo cuando se visita su ruta, no en la portada.
const ServicePage = lazy(() => import('@/components/ServicePage').then((m) => ({ default: m.ServicePage })));
const CityPage = lazy(() => import('@/components/CityPage').then((m) => ({ default: m.CityPage })));
const BrandPage = lazy(() => import('@/components/BrandPage').then((m) => ({ default: m.BrandPage })));
const BlogPage = lazy(() => import('@/components/BlogPage').then((m) => ({ default: m.BlogPage })));
const BlogList = lazy(() => import('@/components/BlogPage').then((m) => ({ default: m.BlogList })));
const Catalog = lazy(() => import('@/components/Catalog').then((m) => ({ default: m.Catalog })));
const LogoDownload = lazy(() => import('@/components/LogoDownload').then((m) => ({ default: m.LogoDownload })));
const Careers = lazy(() => import('@/components/Careers').then((m) => ({ default: m.Careers })));
const ErrorCodesPage = lazy(() => import('@/components/ErrorCodesPage').then((m) => ({ default: m.ErrorCodesPage })));
const DownloadCenter = lazy(() => import('@/components/DownloadCenter').then((m) => ({ default: m.DownloadCenter })));
const FrigoriasCalculator = lazy(() => import('@/components/FrigoriasCalculator').then((m) => ({ default: m.FrigoriasCalculator })));
const CookiePolicy = lazy(() => import('@/components/CookiePolicy').then((m) => ({ default: m.CookiePolicy })));
const LegalNotice = lazy(() => import('@/components/LegalNotice').then((m) => ({ default: m.LegalNotice })));
const ProductPage = lazy(() => import('@/components/ProductPage').then((m) => ({ default: m.ProductPage })));

// El chat flotante se carga mas tarde (en tiempo de inactividad) para no
// competir con el contenido principal de la portada.
const ChatWidget = lazy(() => import('@/components/ChatWidget').then((m) => ({ default: m.ChatWidget })));

function normalizePath(pathname: string) {
  return pathname.replace(/\/+$/, '') || '/';
}

function usePathRoute() {
  const initialPath = normalizePath(window.location.pathname);
  const [path, setPath] = useState(initialPath);

  useEffect(() => {
    if (window.location.pathname !== initialPath) {
      window.history.replaceState({}, '', `${initialPath}${window.location.search}${window.location.hash}`);
    }
    const onChange = () => {
      const normalizedPath = normalizePath(window.location.pathname);
      if (normalizedPath !== window.location.pathname) {
        window.history.replaceState({}, '', `${normalizedPath}${window.location.search}${window.location.hash}`);
      }
      setPath(normalizedPath);
    };
    window.addEventListener('popstate', onChange);
    return () => window.removeEventListener('popstate', onChange);
  }, [initialPath]);

  return path;
}

function useHashScroll(path: string) {
  useEffect(() => {
    if (window.location.hash) {
      const hash = window.location.hash;
      if (path === '/' || path === '/index.html') {
        const el = document.querySelector(hash);
        if (el) {
          const timer = setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
          return () => clearTimeout(timer);
        }
      } else {
        const target = hash;
        window.history.replaceState({}, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
        setTimeout(() => {
          const el = document.querySelector(target);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 200);
      }
    }
  }, [path]);
}

const INTERNAL_ROUTE_PREFIXES = [
  '/servicios/', '/ciudades/', '/marcas/', '/blog/', '/productos/',
];

const INTERNAL_EXACT_ROUTES = [
  '/', '/catalogo', '/empleo', '/codigos-de-errores',
  '/calculadora-frigorias', '/descargar-logo',
  '/politica-de-cookies', '/aviso-legal', '/admin', '/blog', '/centro-de-descargas',
];

function isInternalRoute(href: string): boolean {
  if (INTERNAL_ROUTE_PREFIXES.some((p) => href.startsWith(p))) return true;
  return INTERNAL_EXACT_ROUTES.some((r) => href === r || href === r + '/');
}

function isHashRoute(href: string): boolean {
  return href.startsWith('/#') && href.length > 2;
}

function useLinkInterceptor() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const anchor = (e.target as HTMLElement)?.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href) return;
      if (href.startsWith('tel:') || href.startsWith('mailto:') || href.startsWith('http')) return;
      if (anchor.target === '_blank') return;

      if (isHashRoute(href)) {
        e.preventDefault();
        const hash = href.substring(1);
        const currentPath = window.location.pathname;
        if (currentPath === '/' || currentPath === '/index.html') {
          const el = document.querySelector(hash);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.history.pushState({}, '', href);
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
        return;
      }

      if (isInternalRoute(href)) {
        e.preventDefault();
        navigate(href);
      }
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);
}

function AppRoutes() {
  const path = usePathRoute();
  usePageTracking(path);
  useHashScroll(path);
  useLinkInterceptor();
  const [blogPosts, setBlogPosts] = useState(BLOG_POSTS);
  const [chatReady, setChatReady] = useState(false);

  // Carga diferida del chat: cuando el navegador esta inactivo o pasados unos
  // segundos, para no retrasar el render inicial de la pagina.
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number };
    if (typeof w.requestIdleCallback === 'function') {
      w.requestIdleCallback(() => setChatReady(true), { timeout: 4000 });
      return;
    }
    const timer = window.setTimeout(() => setChatReady(true), 2500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    import('@/lib/blog').then(({ loadPublishedBlogPosts }) => loadPublishedBlogPosts()).then((publishedPosts) => {
      if (cancelled || publishedPosts.length === 0) return;
      const publishedBySlug = new Map(publishedPosts.map((post) => [post.slug, post]));
      const mergedPosts = BLOG_POSTS.map((post) => publishedBySlug.get(post.slug) || post);
      const staticSlugs = new Set(BLOG_POSTS.map((post) => post.slug));
      setBlogPosts([...mergedPosts, ...publishedPosts.filter((post) => !staticSlugs.has(post.slug))]);
    });
    return () => { cancelled = true; };
  }, []);

  const isCookiePolicy = path === '/politica-de-cookies';
  const isLegalNotice = path === '/aviso-legal';
  const isAdmin = path.startsWith('/admin');
  const serviceMatch = path.match(/^\/servicios\/(.+)$/);
  const serviceSlug = serviceMatch?.[1] || '';
  const serviceData = serviceSlug ? getServiceBySlug(serviceSlug) : undefined;
  const isServicePage = !!serviceData;
  const productMatch = path.match(/^\/productos\/(.+)$/);
  const productSlug = productMatch?.[1] || '';
  const isProductPage = !!productSlug;
  const cityMatch = path.match(/^\/ciudades\/(.+)$/);
  const citySlug = cityMatch?.[1] || '';
  const cityData = citySlug ? getCityBySlug(citySlug) : undefined;
  const isCityPage = !!cityData;
  const brandMatch = path.match(/^\/marcas\/(.+)$/);
  const brandSlug = brandMatch?.[1] || '';
  const brandData = brandSlug ? getBrandBySlug(brandSlug) : undefined;
  const isBrandPage = !!brandData;
  const blogMatch = path.match(/^\/blog\/(.+)$/);
  const blogSlug = blogMatch?.[1] || '';
  const blogData = blogSlug ? blogPosts.find((post) => post.slug === blogSlug) : undefined;
  const isBlogPost = !!blogData;
  const isBlogList = path === '/blog';
  const isCatalog = path === '/catalogo';
  const isCareers = path === '/empleo';
  const isLogoDownload = path === '/descargar-logo';
  const isErrorCodes = path === '/codigos-de-errores';
  const isDownloadCenter = path === '/centro-de-descargas';
  const isFrigorias = path === '/calculadora-frigorias';
  const isNotFound = !isAdmin && !isServicePage && !isCityPage && !isBrandPage && !isBlogPost && !isBlogList && !isCatalog && !isCareers && !isCookiePolicy && !isLegalNotice && !isLogoDownload && !isErrorCodes && !isDownloadCenter && !isFrigorias && !isProductPage && path !== '/' && path !== '/index.html';

  useSeo({
    title: isCookiePolicy
      ? 'Política de Cookies | Climatizaciones Montaño, S.L.'
      : isLegalNotice
        ? 'Aviso Legal | Climatizaciones Montaño, S.L.'
      : isAdmin
        ? 'Panel de Administración | Climatizaciones Montaño, S.L.'
        : isServicePage
          ? serviceData!.metaTitle
          : isCityPage
            ? cityData!.metaTitle
            : isBrandPage
              ? brandData!.metaTitle
              : isBlogPost
                ? blogData!.metaTitle
                : isBlogList
                  ? 'Blog de Climatización en Sevilla | Climatizaciones Montaño, S.L.'
                  : isCareers
                    ? '¿Eres profesional del aire acondicionado? Trabaja con nosotros | Climatizaciones Montaño'
                    : isCatalog
                      ? 'Catálogo de productos de climatización | Climatizaciones Montaño, S.L.'
                      : isLogoDownload
                        ? 'Descarga el logotipo | Climatizaciones Montaño, S.L.'
                        : isErrorCodes
                          ? 'Códigos de errores de aire acondicionado | Climatizaciones Montaño'
                          : isDownloadCenter
                            ? 'Centro de descargas para clientes | Climatizaciones Montaño'
                          : isFrigorias
                            ? 'Calculadora de Frigorías y Potencia de Aire Acondicionado | Climatizaciones Montaño'
                          : isNotFound
                          ? 'Página no encontrada | Climatizaciones Montaño, S.L.'
                          : undefined,
    description: isCookiePolicy
      ? 'Política de cookies de Climatizaciones Montaño, S.L. Información sobre el uso de cookies en nuestro sitio web.'
      : isLegalNotice
        ? 'Aviso legal y condiciones de uso del sitio web de Climatizaciones Montaño, S.L.'
      : isServicePage
        ? serviceData!.metaDescription
        : isCityPage
          ? cityData!.metaDescription
          : isBrandPage
            ? brandData!.metaDescription
            : isBlogPost
              ? blogData!.metaDescription
              : isBlogList
                ? 'Consejos, guías y novedades sobre aire acondicionado, aerotermia, eficiencia energética y mantenimiento en Sevilla.'
                : isCareers
                  ? 'Únete al equipo de Climatizaciones Montaño. Buscamos técnicos certificados en climatización, aerotermia y ventilación. Estabilidad, formación continua y buen ambiente. Envíanos tu CV.'
                  : isCatalog
                    ? 'Catálogo de productos de aire acondicionado, aerotermia y climatización en Sevilla. Equipos de Daikin, Mitsubishi, Samsung, LG, Panasonic, Fujitsu, Hisense, Hitachi y Johnson.'
                    : isLogoDownload
                      ? 'Descarga el logotipo de Climatizaciones Montaño, S.L.'
                      : isErrorCodes
                        ? 'Consulta códigos de error de aire acondicionado por marca, categoría y significado en la biblioteca profesional de Climatizaciones Montaño.'
                        : isDownloadCenter
                          ? 'Accede a certificados, fichas técnicas, manuales y documentación de climatización para clientes registrados.'
                        : isFrigorias
                          ? 'Calcula cuántas frigorías y potencia de aire acondicionado necesita tu espacio. Herramienta gratuita profesional con orientación, aislamiento y más factores.'
                        : isNotFound
                          ? 'La página que buscas no existe.'
                        : undefined,
    canonicalPath: isCookiePolicy
      ? '/politica-de-cookies'
      : isLegalNotice
        ? '/aviso-legal'
      : isServicePage
        ? `/servicios/${serviceData!.slug}`
        : isCityPage
          ? `/ciudades/${cityData!.slug}`
          : isBrandPage
            ? `/marcas/${brandData!.slug}`
            : isBlogPost
              ? `/blog/${blogData!.slug}`
              : isBlogList
                ? '/blog'
                : isCareers
                  ? '/empleo'
                  : isCatalog
                    ? '/catalogo'
                    : isLogoDownload
                      ? '/descargar-logo'
                      : isErrorCodes
                        ? '/codigos-de-errores'
                        : isDownloadCenter
                          ? '/centro-de-descargas'
                        : isFrigorias
                          ? '/calculadora-frigorias'
                        : isProductPage
                          ? `/productos/${productSlug}`
                        : undefined,
    keywords: isServicePage
      ? serviceData!.keywords
      : isCityPage
        ? cityData!.keywords
        : isBrandPage
          ? brandData!.keywords
          : isBlogPost
            ? blogData!.keywords
            : isCatalog
              ? 'catálogo climatización Sevilla, productos aire acondicionado Sevilla, equipos Daikin Mitsubishi Samsung LG Sevilla, aerotermia Sevilla catálogo, splits conductos cassettes Sevilla'
              : isErrorCodes
                ? 'códigos error aire acondicionado, códigos avería climatización, códigos Daikin, códigos Mitsubishi, códigos Samsung, códigos LG, códigos Haier, códigos Midea'
                : 'aire acondicionado Sevilla, instalación aire acondicionado Sevilla, mantenimiento aire acondicionado Sevilla, reparación aire acondicionado Sevilla, instalador aire acondicionado Sevilla, climatización Sevilla, aerotermia Sevilla, conductos climatización Sevilla, Daikin Sevilla, Mitsubishi Sevilla, Samsung Sevilla, Panasonic Sevilla, Fujitsu Sevilla, Hitachi Sevilla, Hisense Sevilla, LG Sevilla, Johnson Sevilla, Airzone Sevilla, Climaver Sevilla, preinstalación constructoras Sevilla, ventilación Sevilla, energía solar térmica Sevilla, eficiencia energética Sevilla, presupuesto aire acondicionado Sevilla',
    noIndex: isAdmin || isCookiePolicy || isLogoDownload || isDownloadCenter || isNotFound,
    // En fichas de producto el SEO lo aplica ProductPage cuando ya tiene los
    // datos reales (título, descripción y canonical con el slug).
    disabled: isProductPage,
  });

  if (isAdmin) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-ink-950 text-white">
            Cargando panel…
          </div>
        }
      >
        <ErrorBoundary label="admin">
          <AdminPanel />
        </ErrorBoundary>
      </Suspense>
    );
  }

  if (isDownloadCenter) {
    return <DownloadCenter />;
  }

  if (isServicePage) {
    return <><ServicePage service={serviceData!} /><Footer /><FloatingPhoneButton /></>;
  }

  if (isProductPage) {
    return (
      <>
        <ProductPage slug={productSlug} />
        <Footer />
        <FloatingPhoneButton />
      </>
    );
  }

  if (isCityPage) {
    return <><CityPage city={cityData!} /><Footer /><FloatingPhoneButton /></>;
  }

  if (isBrandPage) {
    return <><BrandPage brand={brandData!} /><Footer /><FloatingPhoneButton /></>;
  }

  if (isBlogPost) {
    return <><BlogPage post={blogData!} /><Footer /><FloatingPhoneButton /></>;
  }

  if (isLogoDownload) {
    return <><LogoDownload /><Footer /><FloatingPhoneButton /></>;
  }

  if (isErrorCodes) {
    return <><ErrorCodesPage /><Footer /><FloatingPhoneButton /></>;
  }

  if (isFrigorias) {
    return <><FrigoriasCalculator /><Footer /></>;
  }

  if (isNotFound) {
    return (
      <>
      <div className="min-h-screen bg-ink-50 flex flex-col">
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-lg text-center">
            <p className="text-primary-600 font-semibold mb-3">404</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink-900 mb-4">Esta página no existe</h1>
            <p className="text-ink-500 leading-relaxed mb-8">Puede que el enlace esté desactualizado o que la página se haya movido.</p>
            <a href="/" className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors">Volver al inicio</a>
          </div>
        </main>
      </div>
      <Footer />
      </>
    );
  }

  if (isCatalog) {
    return <><Catalog /><Footer /><FloatingPhoneButton /></>;
  }

  if (isCareers) {
    return <><Careers /><Footer /><FloatingPhoneButton /></>;
  }

  if (isBlogList) {
    return <><BlogList posts={blogPosts} /><Footer /><FloatingPhoneButton /></>;
  }

  if (path === '/aviso-legal') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-1">
          <LegalNotice />
        </div>
        <Footer />
        <FloatingPhoneButton />
      </div>
    );
  }

  if (path === '/politica-de-cookies') {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex-1">
          <CookiePolicy />
        </div>
        <Footer />
        <FloatingPhoneButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Hero />
        <GoogleReviews />
        <Services />
        <WhyUs />
        <Constructors />
        <Brands />
        <HomeSeoContent />
        <FaqCoverage />
        <BlogCTA />
        <Contact />
      </main>
      <Footer />
      <CookieConsent />
      {chatReady && (
        <Suspense fallback={null}>
          <ChatWidget />
        </Suspense>
      )}
      <FloatingPhoneButton />
    </div>
  );
}

function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-ink-500 text-sm">
      Cargando…
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<PageLoading />}>
      <AppRoutes />
    </Suspense>
  );
}

export default App;
