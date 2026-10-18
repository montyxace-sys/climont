import { useState } from 'react';
import { ChevronDown, MapPin, HelpCircle } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { CITIES } from '@/data/cities';

const FAQ_ITEMS = [
  {
    question: '¿Qué zonas cubre Climatizaciones Montaño, S.L.?',
    answer:
      'Damos servicio en toda la provincia de Sevilla: capital, Alcalá de Guadaíra, Dos Hermanas, Mairena del Aljarafe, Tomares, Coria del Río, La Rinconada, Carmona, Écija, Utrera, Los Palacios y Villafranca, Mairena del Alcor y todos los municipios de la provincia.',
  },
  {
    question: '¿El presupuesto es gratuito?',
    answer:
      'Sí, totalmente gratis y sin compromiso. Te respondemos en menos de 24 horas y organizamos una visita técnica sin coste para evaluar tu caso.',
  },
  {
    question: '¿Estáis certificados?',
    answer:
      'Sí. Estamos certificados según el RITE-07 (Reglamento de Instalaciones Térmicas en los Edificios) y cumplimos con el Código Técnico de la Edificación (CTE). Todos nuestros trabajos incluyen garantía.',
  },
  {
    question: '¿Hacéis preinstalaciones para constructoras?',
    answer:
      'Sí. Trabajamos con constructoras y promotoras en obra nueva y reformas. Hacemos desde la preinstalación hasta la instalación completa de climatización y ventilación, cumpliendo plazos y con toda la documentación técnica.',
  },
  {
    question: '¿Qué marcas instaláis?',
    answer:
      'Trabajamos con las mejores marcas del mercado: Daikin, Mitsubishi, Samsung, LG, Panasonic, Fujitsu, Hisense, Airzone y otras marcas líderes. Siempre con la garantía oficial del fabricante.',
  },
  {
    question: '¿Cuánto tarda una instalación de aire acondicionado?',
    answer:
      'Una instalación de split de pared suele llevar entre 2 y 4 horas. Las instalaciones por conductos o los proyectos más grandes pueden tardar de 1 a 3 días, según lo complejo que sea. En todos los casos cumplimos lo que acordamos contigo.',
  },
];

const COVERAGE_AREAS = [
  'Sevilla Capital',
  'Alcalá de Guadaíra',
  'Dos Hermanas',
  'Mairena del Aljarafe',
  'Tomares',
  'Coria del Río',
  'San Juan de Aznalfarache',
  'Camas',
  'La Rinconada',
  'Carmona',
  'Écija',
  'Utrera',
  'Los Palacios y Villafranca',
  'Mairena del Alcor',
  'Gines',
  'Bormujos',
  'Espartinas',
  'Castilleja de la Cuesta',
  'Pilas',
  'Olivares',
];

export function FaqCoverage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <section id="faq" className="py-16 lg:py-24 bg-ink-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* FAQ */}
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-semibold rounded-full mb-4">
                <HelpCircle className="w-4 h-4" />
                Preguntas frecuentes
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink-900 mb-4">
                Resolvemos tus dudas sobre aire acondicionado
              </h2>
              <p className="text-ink-500 mb-8">
                Todo lo que necesitas saber antes de instalar o reparar tu aire acondicionado.
              </p>
            </Reveal>

            <Reveal delay={150}>
              <div className="space-y-3">
                {FAQ_ITEMS.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white border border-ink-100 rounded-2xl overflow-hidden transition-shadow hover:shadow-md"
                  >
                    <button
                      onClick={() => setOpenIndex(openIndex === index ? null : index)}
                      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                      aria-expanded={openIndex === index}
                      aria-controls={`faq-panel-${index}`}
                      id={`faq-button-${index}`}
                    >
                      <span className="font-display font-semibold text-ink-800 text-sm sm:text-base">
                        {item.question}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-primary-600 flex-shrink-0 transition-transform duration-300 ${
                          openIndex === index ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <div
                      id={`faq-panel-${index}`}
                      className={`overflow-hidden transition-all duration-300 ${
                        openIndex === index ? 'max-h-60' : 'max-h-0'
                      }`}
                      role="region"
                      aria-labelledby={`faq-button-${index}`}
                    >
                      <p className="px-5 pb-4 text-ink-500 text-sm leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Coverage areas */}
          <div>
            <Reveal delay={100}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-semibold rounded-full mb-4">
                <MapPin className="w-4 h-4" />
                Zona de cobertura
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink-900 mb-4">
                Cobertura en toda la provincia
              </h2>
              <p className="text-ink-500 mb-8">
                Damos servicio en la capital y todos los municipios de la provincia.
                Si tu localidad no aparece en la lista, consúltanos — seguro que te cubrimos.
              </p>
            </Reveal>

            <Reveal delay={250}>
              <div className="bg-white border border-ink-100 rounded-2xl p-6 shadow-sm">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {COVERAGE_AREAS.map((area) => {
                    const cityData = CITIES.find((c) => c.name === area);
                    return cityData ? (
                      <a
                        key={area}
                        href={`/ciudades/${cityData.slug}`}
                        className="flex items-center gap-2 text-sm text-ink-600 hover:text-primary-700 py-1.5 transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                        {area}
                      </a>
                    ) : (
                      <div
                        key={area}
                        className="flex items-center gap-2 text-sm text-ink-600 py-1.5"
                      >
                        <MapPin className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                        {area}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-5 pt-5 border-t border-ink-100">
                  <p className="text-sm text-ink-400">
                    ¿No ves tu municipio? Estamos en continua expansión.
                    <a
                      href="#contacto"
                      onClick={(e) => {
                        e.preventDefault();
                        document.querySelector('#contacto')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-primary-600 font-semibold hover:text-primary-700 ml-1"
                    >
                      Consúltanos sin compromiso
                    </a>
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
