import { useState, type FormEvent } from 'react';
import {
  Snowflake, ArrowLeft, ArrowRight, CheckCircle2, Phone, Clock,
  ShieldCheck, Users, BadgeCheck, Send, AlertCircle, Loader2,
  MessageCircle, Mail, MapPin, ChevronRight,
} from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { useSeo } from '@/hooks/useSeo';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';
import { CITIES, type CityData } from '@/data/cities';

const TRUST_BADGES = [
  { icon: ShieldCheck, text: 'GarantÃ­a 3 aÃ±os' },
  { icon: Clock, text: 'Respuesta en 24h' },
  { icon: BadgeCheck, text: 'Certificados RITE-07' },
  { icon: Users, text: '+5.000 clientes' },
];

const SERVICE_OPTIONS = [
  { value: 'instalacion', label: 'InstalaciÃ³n' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'reparacion', label: 'ReparaciÃ³n' },
  { value: 'ventilacion', label: 'VentilaciÃ³n y extracciÃ³n' },
  { value: 'eficiencia', label: 'Eficiencia energÃ©tica' },
  { value: 'airzone', label: 'ClimatizaciÃ³n inteligente Airzone' },
  { value: 'constructoras', label: 'Instalaciones y preinstalaciones para constructoras' },
  { value: 'aerotermia', label: 'Aerotermia' },
  { value: 'solar-termica', label: 'EnergÃ­a solar tÃ©rmica' },
];

const ALL_INSTALLATION_TYPES = [
  { value: 'splits_pared', label: 'Splits de pared' },
  { value: 'conductos', label: 'Centralizado por conductos' },
  { value: 'cassettes', label: 'Cassettes de techo' },
  { value: 'suelo_techo', label: 'Equipos suelo/techo' },
  { value: 'fabricacion_conductos', label: 'FabricaciÃ³n de conductos (fibra Climaver / chapa galvanizada)' },
  { value: 'preinstalacion_obra', label: 'PreinstalaciÃ³n en obra nueva / nueva construcciÃ³n' },
  { value: 'instalacion_obra', label: 'InstalaciÃ³n completa en obra nueva' },
  { value: 'ventilacion_viviendas', label: 'VentilaciÃ³n de viviendas' },
  { value: 'ventilacion_garajes', label: 'VentilaciÃ³n de garajes' },
  { value: 'airzone', label: 'ClimatizaciÃ³n inteligente Airzone' },
];

const CONTACT_INFO = [
  { icon: Phone, label: 'TelÃ©fono', value: '676 628 348', href: 'tel:+34676628348' },
  { icon: MessageCircle, label: 'WhatsApp', value: '691 680 706', href: 'https://wa.me/34691680706' },
  { icon: Mail, label: 'Email', value: 'info@climont.es', href: 'mailto:info@climont.es' },
  { icon: MapPin, label: 'DirecciÃ³n', value: 'AlcalÃ¡ de GuadaÃ­ra, Sevilla', href: '#' },
  { icon: Clock, label: 'Horario', value: 'Lunâ€“Vie: 8:00â€“14:00 / 15:00â€“18:00', href: '#' },
];

const CITY_FAQS = [
  {
    question: 'Â¿CuÃ¡nto tardÃ¡is en llegar a {city}?',
    answer: 'Normalmente atendemos solicitudes en {city} en menos de 24 horas. Si tienes una averÃ­a, hacemos todo lo posible por ir el mismo dÃ­a, especialmente en verano cuando el aire acondicionado es imprescindible.',
  },
  {
    question: 'Â¿El presupuesto es gratuito en {city}?',
    answer: 'SÃ­, el presupuesto es totalmente gratuito y sin compromiso, sea cual sea tu localidad en la provincia de Sevilla. Organizamos una visita tÃ©cnica sin coste para evaluar tu caso en {city}.',
  },
  {
    question: 'Â¿QuÃ© servicios ofrecÃ©is en {city}?',
    answer: 'Ofrecemos instalaciÃ³n de aire acondicionado (splits, conductos, cassettes), mantenimiento preventivo, reparaciÃ³n, ventilaciÃ³n, aerotermia, energÃ­a solar tÃ©rmica, climatizaciÃ³n inteligente Airzone y preinstalaciones para constructoras en {city} y toda la provincia.',
  },
  {
    question: 'Â¿ReparÃ¡is todas las marcas en {city}?',
    answer: 'SÃ­, reparamos todas las marcas en {city}: Daikin, Mitsubishi, Samsung, LG, Panasonic, Fujitsu, Hisense, Hitachi, Johnson y todas las demÃ¡s. Trabajamos con repuestos originales y garantÃ­a de 6 meses en cada reparaciÃ³n.',
  },
];

function buildCityJsonLd(city: CityData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HVACBusiness',
    '@id': 'https://climont.es/#business',
    name: 'Climatizaciones MontaÃ±o, S.L.',
    telephone: '+34676628348',
    email: 'info@climont.es',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'C/ Hacienda Guadalupe 35',
      addressLocality: 'AlcalÃ¡ de GuadaÃ­ra',
      addressRegion: 'Sevilla',
      postalCode: '41500',
      addressCountry: 'ES',
    },
    areaServed: {
      '@type': 'City',
      name: city.name,
      addressRegion: 'Sevilla',
      addressCountry: 'ES',
    },
  };
}

function buildCityFaqJsonLd(city: CityData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: CITY_FAQS.map((f) => ({
      '@type': 'Question',
      name: f.question.replace('{city}', city.name),
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer.replace(/{city}/g, city.name),
      },
    })),
  };
}

function buildCityBreadcrumbJsonLd(city: CityData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://climont.es/' },
      { '@type': 'ListItem', position: 2, name: 'Cobertura', item: 'https://climont.es/#faq' },
      { '@type': 'ListItem', position: 3, name: city.name, item: `https://climont.es/ciudades/${city.slug}` },
    ],
  };
}

function CityJsonLd({ city }: { city: CityData }) {
  const scripts = [buildCityJsonLd(city), buildCityFaqJsonLd(city), buildCityBreadcrumbJsonLd(city)];
  return (
    <>
      {scripts.map((data, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
      ))}
    </>
  );
}

function CityContactForm({ city }: { city: CityData }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', city: city.name, service_type: '',
    installation_type: '', message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Introduce tu nombre';
    if (!form.email.trim()) next.email = 'Introduce tu email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Email no vÃ¡lido';
    if (!form.phone.trim()) next.phone = 'Introduce tu telÃ©fono';
    if (!form.city.trim()) next.city = 'Introduce tu ciudad';
    if (!form.service_type) next.service_type = 'Selecciona un servicio';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
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
    setForm({ name: '', email: '', phone: '', city: city.name, service_type: '', installation_type: '', message: '' });
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
          <h4 className="font-display text-xl font-bold text-ink-900 mb-2">Â¡Solicitud enviada!</h4>
          <p className="text-ink-500 mb-6 max-w-md">
            Gracias por escribirnos. Nuestro equipo te llamarÃ¡ en menos de 24 horas para organizar la visita tÃ©cnica en {city.name}.
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
              Ha ocurrido un error. Por favor, intÃ©ntalo de nuevo o llÃ¡manos al 676 628 348.
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Nombre completo *</label>
              <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)}
                className={inputClass('name')} placeholder="Tu nombre" />
              {errors.name && <p className="mt-1 text-xs text-error-600">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Ciudad *</label>
              <input type="text" value={form.city} onChange={(e) => update('city', e.target.value)}
                className={inputClass('city')} placeholder="Tu ciudad" />
              {errors.city && <p className="mt-1 text-xs text-error-600">{errors.city}</p>}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">TelÃ©fono *</label>
              <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)}
                className={inputClass('phone')} placeholder="600 123 456" />
              {errors.phone && <p className="mt-1 text-xs text-error-600">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Email *</label>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
                className={inputClass('email')} placeholder="tu@email.com" />
              {errors.email && <p className="mt-1 text-xs text-error-600">{errors.email}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">
              Tipo de instalaciÃ³n <span className="text-ink-400 font-normal">(opcional)</span>
            </label>
            <select value={form.installation_type} onChange={(e) => update('installation_type', e.target.value)}
              className={`w-full px-4 py-3 bg-ink-50 border border-ink-200 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all ${!form.installation_type ? 'text-ink-300' : ''}`}>
              <option value="">Selecciona un tipo</option>
              {ALL_INSTALLATION_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value} className="text-ink-900">{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Tipo de servicio *</label>
            <select value={form.service_type} onChange={(e) => update('service_type', e.target.value)}
              className={`${inputClass('service_type')} ${!form.service_type ? 'text-ink-300' : ''}`}>
              <option value="">Selecciona un servicio</option>
              {SERVICE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="text-ink-900">{opt.label}</option>
              ))}
            </select>
            {errors.service_type && <p className="mt-1 text-xs text-error-600">{errors.service_type}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Mensaje <span className="text-ink-400 font-normal">(opcional)</span></label>
            <textarea value={form.message} onChange={(e) => update('message', e.target.value)}
              rows={4} maxLength={5000}
              className="w-full px-4 py-3 bg-ink-50 border border-ink-200 rounded-xl text-ink-900 placeholder-ink-300 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all resize-none"
              placeholder="CuÃ©ntanos quÃ© necesitas..." />
          </div>

          <button type="submit" disabled={status === 'loading'}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/30 hover:shadow-xl">
            {status === 'loading' ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</>
            ) : (
              <><Send className="w-5 h-5" /> Solicitar presupuesto gratis</>
            )}
          </button>
          <p className="text-xs text-ink-400 text-center">Al enviar aceptas nuestra polÃ­tica de privacidad. No compartimos tus datos.</p>
        </form>
      )}
    </div>
  );
}

function CityFAQSection({ city }: { city: CityData }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 lg:py-32 bg-ink-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-semibold rounded-full mb-4">
            Preguntas frecuentes
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink-900 mb-4">
            Aire acondicionado en {city.name}: dudas frecuentes
          </h2>
        </Reveal>

        <div className="space-y-3">
          {CITY_FAQS.map((item, index) => {
            const question = item.question.replace('{city}', city.name);
            const answer = item.answer.replace(/{city}/g, city.name);
            return (
              <div key={index} className="bg-white border border-ink-100 rounded-2xl overflow-hidden transition-shadow hover:shadow-md">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={openIndex === index}
                >
                  <span className="font-display font-semibold text-ink-800 text-sm sm:text-base">{question}</span>
                  <svg className={`w-5 h-5 text-primary-600 flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-60' : 'max-h-0'}`}>
                  <p className="px-5 pb-4 text-ink-500 text-sm leading-relaxed">{answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function OtherCitiesLinks({ currentSlug }: { currentSlug: string }) {
  const otherCities = CITIES.filter((c) => c.slug !== currentSlug);
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-10">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 mb-3">
            TambiÃ©n damos servicio en otras zonas
          </h2>
          <p className="text-ink-500">Cobertura completa en toda la provincia</p>
        </Reveal>
        <div className="flex flex-wrap justify-center gap-3">
          {otherCities.map((c) => (
            <a key={c.slug} href={`/ciudades/${c.slug}`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-ink-50 hover:bg-primary-50 text-ink-700 hover:text-primary-700 text-sm font-medium rounded-xl border border-ink-100 hover:border-primary-200 transition-all">
              <MapPin className="w-4 h-4 text-primary-500" />
              {c.name}
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CityPage({ city }: { city: CityData }) {
  useSeo({
    title: city.metaTitle,
    description: city.metaDescription,
    canonicalPath: `/ciudades/${city.slug}`,
    keywords: city.keywords,
  });

  return (
    <div className="min-h-screen bg-white">
      <CityJsonLd city={city} />

      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-ink-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform">
              <Snowflake className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-ink-900 hidden sm:inline">
              Climatizaciones <span className="text-primary-500">MontaÃ±o</span>
            </span>
          </a>
          <a href="/#faq" className="flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-primary-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Ver todas las zonas
          </a>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-950 pt-12 pb-20 lg:pt-20 lg:pb-32">
        <div className="absolute inset-0 opacity-15">
          <img src="/office-cassette-ac.webp" alt={`InstalaciÃ³n de aire acondicionado en ${city.name}`} className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/90 to-ink-900/50" />
        <div className="absolute top-1/4 right-20 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-300 text-sm font-medium mb-6">
              <MapPin className="w-4 h-4" />
              Zona de cobertura
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-6">
              Aire acondicionado en {city.name}
            </h1>
            <p className="text-lg lg:text-xl text-white/80 leading-relaxed mb-6">
              {city.intro}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#contacto-ciudad" className="group inline-flex items-center justify-center gap-2 px-7 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-xl shadow-primary-500/30 hover:-translate-y-0.5">
                Solicitar presupuesto gratis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="https://wa.me/34691680706" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-success-600 hover:bg-success-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-success-500/30 hover:-translate-y-0.5">
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </a>
              <a href="tel:+34676628348" className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white font-semibold rounded-xl transition-all">
                <Phone className="w-5 h-5" />
                676 628 348
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

      {/* City highlights */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <Reveal>
              <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-semibold rounded-full mb-4">
                Por quÃ© elegirnos en {city.name}
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink-900 mb-6">
                Profesionales en climatizaciÃ³n en {city.name}
              </h2>
              <p className="text-ink-500 leading-relaxed mb-8">
                Somos una empresa con base en la provincia que lleva mÃ¡s de 25 aÃ±os instalando, reparando y manteniendo aire acondicionado en {city.name} y toda la comarca. Nuestro equipo de tÃ©cnicos certificados RITE-07 garantiza un trabajo profesional y duradero.
              </p>
              <div className="space-y-4">
                {city.highlights.map((highlight) => (
                  <div key={highlight} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 text-primary-600" />
                    </div>
                    <span className="text-ink-700 text-sm leading-relaxed">{highlight}</span>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="bg-ink-50 rounded-3xl p-8 border border-ink-100">
                <h3 className="font-display text-lg font-bold text-ink-900 mb-5">Datos de {city.name}</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-ink-200">
                    <span className="text-sm text-ink-500">Provincia</span>
                    <span className="text-sm font-semibold text-ink-900">{city.province}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-ink-200">
                    <span className="text-sm text-ink-500">CÃ³digo postal</span>
                    <span className="text-sm font-semibold text-ink-900">{city.postalCode}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-ink-200">
                    <span className="text-sm text-ink-500">PoblaciÃ³n</span>
                    <span className="text-sm font-semibold text-ink-900">{city.population} habitantes</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-ink-200">
                    <span className="text-sm text-ink-500">Distancia a Sevilla</span>
                    <span className="text-sm font-semibold text-ink-900">{city.distanceFromSevilla}</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Areas within the city */}
      <section className="py-16 lg:py-24 bg-ink-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-semibold rounded-full mb-4">
              Zonas que cubrimos
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 mb-3">
              Atendemos todos los barrios de {city.name}
            </h2>
            <p className="text-ink-500">Damos servicio en todo el municipio y sus urbanizaciones</p>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
            {city.areas.map((area) => (
              <div key={area} className="flex items-center gap-2 p-4 bg-white rounded-xl border border-ink-100">
                <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span className="text-sm font-medium text-ink-700">{area}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services available */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 mb-3">
              Servicios disponibles en {city.name}
            </h2>
            <p className="text-ink-500">Todo lo que necesitas en climatizaciÃ³n, con garantÃ­a profesional</p>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'InstalaciÃ³n de aire acondicionado', desc: 'Splits, conductos, cassettes', href: '/servicios/instalacion' },
              { title: 'Mantenimiento preventivo', desc: 'Revisiones y limpieza', href: '/servicios/mantenimiento' },
              { title: 'ReparaciÃ³n', desc: 'DiagnÃ³stico y reparaciÃ³n de averÃ­as', href: '/servicios/reparacion' },
              { title: 'Aerotermia', desc: 'CalefacciÃ³n y ACS eficiente', href: '/servicios/aerotermia' },
              { title: 'VentilaciÃ³n y extracciÃ³n', desc: 'Viviendas, garajes e industrias', href: '/servicios/ventilacion' },
              { title: 'EnergÃ­a solar tÃ©rmica', desc: 'Agua caliente con el sol', href: '/servicios/solar-termica' },
            ].map((svc) => (
              <a key={svc.title} href={svc.href} className="group p-5 bg-ink-50 rounded-2xl hover:bg-primary-50 border border-ink-100 hover:border-primary-200 transition-all">
                <h3 className="font-display font-bold text-ink-900 text-sm mb-1 group-hover:text-primary-700 transition-colors">{svc.title}</h3>
                <p className="text-xs text-ink-500">{svc.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <CityFAQSection city={city} />

      {/* Contact form */}
      <section id="contacto-ciudad" className="py-20 lg:py-32 bg-white">
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
                  Â¿Necesitas aire acondicionado en {city.name}?
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
                  Rellena el formulario y te llamaremos para organizar una visita tÃ©cnica gratis en {city.name}. TambiÃ©n puedes contactarnos directamente por telÃ©fono o WhatsApp.
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
                          <div className="text-xs text-ink-400 font-medium uppercase tracking-wide">{item.label}</div>
                          <div className="text-ink-800 font-semibold">{item.value}</div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            </Reveal>
            <Reveal className="lg:col-span-3" delay={150}>
              <CityContactForm city={city} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Other cities */}
      <OtherCitiesLinks currentSlug={city.slug} />

      {/* Footer */}
      <footer className="bg-ink-950 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Snowflake className="w-5 h-5 text-primary-400" />
            <span className="text-white/70 text-sm font-medium">Climatizaciones MontaÃ±o, S.L. â€” {city.name}</span>
          </div>
          <div className="flex gap-4 text-sm text-white/50">
            <a href="/" className="hover:text-primary-400 transition-colors">Inicio</a>
            <a href="/#servicios" className="hover:text-primary-400 transition-colors">Servicios</a>
            <a href="#contacto-ciudad" className="hover:text-primary-400 transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
