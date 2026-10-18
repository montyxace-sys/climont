export type BrandData = {
  slug: string;
  name: string;
  logo: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  intro: string;
  services: { title: string; description: string }[];
  highlights: string[];
  faqs: { question: string; answer: string }[];
};

export const BRANDS: BrandData[] = [
  {
    slug: 'daikin',
    name: 'Daikin',
    logo: '/brands/daikin.svg',
    metaTitle: 'Aire Acondicionado Daikin en Sevilla | Instalador Autorizado | Climatizaciones Montaño, S.L.',
    metaDescription: 'Instalación, mantenimiento y reparación de aire acondicionado Daikin en Sevilla. Splits, conductos, cassettes y aerotermia Daikin. Instalador autorizado con garantía oficial. Presupuesto gratis.',
    keywords: 'aire acondicionado Daikin Sevilla, instalación aire acondicionado Daikin Sevilla, reparación Daikin Sevilla, mantenimiento Daikin Sevilla, instalador Daikin Sevilla, conductos Daikin Sevilla, split Daikin Sevilla, cassette Daikin Sevilla, máquinas de conductos Daikin Sevilla, aerotermia Daikin Sevilla, bomba de calor Daikin Sevilla, presupuesto Daikin Sevilla, técnico Daikin Sevilla',
    intro: 'Somos instaladores autorizados de aire acondicionado Daikin. Daikin es la marca líder mundial en climatización, con equipos de máxima eficiencia energética y tecnología inverter de última generación. Instalamos, reparamos y mantenemos todos los equipos Daikin en toda la provincia.',
    services: [
      { title: 'Instalación de aire acondicionado Daikin en Sevilla', description: 'Instalación de splits, máquinas de conductos, cassettes y equipos suelo/techo Daikin con garantía oficial del fabricante.' },
      { title: 'Mantenimiento de equipos Daikin', description: 'Mantenimiento preventivo de aire acondicionado Daikin: limpieza de filtros, recarga de refrigerante y revisiones anuales.' },
      { title: 'Reparación de aire acondicionado Daikin', description: 'Reparación de equipos Daikin con repuestos originales y técnicos especializados en la marca Daikin.' },
      { title: 'Aerotermia Daikin en Sevilla', description: 'Instalación de bombas de calor aerotérmicas Daikin para calefacción y agua caliente, sustituyendo calderas de gas o gasoil.' },
    ],
    highlights: [
      'Instalador autorizado Daikin',
      'Garantía oficial del fabricante en todas las instalaciones',
      'Repuestos originales Daikin en todas las reparaciones',
      'Técnicos certificados en equipos Daikin',
    ],
    faqs: [
      { question: '¿Sois instaladores autorizados de Daikin?', answer: 'Sí, somos instaladores autorizados de Daikin. Esto significa que podemos ofrecer la garantía oficial del fabricante en todas las instalaciones de aire acondicionado Daikin, además de acceder a recambios originales y soporte técnico directo de la marca.' },
      { question: '¿Reparáis equipos Daikin?', answer: 'Sí, nuestro técnico especializado en Daikin repara cualquier avería de equipos Daikin en toda la provincia. Usamos repuestos originales Daikin y damos 6 meses de garantía en todas las reparaciones.' },
      { question: '¿Instaláis aerotermia Daikin?', answer: 'Sí, instalamos bombas de calor aerotérmicas Daikin. La aerotermia Daikin es una de las opciones más eficientes para sustituir caldera de gas o gasoil, con ahorros de hasta un 70% en calefacción y agua caliente.' },
    ],
  },
  {
    slug: 'mitsubishi',
    name: 'Mitsubishi Electric',
    logo: '/brands/mitsubishi.svg',
    metaTitle: 'Aire Acondicionado Mitsubishi en Sevilla | Instalador Autorizado | Climatizaciones Montaño, S.L.',
    metaDescription: 'Instalación, mantenimiento y reparación de aire acondicionado Mitsubishi Electric en Sevilla. Splits, conductos, cassettes y aerotermia Mitsubishi. Instalador autorizado. Presupuesto gratis.',
    keywords: 'aire acondicionado Mitsubishi Sevilla, instalación aire acondicionado Mitsubishi Sevilla, reparación Mitsubishi Sevilla, mantenimiento Mitsubishi Sevilla, instalador Mitsubishi Sevilla, conductos Mitsubishi Sevilla, split Mitsubishi Sevilla, cassette Mitsubishi Sevilla, máquinas de conductos Mitsubishi Sevilla, aerotermia Mitsubishi Sevilla, presupuesto Mitsubishi Sevilla, técnico Mitsubishi Sevilla',
    intro: 'Instalamos y reparamos aire acondicionado Mitsubishi Electric. Mitsubishi es una de las marcas más reconocidas del mercado por su fiabilidad, silencio y eficiencia energética. Como instaladores autorizados, garantizamos el máximo rendimiento de tus equipos Mitsubishi.',
    services: [
      { title: 'Instalación de aire acondicionado Mitsubishi en Sevilla', description: 'Instalación de splits, máquinas de conductos y cassettes Mitsubishi Electric con garantía oficial.' },
      { title: 'Mantenimiento de equipos Mitsubishi', description: 'Mantenimiento preventivo de aire acondicionado Mitsubishi Electric con revisiones anuales.' },
      { title: 'Reparación de aire acondicionado Mitsubishi', description: 'Reparación de equipos Mitsubishi con repuestos originales y técnicos especializados en Mitsubishi Electric.' },
      { title: 'Aerotermia Mitsubishi en Sevilla', description: 'Instalación de bombas de calor aerotérmicas Mitsubishi Electric para calefacción y agua caliente eficiente.' },
    ],
    highlights: [
      'Instalador autorizado Mitsubishi Electric',
      'Garantía oficial del fabricante en instalaciones Mitsubishi',
      'Especialistas en sistemas por conductos Mitsubishi',
      'Repuestos originales Mitsubishi en reparaciones',
    ],
    faqs: [
      { question: '¿Instaláis equipos Mitsubishi Electric?', answer: 'Sí, somos instaladores autorizados de Mitsubishi Electric. Instalamos splits, máquinas de conductos, cassettes y bombas de calor aerotérmicas Mitsubishi con garantía oficial del fabricante.' },
      { question: '¿Reparáis aire acondicionado Mitsubishi?', answer: 'Sí, reparamos todos los equipos Mitsubishi Electric en toda la provincia. Nuestro técnico especializado en Mitsubishi usa repuestos originales y ofrece 6 meses de garantía en todas las reparaciones.' },
    ],
  },
  {
    slug: 'samsung',
    name: 'Samsung',
    logo: '/brands/samsung.svg',
    metaTitle: 'Aire Acondicionado Samsung en Sevilla | Instalador Autorizado | Climatizaciones Montaño, S.L.',
    metaDescription: 'Instalación, mantenimiento y reparación de aire acondicionado Samsung en Sevilla. Splits, conductos, cassettes y aerotermia Samsung. Instalador autorizado. Presupuesto gratis.',
    keywords: 'aire acondicionado Samsung Sevilla, instalación aire acondicionado Samsung Sevilla, reparación Samsung Sevilla, mantenimiento Samsung Sevilla, instalador Samsung Sevilla, conductos Samsung Sevilla, split Samsung Sevilla, cassette Samsung Sevilla, máquinas de conductos Samsung Sevilla, aerotermia Samsung Sevilla, presupuesto Samsung Sevilla, técnico Samsung Sevilla',
    intro: 'Instalamos aire acondicionado Samsung con garantía oficial. Samsung ofrece equipos de climatización con tecnología inverter de alta eficiencia y conectividad WiFi de serie. Somos instaladores autorizados Samsung en toda la provincia.',
    services: [
      { title: 'Instalación de aire acondicionado Samsung en Sevilla', description: 'Instalación de splits, conductos y cassettes Samsung con garantía oficial del fabricante.' },
      { title: 'Mantenimiento de equipos Samsung', description: 'Mantenimiento preventivo de aire acondicionado Samsung con limpieza y revisiones.' },
      { title: 'Reparación de aire acondicionado Samsung', description: 'Reparación de equipos Samsung con repuestos originales y técnicos especializados.' },
      { title: 'Aerotermia Samsung en Sevilla', description: 'Instalación de bombas de calor aerotérmicas Samsung para calefacción y ACS.' },
    ],
    highlights: [
      'Instalador autorizado Samsung',
      'Equipos Samsung con conectividad WiFi de serie',
      'Garantía oficial Samsung en todas las instalaciones',
      'Repuestos originales Samsung en reparaciones',
    ],
    faqs: [
      { question: '¿Instaláis aire acondicionado Samsung?', answer: 'Sí, somos instaladores autorizados de Samsung. Instalamos toda la gama de equipos Samsung: splits, máquinas de conductos, cassettes y aerotermia, con garantía oficial del fabricante.' },
      { question: '¿Los equipos Samsung tienen WiFi?', answer: 'La mayoría de equipos Samsung actuales incluyen conectividad WiFi de serie, lo que permite controlar el aire acondicionado desde el móvil sin necesidad de accesorios adicionales.' },
    ],
  },
  {
    slug: 'lg',
    name: 'LG',
    logo: '/brands/lg.svg',
    metaTitle: 'Aire Acondicionado LG en Sevilla | Instalador Autorizado | Climatizaciones Montaño, S.L.',
    metaDescription: 'Instalación, mantenimiento y reparación de aire acondicionado LG en Sevilla. Splits, conductos, cassettes y aerotermia LG. Instalador autorizado. Presupuesto gratis en 24h.',
    keywords: 'aire acondicionado LG Sevilla, instalación aire acondicionado LG Sevilla, reparación LG Sevilla, mantenimiento LG Sevilla, instalador LG Sevilla, conductos LG Sevilla, split LG Sevilla, cassette LG Sevilla, máquinas de conductos LG Sevilla, aerotermia LG Sevilla, presupuesto LG Sevilla, técnico LG Sevilla, instalación conductos LG Sevilla',
    intro: 'Aire acondicionado LG con garantía oficial. LG es una de las marcas con mejor relación calidad-precio del mercado, con equipos inverter de alta eficiencia y tecnología de purificación de aire. Instalamos, mantenemos y reparamos todos los equipos LG en toda la provincia.',
    services: [
      { title: 'Instalación de aire acondicionado LG en Sevilla', description: 'Instalación de splits, máquinas de conductos y cassettes LG con garantía oficial.' },
      { title: 'Mantenimiento de equipos LG', description: 'Mantenimiento preventivo de aire acondicionado LG con limpieza de filtros y revisiones.' },
      { title: 'Reparación de aire acondicionado LG', description: 'Reparación de equipos LG con repuestos originales y técnicos especializados en LG.' },
      { title: 'Instalación de conductos LG en Sevilla', description: 'Instalación de máquinas de conductos LG para climatización centralizada en viviendas y empresas.' },
    ],
    highlights: [
      'Instalador autorizado LG',
      'Excelente relación calidad-precio en equipos LG',
      'Garantía oficial LG en todas las instalaciones',
      'Instalación de máquinas de conductos LG',
    ],
    faqs: [
      { question: '¿Instaláis aire acondicionado LG?', answer: 'Sí, somos instaladores autorizados de aire acondicionado LG. Instalamos splits, máquinas de conductos, cassettes y aerotermia LG con garantía oficial del fabricante y presupuesto gratis en 24 horas.' },
      { question: '¿Es buena marca LG para aire acondicionado?', answer: 'Sí, LG es una de las marcas con mejor relación calidad-precio del mercado. Sus equipos inverter ofrecen alta eficiencia energética, bajo nivel de ruido y tecnología de purificación de aire. El aire acondicionado LG es una excelente opción para viviendas y oficinas.' },
    ],
  },
  {
    slug: 'panasonic',
    name: 'Panasonic',
    logo: '/brands/panasonic.svg',
    metaTitle: 'Aire Acondicionado Panasonic en Sevilla | Instalador Autorizado | Climatizaciones Montaño, S.L.',
    metaDescription: 'Instalación, mantenimiento y reparación de aire acondicionado Panasonic en Sevilla. Splits, conductos, cassettes y aerotermia Panasonic. Instalador autorizado. Presupuesto gratis.',
    keywords: 'aire acondicionado Panasonic Sevilla, instalación aire acondicionado Panasonic Sevilla, reparación Panasonic Sevilla, mantenimiento Panasonic Sevilla, instalador Panasonic Sevilla, conductos Panasonic Sevilla, split Panasonic Sevilla, cassette Panasonic Sevilla, máquinas de conductos Panasonic Sevilla, aerotermia Panasonic Sevilla, presupuesto Panasonic Sevilla',
    intro: 'Instalamos aire acondicionado Panasonic con garantía oficial. Panasonic es reconocida por la fiabilidad y durabilidad de sus equipos, con tecnología inverter de alta eficiencia y bombas de calor aerotérmicas entre las más eficientes del mercado.',
    services: [
      { title: 'Instalación de aire acondicionado Panasonic en Sevilla', description: 'Instalación de splits, conductos y cassettes Panasonic con garantía oficial.' },
      { title: 'Mantenimiento de equipos Panasonic', description: 'Mantenimiento preventivo de aire acondicionado Panasonic.' },
      { title: 'Reparación de aire acondicionado Panasonic', description: 'Reparación de equipos Panasonic con repuestos originales.' },
      { title: 'Aerotermia Panasonic en Sevilla', description: 'Instalación de bombas de calor aerotérmicas Panasonic para calefacción y ACS.' },
    ],
    highlights: [
      'Instalador autorizado Panasonic',
      'Equipos Panasonic de alta fiabilidad y durabilidad',
      'Garantía oficial Panasonic en instalaciones',
      'Especialistas en aerotermia Panasonic',
    ],
    faqs: [
      { question: '¿Instaláis aire acondicionado Panasonic?', answer: 'Sí, somos instaladores autorizados de Panasonic. Instalamos splits, máquinas de conductos, cassettes y aerotermia Panasonic con garantía oficial del fabricante.' },
    ],
  },
  {
    slug: 'fujitsu',
    name: 'Fujitsu',
    logo: '/brands/fujitsu.svg',
    metaTitle: 'Aire Acondicionado Fujitsu en Sevilla | Instalador Autorizado | Climatizaciones Montaño, S.L.',
    metaDescription: 'Instalación, mantenimiento y reparación de aire acondicionado Fujitsu en Sevilla. Splits, conductos y cassettes Fujitsu. Instalador autorizado. Presupuesto gratis en 24h.',
    keywords: 'aire acondicionado Fujitsu Sevilla, instalación aire acondicionado Fujitsu Sevilla, reparación Fujitsu Sevilla, mantenimiento Fujitsu Sevilla, instalador Fujitsu Sevilla, conductos Fujitsu Sevilla, split Fujitsu Sevilla, cassette Fujitsu Sevilla, máquinas de conductos Fujitsu Sevilla, presupuesto Fujitsu Sevilla',
    intro: 'Instalamos aire acondicionado Fujitsu con garantía oficial. Fujitsu es una marca japonesa conocida por la calidad y el silencio de sus equipos, con una gama muy amplia de splits, conductos y cassettes para cualquier tipo de instalación.',
    services: [
      { title: 'Instalación de aire acondicionado Fujitsu en Sevilla', description: 'Instalación de splits, conductos y cassettes Fujitsu con garantía oficial.' },
      { title: 'Mantenimiento de equipos Fujitsu', description: 'Mantenimiento preventivo de aire acondicionado Fujitsu.' },
      { title: 'Reparación de aire acondicionado Fujitsu', description: 'Reparación de equipos Fujitsu con repuestos originales.' },
    ],
    highlights: [
      'Instalador autorizado Fujitsu',
      'Equipos Fujitsu de máxima calidad y bajo ruido',
      'Garantía oficial Fujitsu en instalaciones',
      'Repuestos originales Fujitsu en reparaciones',
    ],
    faqs: [
      { question: '¿Instaláis aire acondicionado Fujitsu?', answer: 'Sí, somos instaladores autorizados de Fujitsu. Instalamos splits, máquinas de conductos y cassettes Fujitsu con garantía oficial del fabricante.' },
    ],
  },
  {
    slug: 'hisense',
    name: 'Hisense',
    logo: '/brands/hisense.svg',
    metaTitle: 'Aire Acondicionado Hisense en Sevilla | Instalador Autorizado | Climatizaciones Montaño, S.L.',
    metaDescription: 'Instalación, mantenimiento y reparación de aire acondicionado Hisense en Sevilla. Splits, conductos y cassettes Hisense. Excelente relación calidad-precio. Presupuesto gratis.',
    keywords: 'aire acondicionado Hisense Sevilla, instalación aire acondicionado Hisense Sevilla, reparación Hisense Sevilla, mantenimiento Hisense Sevilla, instalador Hisense Sevilla, conductos Hisense Sevilla, split Hisense Sevilla, cassette Hisense Sevilla, máquinas de conductos Hisense Sevilla, presupuesto Hisense Sevilla, técnico Hisense Sevilla, instalación conductos Hisense Sevilla, instalación máquinas conductos Hisense Sevilla',
    intro: 'Aire acondicionado Hisense con garantía oficial. Hisense es una de las marcas con mejor relación calidad-precio del mercado, con equipos inverter de alta eficiencia energética ideales para viviendas y oficinas. Instalamos, mantenemos y reparamos todos los equipos Hisense en toda la provincia.',
    services: [
      { title: 'Instalación de aire acondicionado Hisense en Sevilla', description: 'Instalación de splits, máquinas de conductos y cassettes Hisense con garantía oficial.' },
      { title: 'Mantenimiento de equipos Hisense', description: 'Mantenimiento preventivo de aire acondicionado Hisense.' },
      { title: 'Reparación de aire acondicionado Hisense', description: 'Reparación de equipos Hisense con repuestos originales y técnicos especializados.' },
      { title: 'Instalación de conductos Hisense en Sevilla', description: 'Instalación de máquinas de conductos Hisense para climatización centralizada.' },
    ],
    highlights: [
      'Instalador autorizado Hisense',
      'Excelente relación calidad-precio en equipos Hisense',
      'Garantía oficial Hisense en todas las instalaciones',
      'Instalación de máquinas de conductos Hisense',
    ],
    faqs: [
      { question: '¿Instaláis aire acondicionado Hisense?', answer: 'Sí, somos instaladores autorizados de aire acondicionado Hisense. Instalamos splits, máquinas de conductos, cassettes Hisense con garantía oficial. La instalación de máquinas de conductos Hisense es uno de nuestros servicios más solicitados.' },
      { question: '¿Es buena marca Hisense para aire acondicionado?', answer: 'Sí, Hisense ofrece una de las mejores relaciones calidad-precio del mercado. Sus equipos inverter son eficientes, silenciosos y fiables. El aire acondicionado Hisense es una opción muy popular para viviendas y oficinas.' },
    ],
  },
  {
    slug: 'johnson',
    name: 'Johnson',
    logo: '/brands/johnson.svg',
    metaTitle: 'Aire Acondicionado Johnson en Sevilla | Instalador Autorizado | Climatizaciones Montaño, S.L.',
    metaDescription: 'Instalación, mantenimiento y reparación de aire acondicionado Johnson en Sevilla. Splits, conductos y cassettes Johnson. Buena calidad y precios muy competitivos. Presupuesto gratis.',
    keywords: 'aire acondicionado Johnson Sevilla, instalación aire acondicionado Johnson Sevilla, reparación Johnson Sevilla, mantenimiento Johnson Sevilla, instalador Johnson Sevilla, conductos Johnson Sevilla, split Johnson Sevilla, cassette Johnson Sevilla, máquinas de conductos Johnson Sevilla, presupuesto Johnson Sevilla, técnico Johnson Sevilla, aire acondicionado barato Sevilla calidad',
    intro: 'Instalamos y reparamos aire acondicionado Johnson con garantía oficial. Johnson es una marca que destaca por ofrecer muy buena calidad a precios realmente competitivos, con equipos inverter de alta eficiencia energética ideales para viviendas, oficinas y segundas residencias. Somos instaladores autorizados de Johnson en toda la provincia.',
    services: [
      { title: 'Instalación de aire acondicionado Johnson en Sevilla', description: 'Instalación de splits, máquinas de conductos y cassettes Johnson con garantía oficial del fabricante.' },
      { title: 'Mantenimiento de equipos Johnson', description: 'Mantenimiento preventivo de aire acondicionado Johnson con limpieza de filtros y revisiones anuales.' },
      { title: 'Reparación de aire acondicionado Johnson', description: 'Reparación de equipos Johnson con repuestos originales y técnicos especializados en la marca.' },
      { title: 'Instalación de conductos Johnson en Sevilla', description: 'Instalación de máquinas de conductos Johnson para climatización centralizada en viviendas y empresas.' },
    ],
    highlights: [
      'Instalador autorizado Johnson',
      'Muy buena calidad a precios muy competitivos',
      'Garantía oficial Johnson en todas las instalaciones',
      'Equipos inverter de alta eficiencia energética',
    ],
    faqs: [
      { question: '¿Instaláis aire acondicionado Johnson?', answer: 'Sí, somos instaladores autorizados de aire acondicionado Johnson. Instalamos splits, máquinas de conductos y cassettes Johnson con garantía oficial del fabricante y presupuesto gratis en 24 horas.' },
      { question: '¿Es buena marca Johnson para aire acondicionado?', answer: 'Sí, Johnson ofrece muy buena calidad a precios muy competitivos. Sus equipos inverter son eficientes, fiables y silenciosos. Es una opción excelente si buscas un equipo de calidad sin gastar demasiado. El aire acondicionado Johnson es muy popular para viviendas, oficinas y segundas residencias.' },
      { question: '¿Reparáis equipos Johnson?', answer: 'Sí, reparamos todos los equipos Johnson en toda la provincia. Nuestro técnico especializado usa repuestos originales Johnson y ofrece 6 meses de garantía en todas las reparaciones.' },
    ],
  },
  {
    slug: 'hitachi',
    name: 'Hitachi',
    logo: '/brands/hitachi.svg',
    metaTitle: 'Aire Acondicionado Hitachi en Sevilla | Instalador Autorizado | Climatizaciones Montaño, S.L.',
    metaDescription: 'Instalación, mantenimiento y reparación de aire acondicionado Hitachi en Sevilla. Splits, conductos y cassettes Hitachi. Reparación Hitachi con repuestos originales. Presupuesto gratis.',
    keywords: 'aire acondicionado Hitachi Sevilla, instalación aire acondicionado Hitachi Sevilla, reparación Hitachi Sevilla, mantenimiento Hitachi Sevilla, instalador Hitachi Sevilla, conductos Hitachi Sevilla, split Hitachi Sevilla, cassette Hitachi Sevilla, máquinas de conductos Hitachi Sevilla, presupuesto Hitachi Sevilla, técnico Hitachi Sevilla',
    intro: 'Instalamos y reparamos aire acondicionado Hitachi con garantía oficial. Hitachi es una marca japonesa de máxima calidad, conocida por la durabilidad y el rendimiento de sus equipos de climatización. Reparación Hitachi con técnicos especializados y repuestos originales.',
    services: [
      { title: 'Instalación de aire acondicionado Hitachi en Sevilla', description: 'Instalación de splits, conductos y cassettes Hitachi con garantía oficial.' },
      { title: 'Mantenimiento de equipos Hitachi', description: 'Mantenimiento preventivo de aire acondicionado Hitachi.' },
      { title: 'Reparación de aire acondicionado Hitachi', description: 'Reparación Hitachi con repuestos originales y técnicos especializados en la marca.' },
    ],
    highlights: [
      'Instalador autorizado Hitachi',
      'Reparación Hitachi con repuestos originales',
      'Garantía oficial Hitachi en instalaciones',
      'Técnicos especializados en equipos Hitachi',
    ],
    faqs: [
      { question: '¿Reparáis aire acondicionado Hitachi?', answer: 'Sí, la reparación Hitachi es uno de nuestros servicios más solicitados. Nuestro técnico especializado en Hitachi usa repuestos originales y ofrece 6 meses de garantía en todas las reparaciones de equipos Hitachi.' },
      { question: '¿Instaláis equipos Hitachi?', answer: 'Sí, somos instaladores autorizados de Hitachi. Instalamos splits, máquinas de conductos y cassettes Hitachi con garantía oficial del fabricante.' },
    ],
  },
];

export function getBrandBySlug(slug: string): BrandData | undefined {
  return BRANDS.find((b) => b.slug === slug);
}
