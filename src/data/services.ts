import {
  Snowflake, Settings, Wrench, Wind, Zap, Smartphone, Flame, Sun, Building2,
  type LucideIcon,
} from 'lucide-react';

export type ServiceSlug =
  | 'instalacion'
  | 'mantenimiento'
  | 'reparacion'
  | 'ventilacion'
  | 'eficiencia'
  | 'airzone'
  | 'aerotermia'
  | 'solar-termica'
  | 'constructoras';

export type ServiceFAQ = {
  question: string;
  answer: string;
};

export type SeoContentBlock = {
  heading: string;
  paragraphs: string[];
};

export type ServiceData = {
  slug: ServiceSlug;
  icon: LucideIcon;
  title: string;
  shortTitle: string;
  description: string;
  heroImage: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  features: string[];
  faqs: ServiceFAQ[];
  benefits: { title: string; description: string }[];
  galleryImages: { src: string; alt: string; caption: string }[];
  serviceValue: string;
  installationTypes?: { value: string; label: string }[];
  seoContent?: SeoContentBlock[];
};

export const SERVICES: ServiceData[] = [
  {
    slug: 'instalacion',
    icon: Snowflake,
    title: 'Instalación de aire acondicionado en Sevilla',
    shortTitle: 'Instalación de aire acondicionado',
description: 'Instalación de aire acondicionado con equipos de última generación de Daikin, Mitsubishi, Samsung, LG, Panasonic, Fujitsu, Hisense, Hitachi y Johnson. Instalamos splits, máquinas de conductos, cassettes y equipos suelo/techo. Estudiamos tu espacio a fondo para darte la solución que mejor se adapte a ti.',
    heroImage: '/office-cassette-ac.webp',
    metaTitle: 'Instalación de Aire Acondicionado en Sevilla | Climatizaciones Montaño, S.L.',
    metaDescription: 'Instalación profesional de aire acondicionado en Sevilla: splits de pared, conductos, cassettes y equipos suelo/techo. Conductos en fibra Climaver y chapa galvanizada. Certificados RITE-07. Presupuesto gratis en 24h.',
    keywords: 'instalación aire acondicionado Sevilla, instalar split Sevilla, instalación conductos climatización Sevilla, cassettes techo Sevilla, equipos suelo techo Sevilla, fibra Climaver Sevilla, chapa galvanizada conductos Sevilla, aire acondicionado obra nueva Sevilla, instalación aire acondicionado Alcalá de Guadaíra, instalación aire acondicionado Dos Hermanas, instalación máquinas de conductos Daikin Sevilla, instalación conductos Daikin Sevilla, instalación cassette Daikin Sevilla, instalación split Daikin Sevilla, instalación conductos Mitsubishi Sevilla, instalación cassette Mitsubishi Sevilla, instalación split Mitsubishi Sevilla, instalación conductos Samsung Sevilla, instalación split Samsung Sevilla, instalación conductos Panasonic Sevilla, instalación split Panasonic Sevilla, instalación conductos Fujitsu Sevilla, instalación split Fujitsu Sevilla, instalación conductos Hitachi Sevilla, instalación conductos Climaver Sevilla, instalación aire acondicionado Daikin Sevilla, instalación aire acondicionado Mitsubishi Sevilla, instalación aire acondicionado Samsung Sevilla, instalación aire acondicionado Panasonic Sevilla, instalación aire acondicionado Fujitsu Sevilla, instalación aire acondicionado Hitachi Sevilla, instalación aire acondicionado inverter Sevilla, presupuesto aire acondicionado Daikin Sevilla, presupuesto aire acondicionado Mitsubishi Sevilla, presupuesto conductos climatización Sevilla',
    features: ['Splits de pared', 'Centralizado por conductos', 'Cassettes de techo', 'Equipos suelo/techo', 'Conductos fibra Climaver y chapa galvanizada'],
    serviceValue: 'instalacion',
    installationTypes: [
      { value: 'splits_pared', label: 'Splits de pared' },
      { value: 'conductos', label: 'Centralizado por conductos' },
      { value: 'cassettes', label: 'Cassettes de techo' },
      { value: 'suelo_techo', label: 'Equipos suelo/techo' },
      { value: 'fabricacion_conductos', label: 'Fabricación de conductos (fibra Climaver / chapa galvanizada)' },
    ],
    benefits: [
{ title: 'Equipos de última generación', description: 'Instalamos aire acondicionado de las marcas líderes: Daikin, Mitsubishi, Samsung, LG, Panasonic, Fujitsu, Hisense, Hitachi y Johnson. Instalación de máquinas de conductos, splits y cassettes con equipos inverter de alta eficiencia.' },
      { title: 'Estudio personalizado', description: 'Visitamos tu espacio sin coste y analizamos metros cuadrados, orientación, aislamiento y número de estancias para recomendarte la mejor opción.' },
      { title: 'Instalación limpia y rápida', description: 'Un split de pared se instala en 2-4 horas. Dejamos todo limpio y funcionando. Sin obras innecesarias y con mínimo impacto.' },
      { title: 'Garantía de 3 años', description: 'Todas nuestras instalaciones llevan 3 años de garantía total. Las piezas y reparaciones tienen 6 meses de garantía. Si algo falla, lo solucionamos sin coste.' },
    ],
    galleryImages: [

      
      { src: '/images/servicios/instalacion/instalacion-01.jpg', alt: 'Trabajo de instalación de aire acondicionado realizado en Sevilla — foto 01', caption: '' },
      { src: '/images/servicios/instalacion/instalacion-02.jpg', alt: 'Trabajo de instalación de aire acondicionado realizado en Sevilla — foto 02', caption: '' },
      { src: '/images/servicios/instalacion/instalacion-03.jpg', alt: 'Trabajo de instalación de aire acondicionado realizado en Sevilla — foto 03', caption: '' },
      { src: '/images/servicios/instalacion/instalacion-04.jpg', alt: 'Trabajo de instalación de aire acondicionado realizado en Sevilla — foto 04', caption: '' },
      { src: '/images/servicios/instalacion/instalacion-05.jpg', alt: 'Trabajo de instalación de aire acondicionado realizado en Sevilla — foto 05', caption: '' },
      { src: '/images/servicios/instalacion/instalacion-06.jpg', alt: 'Trabajo de instalación de aire acondicionado realizado en Sevilla — foto 06', caption: '' },
      { src: '/images/servicios/instalacion/instalacion-07.jpg', alt: 'Trabajo de instalación de aire acondicionado realizado en Sevilla — foto 07', caption: '' },
      { src: '/images/servicios/instalacion/instalacion-08.jpg', alt: 'Trabajo de instalación de aire acondicionado realizado en Sevilla — foto 08', caption: '' },
      { src: '/images/servicios/instalacion/instalacion-09.jpg', alt: 'Trabajo de instalación de aire acondicionado realizado en Sevilla — foto 09', caption: '' },
      { src: '/images/servicios/instalacion/instalacion-10.jpg', alt: 'Trabajo de instalación de aire acondicionado realizado en Sevilla — foto 10', caption: '' },
      { src: '/images/servicios/instalacion/instalacion-11.jpg', alt: 'Trabajo de instalación de aire acondicionado realizado en Sevilla — foto 11', caption: '' },
      { src: '/images/servicios/instalacion/instalacion-12.jpg', alt: 'Trabajo de instalación de aire acondicionado realizado en Sevilla — foto 12', caption: '' },
      { src: '/images/servicios/instalacion/instalacion-13.jpg', alt: 'Trabajo de instalación de aire acondicionado realizado en Sevilla — foto 13', caption: '' },
      { src: '/images/servicios/instalacion/instalacion-14.jpg', alt: 'Trabajo de instalación de aire acondicionado realizado en Sevilla — foto 14', caption: '' },
      { src: '/images/servicios/instalacion/instalacion-15.jpg', alt: 'Trabajo de instalación de aire acondicionado realizado en Sevilla — foto 15', caption: '' },
      { src: '/images/servicios/instalacion/instalacion-16.jpg', alt: 'Trabajo de instalación de aire acondicionado realizado en Sevilla — foto 16', caption: '' },
      { src: '/images/servicios/instalacion/instalacion-17.jpg', alt: 'Trabajo de instalación de aire acondicionado realizado en Sevilla — foto 17', caption: '' },
      { src: '/images/servicios/instalacion/instalacion-18.jpg', alt: 'Trabajo de instalación de aire acondicionado realizado en Sevilla — foto 18', caption: '' },
      { src: '/images/servicios/instalacion/instalacion-19.jpg', alt: 'Trabajo de instalación de aire acondicionado realizado en Sevilla — foto 19', caption: '' },
      { src: '/images/servicios/instalacion/instalacion-20.jpg', alt: 'Trabajo de instalación de aire acondicionado realizado en Sevilla — foto 20', caption: '' },
      { src: '/images/servicios/instalacion/instalacion-21.jpg', alt: 'Trabajo de instalación de aire acondicionado realizado en Sevilla — foto 21', caption: '' },
      { src: '/images/servicios/instalacion/instalacion-22.jpg', alt: 'Trabajo de instalación de aire acondicionado realizado en Sevilla — foto 22', caption: '' },
      { src: '/images/servicios/instalacion/instalacion-23.jpg', alt: 'Trabajo de instalación de aire acondicionado realizado en Sevilla — foto 23', caption: '' },
      { src: '/images/servicios/instalacion/instalacion-24.jpg', alt: 'Trabajo de instalacion de aire acondicionado realizado en Sevilla - foto 24', caption: '' },
      { src: '/images/servicios/instalacion/instalacion-25.jpg', alt: 'Trabajo de instalacion de aire acondicionado realizado en Sevilla - foto 25', caption: '' },
    ],
    faqs: [
      { question: '¿Cuánto tarda una instalación de aire acondicionado?', answer: 'Una instalación de split de pared suele completarse en 2-4 horas. Las instalaciones por conductos o proyectos más grandes pueden requerir 1-3 días según la complejidad. Siempre cumplimos los plazos acordados.' },
      { question: '¿Qué tipo de aire acondicionado es mejor para mi casa?', answer: 'Depende del espacio. Para viviendas de 1-3 habitaciones, los splits de pared son la opción más económica y rápida. Para viviendas más grandes o con varias estancias, el sistema por conductos distribuye el aire de forma uniforme y queda integrado en el falso techo. En nuestra visita técnica gratuita te asesoramos sin compromiso.' },
      { question: '¿Incluye la instalación todos los materiales?', answer: 'Sí, nuestro presupuesto incluye mano de obra, materiales (tuberías, cableado, soportes) y el equipo de aire acondicionado. No hay costes ocultos ni sorpresas. Todo queda detallado antes de empezar.' },
      { question: '¿Hacéis instalaciones en obra nueva?', answer: 'Sí, hacemos preinstalaciones e instalaciones completas en obra nueva y rehabilitación. Trabajamos con constructoras y promotoras, cumpliendo los plazos de obra y entregando toda la documentación técnica.' },
    ],
    seoContent: [
      {
        heading: 'Instalación de máquinas de conductos Hisense y LG',
        paragraphs: [
          'La instalación de máquinas de conductos Hisense y la instalación de máquinas de conductos LG son dos de los servicios más solicitados por comunidades de vecinos y empresas que buscan climatización centralizada eficiente. Nuestro equipo técnico está certificado para instalar máquinas de conductos de todas las marcas: Daikin, Mitsubishi, Samsung, LG, Panasonic, Fujitsu, Hisense y Hitachi.',
          'La instalación de conductos Hisense y la instalación de conductos LG requieren un estudio previo del espacio para calcular la potencia necesaria y el dimensionado de los conductos. Trabajamos con fibra Climaver y chapa galvanizada para garantizar el máximo rendimiento y el mínimo ruido. También realizamos la instalación de conductos Daikin, Mitsubishi, Samsung y Panasonic con la misma garantía profesional.',
        ],
      },
      {
        heading: 'Aire acondicionado Hisense y LG: instaladores autorizados',
        paragraphs: [
          'Como instaladores autorizados de aire acondicionado Hisense y LG, ofrecemos la garantía oficial del fabricante en todas nuestras instalaciones. Hisense y LG son marcas con una excelente relación calidad-precio, con equipos inverter de alta eficiencia energética ideales para viviendas y oficinas.',
          'Si buscas aire acondicionado, nuestro equipo te asesora sin compromiso sobre qué equipo se adapta mejor a tu espacio y presupuesto. Trabajamos con todas las marcas líderes del mercado y te ofrecemos presupuesto gratis en 24 horas.',
        ],
      },
    ],
  },
  {
    slug: 'mantenimiento',
    icon: Settings,
    title: 'Mantenimiento de aire acondicionado en Sevilla',
    shortTitle: 'Mantenimiento preventivo',
    description: 'Revisiones periódicas para que tus equipos duren más, consuman menos y no te lleves sustos con averías caras.',
    heroImage: '/maintenance-filter-cleaning.webp',
    metaTitle: 'Mantenimiento de Aire Acondicionado en Sevilla | Climatizaciones Montaño, S.L.',
    metaDescription: 'Mantenimiento preventivo de aire acondicionado en Sevilla. Limpieza profunda, recarga de refrigerante, revisiones anuales y contratos de mantenimiento para hogares y empresas. Certificados RITE-07.',
    keywords: 'mantenimiento aire acondicionado Sevilla, limpieza aire acondicionado Sevilla, recarga refrigerante Sevilla, revisión aire acondicionado Sevilla, contrato mantenimiento aire acondicionado Sevilla, mantenimiento splits Sevilla, mantenimiento conductos Sevilla, limpieza filtros aire acondicionado Sevilla, mantenimiento Daikin Sevilla, mantenimiento Mitsubishi Sevilla, mantenimiento Samsung Sevilla, mantenimiento Panasonic Sevilla, mantenimiento Fujitsu Sevilla, mantenimiento Hitachi Sevilla, mantenimiento máquinas de conductos Daikin Sevilla, mantenimiento conductos Mitsubishi Sevilla, mantenimiento cassette Samsung Sevilla, mantenimiento split Panasonic Sevilla, mantenimiento conductos Climaver Sevilla',
    features: ['Limpieza profunda', 'Recarga de refrigerante', 'Revisiones anuales'],
    serviceValue: 'mantenimiento',
    benefits: [
      { title: 'Alarga la vida de tus equipos', description: 'Un mantenimiento regular puede duplicar la vida útil de tu aire acondicionado. Pequeñas revisiones evitan averías graves y caras.' },
      { title: 'Ahorra en la factura eléctrica', description: 'Un equipo limpio y con los filtros en buen estado consume hasta un 25% menos. El mantenimiento se paga solo con el ahorro energético.' },
      { title: 'Mejor calidad del aire', description: 'La limpieza profunda elimina bacterias, moho y ácaros acumulados en los filtros y conductos. El aire que respiras será más sano.' },
      { title: 'Contratos para empresas y comunidades', description: 'Ofrecemos contratos de mantenimiento anuales con prioridad en reparaciones, descuentos en recambios y visitas programadas.' },
    ],
    galleryImages: [
      { src: '/maintenance-filter-cleaning.webp', alt: 'Limpieza de filtros de aire acondicionado', caption: 'Limpieza profunda de filtros' },
    ],
    faqs: [
      { question: '¿Con qué frecuencia debo hacer mantenimiento?', answer: 'Recomendamos una revisión anual para uso doméstico y dos revisiones al año para equipos de uso intensivo (comercios, restaurantes, oficinas). Los equipos por conductos requieren revisión de los conductos cada 2 años.' },
      { question: '¿Qué incluye el mantenimiento?', answer: 'Limpieza profunda de filtros y baterías, revisión de niveles de refrigerante, comprobación del circuito eléctrico, limpieza del drenaje, revisión de rendimientos y informe técnico del estado del equipo.' },
      { question: '¿Tenéis contratos de mantenimiento?', answer: 'Sí, ofrecemos contratos anuales para hogares, empresas y comunidades de vecinos. Incluyen visitas programadas, prioridad en reparaciones, descuentos en recambios y mano de obra, y informe técnico anual.' },
      { question: '¿Es obligatorio el mantenimiento por ley?', answer: 'Sí, el RITE-07 establece que los equipos de climatización deben someterse a mantenimiento periódico. En el caso de equipos con carga de refrigerante superior a 5 kg, la normativa exige una revisión anual obligatoria.' },
    ],
  },
  {
    slug: 'reparacion',
    icon: Wrench,
    title: 'Reparación de aire acondicionado en Sevilla',
    shortTitle: 'Reparación y diagnóstico',
description: 'Si tu aire acondicionado falla, nuestro técnico aire acondicionado va lo antes posible. Reparamos todas las marcas: Daikin, Mitsubishi, Samsung, LG, Panasonic, Fujitsu, Hisense, Hitachi y Johnson. Te decimos qué tiene y cuánto va a costar antes de tocar nada, sin sorpresas.',
    heroImage: '/reparacion-mitsubishi-tecnico.webp',
metaTitle: 'Reparación de Aire Acondicionado en Sevilla | Técnico Aire Acondicionado | Climatizaciones Montaño, S.L.',
    metaDescription: 'Reparación y diagnóstico de aire acondicionado en Sevilla. Diagnóstico electrónico, repuestos originales y garantía de 6 meses. Reparamos todas las marcas. ¡Llámanos al 676 628 348!',
    keywords: 'reparación aire acondicionado Sevilla, reparar aire acondicionado Sevilla, técnico aire acondicionado Sevilla, diagnóstico aire acondicionado Sevilla, repuestos originales aire acondicionado Sevilla, avería aire acondicionado Sevilla, aire acondicionado no enfría Sevilla, reparación Daikin Sevilla, reparación Mitsubishi Sevilla, reparación Samsung Sevilla, reparación Panasonic Sevilla, reparación Fujitsu Sevilla, reparación Hitachi Sevilla, reparación Hisense Sevilla, reparación LG Sevilla, reparación máquinas de conductos Daikin Sevilla, reparación conductos Mitsubishi Sevilla, reparación cassette Samsung Sevilla, reparación split Panasonic Sevilla, reparación conductos Climaver Sevilla',
    features: ['Diagnóstico electrónico', 'Repuestos originales', 'Garantía de 6 meses'],
    serviceValue: 'reparacion',
    benefits: [
{ title: 'Respuesta rápida', description: 'Sabemos que un aire averiado en pleno verano es una prioridad. Nuestro técnico aire acondicionado va lo antes posible, incluso fines de semana, para que no te quedes sin climatización.' },
      { title: 'Diagnóstico antes de reparar', description: 'Te decimos qué tiene tu equipo y cuánto va a costar la reparación antes de empezar. Sin sorpresas, sin costes ocultos. Tú decides si quieres seguir.' },
{ title: 'Repuestos originales de todas las marcas', description: 'Solo usamos recambios originales del fabricante. Reparación Hitachi, reparación Hisense, reparación Daikin, Mitsubishi, Samsung, LG, Panasonic y Fujitsu con garantía de que la reparación dure y tu equipo siga funcionando como el primer día.' },
      { title: 'Garantía de 6 meses', description: 'Todas nuestras reparaciones llevan 6 meses de garantía. Si la misma avería reaparece, la arreglamos sin coste.' },
    ],
    galleryImages: [
{ src: '/reparacion-mitsubishi-tecnico.webp', alt: 'Técnico aire acondicionado reparando Mitsubishi y Hitachi', caption: 'Diagnóstico técnico profesional' },
    ],
    faqs: [
{ question: '¿Reparáis todas las marcas?', answer: 'Sí, reparamos todas las marcas. Reparación Hitachi, reparación Hisense, reparación Daikin, Mitsubishi, Samsung, LG, Panasonic y Fujitsu. Nuestro técnico aire acondicionado trabaja con repuestos originales de cada fabricante.' },
      { question: '¿Cuánto tarda una reparación?', answer: 'La mayoría de las reparaciones se resuelven en la misma visita. Si necesitamos pedir un repuesto especial, suele tardar 24-48 horas. Siempre te informamos del plazo antes de continuar.' },
      { question: '¿Mi aire acondicionado se puede reparar o hay que cambiarlo?', answer: 'Te damos una recomendación honesta. Si la reparación es sencilla y económica, la hacemos. Si el equipo tiene más de 10-12 años y la avería es grave, te aconsejamos qué equipos nuevos se adaptan mejor a tu presupuesto y necesidades.' },
      { question: '¿Hacéis reparaciones en fin de semana?', answer: 'Sí, atendemos reparaciones fuera del horario habitual, incluyendo fines de semana. Llámanos al 676 628 348 y haremos todo lo posible por atenderte lo antes posible.' },
    ],
    seoContent: [
      {
        heading: 'Reparación Hitachi y reparación Hisense: técnico especializado',
        paragraphs: [
          'La reparación Hitachi y la reparación Hisense son dos de los servicios más solicitados por clientes que tienen equipos de estas marcas y necesitan un técnico especializado. Nuestro técnico aire acondicionado está formado y certificado para reparar todas las marcas del mercado con repuestos originales del fabricante.',
          'Si tu aire acondicionado Hitachi o Hisense falla, nuestro técnico aire acondicionado acude lo antes posible para diagnosticar la avería. Reparación Hitachi, reparación Hisense, reparación Daikin, Mitsubishi, Samsung, LG, Panasonic y Fujitsu: reparamos todas las marcas con garantía de 6 meses en todas nuestras reparaciones.',
        ],
      },
      {
        heading: 'Técnico aire acondicionado: reparación de todas las marcas',
        paragraphs: [
          'Nuestro técnico aire acondicionado ofrece servicio de reparación para aire acondicionado en hogares, oficinas y comercios. Reparación Hitachi, reparación Hisense, reparación Daikin, Mitsubishi, Samsung, LG, Panasonic, Fujitsu y todas las marcas con diagnóstico electrónico y repuestos originales.',
          'Un técnico aire acondicionado profesional y certificado hace la diferencia entre una reparación que dura y una que vuelve a fallar. Por eso usamos solo repuestos originales del fabricante y damos 6 meses de garantía en todas nuestras reparaciones. Llámanos al 676 628 348 y te atendemos lo antes posible.',
        ],
      },
    ],
  },
  {
    slug: 'ventilacion',
    icon: Wind,
    title: 'Ventilación y extracción en Sevilla',
    shortTitle: 'Ventilación y extracción',
    description: 'Diseñamos e instalamos sistemas de ventilación para viviendas, locales y naves industriales. Que el aire de tu espacio siempre sea limpio y sano.',
    heroImage: '/energy-efficient-building.webp',
    metaTitle: 'Ventilación y Extracción en Sevilla | Climatizaciones Montaño, S.L.',
    metaDescription: 'Diseño e instalación de sistemas de ventilación y extracción en Sevilla. Ventilación de viviendas, garajes, cocinas industriales y naves industriales. Recuperación de calor. Certificados RITE-07.',
    keywords: 'ventilación Sevilla, extracción aire Sevilla, ventilación viviendas Sevilla, ventilación garajes Sevilla, extracción cocinas industriales Sevilla, ventilación industrial Sevilla, recuperación de calor Sevilla, sistemas ventilación mecánica Sevilla, vmc Sevilla, ventilación garajes comunitarios Sevilla, ventilación naves industriales Sevilla, ventilación forzada Sevilla, extracción humos Sevilla, ventilación mecánica controlada Sevilla, VMC doble flujo Sevilla, ventilación cocinas industriales Sevilla, ventilación obra nueva Sevilla',
    features: ['Ventilación de viviendas', 'Ventilación de garajes', 'Extracción de cocinas', 'Ventilación industrial', 'Recuperación de calor'],
    serviceValue: 'ventilacion',
    installationTypes: [
      { value: 'ventilacion_viviendas', label: 'Ventilación de viviendas' },
      { value: 'ventilacion_garajes', label: 'Ventilación de garajes' },
    ],
    benefits: [
      { title: 'Aire limpio y sano', description: 'La ventilación mecánica controlada renueva el aire interior de forma continua, eliminando contaminantes, CO2 y humedad. Respira mejor en casa.' },
      { title: 'Cumple la normativa CTE', description: 'El Código Técnico de la Edificación exige sistemas de ventilación en viviendas y garajes. Diseñamos sistemas que cumplen todos los requisitos legales.' },
      { title: 'Recuperación de calor', description: 'Nuestros sistemas con recuperador aprovechan el calor del aire extraído para calentar el aire nuevo que entra. Ahorra energía y mantiene la temperatura.' },
      { title: 'Para viviendas e industrias', description: 'Desde la ventilación de un piso hasta la extracción de una cocina industrial o la ventilación de una nave. Nos adaptamos a cada espacio y necesidad.' },
    ],
    galleryImages: [
      { src: '/energy-efficient-building.webp', alt: 'Edificio con sistema de ventilación', caption: 'Ventilación en edificios' },
    ],
    faqs: [
      { question: '¿Es obligatoria la ventilación en viviendas?', answer: 'Sí, el Código Técnico de la Edificación (CTE) exige que todas las viviendas nuevas dispongan de un sistema de ventilación que garantice la renovación del aire interior. En reformas también es muy recomendable para evitar problemas de humedad y salud.' },
      { question: '¿Qué es la recuperación de calor?', answer: 'Es un sistema que aprovecha la energía del aire que se extrae de la vivienda (ya calentado) para precalentar el aire nuevo que entra del exterior. Puede recuperar hasta un 90% de la energía, reduciendo significativamente el consumo de calefacción.' },
      { question: '¿Instaláis ventilación en garajes comunitarios?', answer: 'Sí, diseñamos e instalamos sistemas de ventilación para garajes comunitarios que cumplen la normativa de evacuación de humos y gases de escape. Incluyen detectores de CO que activan la extracción automáticamente.' },
    ],
  },
  {
    slug: 'eficiencia',
    icon: Zap,
    title: 'Eficiencia energética en Sevilla',
    shortTitle: 'Eficiencia energética',
description: 'Mejoramos la eficiencia energética. Analizamos tu consumo y te proponemos mejoras para pagar menos en la factura. Te ayudamos a cambiar a equipos inverter que gastan mucho menos y mejoran tu eficiencia energética.',
    heroImage: '/energy-efficiency-green-world.webp',
    metaTitle: 'Eficiencia Energética en Sevilla | Auditoría Energética | Climatizaciones Montaño, S.L.',
    metaDescription: 'Auditoría energética, instalación de equipos inverter y certificación energética en Sevilla. Reduce tu consumo eléctrico hasta un 40%. Certificados RITE-07. Presupuesto gratis en 24h.',
    keywords: 'eficiencia energética Sevilla, auditoría energética Sevilla, equipos inverter Sevilla, certificación energética Sevilla, ahorro energía Sevilla, reducir factura eléctrica Sevilla, bomba de calor inverter Sevilla, aerotermia eficiencia Sevilla, certificado energético vivienda Sevilla, certificación energética edificio Sevilla, auditoría energética climatización Sevilla, optimización consumo aire acondicionado Sevilla, sustituir equipos por inverter Sevilla, aerotermia ahorro energético Sevilla, bomba de calor alta eficiencia Sevilla, eficiencia energética industria Sevilla',
    features: ['Auditoría energética', 'Equipos inverter', 'Certificación energética'],
    serviceValue: 'eficiencia',
    benefits: [
{ title: 'Reduce tu factura hasta un 40%', description: 'La eficiencia energética empieza con equipos inverter que ajustan su potencia según la demanda, gastando solo lo necesario. Cambiar de un equipo convencional a inverter puede ahorrar hasta un 40% en consumo.' },
{ title: 'Auditoría energética completa', description: 'Analizamos tu instalación actual, medimos consumos reales y te proponemos mejoras de eficiencia energética con retorno de inversión calculado. Sabes cuánto vas a ahorrar antes de invertir.' },
      { title: 'Certificación energética', description: 'Emitimos el certificado energético oficial de tu vivienda o edificio, obligatorio para vender o alquilar. Trámite rápido y sin complicaciones.' },
      { title: 'Ayudas y subvenciones', description: 'Te informamos sobre las ayudas disponibles para renovación de equipos y mejora de la eficiencia energética. Te ayudamos con los trámites.' },
    ],
    galleryImages: [
{ src: '/energy-efficiency-green-world.webp', alt: 'Auditoría de eficiencia energética para reducir consumo', caption: 'Energía eficiente y sostenible' },
    ],
    faqs: [
      { question: '¿Cuánto puedo ahorrar con equipos inverter?', answer: 'Los equipos inverter pueden ahorrar hasta un 40% comparado con equipos convencionales. El ahorro exacto depende del uso, el tamaño del espacio y el equipo instalado. En nuestra auditoría energética gratuita te damos una estimación real.' },
      { question: '¿Qué es la certificación energética?', answer: 'Es un documento oficial que clasifica tu vivienda o edificio según su eficiencia energética (de la A a la G). Es obligatorio para vender o alquilar una vivienda. Nosotros nos encargamos de todo el proceso.' },
      { question: '¿Hay ayudas para mejorar la eficiencia?', answer: 'Sí, existen ayudas estatales y autonómicas para la renovación de equipos de climatización por otros más eficientes. Te informamos sobre las disponibles en cada momento y te ayudamos con los trámites.' },
    ],
    seoContent: [
      {
        heading: 'Eficiencia energética: reduce tu consumo hasta un 40%',
        paragraphs: [
          'La eficiencia energética es fundamental para reducir el consumo eléctrico de hogares y empresas. Nuestro servicio de eficiencia energética incluye auditoría energética completa, instalación de equipos inverter de alta eficiencia y certificación energética oficial para viviendas y edificios.',
          'Mejorar la eficiencia energética puede reducir tu factura eléctrica hasta un 40%. Cambiar equipos convencionales por equipos inverter, optimizar el dimensionado de la climatización y mejorar el aislamiento son las acciones más efectivas para mejorar la eficiencia energética.',
        ],
      },
    ],
  },
  {
    slug: 'airzone',
    icon: Smartphone,
    title: 'Climatización inteligente Airzone en Sevilla',
    shortTitle: 'Climatización inteligente Airzone',
    description: 'Con Airzone puedes controlar la temperatura de cada habitación desde el móvil, por separado. Enciende, apaga o ajusta desde donde estés, sin levantarte del sofá.',
    heroImage: '/airzone-ducts-system.webp',
    metaTitle: 'Climatización Inteligente Airzone en Sevilla | Climatizaciones Montaño, S.L.',
    metaDescription: 'Instalación de Airzone en Sevilla: control de temperatura por zonas desde el móvil vía WiFi. Enciende, apaga o ajusta cada habitación por separado. Ahorro energético inteligente. Presupuesto gratis.',
    keywords: 'Airzone Sevilla, climatización inteligente Sevilla, control por zonas Sevilla, control temperatura móvil Sevilla, termostato WiFi Sevilla, app Airzone Sevilla, climatización por zonas Sevilla, control remoto aire acondicionado Sevilla, Airzone Daikin Sevilla, Airzone Mitsubishi Sevilla, Airzone Samsung Sevilla, Airzone Panasonic Sevilla, Airzone Fujitsu Sevilla, instalación Airzone Sevilla, termostato inteligente Sevilla, control climático WiFi Sevilla, domótica climatización Sevilla, Airzone conductos Sevilla',
    features: ['Control por zonas', 'App móvil vía WiFi', 'Ahorro energético inteligente'],
    serviceValue: 'airzone',
    installationTypes: [
      { value: 'airzone', label: 'Climatización inteligente Airzone' },
    ],
    benefits: [
      { title: 'Controla cada habitación', description: 'Con Airzone cada habitación tiene su propia temperatura. El salón a 22º, los dormitorios a 19º, el despacho a 24º. Tú decides en cada momento.' },
      { title: 'Gestiona todo desde el móvil', description: 'Enciende, apaga o ajusta la temperatura desde la app, estés donde estés. Llega a casa y ya está fresco. ¿Se te olvidó apagarlo? Lo haces desde el móvil.' },
      { title: 'Ahorra hasta un 30%', description: 'Al climatizar solo las habitaciones que usas y a la temperatura que necesitas, ahorras energía. No hay que enfriar toda la casa si solo usas el salón.' },
      { title: 'Compatible con tu sistema', description: 'Airzone funciona con sistemas por conductos y se integra con las principales marcas: Daikin, Mitsubishi, Samsung, Panasonic, Fujitsu, etc.' },
    ],
    galleryImages: [
      { src: '/airzone-ducts-system.webp', alt: 'Sistema por conductos con rejillas y centralita Airzone', caption: 'Sistema por conductos con control Airzone' },
    ],
    faqs: [
      { question: '¿Airzone funciona con cualquier aire acondicionado?', answer: 'Airzone funciona principalmente con sistemas por conductos y es compatible con la mayoría de marcas líderes: Daikin, Mitsubishi, Samsung, Panasonic, Fujitsu, Hisense, etc. Si ya tienes un sistema por conductos, probablemente se pueda integrar.' },
      { question: '¿Puedo controlar Airzone desde fuera de casa?', answer: 'Sí, la app de Airzone funciona desde cualquier lugar con conexión a internet. Puedes encender el aire antes de llegar a casa, apagarlo si se te olvidó, o ajustar la temperatura de cada habitación estés donde estés.' },
      { question: '¿Cuánto se ahorra con Airzone?', answer: 'El control por zonas puede ahorrar hasta un 30% en consumo eléctrico, ya que solo climatizas las habitaciones que usas y a la temperatura exacta que necesitas. No malgastas energía enfriando habitaciones vacías.' },
    ],
  },
  {
    slug: 'aerotermia',
    icon: Flame,
    title: 'Instalación de aerotermia en Sevilla',
    shortTitle: 'Instalación de aerotermia',
description: 'La aerotermia es la alternativa moderna para sustituir caldera de gas o gasoil. La aerotermia aprovecha la energía del aire para calentar tu casa y darte agua caliente: gasta hasta un 70% menos, no contamina y no necesita combustibles fósiles.',
    heroImage: '/aerotermia-daikin-installer.webp',
    metaTitle: 'Aerotermia en Sevilla | Sustituir Caldera de Gas | Climatizaciones Montaño, S.L.',
    metaDescription: 'Instalación de aerotermia en Sevilla. Calefacción y agua caliente sanitaria con bomba de calor aerotérmica. Ahorro hasta 70% frente a gas o gasoil. Compatible con suelo radiante. Certificados RITE-07.',
    keywords: 'aerotermia Sevilla, instalación aerotermia Sevilla, bomba de calor aerotérmica Sevilla, aerotermia Daikin Sevilla, calefacción aerotermia Sevilla, agua caliente aerotermia Sevilla, aerotermia suelo radiante Sevilla, sustituir caldera gas Sevilla, aerotermia ACS Sevilla, aerotermia nueva construcción Sevilla, instalación aerotermia Daikin Sevilla, instalación aerotermia Mitsubishi Sevilla, instalación aerotermia Samsung Sevilla, instalación aerotermia Panasonic Sevilla, instalación bomba de calor Daikin Sevilla, bomba de calor aerotérmica Daikin Sevilla, aerotermia radiadores Sevilla, aerotermia fan-coil Sevilla, presupuesto aerotermia Sevilla, sustituir caldera gasoil por aerotermia Sevilla, aerotermia vivienda nueva Sevilla',
    features: ['Bomba de calor aerotérmica', 'Calefacción y ACS en un solo equipo', 'Ahorro hasta 70% frente a gas o gasoil', 'Sin combustibles fósiles ni emisiones', 'Compatible con suelo radiante y radiadores'],
    serviceValue: 'instalacion',
    installationTypes: [
      { value: 'splits_pared', label: 'Bomba de calor aerotérmica' },
    ],
    benefits: [
{ title: 'Ahorra hasta un 70% al sustituir caldera de gas', description: 'La aerotermia aprovecha la energía gratuita del aire exterior. Por cada kW eléctrico que consume, produce hasta 4-5 kW de calor. Sustituir caldera de gas por aerotermia ahorra hasta un 70% en calefacción y agua caliente.' },
      { title: 'Calefacción y agua caliente juntas', description: 'Un solo equipo cubre la calefacción de tu casa y el agua caliente sanitaria. Sin necesidad de caldera ni paneles solares independientes. Todo integrado.' },
{ title: 'Sin combustibles, sin emisiones', description: 'Al sustituir caldera de gas por aerotermia no necesitas gas, gasoil ni humos. Funciona con electricidad y la energía del aire. Cero emisiones locales. Es la alternativa limpia y moderna a las calderas tradicionales.' },
      { title: 'Compatible con tu sistema', description: 'Funciona con suelo radiente, radiadores de baja temperatura y fan-coils. Si estás reformando o construyendo una casa nueva, la aerotermia es la opción más eficiente.' },
    ],
    galleryImages: [
{ src: '/aerotermia-daikin-installer.webp', alt: 'Instalación de aerotermia Daikin para sustituir caldera de gas', caption: 'Instalación de aerotermia' },
    ],
    faqs: [
      { question: '¿Qué es la aerotermia y cómo funciona?', answer: 'La aerotermia es una tecnología que aprovecha la energía calorífica del aire exterior para calentar tu casa y el agua caliente sanitaria. Por cada kW de electricidad que consume, puede extraer hasta 3-4 kW adicionales del aire, lo que la hace mucho más eficiente que una caldera convencional.' },
      { question: '¿Cuánto se ahorra con aerotermia?', answer: 'La aerotermia puede ahorrar hasta un 70% en la factura de calefacción y agua caliente comparado con calderas de gas o gasoil. El ahorro exacto depende del clima, el aislamiento de la vivienda y el sistema de emisión (suelo radiente, radiadores, etc.).' },
      { question: '¿La aerotermia funciona en invierno con frío?', answer: 'Sí, las bombas de calor aerotérmicas modernas funcionan correctamente incluso con temperaturas exteriores de -15ºC a -20ºC. Aunque la eficiencia disminuye ligeramente con el frío extremo, siguen siendo más eficientes que una caldera de gas.' },
      { question: '¿Necesito suelo radiante para aerotermia?', answer: 'No es obligatorio, pero es la combinación más eficiente. La aerotermia funciona también con radiadores de baja temperatura y fan-coils. El suelo radiente maximiza el ahorro porque trabaja a temperaturas más bajas.' },
    ],
    seoContent: [
      {
        heading: 'Aerotermia: la alternativa para sustituir caldera de gas',
        paragraphs: [
          'La aerotermia es la solución más eficiente para sustituir caldera de gas o gasoil en tu vivienda. Cada vez más familias de la provincia deciden sustituir caldera de gas por aerotermia para ahorrar hasta un 70% en calefacción y agua caliente sanitaria, eliminando además el consumo de combustibles fósiles y las emisiones contaminantes.',
          'Sustituir caldera de gas es una decisión inteligente: la aerotermia aprovecha la energía gratuita del aire exterior, por lo que por cada kW eléctrico que consume produce hasta 4-5 kW de calor. La aerotermia es especialmente rentable en nuestra zona gracias al clima suave, que permite a la bomba de calor trabajar con alta eficiencia durante todo el año.',
        ],
      },
      {
        heading: 'Sustituir caldera de gas: ventajas de la aerotermia',
        paragraphs: [
          'Si estás pensando en sustituir caldera de gas, la aerotermia es la opción más rentable a medio plazo. Al sustituir caldera de gas por aerotermia, un solo equipo cubre la calefacción y el agua caliente sanitaria, sin necesidad de combustibles ni almacenamiento de gas o gasoil.',
          'La aerotermia es compatible con suelo radiante, radiadores de baja temperatura y fan-coils. Nuestro equipo técnico estudia tu instalación actual y te propone la mejor solución para sustituir caldera de gas con mínimo impacto y máximo ahorro. Presupuesto gratis y sin compromiso.',
        ],
      },
    ],
  },
  {
    slug: 'solar-termica',
    icon: Sun,
    title: 'Agua caliente sanitaria por energía solar térmica en Sevilla',
    shortTitle: 'Energía solar térmica (ACS)',
    description: 'Aprovecha el sol para calentar el agua de tu casa o empresa. Con nuestros paneles solares térmicos pagas mucho menos en la factura y usas una energía limpia que no se agota.',
    heroImage: '/solar-thermosiphon-acs-installer.webp',
    metaTitle: 'Energía Solar Térmica y ACS en Sevilla | Climatizaciones Montaño, S.L.',
    metaDescription: 'Instalación de paneles solares térmicos para agua caliente sanitaria (ACS) en Sevilla. Ahorra hasta 80% en agua caliente con energía solar. Sistemas para viviendas y empresas. Certificados RITE-07.',
    keywords: 'energía solar térmica Sevilla, paneles solares térmicos Sevilla, agua caliente sanitaria solar Sevilla, ACS solar Sevilla, instalación paneles solares Sevilla, solar térmica viviendas Sevilla, solar térmica empresas Sevilla, depósito acumulador solar Sevilla, termosifón solar Sevilla, agua caliente solar Sevilla, paneles solares ACS Sevilla, instalación solar térmica comunidad vecinos Sevilla, energía solar térmica industria Sevilla, sistema solar combinado Sevilla, solar térmica hotel Sevilla, solar térmica gimnasio Sevilla, mantenimiento paneles solares térmicos Sevilla, energía solar Andalucía Sevilla',
    features: ['Paneles solares térmicos', 'Sistemas ACS para viviendas', 'Depósitos acumuladores', 'Ahorro hasta 80% en agua caliente', 'Certificado de instalación'],
    serviceValue: 'instalacion',
    benefits: [
      { title: 'Ahorra hasta un 80% en agua caliente', description: 'El sol calienta tu agua de forma gratuita. Con un sistema bien dimensionado puedes cubrir hasta el 80% de tu consumo anual de agua caliente sanitaria.' },
      { title: 'Energía limpia y renovable', description: 'La energía solar no emite CO2 ni contaminantes. Reduce tu huella de carbono y aprovecha un recurso gratuito e inagotable. La provincia tiene más de 2.800 horas de sol al año.' },
      { title: 'Para viviendas y empresas', description: 'Instalamos sistemas para una sola vivienda, comunidades de vecinos, hoteles, gimnasios y empresas. Diseñamos cada instalación según el consumo real.' },
      { title: 'Bajo mantenimiento', description: 'Los sistemas solares térmicos requieren muy poco mantenimiento. Una revisión anual basta para asegurar un funcionamiento óptimo durante más de 20 años.' },
    ],
    galleryImages: [
      { src: '/solar-thermosiphon-acs-installer.webp', alt: 'Instalación de paneles solares térmicos para ACS', caption: 'Instalación solar térmica' },
    ],
    faqs: [
      { question: '¿Cuánto se ahorra con energía solar térmica?', answer: 'Un sistema solar térmico bien dimensionado puede cubrir hasta el 80% del consumo anual de agua caliente sanitaria. El ahorro en la factura depende del consumo y del sistema de apoyo (gas, electricidad, aerotermia), pero la inversión se suele recuperar en 5-7 años.' },
      { question: '¿Funciona en invierno o días nublados?', answer: 'Sí, los paneles solares térmicos funcionan incluso en días nublados, aunque con menor rendimiento. El sistema incluye un apoyo (caldera o resistencia eléctrica) que se activa automáticamente cuando la energía solar no es suficiente, para que nunca te quedes sin agua caliente.' },
      { question: '¿Se puede instalar en una comunidad de vecinos?', answer: 'Sí, de hecho es una de las aplicaciones más rentables. En una comunidad, el sistema centralizado de ACS solar sirve a todos los vecinos y el ahorro se reparte proporcionalmente. El retorno de inversión suele ser menor que en una vivienda individual.' },
    ],
  },
  {
    slug: 'constructoras',
    icon: Building2,
    title: 'Instalaciones y preinstalaciones para constructoras en Sevilla',
    shortTitle: 'Servicios para constructoras',
    description: 'Trabajamos con constructoras y promotoras en obra nueva y reformas. Hacemos desde la preinstalación hasta la instalación completa de climatización y ventilación, cumpliendo los plazos de obra sin retrasos.',
    heroImage: '/edificio-moderno-obra-nueva.webp',
    metaTitle: 'Preinstalaciones para Constructoras en Sevilla | Climatizaciones Montaño, S.L.',
    metaDescription: 'Instalaciones y preinstalaciones de climatización, ventilación y conductos para constructoras y promotoras en Sevilla. Obra nueva y rehabilitación. Proyectos llave en mano. Certificados RITE-07 y CTE.',
    keywords: 'preinstalación constructoras Sevilla, instalación climatización obra nueva Sevilla, conductos constructoras Sevilla, preinstalación aire acondicionado obra nueva Sevilla, proyecto llave en mano climatización Sevilla, ventilación obra nueva Sevilla, constructoras promotoras climatización Sevilla, conductos Climaver constructoras Sevilla, aire acondicionado obra nueva Sevilla, proyecto llave en mano climatización Sevilla, preinstalación conductos obra nueva Sevilla, instalación aerotermia obra nueva Sevilla, instalación conductos Climaver constructoras Sevilla, preinstalación ventilación obra nueva Sevilla, instalación climatización promotoras Sevilla, climatización edificios nuevos Sevilla, conductos fibra Climaver constructoras Sevilla, conductos chapa galvanizada constructoras Sevilla, certificación RITE obra nueva Sevilla, proyecto completo climatización Sevilla',
    features: ['Obra nueva y nueva construcción', 'Preinstalaciones de conductos', 'Proyectos llave en mano', 'Cumplimiento de plazos de obra', 'Documentación y certificación técnica'],
    serviceValue: 'constructoras',
    installationTypes: [
      { value: 'preinstalacion_obra', label: 'Preinstalación en obra nueva / nueva construcción' },
      { value: 'instalacion_obra', label: 'Instalación completa en obra nueva' },
      { value: 'fabricacion_conductos', label: 'Fabricación de conductos (fibra Climaver / chapa galvanizada)' },
    ],
    benefits: [
      { title: 'Proyectos certificados', description: 'Entregamos toda la documentación técnica y las certificaciones que exige el RITE-07 y el CTE. Todo en regla desde el primer día.' },
      { title: 'Cumplimiento de plazos', description: 'Nos adaptamos al calendario de tu obra para que la entrega de llaves no se retrase por nuestra parte. Coordinación con el resto de gremios.' },
      { title: 'Equipo especializado', description: 'Equipo propio de técnicos cualificados, sin subcontratas. Así controlamos la calidad de principio a fin.' },
      { title: 'Obra nueva y rehabilitación', description: 'Preinstalaciones mientras la obra está en construcción e instalaciones completas en reformas y rehabilitaciones. Cobertura total del proyecto.' },
    ],
    galleryImages: [
      { src: '/conductos-climaver-plus-obra-nueva.webp', alt: 'Preinstalación de conductos Climaver en obra nueva', caption: 'Conductos en obra nueva' },
      { src: '/conductos-climaver-constructora.webp', alt: 'Conductos de climatización para constructoras', caption: 'Conductos para constructoras' },
      { src: '/edificio-moderno-obra-nueva.webp', alt: 'Edificio moderno con climatización en obra nueva', caption: 'Edificio de obra nueva' },
    ],
    faqs: [
      { question: '¿Hacéis preinstalaciones en obra nueva?', answer: 'Sí, ejecutamos preinstalaciones de conductos y sistemas de climatización durante la fase de construcción, coordinándonos con el resto de gremios. Posteriormente completamos la instalación cuando la obra está lista.' },
      { question: '¿Entregáis documentación técnica?', answer: 'Sí, entregamos toda la documentación que exige la normativa: memoria técnica, planos, certificado de instalación RITE, libro de mantenimiento y certificación energética. Todo listo para la entrega de llaves.' },
      { question: '¿Trabajáis con plazos de obra?', answer: 'Sí, nos adaptamos al calendario de cada obra y coordinamos con el jefe de obra y otros gremios. Sabemos que los retrasos cuestan dinero y cumplimos lo acordado.' },
      { question: '¿Hacéis proyectos llave en mano?', answer: 'Sí, podemos encargarnos de todo el proyecto de climatización y ventilación desde el diseño hasta la puesta en marcha: cálculo de cargas, selección de equipos, instalación, pruebas y certificación.' },
    ],
  },
];

export function getServiceBySlug(slug: string): ServiceData | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export const SERVICE_ROUTES = SERVICES.map((s) => `/servicios/${s.slug}`);
