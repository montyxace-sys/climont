import { Snowflake, ArrowLeft, ArrowRight, MessageCircle, Phone, CheckCircle2, MapPin } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { useSeo } from '@/hooks/useSeo';
import type { BrandData } from '@/data/brands';

function BrandJsonLd({ brand }: { brand: BrandData }) {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: `Instalación y reparación de aire acondicionado ${brand.name} en Sevilla`,
    provider: { '@id': 'https://climont.es/#business' },
    areaServed: { '@type': 'AdministrativeArea', name: 'Sevilla y provincia' },
    brand: { '@type': 'Brand', name: brand.name },
  };
  const faqJson = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: brand.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
  const breadcrumbJson = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://climont.es/' },
      { '@type': 'ListItem', position: 2, name: 'Marcas', item: 'https://climont.es/#marcas' },
      { '@type': 'ListItem', position: 3, name: brand.name, item: `https://climont.es/marcas/${brand.slug}` },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJson) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJson) }} />
    </>
  );
}

const TRUST_BADGES = [
  { text: 'Certificados RITE-07', icon: CheckCircle2 },
  { text: 'Garantía oficial del fabricante', icon: CheckCircle2 },
  { text: 'Presupuesto gratis en 24h', icon: CheckCircle2 },
  { text: '25+ años de experiencia', icon: CheckCircle2 },
];

const CONTACT_INFO = [
  { label: 'Teléfono', value: 'Llamar', href: 'tel:+34676628348', icon: Phone },
  { label: 'WhatsApp', value: 'nuestro WhatsApp', href: 'https://wa.me/34691680706', icon: MessageCircle },
  { label: 'Zona', value: 'Sevilla y provincia', href: '/', icon: MapPin },
];

export function BrandPage({ brand }: { brand: BrandData }) {
  useSeo({
    title: brand.metaTitle,
    description: brand.metaDescription,
    canonicalPath: `/marcas/${brand.slug}`,
    keywords: brand.keywords,
  });

  return (
    <div className="min-h-screen bg-white">
      <BrandJsonLd brand={brand} />
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-ink-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform">
              <Snowflake className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-ink-900 hidden sm:inline">
              Climatizaciones <span className="text-primary-700">Montaño</span>
            </span>
          </a>
          <a href="/#marcas" className="flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-primary-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Ver todas las marcas
          </a>
        </div>
      </div>

      <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-950 pt-12 pb-20 lg:pt-20 lg:pb-32">
        <div className="absolute inset-0">
          <img src="/office-cassette-ac.webp" alt={`${brand.name} — Instalador autorizado | Climatizaciones Montaño`} className="w-full h-full object-cover opacity-20"  width={1184} height={896} />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/90 to-ink-900/60" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-300 text-sm font-medium mb-6">
              <img src={brand.logo} alt={brand.name} className="h-4 w-auto"  width={1184} height={896} />
              Instalador autorizado {brand.name}
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-6">
              Aire acondicionado {brand.name} en Sevilla
            </h1>
            <p className="text-lg lg:text-xl text-white/80 leading-relaxed mb-6">
              {brand.intro}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#contacto-marca" className="group inline-flex items-center justify-center gap-2 px-7 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-xl shadow-primary-500/30 hover:-translate-y-0.5">
                Solicitar presupuesto gratis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="https://wa.me/34691680706" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-success-600 hover:bg-success-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-success-500/30 hover:-translate-y-0.5">
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </a>
              <a href="tel:+34676628348" className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white font-semibold rounded-xl transition-all">
                <Phone className="w-5 h-5" />
                Llamar
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <div className="border-b border-ink-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {TRUST_BADGES.map((badge) => {
              const BIcon = badge.icon;
              return (
                <div key={badge.text} className="flex items-center gap-3 justify-center lg:justify-start">
                  <BIcon className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-ink-700">{badge.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Services */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-900 mb-4">
              Servicios de aire acondicionado {brand.name}
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
            {brand.services.map((svc, index) => (
              <Reveal key={svc.title} delay={index * 80}>
                <div className="group h-full bg-white rounded-2xl p-7 border border-ink-100 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-primary-500/20">
                    <CheckCircle2 className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-ink-900 mb-2">{svc.title}</h3>
                  <p className="text-ink-500 text-sm leading-relaxed">{svc.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-16 lg:py-24 bg-ink-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 mb-4">
              Por qué elegirnos como instalador {brand.name}
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-4">
            {brand.highlights.map((highlight, index) => (
              <Reveal key={highlight} delay={index * 60}>
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-ink-100">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="text-sm font-medium text-ink-800">{highlight}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink-900 mb-4">
              Preguntas frecuentes sobre {brand.name}
            </h2>
          </Reveal>
          <div className="space-y-4">
            {brand.faqs.map((faq, index) => (
              <Reveal key={index} delay={index * 80}>
                <div className="bg-ink-50 rounded-2xl p-6 border border-ink-100">
                  <h3 className="font-display font-bold text-ink-900 mb-3 text-lg">{faq.question}</h3>
                  <p className="text-ink-600 leading-relaxed">{faq.answer}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contacto-marca" className="py-20 lg:py-32 bg-ink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden mb-16">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-900" />
            <div className="relative px-6 py-12 lg:px-16 lg:py-16 flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="text-center lg:text-left">
                <h2 className="font-display text-2xl lg:text-3xl font-bold text-white mb-2">
                  ¿Necesitas aire acondicionado {brand.name}?
                </h2>
                <p className="text-primary-100 text-base lg:text-lg">
                  Solicita tu presupuesto gratis y sin compromiso. Te respondemos en menos de 24 horas.
                </p>
              </div>
              <div className="flex gap-3">
                <a href="https://wa.me/34691680706" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-7 py-4 bg-success-600 hover:bg-success-700 text-white font-semibold rounded-xl transition-all shadow-xl hover:-translate-y-0.5 whitespace-nowrap">
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </a>
                <a href="tel:+34676628348" className="inline-flex items-center gap-2 px-7 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-all shadow-xl hover:-translate-y-0.5 whitespace-nowrap">
                  <Phone className="w-5 h-5" />
                  Llamar ahora
                </a>
              </div>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {CONTACT_INFO.map((item) => {
              const CIcon = item.icon;
              return (
                <a key={item.label} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-white rounded-2xl hover:bg-primary-50 transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-ink-50 flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                    <CIcon className="w-5 h-5 text-primary-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <div className="text-xs text-ink-500 font-medium uppercase tracking-wide">{item.label}</div>
                    <div className="text-ink-800 font-semibold">{item.value}</div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      </main>

      <footer className="bg-ink-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Snowflake className="w-5 h-5 text-primary-400" />
            <span className="text-white/70 text-sm font-medium">Climatizaciones Montaño, S.L. — {brand.name}</span>
          </div>
          <div className="flex gap-4 text-sm text-white/50">
            <a href="/" className="hover:text-primary-400 transition-colors">Inicio</a>
            <a href="/#servicios" className="hover:text-primary-400 transition-colors">Servicios</a>
            <a href="#contacto-marca" className="hover:text-primary-400 transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
