import { useState } from 'react';
import { Snowflake, Phone, Mail, MapPin, MessageCircle, Clock, Facebook, Instagram, Youtube, Twitter, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const FOOTER_LINKS = {
  Servicios: [
    { label: 'Instalación de aire acondicionado', href: '/servicios/instalacion' },
    { label: 'Mantenimiento', href: '/servicios/mantenimiento' },
    { label: 'Reparación', href: '/servicios/reparacion' },
    { label: 'Ventilación y extracción', href: '/servicios/ventilacion' },
    { label: 'Aerotermia', href: '/servicios/aerotermia' },
    { label: 'Energía solar térmica', href: '/servicios/solar-termica' },
    { label: 'Climatización inteligente Airzone', href: '/servicios/airzone' },
    { label: 'Eficiencia energética', href: '/servicios/eficiencia' },
    { label: 'Constructoras', href: '/servicios/constructoras' },
  ],
  Marcas: [
    { label: 'Daikin', href: '/marcas/daikin' },
    { label: 'Mitsubishi Electric', href: '/marcas/mitsubishi' },
    { label: 'Samsung', href: '/marcas/samsung' },
    { label: 'LG', href: '/marcas/lg' },
    { label: 'Panasonic', href: '/marcas/panasonic' },
    { label: 'Fujitsu', href: '/marcas/fujitsu' },
    { label: 'Hisense', href: '/marcas/hisense' },
    { label: 'Hitachi', href: '/marcas/hitachi' },
    { label: 'Johnson', href: '/marcas/johnson' },
  ],
  'Zonas de cobertura': [
    { label: 'Sevilla Capital', href: '/ciudades/sevilla-capital' },
    { label: 'Alcalá de Guadaíra', href: '/ciudades/alcala-de-guadaira' },
    { label: 'Dos Hermanas', href: '/ciudades/dos-hermanas' },
    { label: 'Mairena del Aljarafe', href: '/ciudades/mairena-del-aljarafe' },
    { label: 'Tomares', href: '/ciudades/tomares' },
    { label: 'La Rinconada', href: '/ciudades/la-rinconada' },
    { label: 'Écija', href: '/ciudades/ecija' },
    { label: 'Utrera', href: '/ciudades/utrera' },
    { label: 'Carmona', href: '/ciudades/carmona' },
    { label: 'Los Palacios y Villafranca', href: '/ciudades/los-palacios' },
    { label: 'Mairena del Alcor', href: '/ciudades/mairena-del-alcor' },
    { label: 'Coria del Río', href: '/ciudades/coria-del-rio' },
  ],
  Empresa: [
    { label: 'Ventajas', href: '/#beneficios' },
    { label: 'Reseñas de Google', href: '/#resenas' },
    { label: 'Constructoras', href: '/#constructoras' },
    { label: 'Marcas', href: '/#marcas' },
    { label: 'Catálogo de productos', href: '/catalogo' },
    { label: 'Blog de climatización', href: '/blog' },
    { label: 'Empleo', href: '/empleo' },
    { label: 'Preguntas frecuentes', href: '/#faq' },
    { label: 'Contacto', href: '/#contacto' },
  ],
  Legal: [
    { label: 'Aviso legal', href: '/aviso-legal' },
    { label: 'Política de cookies', href: '/politica-de-cookies' },
    { label: 'Mapa del sitio', href: '/sitemap.xml' },
  ],
};

export function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterState, setNewsletterState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setNewsletterState('loading');
    try {
      const { error } = await supabase.from('newsletter_subscribers').insert({ email: newsletterEmail.trim() });
      if (error && error.code !== '23505') throw error;
      setNewsletterState('success');
      setNewsletterEmail('');
    } catch {
      setNewsletterState('error');
    }
  };

  return (
    <footer className="bg-ink-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-10 py-16">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
                <Snowflake className="w-6 h-6 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                Climatizaciones <span className="text-primary-400">Montaño</span>, S.L.
              </span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm mb-6">
              Empresa de instalación, mantenimiento y reparación de aire acondicionado
              en la provincia. Técnicos certificados RITE-07, garantía en todos los trabajos y servicio
              para hogares, empresas y constructoras.
            </p>
            <div className="space-y-2">
              <a href="tel:+34676628348" className="flex items-center gap-3 text-white/70 hover:text-white text-sm transition-colors">
                <Phone className="w-4 h-4 text-primary-400" /> Llamar
              </a>
              <a href="https://wa.me/34691680706" className="flex items-center gap-3 text-white/70 hover:text-white text-sm transition-colors">
                <MessageCircle className="w-4 h-4 text-primary-400" /> 691 680 706 (WhatsApp)
              </a>
              <a href="mailto:info@climont.es" className="flex items-center gap-3 text-white/70 hover:text-white text-sm transition-colors">
                <Mail className="w-4 h-4 text-primary-400" /> info@climont.es
              </a>
              <div className="flex items-center gap-3 text-white/70 text-sm">
                <MapPin className="w-4 h-4 text-primary-400" /> C/ Hacienda Guadalupe 35, Alcalá de Guadaíra, Sevilla
              </div>
              <div className="flex items-center gap-3 text-white/70 text-sm">
                <Clock className="w-4 h-4 text-primary-400" /> Lun–Vie: 8:00–14:00 / 15:00–18:00
              </div>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h2 className="font-display font-semibold text-white mb-4 text-sm uppercase tracking-wide">
                {title}
              </h2>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-white/60 hover:text-primary-400 text-sm transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="border-t border-white/10 py-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-md">
              <h2 className="font-display text-lg font-bold text-white mb-1">Boletín de ofertas y actualizaciones</h2>
              <p className="text-white/60 text-sm leading-relaxed">
                Suscríbete para recibir novedades, ofertas y consejos de climatización en tu email.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="w-full lg:w-auto flex flex-col sm:flex-row gap-2 flex-shrink-0">
              <label htmlFor="newsletter-email" className="sr-only">Correo electrónico</label>
              <input
                id="newsletter-email"
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="tu@email.com"
                className="flex-1 min-w-[220px] px-4 py-3 bg-ink-900/60 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
              />
              <button
                type="submit"
                disabled={newsletterState === 'loading'}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors whitespace-nowrap"
              >
                {newsletterState === 'loading' ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {newsletterState === 'loading' ? 'Enviando...' : 'Suscribirse'}
              </button>
            </form>
          </div>
          {newsletterState === 'success' && (
            <p className="mt-3 text-sm text-success-400">¡Gracias! Ya estás suscrito/a. Te avisaremos de las novedades.</p>
          )}
          {newsletterState === 'error' && (
            <p className="mt-3 text-sm text-error-400">No se ha podido registrar. Inténtalo de nuevo.</p>
          )}
        </div>

        {/* Social + bottom bar */}
        <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-white/60 text-xs">
              © 2004–{new Date().getFullYear()} Climatizaciones Montaño, S.L. Todos los derechos reservados.
            </p>
            <p className="text-white/60 text-xs mt-1">Design by JMMS</p>
          </div>
          <div className="flex items-center gap-2.5">
            <a
              href="https://www.facebook.com/profile.php?id=61594903275824"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-10 h-10 rounded-xl bg-white/5 ring-1 ring-white/10 hover:ring-white/20 flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-105"
              aria-label="Facebook"
            >
              <span className="absolute inset-0 bg-[#1877F2] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Facebook className="relative w-4 h-4 text-white/60 group-hover:text-white transition-colors duration-300" />
            </a>
            <a
              href="https://www.instagram.com/climont_oficial"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-10 h-10 rounded-xl bg-white/5 ring-1 ring-white/10 hover:ring-white/20 flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-105"
              aria-label="Instagram"
            >
              <span className="absolute inset-0 bg-gradient-to-br from-[#f09433] via-[#dc2743] to-[#bc1888] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Instagram className="relative w-4 h-4 text-white/60 group-hover:text-white transition-colors duration-300" />
            </a>
            <a
              href="https://www.youtube.com/@climont"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-10 h-10 rounded-xl bg-white/5 ring-1 ring-white/10 hover:ring-white/20 flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-105"
              aria-label="YouTube"
            >
              <span className="absolute inset-0 bg-[#FF0000] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Youtube className="relative w-4 h-4 text-white/60 group-hover:text-white transition-colors duration-300" />
            </a>
            <a
              href="https://x.com/climont"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative w-10 h-10 rounded-xl bg-white/5 ring-1 ring-white/10 hover:ring-white/20 flex items-center justify-center overflow-hidden transition-all duration-300 hover:scale-105"
              aria-label="X (Twitter)"
            >
              <span className="absolute inset-0 bg-ink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Twitter className="relative w-4 h-4 text-white/60 group-hover:text-white transition-colors duration-300" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
