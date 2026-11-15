import {
  Wrench,
  Settings,
  Snowflake,
  Wind,
  Zap,
  Smartphone,
  Building2,
  Sun,
  Flame,
  ArrowUpRight,
} from 'lucide-react';
import { Reveal } from '@/components/Reveal';

const SERVICE_SLUGS = [
  'instalacion', 'mantenimiento', 'reparacion', 'ventilacion',
  'eficiencia', 'airzone', 'aerotermia', 'solar-termica', 'constructoras',
];

const SERVICES = [
  {
    icon: Snowflake,
    title: 'Instalación de aire acondicionado',
    description:
      'Estudiamos tu espacio y montamos el sistema que mejor encaja contigo.',
    features: ['Splits', 'Conductos', 'Cassettes y suelo/techo'],
    image:
      '/office-cassette-ac.webp',
  },
  {
    icon: Settings,
    title: 'Mantenimiento preventivo',
    description:
      'Revisiones sencillas para alargar la vida del equipo y evitar averías.',
    features: ['Limpieza de filtros', 'Revisión del circuito', 'Plan anual'],
    image:
      '/maintenance-filter-cleaning.webp',
  },
  {
    icon: Wrench,
    title: 'Reparación y diagnóstico',
    description:
      'Localizamos la avería y te explicamos la solución antes de reparar.',
    features: ['Diagnóstico', 'Repuestos originales', 'Garantía'],
    image:
      '/reparacion-mitsubishi-tecnico.webp',
  },
  {
    icon: Wind,
    title: 'Ventilación y extracción',
    description:
      'Renovamos y extraemos el aire para crear espacios más saludables.',
    features: ['Viviendas y locales', 'Garajes y cocinas', 'Recuperación de calor'],
    image:
      'https://images.pexels.com/photos/36335953/pexels-photo-36335953.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    icon: Zap,
    title: 'Eficiencia energética',
    description:
      'Analizamos el consumo y proponemos mejoras que reduzcan la factura.',
    features: ['Auditoría', 'Equipos inverter', 'Certificación'],
    image:
      '/energy-efficiency-green-world.webp',
  },
  {
    icon: Smartphone,
    title: 'Climatización inteligente Airzone',
    description:
      'Controla cada zona desde el móvil y climatiza solo lo que necesitas.',
    features: ['Control por zonas', 'App WiFi', 'Ahorro'],
    image:
      'https://images.pexels.com/photos/32737485/pexels-photo-32737485.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    icon: Flame,
    title: 'Instalación de aerotermia',
    description:
      'Calefacción y agua caliente aprovechando la energía del aire.',
    features: ['Calefacción y ACS', 'Ahorro energético', 'Suelo radiante y radiadores'],
    image:
      '/aerotermia-daikin-installer.jpg',
  },
  {
    icon: Sun,
    title: 'Agua caliente sanitaria por energía solar',
    description:
      'Agua caliente con una fuente limpia y renovable.',
    features: ['Paneles térmicos', 'ACS para viviendas y empresas', 'Depósitos y certificación'],
    image:
      '/solar-thermosiphon-acs-installer.webp',
  },
  {
    icon: Building2,
    title: 'Instalaciones y preinstalaciones para constructoras',
    description:
      'Coordinamos la climatización y ventilación de tu obra desde la preinstalación hasta la puesta en marcha.',
    features: ['Preinstalación e instalación', 'Coordinación de obra', 'Documentación técnica'],
    image:
      '/images/new-work/alcala-de-guadaira/edificio-europa-2/1791285345778.jpg',
  },
];

export function Services() {
  return (
    <section id="servicios" className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <Reveal className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-semibold rounded-full mb-4">
            Nuestros servicios
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-900 mb-4">
            Instalación de aire acondicionado en Sevilla y provincia
          </h2>
          <p className="text-lg text-ink-500">
            Climatización, mantenimiento y soluciones eficientes para hogares, negocios y obras.
          </p>
        </Reveal>

        {/* Services grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {SERVICES.map((service, index) => {
            const Icon = service.icon;
            return (
              <Reveal key={service.title} delay={index * 100}>
                <article className="group h-full bg-white border border-ink-100 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-ink-900/10 hover:-translate-y-1 transition-all duration-300">
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={service.image}
                      alt={`${service.title} — Climatizaciones Montaño, S.L.`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 to-transparent" />
                    <div className="absolute top-4 left-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                      <Icon className="w-6 h-6 text-primary-600" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold text-ink-900 mb-3">
                      {service.title}
                    </h3>
                    <p className="text-ink-500 text-sm leading-relaxed mb-4">
                      {service.description}
                    </p>
                    <ul className="space-y-2 mb-5">
                      {service.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-center gap-2 text-sm text-ink-600"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <a
                      href={`/servicios/${SERVICE_SLUGS[index]}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 group/link"
                    >
                      Más información
                      <ArrowUpRight className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
