import { Award, Clock, Users, ShieldCheck, BadgeCheck, ThumbsUp } from 'lucide-react';
import { Reveal } from '@/components/Reveal';

const BENEFITS = [
  {
    icon: Award,
    title: 'Empresa certificada RITE-07',
    description:
      'Somos una empresa certificada según el Reglamento de Instalaciones Térmicas en Edificios (RITE-07). Cumplimos toda la normativa de seguridad y eficiencia para que estés tranquilo.',
  },
  {
    icon: Clock,
    title: 'Respuesta rápida',
    description:
      'Te contestamos en menos de 24 horas. Vamos rápidos y cumplimos lo que prometemos en cada visita.',
  },
  {
    icon: ShieldCheck,
    title: 'Garantía en todos los trabajos',
    description:
      'Nuestras instalaciones llevan 3 años de garantía. Las piezas y reparaciones tienen 6 meses de garantía. Si algo falla, lo arreglamos sin coste.',
  },
  {
    icon: BadgeCheck,
    title: 'Presupuesto transparente',
    description:
      'Sin sorpresas ni costes ocultos. Te damos un presupuesto claro y detallado antes de empezar. Si no te convence, no pasa nada.',
  },
  {
    icon: Users,
    title: 'Más de 5.000 clientes',
    description:
      'Familias, comercios, oficinas y comunidades de toda la provincia de Sevilla que nos eligen para mantener su aire acondicionado.',
  },
  {
    icon: ThumbsUp,
    title: 'Repuestos originales',
    description:
      'Solo usamos recambios y accesorios originales de las mejores marcas. Así tus equipos duran más y funcionan mejor.',
  },
];

const PROCESS = [
  { step: '01', title: 'Contacto', description: 'Nos llamas o rellenas el formulario y te escuchamos. Nos cuentas qué necesitas.' },
  { step: '02', title: 'Visita técnica', description: 'Un técnico visita tu espacio y te aconseja la mejor opción para tu caso.' },
  { step: '03', title: 'Presupuesto', description: 'Te mandamos un presupuesto claro y sin compromiso. Tú decides.' },
  { step: '04', title: 'Ejecución', description: 'Hacemos la instalación o reparación con garantía. Y dejamos todo limpio.' },
];

export function WhyUs() {
  return (
    <section id="beneficios" className="py-16 lg:py-24 bg-ink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Reveal className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-semibold rounded-full mb-4">
            Por qué elegirnos
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-900 mb-4">
            Profesionales en los que puedes confiar
          </h2>
          <p className="text-lg text-ink-500">
            No nos limitamos a instalar y reparar. Cuidamos tu bienestar y tu inversión para que duren años.
          </p>
        </Reveal>

        {/* Benefits grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {BENEFITS.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Reveal key={benefit.title} delay={index * 80}>
                <div className="group h-full bg-white rounded-2xl p-7 border border-ink-100 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-500/5 transition-all duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-primary-500/20">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-ink-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-ink-500 text-sm leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Certifications */}
        <Reveal>
          <div className="rounded-3xl bg-white border border-ink-100 overflow-hidden shadow-sm mb-16">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr] items-center">
              <div className="p-7 sm:p-10 lg:p-12">
                <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-semibold rounded-full mb-4">
                  Calidad y confianza
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 mb-4">
                  Instalaciones respaldadas por certificaciones
                </h3>
                <p className="text-ink-500 leading-relaxed mb-5">
                  Trabajamos con los estándares y requisitos técnicos que garantizan unas instalaciones seguras, eficientes y preparadas para durar. Nuestro compromiso con la calidad se refleja en cada proyecto, desde el asesoramiento inicial hasta la puesta en marcha.
                </p>
                <div className="grid sm:grid-cols-3 gap-3" aria-label="Certificaciones y garantías">
                  <div className="rounded-xl bg-ink-50 p-4">
                    <p className="font-display font-bold text-ink-900 text-sm">RITE-07</p>
                    <p className="text-ink-500 text-xs mt-1">Cumplimiento técnico</p>
                  </div>
                  <div className="rounded-xl bg-ink-50 p-4">
                    <p className="font-display font-bold text-ink-900 text-sm">EIC</p>
                    <p className="text-ink-500 text-xs mt-1">Empresa instaladora</p>
                  </div>
                  <div className="rounded-xl bg-ink-50 p-4">
                    <p className="font-display font-bold text-ink-900 text-sm">ISO 9001</p>
                    <p className="text-ink-500 text-xs mt-1">Gestión de calidad</p>
                  </div>
                </div>
              </div>
              <div className="bg-ink-50 p-5 sm:p-8 lg:p-10">
                <img
                  src="/images/certifications/Gemini_Generated_Image_ruzg36ruzg36ruzg.jpg"
                  alt="Distintivos de calidad RITE-07, empresa instaladora certificada EIC e ISO 9001"
                  className="w-full h-auto rounded-2xl shadow-lg"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </Reveal>

        {/* Process timeline */}
        <Reveal>
          <div className="text-center mb-10">
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 mb-3">
              Cómo trabajamos
            </h3>
            <p className="text-ink-500">Un proceso sencillo y claro, de principio a fin</p>
          </div>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
          {PROCESS.map((item, index) => (
            <Reveal key={item.step} delay={index * 120}>
              <div className="relative">
                {/* Connector line */}
                {index < PROCESS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] right-[-40%] h-0.5 bg-gradient-to-r from-primary-300 to-primary-100" />
                )}
                <div className="relative flex flex-col items-center text-center lg:items-start lg:text-left">
                  <div className="w-16 h-16 rounded-2xl bg-white border-2 border-primary-200 flex items-center justify-center font-display font-bold text-xl text-primary-600 mb-4 shadow-sm relative z-10">
                    {item.step}
                  </div>
                  <h4 className="font-display font-bold text-ink-900 mb-1">{item.title}</h4>
                  <p className="text-sm text-ink-500 leading-relaxed">{item.description}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
