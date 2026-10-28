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
      { src: '/images/new-work/alcala-de-guadaira/edificio-europa-2/1791285280167.jpg', alt: 'Equipos de climatización Daikin en la cubierta del Edificio Europa 2 de Alcalá de Guadaíra', caption: 'Europa 2 - Cubierta' },
      { src: '/images/new-work/alcala-de-guadaira/edificio-europa-2/1791285345778.jpg', alt: 'Técnico revisando la instalación de climatización del Edificio Europa 2', caption: 'Europa 2 - Interior' },
    ],
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
    slug: 'obra-mr12-grupo-recio',
    status: 'en-ejecucion',
    title: 'Obra MR12 - Grupo Recio',
    location: 'Alcalá de Guadaíra, Sevilla',
    category: 'En ejecución · Viviendas',
    summary:
      'Climatización y ventilación para la promoción MR12 del Grupo Recio en Alcalá de Guadaíra: equipos Daikin y sistemas por zonas con control total vía WiFi desde la app del móvil (MysAir).',
    gallery: [
      { src: '/images/obras/mr12/obra-mr12-01.jpg', alt: 'Obra MR12 Grupo Recio - Alcalá de Guadaíra, foto 01', caption: 'Obra MR12' },
      { src: '/images/obras/mr12/obra-mr12-02.jpg', alt: 'Obra MR12 Grupo Recio - Alcalá de Guadaíra, foto 02', caption: 'Obra MR12' },
      { src: '/images/obras/mr12/obra-mr12-03.jpg', alt: 'Obra MR12 Grupo Recio - Alcalá de Guadaíra, foto 03', caption: 'Obra MR12' },
      { src: '/images/obras/mr12/obra-mr12-04.jpg', alt: 'Obra MR12 Grupo Recio - Alcalá de Guadaíra, foto 04', caption: 'Obra MR12' },
      { src: '/images/obras/mr12/obra-mr12-05.jpg', alt: 'Obra MR12 Grupo Recio - Alcalá de Guadaíra, foto 05', caption: 'Obra MR12' },
      { src: '/images/obras/mr12/obra-mr12-06.jpg', alt: 'Obra MR12 Grupo Recio - Alcalá de Guadaíra, foto 06', caption: 'Obra MR12' },
      { src: '/images/obras/mr12/obra-mr12-07.jpg', alt: 'Obra MR12 Grupo Recio - Alcalá de Guadaíra, foto 07', caption: 'Obra MR12' },
      { src: '/images/obras/mr12/obra-mr12-08.jpg', alt: 'Obra MR12 Grupo Recio - Alcalá de Guadaíra, foto 08', caption: 'Obra MR12' },
      { src: '/images/obras/mr12/obra-mr12-09.jpg', alt: 'Obra MR12 Grupo Recio - Alcalá de Guadaíra, foto 09', caption: 'Obra MR12' },
      { src: '/images/obras/mr12/obra-mr12-10.jpg', alt: 'Obra MR12 Grupo Recio - Alcalá de Guadaíra, foto 10', caption: 'Obra MR12' },
    ],
  },
];
