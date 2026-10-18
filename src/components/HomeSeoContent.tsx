import { Reveal } from '@/components/Reveal';

export function HomeSeoContent() {
  return (
    <section className="py-16 lg:py-24 bg-ink-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-ink-900 mb-6">
            Más de 25 años climatizando hogares y empresas
          </h2>
          <p className="text-lg text-ink-600 leading-relaxed mb-4">
            En Climatizaciones Montaño llevamos más de dos décadas instalando, reparando y manteniendo
            sistemas de climatización en Sevilla y toda la provincia. Nuestro equipo de técnicos
            certificados RITE-07 trabaja con las principales marcas del mercado para ofrecerte la
            mejor solución según tu espacio, tu presupuesto y tu consumo energético.
          </p>
          <p className="text-lg text-ink-600 leading-relaxed mb-10">
            Desde un split de pared para tu salón hasta un proyecto completo de conductos para un
            edificio de oficinas, nos encargamos de todo: estudio previo, instalación, puesta en marcha
            y mantenimiento posterior. Y si tu equipo falla, respondemos rápido con repuestos originales
            y garantía de 6 meses en cada reparación.
          </p>
        </Reveal>

        <Reveal delay={100}>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-ink-900 mb-6">
            Instaladores autorizados de las marcas líderes
          </h2>
          <p className="text-lg text-ink-600 leading-relaxed mb-4">
            Somos distribuidores e instaladores autorizados de Daikin, Mitsubishi, Samsung, LG,
            Panasonic, Fujitsu, Hisense, Hitachi y Johnson. Esto significa que trabajamos con repuestos
            originales, respetamos las especificaciones de cada fabricante y mantenemos la garantía
            oficial en todas las instalaciones que realizamos.
          </p>
          <p className="text-lg text-ink-600 leading-relaxed mb-10">
            También instalamos equipos de marcas complementarias como Haier y Giatsu, y
            sistemas de control por zonas Airzone. Sea cual sea la marca que elijas, te asesoramos
            sin compromiso para encontrar el equipo que mejor se adapte a tus necesidades.
          </p>
        </Reveal>

        <Reveal delay={200}>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-ink-900 mb-6">
            Soluciones para hogares, empresas y comunidades
          </h2>
          <p className="text-lg text-ink-600 leading-relaxed mb-4">
            Damos servicio a particulares, comunidades de vecinos, restaurantes, oficinas, naves
            industriales y constructoras en obra nueva y rehabilitación. Cada proyecto es diferente:
            por eso empezamos siempre con una visita técnica gratuita para evaluar el espacio y
            recomendarte la opción más eficiente.
          </p>
          <p className="text-lg text-ink-600 leading-relaxed">
            Además de la climatización tradicional, instalamos aerotermia para sustituir calderas
            de gas, sistemas de energía solar térmica para agua caliente sanitaria, y soluciones de
            ventilación y eficiencia energética. Todo con presupuesto gratis en 24 horas y respuesta
            rápida para reparaciones. Llámanos al 676 628 348, escríbenos por WhatsApp al 691 680 706 o envíanos un email a info@climont.es.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
