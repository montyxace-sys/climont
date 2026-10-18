import { Snowflake, CheckCircle2, ArrowRight, MessageCircle } from 'lucide-react';

const HERO_IMAGE = '/og-image.webp';

const STATS = [
  { value: '25+', label: 'Años de experiencia' },
  { value: '3 años', label: 'De garantía total' },
  { value: '100%', label: 'Presupuesto gratuito y sin compromiso' },
  { value: '24h', label: 'Tiempo de respuesta' },
];

export function Hero() {
  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="inicio" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={HERO_IMAGE}
          alt="Instalación profesional de aire acondicionado"
          className="w-full h-full object-cover"
          {...({ fetchpriority: 'high' } as Record<string, string>)}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950/90 via-ink-900/80 to-ink-900/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-ink-950/20" />
      </div>

      {/* Decorative floating circles */}
      <div className="absolute top-1/4 right-20 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl animate-pulse-slow" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white/90 text-sm font-medium mb-6 animate-fade-in-up">
            <Snowflake className="w-4 h-4 text-primary-300" />
            Empresa certificada RITE-07 · Garantía 3 años
          </div>

          <h1
            className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.1] mb-6 animate-fade-in-up"
            style={{ animationDelay: '100ms' }}
          >
            Aire acondicionado en Sevilla,{' '}
            <span className="block bg-gradient-to-r from-primary-300 to-primary-500 bg-clip-text text-transparent">
              instalado por expertos
            </span>{' '}
            <span className="block text-2xl sm:text-3xl lg:text-4xl text-white/70 font-bold mt-3">
              Climatización profesional con garantía total
            </span>
          </h1>

          <p
            className="text-lg lg:text-xl text-white/80 leading-relaxed max-w-2xl mb-8 animate-fade-in-up"
            style={{ animationDelay: '200ms' }}
          >
            Instalación, reparación y mantenimiento de aire acondicionado en Sevilla y provincia.
            Trabajamos con Daikin, Mitsubishi, Samsung, LG, Panasonic, Fujitsu, Hisense, Hitachi y Johnson.
            Servicio para hogares y empresas, rápido y con garantía en cada trabajo de climatización.
          </p>

          {/* Bullet points */}
          <div
            className="flex flex-wrap gap-x-6 gap-y-2 mb-8 animate-fade-in-up"
            style={{ animationDelay: '300ms' }}
          >
            {['Presupuesto sin compromiso', 'Respuesta en 24h', 'Certificados RITE-07'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-white/90 text-sm font-medium">
                <CheckCircle2 className="w-5 h-5 text-primary-400" />
                {item}
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in-up"
            style={{ animationDelay: '400ms' }}
          >
            <button
              onClick={() => scrollTo('#contacto')}
              className="group inline-flex items-center justify-center gap-2 px-7 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/40 hover:-translate-y-0.5"
            >
              Solicitar presupuesto gratis
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="https://wa.me/34691680706"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-success-600 hover:bg-success-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-success-500/30 hover:-translate-y-0.5"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </a>
            <button
              onClick={() => scrollTo('#servicios')}
              className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white font-semibold rounded-xl transition-all"
            >
              Ver servicios
            </button>
          </div>


        </div>

        {/* Stats bar */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 max-w-4xl animate-fade-in-up"
          style={{ animationDelay: '600ms' }}
        >
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="glass border border-white/10 rounded-2xl px-5 py-4"
            >
              <div className="font-display text-2xl lg:text-3xl font-bold text-white">
                {stat.value}
              </div>
              <div className="text-white/60 text-xs lg:text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
