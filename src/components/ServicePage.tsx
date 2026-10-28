import { useState, type FormEvent } from 'react';
import {
  Snowflake, ArrowLeft, ArrowRight, CheckCircle2, Phone, Clock,
  ShieldCheck, Users, BadgeCheck, Send, AlertCircle, Loader2,
  MessageCircle, Mail, MapPin, Link2,
} from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { HumanCheck } from '@/components/HumanCheck';
import { useSeo } from '@/hooks/useSeo';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';
import type { ServiceData } from '@/data/services';
import { SERVICES } from '@/data/services';
import { BLOG_POSTS } from '@/data/blog';

const TRUST_BADGES = [
  { icon: ShieldCheck, text: 'Garantía 3 años' },
  { icon: Clock, text: 'Respuesta en 24h' },
  { icon: BadgeCheck, text: 'Certificados RITE-07' },
  { icon: Users, text: '+5.000 clientes' },
];

const ALL_INSTALLATION_TYPES = [
  { value: 'splits_pared', label: 'Splits de pared' },
  { value: 'conductos', label: 'Centralizado por conductos' },
  { value: 'cassettes', label: 'Cassettes de techo' },
  { value: 'suelo_techo', label: 'Equipos suelo/techo' },
  { value: 'fabricacion_conductos', label: 'Fabricación de conductos (fibra Climaver / chapa galvanizada)' },
  { value: 'preinstalacion_obra', label: 'Preinstalación en obra nueva / nueva construcción' },
  { value: 'instalacion_obra', label: 'Instalación completa en obra nueva' },
  { value: 'ventilacion_viviendas', label: 'Ventilación de viviendas' },
  { value: 'ventilacion_garajes', label: 'Ventilación de garajes' },
  { value: 'airzone', label: 'Climatización inteligente Airzone' },
];

const CONTACT_INFO = [
  { icon: Phone, label: 'Teléfono', value: 'Llamar', href: 'tel:+34676628348' },
  { icon: MessageCircle, label: 'WhatsApp', value: 'nuestro WhatsApp', href: 'https://wa.me/34691680706' },
  { icon: Mail, label: 'Email', value: 'info@climont.es', href: 'mailto:info@climont.es' },
  { icon: MapPin, label: 'Dirección', value: 'Alcalá de Guadaíra, Sevilla', href: '#' },
  { icon: Clock, label: 'Horario', value: 'Lun–Vie: 8:00–14:00 / 15:00–18:00', href: '#' },
];

function buildServiceJsonLd(service: ServiceData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.metaDescription,
    serviceType: service.shortTitle,
    provider: {
      '@type': 'HVACBusiness',
      '@id': 'https://climont.es/#business',
      name: 'Climatizaciones Montaño, S.L.',
      telephone: '+34676628348',
      email: 'info@climont.es',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'C/ Hacienda Guadalupe 35',
        addressLocality: 'Alcalá de Guadaíra',
        addressRegion: 'Sevilla',
        postalCode: '41500',
        addressCountry: 'ES',
      },
    },
    areaServed: { '@type': 'AdministrativeArea', name: 'Sevilla y provincia' },
    url: `https://climont.es/servicios/${service.slug}`,
  };
}

function buildFaqJsonLd(service: ServiceData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: service.faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

function buildBreadcrumbJsonLd(service: ServiceData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://climont.es/' },
      { '@type': 'ListItem', position: 2, name: 'Servicios', item: 'https://climont.es/#servicios' },
      { '@type': 'ListItem', position: 3, name: service.shortTitle, item: `https://climont.es/servicios/${service.slug}` },
    ],
  };
}

function ServiceJsonLd({ service }: { service: ServiceData }) {
  const scripts = [buildServiceJsonLd(service), buildFaqJsonLd(service), buildBreadcrumbJsonLd(service)];
  return (
    <>
      {scripts.map((data, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
      ))}
    </>
  );
}

function ServiceContactForm({ service }: { service: ServiceData }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', city: '', service_type: service.serviceValue,
    installation_type: service.installationTypes?.[0]?.value || '', message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [humanVerified, setHumanVerified] = useState(false);
  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Introduce tu nombre';
    if (!form.email.trim()) next.email = 'Introduce tu email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Email no válido';
    if (!form.phone.trim()) next.phone = 'Introduce tu teléfono';
    if (!form.city.trim()) next.city = 'Introduce tu ciudad';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!humanVerified) { setErrors((prev) => ({ ...prev, human: 'Resuelve la verificación anti-spam para continuar' })); return; }
    setStatus('loading');
    const { error } = await supabase.from('contact_requests').insert({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      city: form.city.trim() || null,
      service_type: form.service_type,
      installation_type: form.installation_type || null,
      message: form.message.trim() || null,
    });

    if (error) {
      setStatus('error');
      return;
    }

    try {
      await fetch(`${SUPABASE_URL}/functions/v1/send-contact-email`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          city: form.city.trim(),
          service_type: form.service_type,
          installation_type: form.installation_type,
          message: form.message.trim(),
        }),
      });
    } catch {
      // Best-effort email notification
    }

    setStatus('success');
    setForm({ name: '', email: '', phone: '', city: '', service_type: service.serviceValue,
      installation_type: service.installationTypes?.[0]?.value || '', message: '' });
  };

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const inputClass = (field: string) => `w-full px-4 py-3 bg-ink-50 border rounded-xl text-ink-900 placeholder-ink-300 focus:outline-none focus:ring-2 transition-all ${
    errors[field] ? 'border-error-300 focus:ring-error-200' : 'border-ink-200 focus:ring-primary-200 focus:border-primary-400'
  }`;

  return (
    <div className="bg-white border border-ink-100 rounded-3xl p-6 lg:p-8 shadow-xl shadow-ink-900/5">
      {status === 'success' ? (
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-success-600" />
          </div>
          <h4 className="font-display text-xl font-bold text-ink-900 mb-2">¡Solicitud enviada!</h4>
          <p className="text-ink-500 mb-6 max-w-md">
            Gracias por escribirnos. Nuestro equipo te llamará en menos de 24 horas para organizar la visita técnica.
          </p>
          <button onClick={() => setStatus('idle')} className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors">
            Enviar otra solicitud
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {status === 'error' && (
            <div className="flex items-center gap-3 p-4 bg-error-50 border border-error-200 rounded-xl text-error-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              Ha ocurrido un error. Por favor, inténtalo de nuevo o llámanos por teléfono.
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="service-contact-name" className="block text-sm font-medium text-ink-700 mb-1.5">Nombre completo *</label>
              <input id="service-contact-name" type="text" value={form.name} onChange={(e) => update('name', e.target.value)}
                className={inputClass('name')} placeholder="Tu nombre" />
              {errors.name && <p className="mt-1 text-xs text-error-600">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="service-contact-city" className="block text-sm font-medium text-ink-700 mb-1.5">Ciudad *</label>
              <input id="service-contact-city" type="text" value={form.city} onChange={(e) => update('city', e.target.value)}
                className={inputClass('city')} placeholder="Sevilla, Alcalá..." />
              {errors.city && <p className="mt-1 text-xs text-error-600">{errors.city}</p>}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="service-contact-phone" className="block text-sm font-medium text-ink-700 mb-1.5">Teléfono *</label>
              <input id="service-contact-phone" type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)}
                className={inputClass('phone')} placeholder="600 123 456" />
              {errors.phone && <p className="mt-1 text-xs text-error-600">{errors.phone}</p>}
            </div>
            <div>
              <label htmlFor="service-contact-email" className="block text-sm font-medium text-ink-700 mb-1.5">Email *</label>
              <input id="service-contact-email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
                className={inputClass('email')} placeholder="tu@email.com" />
              {errors.email && <p className="mt-1 text-xs text-error-600">{errors.email}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="service-contact-installation-type" className="block text-sm font-medium text-ink-700 mb-1.5">
              Tipo de instalación <span className="text-ink-500 font-normal">(opcional)</span>
            </label>
            <select id="service-contact-installation-type" value={form.installation_type} onChange={(e) => update('installation_type', e.target.value)}
              className={`w-full px-4 py-3 bg-ink-50 border border-ink-200 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all ${!form.installation_type ? 'text-ink-300' : ''}`}>
              <option value="">Selecciona un tipo</option>
              {(service.installationTypes || ALL_INSTALLATION_TYPES).map((opt) => (
                <option key={opt.value} value={opt.value} className="text-ink-900">{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="service-contact-message" className="block text-sm font-medium text-ink-700 mb-1.5">Mensaje <span className="text-ink-500 font-normal">(opcional)</span></label>
            <textarea id="service-contact-message" value={form.message} onChange={(e) => update('message', e.target.value)}
              rows={4} maxLength={5000}
              className="w-full px-4 py-3 bg-ink-50 border border-ink-200 rounded-xl text-ink-900 placeholder-ink-300 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all resize-none"
              placeholder="Cuéntanos qué necesitas..." />
          </div>

          <HumanCheck onVerified={setHumanVerified} className="mb-2" />
          {errors.human && <p className="text-xs text-error-600 -mt-1 mb-2">{errors.human}</p>}

          <button type="submit" disabled={status === 'loading'}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/30 hover:shadow-xl">
            {status === 'loading' ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</>
            ) : (
              <><Send className="w-5 h-5" /> Solicitar presupuesto gratis</>
            )}
          </button>
          <p className="text-xs text-ink-500 text-center">Al enviar aceptas nuestra política de privacidad. No compartimos tus datos.</p>
        </form>
      )}
    </div>
  );
}

function ServiceFAQSection({ service }: { service: ServiceData }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();

  return (
    <section className="py-20 lg:py-32 bg-ink-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-semibold rounded-full mb-4">
            Preguntas frecuentes
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink-900 mb-4">
            Todo lo que necesitas saber sobre {service.shortTitle.toLowerCase()}
          </h2>
          <p className="text-ink-500">Resolvemos las dudas más comunes de nuestros clientes</p>
        </Reveal>

        <div ref={ref} className={`reveal ${isVisible ? 'is-visible' : ''} space-y-3`}>
          {service.faqs.map((item, index) => (
            <div key={index} className="bg-white border border-ink-100 rounded-2xl overflow-hidden transition-shadow hover:shadow-md">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={openIndex === index}
              >
                <span className="font-display font-semibold text-ink-800 text-sm sm:text-base">{item.question}</span>
                <svg className={`w-5 h-5 text-primary-600 flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-60' : 'max-h-0'}`}>
                <p className="px-5 pb-4 text-ink-500 text-sm leading-relaxed">{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ServicePage({ service }: { service: ServiceData }) {
  const Icon = service.icon;

  useSeo({
    title: service.metaTitle,
    description: service.metaDescription,
    canonicalPath: `/servicios/${service.slug}`,
    keywords: service.keywords,
  });

  return (
    <div className="min-h-screen bg-white">
      <ServiceJsonLd service={service} />

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
          <a href="/#servicios" className="flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-primary-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Ver todos los servicios
          </a>
        </div>
      </div>

      <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-950 pt-12 pb-20 lg:pt-20 lg:pb-32">
        <div className="absolute inset-0">
          <img src={service.heroImage} alt={`${service.shortTitle} — Climatizaciones Montaño`} className="w-full h-full object-cover opacity-20" fetchPriority="high"  width={1184} height={896} />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/90 to-ink-900/60" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-300 text-sm font-medium mb-6">
              <Icon className="w-4 h-4" />
              {service.shortTitle}
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-6">
              {service.title}
            </h1>
            <p className="text-lg lg:text-xl text-white/80 leading-relaxed mb-6">
              {service.description}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-success-500/15 border border-success-500/30 rounded-full text-success-300 text-sm font-medium mb-8">
              <CheckCircle2 className="w-4 h-4" />
              Disponible inmediato — instalación en un máximo de 3 días
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#contacto-servicio" className="group inline-flex items-center justify-center gap-2 px-7 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-xl shadow-primary-500/30 hover:-translate-y-0.5">
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

      {/* SEO intro paragraph */}
      <section className="py-12 bg-white border-b border-ink-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-lg text-ink-600 leading-relaxed text-center">
            {service.shortTitle} en la provincia, realizado por técnicos certificados RITE-07 con garantía en todos los trabajos.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-semibold rounded-full mb-4">
              Ventajas
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-900 mb-4">
              Por qué elegir nuestro servicio de {service.shortTitle.toLowerCase()}
            </h2>
            <p className="text-lg text-ink-500">
              {service.shortTitle} realizado por profesionales certificados en toda la provincia
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
            {service.benefits.map((benefit, index) => (
              <Reveal key={benefit.title} delay={index * 80}>
                <div className="group h-full bg-white rounded-2xl p-7 border border-ink-100 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-primary-500/20">
                    <CheckCircle2 className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-ink-900 mb-2">{benefit.title}</h3>
                  <p className="text-ink-500 text-sm leading-relaxed">{benefit.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features list */}
      <section className="py-16 lg:py-24 bg-ink-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 mb-4">
              Qué incluye este servicio
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {service.features.map((feature, index) => (
              <Reveal key={feature} delay={index * 60}>
                <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-ink-100">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="text-sm font-medium text-ink-800">{feature}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      {service.galleryImages.length > 0 && (
        <section className="py-20 lg:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal className="text-center mb-12">
              <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Galería
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink-900 mb-4">
                Nuestros trabajos de {service.shortTitle.toLowerCase()}
              </h2>
            </Reveal>
            <div className={`grid gap-6 ${service.galleryImages.length > 1 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'max-w-xl mx-auto'}`}>
              {service.galleryImages.map((img, index) => (
                <Reveal key={index} delay={index * 100}>
                  <div className="group relative rounded-2xl overflow-hidden shadow-lg">
                    <img src={img.src} alt={img.alt} className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500 ease-out" loading="lazy"  width={1184} height={896} />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 to-transparent pointer-events-none" />
                    {img.caption && (
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <p className="text-white text-sm font-medium">{img.caption}</p>
                      </div>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <ServiceFAQSection service={service} />

      {/* Related services and blog articles */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Related services */}
            <Reveal>
              <h3 className="font-display text-2xl font-bold text-ink-900 mb-6 flex items-center gap-2">
                <Link2 className="w-5 h-5 text-primary-600" />
                Servicios relacionados
              </h3>
              <div className="space-y-3">
                {SERVICES.filter((s) => s.slug !== service.slug).slice(0, 5).map((s) => (
                  <a key={s.slug} href={`/servicios/${s.slug}`} className="group flex items-center gap-3 p-4 bg-ink-50 rounded-xl hover:bg-primary-50 border border-ink-100 hover:border-primary-200 transition-all">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-primary-600" />
                    </div>
                    <span className="font-medium text-ink-700 group-hover:text-primary-700 transition-colors text-sm flex-1">
                      {s.shortTitle}
                    </span>
                    <ArrowRight className="w-4 h-4 text-primary-500 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </a>
                ))}
              </div>
            </Reveal>

            {/* Related blog articles */}
            {(() => {
              const serviceKeywords = service.slug === 'aerotermia' ? ['aerotermia', 'caldera', 'suelo radiante']
                : service.slug === 'mantenimiento' ? ['mantenimiento', 'filtros', 'limpiar']
                : service.slug === 'reparacion' ? ['reparación', 'avería', 'ruido']
                : service.slug === 'eficiencia' ? ['inverter', 'eficiencia', 'consume', 'bomba de calor']
                : service.slug === 'instalacion' ? ['instalación', 'conductos', 'split', 'potencia', 'marca']
                : service.slug === 'airzone' ? ['wifi', 'domótica', 'inteligente']
                : service.slug === 'constructoras' ? ['obra nueva', 'conductos', 'aerotermia']
                : service.slug === 'ventilacion' ? ['ventilación', 'aire']
                : ['aire acondicionado'];
              const related = BLOG_POSTS.filter((p) =>
                serviceKeywords.some((kw) =>
                  p.title.toLowerCase().includes(kw) || p.keywords.toLowerCase().includes(kw)
                )
              ).slice(0, 4);
              if (related.length === 0) return null;
              return (
                <Reveal delay={150}>
                  <h3 className="font-display text-2xl font-bold text-ink-900 mb-6 flex items-center gap-2">
                    <ArrowRight className="w-5 h-5 text-primary-600" />
                    Artículos del blog relacionados
                  </h3>
                  <div className="space-y-3">
                    {related.map((post) => (
                      <a key={post.slug} href={`/blog/${post.slug}`} className="group block p-4 bg-ink-50 rounded-xl hover:bg-primary-50 border border-ink-100 hover:border-primary-200 transition-all">
                        <div className="inline-block px-2.5 py-0.5 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full mb-2">
                          {post.category}
                        </div>
                        <p className="font-medium text-ink-700 group-hover:text-primary-700 transition-colors text-sm leading-snug">
                          {post.title}
                        </p>
                      </a>
                    ))}
                  </div>
                </Reveal>
              );
            })()}
          </div>
        </div>
      </section>

      {/* SEO content blocks */}
      {service.seoContent && service.seoContent.length > 0 && (
        <section className="py-20 lg:py-32 bg-ink-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {service.seoContent.map((block, index) => (
              <Reveal key={index} delay={index * 100}>
                <div className={index > 0 ? 'mt-16' : ''}>
                  <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-ink-900 mb-6">
                    {block.heading}
                  </h2>
                  {block.paragraphs.map((para, pIndex) => (
                    <p key={pIndex} className="text-lg text-ink-600 leading-relaxed mb-4">
                      {para}
                    </p>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Contact form */}
      <section id="contacto-servicio" className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden mb-16">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-900" />
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary-400 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-primary-300 rounded-full blur-3xl" />
            </div>
            <div className="relative px-6 py-12 lg:px-16 lg:py-16 flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="text-center lg:text-left">
                <h2 className="font-display text-2xl lg:text-3xl font-bold text-white mb-2">
                  ¿Necesitas {service.shortTitle.toLowerCase()}?
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

          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
            <Reveal className="lg:col-span-2">
              <div>
                <h3 className="font-display text-2xl lg:text-3xl font-bold text-ink-900 mb-4">Ponte en contacto</h3>
                <p className="text-ink-500 mb-8 leading-relaxed">
                  Rellena el formulario y te llamaremos para organizar una visita técnica gratis. También puedes contactarnos directamente por teléfono o WhatsApp.
                </p>
                <div className="space-y-4">
                  {CONTACT_INFO.map((item) => {
                    const CIcon = item.icon;
                    return (
                      <a key={item.label} href={item.href} target={item.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 bg-ink-50 rounded-2xl hover:bg-primary-50 transition-colors group">
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:bg-primary-600 transition-colors">
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
            </Reveal>
            <Reveal className="lg:col-span-3" delay={150}>
              <ServiceContactForm service={service} />
            </Reveal>
          </div>
        </div>
      </section>

      </main>

      {/* Footer */}
      <footer className="bg-ink-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Snowflake className="w-5 h-5 text-primary-400" />
            <span className="text-white/70 text-sm font-medium">Climatizaciones Montaño, S.L. — Sevilla</span>
          </div>
          <div className="flex gap-4 text-sm text-white/50">
            <a href="/" className="hover:text-primary-400 transition-colors">Inicio</a>
            <a href="/#servicios" className="hover:text-primary-400 transition-colors">Servicios</a>
            <a href="#contacto-servicio" className="hover:text-primary-400 transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
