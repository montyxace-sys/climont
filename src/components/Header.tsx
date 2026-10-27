import { useEffect, useState } from 'react';
import { Snowflake, Menu, X, Phone, MessageCircle, ChevronDown } from 'lucide-react';
import { navigate } from '@/lib/navigate';

type NavLink = {
  label: string;
  href: string;
  primary: boolean;
};

const NAV_LINKS: NavLink[] = [
  { label: 'Inicio', href: '#inicio', primary: true },
  { label: 'Servicios', href: '#servicios', primary: true },
  { label: 'Constructoras', href: '#constructoras', primary: false },
  { label: 'Ventajas', href: '#beneficios', primary: false },
  { label: 'Marcas', href: '#marcas', primary: true },
  { label: 'Catálogo', href: '/catalogo', primary: true },
  { label: 'Códigos de errores', href: '/codigos-de-errores', primary: true },
  { label: 'Calculadora', href: '/calculadora-frigorias', primary: true },
  { label: 'Blog', href: '/blog', primary: true },
  { label: 'Empleo', href: '/empleo', primary: true },
  { label: 'Descargas', href: '/centro-de-descargas', primary: false },
  { label: 'FAQ', href: '#faq', primary: false },
  { label: 'Contacto', href: '#contacto', primary: true },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const isHome = window.location.pathname === '/' || window.location.pathname === '/index.html';
  const desktopLinks = NAV_LINKS.filter((link) => ['Inicio', 'Servicios', 'Marcas', 'Catálogo', 'Blog', 'Contacto'].includes(link.label));
  const moreLinks = NAV_LINKS.filter((link) => !desktopLinks.includes(link));

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    if (!isHome) {
      navigate(`/${href}`);
      return;
    }
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    const isRoute = href.startsWith('/');
    setMoreOpen(false);
    if (!isRoute) {
      e.preventDefault();
      handleNavClick(href);
    } else {
      setMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || menuOpen
          ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-ink-900/5'
          : 'bg-gradient-to-b from-ink-950/40 to-transparent'
      }`}
    >
      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 lg:gap-8 h-16 lg:h-20">
          {/* Logo */}
          <a
            href={isHome ? '#inicio' : '/'}
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('#inicio');
            }}
            className="flex items-center gap-2 group flex-shrink-0 z-10"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/40 ring-2 ring-white/20 group-hover:scale-105 transition-transform">
              <Snowflake className="w-7 h-7 text-white" />
            </div>
            <span
              className={`font-display font-bold text-base sm:text-lg lg:text-xl whitespace-nowrap transition-colors drop-shadow-sm ${
                scrolled || menuOpen ? 'text-ink-900' : 'text-white'
              }`}
            >
              Climatizaciones{' '}
              <span
                className={
                  scrolled || menuOpen ? 'text-primary-700' : 'text-primary-300'
                }
              >
                Montaño
              </span>
              , <span className="text-xs sm:text-sm font-medium opacity-90">S.L.</span>
            </span>
          </a>

          {/* Desktop nav + CTA */}
          <div className="hidden lg:flex items-center gap-2.5 xl:gap-3 2xl:gap-4 flex-shrink-0 z-10">
            <nav className="flex items-center gap-2 xl:gap-3 2xl:gap-3.5">
              {desktopLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className={`text-sm font-medium whitespace-nowrap transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary-500 after:transition-all hover:after:w-full ${
                    scrolled || menuOpen
                      ? 'text-ink-600 hover:text-primary-600'
                      : 'text-white/90 hover:text-white'
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <div className="relative pl-2 xl:pl-3 border-l border-current/10">
                <button
                  type="button"
                  onClick={() => setMoreOpen((open) => !open)}
                  aria-expanded={moreOpen}
                  aria-haspopup="true"
                  className={`inline-flex items-center gap-1 min-h-11 px-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    scrolled || menuOpen ? 'text-ink-600 hover:text-primary-600' : 'text-white/90 hover:text-white'
                  }`}
                >
                  Más
                  <ChevronDown className={`w-4 h-4 transition-transform ${moreOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                {moreOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-ink-100 bg-white p-2 shadow-xl shadow-ink-900/10">
                    {moreLinks.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        onClick={(e) => handleLinkClick(e, link.href)}
                        className="flex min-h-11 items-center rounded-xl px-3 text-sm font-medium text-ink-700 transition-colors hover:bg-primary-50 hover:text-primary-700"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </nav>
            <div className={`h-6 w-px flex-shrink-0 ${scrolled || menuOpen ? 'bg-ink-200' : 'bg-white/20'}`} />
            <div className="flex items-center gap-1.5 2xl:gap-2 flex-shrink-0">
              <a
                href="tel:+34676628348"
                aria-label="Llamar"
                className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all flex-shrink-0 ${
                  scrolled || menuOpen
                    ? 'border-2 border-ink-200 text-ink-700 hover:border-primary-400 hover:text-primary-600'
                    : 'border-2 border-white/30 text-white hover:border-white/60'
                }`}
              >
                <Phone className="w-5 h-5 flex-shrink-0" />
              </a>
              <a
                href="https://wa.me/34691680706"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 xl:px-3.5 2xl:px-4 py-2.5 bg-success-600 hover:bg-success-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-success-500/30 hover:-translate-y-0.5 whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 flex-shrink-0" />
                <span className="hidden xl:inline">WhatsApp</span>
              </a>
              <button
                onClick={() => handleNavClick('#contacto')}
                className="px-3.5 xl:px-4 2xl:px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5 whitespace-nowrap"
              >
                <span className="hidden xl:inline">Solicitar presupuesto</span>
                <span className="xl:hidden">Presupuesto</span>
              </button>
            </div>
          </div>

          {/* Mobile / tablet toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors flex-shrink-0 z-10 ${
              scrolled || menuOpen
                ? 'text-ink-700 hover:bg-ink-100'
                : 'text-white hover:bg-white/10'
            }`}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile / tablet menu */}
      <div
        id="mobile-navigation"
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? 'max-h-[calc(100vh-4rem)] overflow-y-auto' : 'max-h-0'
        }`}
      >
        <nav aria-label="Navegación móvil" className="bg-white border-t border-ink-100 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="px-4 py-3 text-ink-700 font-medium rounded-lg hover:bg-primary-50 hover:text-primary-700 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 pt-3 border-t border-ink-100 flex flex-col gap-3">
              <a
                href="tel:+34676628348"
                className="flex items-center justify-center gap-2 px-5 py-3.5 border-2 border-ink-200 text-ink-700 font-semibold rounded-xl hover:border-primary-400 hover:text-primary-600 transition-colors"
              >
                <Phone className="w-5 h-5 text-primary-600" /> Llamar
              </a>
              <div className="flex gap-3">
                <a
                  href="https://wa.me/34691680706"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-success-600 hover:bg-success-700 text-white font-semibold rounded-xl text-center transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </a>
                <button
                  onClick={() => handleNavClick('#contacto')}
                  className="flex-1 px-5 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-center transition-colors"
                >
                  Solicitar presupuesto
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
