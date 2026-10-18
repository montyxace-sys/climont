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
      'Instalamos todo tipo de sistemas de climatización con equipos de última generación. Estudiamos tu espacio a fondo para darte la solución que mejor se adapte a ti.',
    features: ['Splits de pared', 'Centralizado por conductos', 'Cassettes de techo', 'Equipos suelo/techo', 'Conductos fibra Climaver y chapa galvanizada'],
    image:
      '/office-cassette-ac.webp',
  },
  {
    icon: Settings,
    title: 'Mantenimiento preventivo',
    description:
      'Revisiones periódicas para que tus equipos duren más, consuman menos y no te lleves sustos con averías caras.',
    features: ['Limpieza profunda', 'Recarga de refrigerante', 'Revisiones anuales'],
    image:
      '/maintenance-filter-cleaning.webp',
  },
  {
    icon: Wrench,
    title: 'Reparación y diagnóstico',
    description:
      'Si tu aire acondicionado falla, vamos lo antes posible. Te decimos qué tiene y cuánto va a costar antes de tocar nada, sin sorpresas.',
    features: ['Diagnóstico electrónico', 'Repuestos originales', 'Garantía de 6 meses'],
    image:
      '/reparacion-mitsubishi-tecnico.webp',
  },
  {
    icon: Wind,
    title: 'Ventilación y extracción',
    description:
      'Diseñamos e instalamos sistemas de ventilación para viviendas, locales y naves industriales. Que el aire de tu espacio siempre sea limpio y sano.',
    features: ['Ventilación de viviendas', 'Ventilación de garajes', 'Extracción de cocinas', 'Ventilación industrial', 'Recuperación de calor'],
    image:
      'https://images.pexels.com/photos/36335953/pexels-photo-36335953.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    icon: Zap,
    title: 'Eficiencia energética',
    description:
      'Analizamos tu consumo y te proponemos mejoras para pagar menos en la factura. Te ayudamos a cambiar a equipos inverter que gastan mucho menos.',
    features: ['Auditoría energética', 'Equipos inverter', 'Certificación energética'],
    image:
      '/energy-efficiency-green-world.webp',
  },
  {
    icon: Smartphone,
    title: 'Climatización inteligente Airzone',
    description:
      'Con Airzone puedes controlar la temperatura de cada habitación desde el móvil, por separado. Enciende, apaga o ajusta desde donde estés, sin levantarte del sofá.',
    features: ['Control por zonas', 'App móvil vía WiFi', 'Ahorro energético inteligente'],
    image:
      'https://images.pexels.com/photos/32737485/pexels-photo-32737485.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    icon: Flame,
    title: 'Instalación de aerotermia',
    description:
      'La aerotermia aprovecha la energía del aire para calentar tu casa y darte agua caliente. Es la alternativa moderna a las calderas de gas: gasta menos, no contamina y no necesita combustibles.',
    features: ['Bomba de calor aerotérmica', 'Calefacción y ACS en un solo equipo', 'Ahorro hasta 70% frente a gas o gasoil', 'Sin combustibles fósiles ni emisiones', 'Compatible con suelo radiante y radiadores'],
    image:
      '/aerotermia-daikin-installer.webp',
  },
  {
    icon: Sun,
    title: 'Agua caliente sanitaria por energía solar',
    description:
      'Aprovecha el sol para calentar el agua de tu casa o empresa. Con nuestros paneles solares térmicos pagas mucho menos en la factura y usas una energía limpia que no se agota.',
    features: ['Paneles solares térmicos', 'Sistemas ACS para viviendas', 'Depósitos acumuladores', 'Ahorro hasta 80% en agua caliente', 'Certificado de instalación'],
    image:
      '/solar-thermosiphon-acs-installer.webp',
  },
  {
    icon: Building2,
    title: 'Instalaciones y preinstalaciones para constructoras',
    description:
      'Trabajamos con constructoras y promotoras en obra nueva y reformas. Hacemos desde la preinstalación hasta la instalación completa de climatización y ventilación, cumpliendo los plazos de obra sin retrasos. En Alcalá de Guadaíra, por ejemplo, hemos climatizado el Edificio Europa 2 con conductos Daikin y control por zonas MYSAir.',
    features: ['Obra nueva y nueva construcción', 'Conductos Daikin', 'Control por zonas MYSAir con WiFi', 'Cumplimiento de plazos de obra', 'Documentación y certificación técnica'],
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
            Desde poner un split en tu salón hasta climatizar un edificio entero.
            Cubrimos todo: hogares, comercios, industrias y constructoras de toda la provincia.
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
