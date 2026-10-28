export type ProjectStatus = 'terminada' | 'en-ejecucion';

export interface Project {
  slug: string;
  status: ProjectStatus;
  title: string;
  location: string;
  summary: string;
  category: string;
  gallery: Array<{ src: string; alt: string; caption?: string }>;
}

export const PROJECTS: Project[] = [
  {
    slug: 'edificio-europa-2',
    status: 'terminada',
    title: 'Edificio Europa 2',
    location: 'Alcalá de Guadaíra, Sevilla',
    category: 'Residencial · Conductos',
    summary:
      'Climatización completa del edificio con equipos de conductos Daikin y control por zonas MysAir. Cada vivienda dispone de control independiente desde el móvil.',
    gallery: [
      { src: '/images/new-work/alcala-de-guadaira/edificio-moderno-obra-nueva.webp', alt: 'Edificio Europa 2 de Alcalá de Guadaíra', caption: 'Edificio Europa 2' },
    ].filter(Boolean),
  },
  {
    slug: 'calle-san-jose',
    status: 'terminada',
    title: 'Calle San José',
    location: 'Alcalá de Guadaíra, Sevilla',
    category: 'Obra nueva · Viviendas',
    summary:
      'Instalación completa de climatización por conductos, equipos Daikin de alta eficiencia y zonificación MysAir con control independiente por estancia.',
    gallery: [
      { src: '/images/new-work/alcala-de-guadaira/calle-san-jose/fachada-viviendas-calle-san-jose.jpg', alt: 'Fachada de las viviendas de la Calle San José', caption: 'Fachada' },
      { src: '/images/new-work/alcala-de-guadaira/calle-san-jose/koolnova-gateway-daikin-vrv.jpg', alt: 'Pasarela Koolnova Gateway Daikin VRV', caption: 'Koolnova Gateway' },
      { src: '/images/new-work/alcala-de-guadaira/calle-san-jose/conductos-chapa-tuberias.jpg', alt: 'Conductos de chapa y tuberías', caption: 'Conductos y tuberías' },
      { src: '/images/new-work/alcala-de-guadaira/calle-san-jose/modulo-zonificacion-mysair-ms201v.jpg', alt: 'Módulo de zonificación MysAir MS201V-V4', caption: 'Zonificación MysAir' },
    ],
  },
  {
    slug: 'proyecto-en-ejecucion-ejemplo',
    status: 'en-ejecucion',
    title: 'Proyecto en ejecución (ejemplo)',
    location: 'Sevilla, provincia',
    category: 'En curso',
    summary:
      'Obra en progreso. Añade aquí nombre, localización y fotos reales cuando tengas la referencia (architecture ready placeholder).',
    gallery: [
      { src: '/office-cassette-ac.webp', alt: 'Imagen temporal de proyecto en ejecución', caption: 'En ejecución' },
    ],
  },
];
