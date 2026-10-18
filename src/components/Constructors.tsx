import { Building2, FileCheck, Clock, Users, ArrowRight, MessageCircle, Phone } from 'lucide-react';
import { Reveal } from '@/components/Reveal';

const ADVANTAGES = [
  {
    icon: FileCheck,
    title: 'Proyectos certificados',
    description: 'Entregamos toda la documentación técnica y las certificaciones que exige el RITE-07 y el CTE. Todo en regla desde el primer día.',
  },
  {
    icon: Clock,
    title: 'Cumplimiento de plazos',
    description: 'Nos adaptamos al calendario de tu obra para que la entrega de llaves no se retrase por nuestra parte.',
  },
  {
    icon: Users,
    title: 'Equipo especializado',
    description: 'Equipo propio de técnicos cualificados, sin subcontratas. Así controlamos la calidad de principio a fin.',
  },
  {
    icon: Building2,
    title: 'Obra nueva y rehabilitación',
    description: 'Preinstalaciones mientras la obra está en construcción e instalaciones completas en reformas y rehabilitaciones.',
  },
];

export function Constructors() {
  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="constructoras" className="py-16 lg:py-24 bg-ink-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary-400 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-500/15 text-primary-300 text-sm font-semibold rounded-full mb-5">
                <Building2 className="w-4 h-4" />
                Servicios para constructoras y promotoras
              </span>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 leading-[1.15]">
                Instalaciones y preinstalaciones en obra nueva
              </h2>
              <p className="text-lg text-ink-300 leading-relaxed mb-8">
                Somos el socio de confianza de constructoras y promotoras en Sevilla y provincia.
                Hacemos preinstalaciones e instalaciones completas de climatización, ventilación
                y conductos en obra nueva y reformas. Cumplimos los plazos de obra y llevamos
                la documentación técnica al día.
              </p>
            </Reveal>

            <Reveal delay={150}>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {ADVANTAGES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="flex gap-3 p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary-300" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-white text-sm mb-1">
                          {item.title}
                        </h3>
                        <p className="text-ink-400 text-xs leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => scrollTo('#contacto')}
                  className="group inline-flex items-center gap-2 px-7 py-4 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl transition-all shadow-xl shadow-primary-500/30 hover:-translate-y-0.5"
                >
                  Solicitar presupuesto para obra
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
                <a
                  href="tel:+34676628348"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-white hover:bg-primary-50 text-primary-700 font-semibold rounded-xl transition-all shadow-lg hover:-translate-y-0.5"
                >
                  <Phone className="w-5 h-5" />
                  Llamar ahora
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={200}>
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/images/new-work/alcala-de-guadaira/edificio-europa-2/1791285280167.jpg"
                  alt="Climatización Daikin instalada por Climatizaciones Montaño en el Edificio Europa 2 de Alcalá de Guadaíra"
                  className="w-full h-[340px] lg:h-[440px] object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-6 -left-2 lg:-left-6 bg-white rounded-2xl shadow-xl p-5 max-w-[260px]">
                <div className="font-display text-3xl font-bold text-primary-600">RITE-07</div>
                <div className="text-sm text-ink-500 mt-1">
                  Certificación técnica y cumplimiento del CTE en cada proyecto
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={350}>
          <article className="mt-14 lg:mt-20 bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
              <div className="grid grid-cols-2 gap-2 p-2 sm:p-3">
                <img
                  src="/images/new-work/alcala-de-guadaira/edificio-europa-2/1791285280167.jpg"
                  alt="Equipos de climatización Daikin en la cubierta del Edificio Europa 2"
                  className="w-full h-64 sm:h-80 lg:h-full min-h-[280px] object-cover rounded-2xl"
                  loading="lazy"
                />
                <img
                  src="/images/new-work/alcala-de-guadaira/edificio-europa-2/1791285345778.jpg"
                  alt="Técnico revisando la instalación de climatización del Edificio Europa 2"
                  className="w-full h-64 sm:h-80 lg:h-full min-h-[280px] object-cover rounded-2xl"
                  loading="lazy"
                />
              </div>
              <div className="p-7 sm:p-9 lg:p-12 flex flex-col justify-center">
                <span className="text-primary-300 text-sm font-semibold uppercase tracking-[0.16em]">Trabajo realizado</span>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mt-3 mb-4">
                  Edificio Europa 2 · Alcalá de Guadaíra
                </h3>
                <p className="text-ink-300 leading-relaxed mb-5">
                  En este proyecto nos encargamos de climatizar el edificio con equipos de conductos Daikin y un sistema de control por zonas MYSAir. Cada estancia puede tener su propio confort y, gracias a la conexión WiFi, los usuarios pueden controlar desde el móvil la temperatura, las rejillas y el funcionamiento del sistema.
                </p>
                <p className="text-ink-300 leading-relaxed">
                  Es una instalación pensada para el día a día: cómoda, eficiente y fácil de manejar. Nosotros nos ocupamos de que todo quede bien calculado, bien instalado y funcionando como debe desde el primer momento.
                </p>
              </div>
            </div>
          </article>
        </Reveal>

        <Reveal delay={350}>
          <article className="mt-8 lg:mt-10 bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
            <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
              <div className="p-7 sm:p-9 lg:p-12 flex flex-col justify-center order-2 lg:order-1">
                <span className="text-primary-300 text-sm font-semibold uppercase tracking-[0.16em]">Trabajo realizado</span>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mt-3 mb-4">
                  Calle San José · Alcalá de Guadaíra
                </h3>
                <p className="text-ink-300 leading-relaxed mb-5">
                  En este proyecto realizamos la instalación completa de climatización por conductos
                  con equipos Daikin de alta eficiencia y zonificación con sistema de control MYSAir.
                  Cada vivienda dispone de control independiente por zonas para ajustar el confort
                  según las necesidades de cada estancia, gestionando la temperatura y las rejillas
                  desde el móvil gracias a la conexión WiFi.
                </p>
                <p className="text-ink-300 leading-relaxed">
                  Nos encargamos del diseño, la instalación y la puesta en marcha de todo el sistema,
                  garantizando un funcionamiento óptimo y un consumo eficiente desde el primer día.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 p-2 sm:p-3 order-1 lg:order-2">
                <img
                  src="/images/new-work/alcala-de-guadaira/calle-san-jose/climont_imagen_profesional_1.jpg"
                  alt="Instalación de climatización por conductos en la Calle San José de Alcalá de Guadaíra"
                  className="w-full h-44 sm:h-56 lg:h-64 object-cover rounded-2xl"
                  loading="lazy"
                />
                <img
                  src="/images/new-work/alcala-de-guadaira/calle-san-jose/climont_imagen_profesional_2.jpg"
                  alt="Equipos Daikin instalados en la Calle San José de Alcalá de Guadaíra"
                  className="w-full h-44 sm:h-56 lg:h-64 object-cover rounded-2xl"
                  loading="lazy"
                />
                <img
                  src="/images/new-work/alcala-de-guadaira/calle-san-jose/climont_imagen_profesional_3.jpg"
                  alt="Zonificación MYSAir en la Calle San José de Alcalá de Guadaíra"
                  className="w-full h-44 sm:h-56 lg:h-64 object-cover rounded-2xl"
                  loading="lazy"
                />
                <img
                  src="/images/new-work/alcala-de-guadaira/calle-san-jose/climont_imagen_profesional_4.jpg"
                  alt="Detalle de la instalación de conductos en la Calle San José"
                  className="w-full h-44 sm:h-56 lg:h-64 object-cover rounded-2xl"
                  loading="lazy"
                />
              </div>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
