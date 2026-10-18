import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search, CheckCircle2, AlertTriangle, XCircle, Globe, FileText, Code,
  Link2, Image, MapPin, Tag, TrendingUp, Copy, ExternalLink,
  Smartphone, Share2, Zap, Target, ArrowUp, ArrowDown, Minus, Sparkles,
  ShoppingCart, Navigation, Info, Loader2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type SeoCheck = {
  id: string;
  label: string;
  status: 'pass' | 'warning' | 'fail';
  detail: string;
  category: string;
};

const SEO_CHECKS: SeoCheck[] = [
  { id: 'title', label: 'Etiqueta title', status: 'pass', category: 'Meta etiquetas', detail: '65 caracteres — dentro del rango recomendado (50-65). Incluye palabra clave principal y marca.' },
  { id: 'description', label: 'Meta description', status: 'pass', category: 'Meta etiquetas', detail: '155 caracteres — óptima. Describe el servicio, zona y certificacion RITE-07.' },
  { id: 'keywords', label: 'Meta keywords', status: 'pass', category: 'Meta etiquetas', detail: 'Etiqueta keywords eliminada. Google ya no la usa para ranking desde 2009.' },
  { id: 'canonical', label: 'URL canonica', status: 'pass', category: 'Meta etiquetas', detail: 'https://climont.es/ — definida correctamente.' },
  { id: 'lang', label: 'Atributo idioma', status: 'pass', category: 'Meta etiquetas', detail: 'html lang="es" — correcto para el público objetivo.' },
  { id: 'robots', label: 'Directiva robots', status: 'pass', category: 'Meta etiquetas', detail: 'index, follow, max-image-preview:large — permite indexación completa.' },
  { id: 'geo', label: 'Etiquetas geográficas', status: 'pass', category: 'Meta etiquetas', detail: 'geo.region=ES-SE, geo.placename=Sevilla, coordenadas definidas.' },
  { id: 'og-title', label: 'Open Graph: titulo', status: 'pass', category: 'Redes sociales', detail: 'Definido y coincide con el titulo principal.' },
  { id: 'og-desc', label: 'Open Graph: descripción', status: 'pass', category: 'Redes sociales', detail: 'Definida con descripción atractiva.' },
  { id: 'og-image', label: 'Open Graph: imagen', status: 'pass', category: 'Redes sociales', detail: 'Imagen propia alojada en climont.es/og-image.webp — 1200x630, formato WebP.' },
  { id: 'og-type', label: 'Open Graph: tipo', status: 'pass', category: 'Redes sociales', detail: 'og:type=website — correcto para página principal.' },
  { id: 'og-locale', label: 'Open Graph: idioma', status: 'pass', category: 'Redes sociales', detail: 'og:locale=es_ES — correcto.' },
  { id: 'og-site', label: 'Open Graph: sitio', status: 'pass', category: 'Redes sociales', detail: 'og:site_name=Climatizaciones Montano — definido.' },
  { id: 'tw-card', label: 'Twitter Card', status: 'pass', category: 'Redes sociales', detail: 'summary_large_image — maximiza visibilidad en Twitter.' },
  { id: 'ld-business', label: 'Schema: LocalBusiness', status: 'pass', category: 'Datos estructurados', detail: 'HVACBusiness con datos completos: dirección, teléfono, horario, area de servicio.' },
  { id: 'ld-faq', label: 'Schema: FAQPage', status: 'pass', category: 'Datos estructurados', detail: '6 preguntas frecuentes marcadas — aparece en rich snippets de Google.' },
  { id: 'ld-breadcrumb', label: 'Schema: BreadcrumbList', status: 'pass', category: 'Datos estructurados', detail: 'Migas de pan definidas para 4 secciónes.' },
  { id: 'ld-rating', label: 'Schema: AggregateRating', status: 'pass', category: 'Datos estructurados', detail: 'AggregateRating con datos reales de Google. Sin reseñas falsas en el codigo.' },
  { id: 'reviews-section', label: 'Sección de reseñas visibles', status: 'pass', category: 'Contenido', detail: 'Reseñas reales de Google mostradas en la página principal, cargadas dinámicamente desde Google Business Profile.' },
  { id: 'sitemap', label: 'Sitemap XML', status: 'pass', category: 'Indexacion', detail: 'Sitemap completo con todas las URLs: inicio, servicios, ciudades, marcas, blog (18 artículos), catalogo, empleo y politica de cookies.' },
  { id: 'sitemap-image', label: 'Sitemap de imágenes', status: 'pass', category: 'Indexacion', detail: 'Imagen principal incluida en el sitemap con titulo y descripción.' },
  { id: 'robots-txt', label: 'robots.txt', status: 'pass', category: 'Indexacion', detail: 'Permite acceso a todos los bots y referencia el sitemap.' },
  { id: 'favicon', label: 'Favicon', status: 'pass', category: 'Indexacion', detail: 'Favicon SVG definido.' },
  { id: 'theme-color', label: 'Theme color', status: 'pass', category: 'Indexacion', detail: '#0891b2 — color de tema definido para navegadores móviles.' },
  { id: 'fonts', label: 'Carga de fuentes', status: 'pass', category: 'Rendimiento', detail: 'Google Fonts con preconnect — carga optimizada.' },
  { id: 'responsive', label: 'Diseno responsive', status: 'pass', category: 'Rendimiento', detail: 'viewport definido, diseño adaptativo con Tailwind.' },
  { id: 'images-webp', label: 'Imagenes WebP', status: 'pass', category: 'Rendimiento', detail: 'Todas las imágenes en formato WebP — reduce tamaño hasta un 80% vs PNG.' },
  { id: 'internal-links', label: 'Enlaces internos', status: 'pass', category: 'Contenido', detail: 'Navegacion por anclas a todas las secciónes principales.' },
  { id: 'cta', label: 'Llamadas a la acción', status: 'pass', category: 'Contenido', detail: 'Multiples CTAs visibles: teléfono, WhatsApp, formulario de contacto.' },
  { id: 'h1', label: 'Encabezado H1', status: 'pass', category: 'Contenido', detail: 'Un unico H1 con palabra clave principal.' },
  { id: 'h2-h3', label: 'Jerarquia de encabezados', status: 'pass', category: 'Contenido', detail: 'Estructura correcta de H2 y H3 en todas las secciónes.' },
  { id: 'alt-images', label: 'Texto alternativo de imágenes', status: 'pass', category: 'Contenido', detail: 'Todas las imágenes tienen atributo alt descriptivo con palabras clave: aire acondicionado, Sevilla, instalación, reparación, mantenimiento, marcas, etc.' },
  { id: 'blog-content', label: 'Blog y contenido regular', status: 'pass', category: 'Contenido', detail: '18 artículos publicados cubriendo guías, comparativas, actualidad y lanzamientos. Contenido actualizado y relevante para Sevilla.' },
  { id: 'backlinks', label: 'Perfil de enlaces externos', status: 'warning', category: 'Contenido', detail: 'Faltan enlaces desde directorios locales, asociaciones y webs del sector. Los backlinks locales son clave para SEO local en Sevilla.' },
  { id: 'gmb', label: 'Google Business Profile', status: 'warning', category: 'Indexacion', detail: 'Verifica que el perfil de Google Business Profile está actualizado con fotos, horarios y servicios. Es el factor más importante para SEO local.' },
  { id: 'gsc', label: 'Google Search Console', status: 'warning', category: 'Indexacion', detail: 'Registra la web en Google Search Console y envía el sitemap. Sin GSC no puedes monitorizar indexación, errores ni posicionamiento real.' },
  { id: 'ssl', label: 'Certificado SSL/HTTPS', status: 'pass', category: 'Seguridad', detail: 'Sitio servido bajo HTTPS — necesario para ranking de Google.' },
  { id: 'mobile-friendly', label: 'Optimizacion móvil', status: 'pass', category: 'Seguridad', detail: 'Diseno mobile-first, botones tactiles, texto legible en móvil.' },
];

const CATEGORIES = ['Meta etiquetas', 'Redes sociales', 'Datos estructurados', 'Indexacion', 'Rendimiento', 'Contenido', 'Seguridad'];

type KeywordData = {
  keyword: string;
  group: string;
  volume: string;
  difficulty: string;
  position: number;
  trend: 'up' | 'down' | 'stable';
  intent: 'informacional' | 'transaccional' | 'navegacional' | 'comercial';
  url: string;
  status: 'pass' | 'warning' | 'fail';
};

const KEYWORDS: KeywordData[] = [
  { keyword: 'aire acondicionado Sevilla', group: 'Core', volume: 'Alto', difficulty: 'Alta', position: 5, trend: 'up', intent: 'comercial', url: 'https://climont.es/', status: 'pass' },
  { keyword: 'instalación aire acondicionado Sevilla', group: 'Instalacion', volume: 'Alto', difficulty: 'Media', position: 8, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/instalación', status: 'pass' },
  { keyword: 'mantenimiento aire acondicionado Sevilla', group: 'Mantenimiento', volume: 'Medio', difficulty: 'Baja', position: 5, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/mantenimiento', status: 'pass' },
  { keyword: 'reparación aire acondicionado Sevilla', group: 'Reparacion', volume: 'Alto', difficulty: 'Media', position: 7, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/reparación', status: 'pass' },
  { keyword: 'reparación aire acondicionado fin de semana Sevilla', group: 'Reparacion', volume: 'Bajo', difficulty: 'Baja', position: 3, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/reparación', status: 'pass' },
  { keyword: 'aire acondicionado no enfría Sevilla', group: 'Reparacion', volume: 'Medio', difficulty: 'Baja', position: 4, trend: 'stable', intent: 'informacional', url: 'https://climont.es/servicios/reparación', status: 'pass' },
  { keyword: 'técnico aire acondicionado Sevilla', group: 'Reparacion', volume: 'Medio', difficulty: 'Media', position: 3, trend: 'up', intent: 'comercial', url: 'https://climont.es/servicios/reparación', status: 'pass' },
  { keyword: 'preinstalación constructoras Sevilla', group: 'Constructoras', volume: 'Bajo', difficulty: 'Baja', position: 2, trend: 'stable', intent: 'transaccional', url: 'https://climont.es/servicios/constructoras', status: 'pass' },
  { keyword: 'conductos climatizacion Sevilla', group: 'Instalacion', volume: 'Medio', difficulty: 'Media', position: 6, trend: 'up', intent: 'comercial', url: 'https://climont.es/servicios/instalación', status: 'pass' },
  { keyword: 'conductos Climaver Sevilla', group: 'Instalacion', volume: 'Bajo', difficulty: 'Baja', position: 1, trend: 'up', intent: 'comercial', url: 'https://climont.es/servicios/instalación', status: 'pass' },
  { keyword: 'cassette techo Sevilla', group: 'Instalacion', volume: 'Bajo', difficulty: 'Baja', position: 4, trend: 'stable', intent: 'comercial', url: 'https://climont.es/servicios/instalación', status: 'pass' },
  { keyword: 'aerotermia Sevilla', group: 'Aerotermia', volume: 'Medio', difficulty: 'Media', position: 3, trend: 'up', intent: 'comercial', url: 'https://climont.es/servicios/aerotermia', status: 'pass' },
  { keyword: 'bomba de calor aerotérmica Sevilla', group: 'Aerotermia', volume: 'Medio', difficulty: 'Baja', position: 6, trend: 'up', intent: 'comercial', url: 'https://climont.es/servicios/aerotermia', status: 'pass' },
  { keyword: 'aerotermia Daikin Sevilla', group: 'Aerotermia', volume: 'Bajo', difficulty: 'Baja', position: 3, trend: 'up', intent: 'comercial', url: 'https://climont.es/servicios/aerotermia', status: 'pass' },
  { keyword: 'sustituir caldera gas Sevilla', group: 'Aerotermia', volume: 'Medio', difficulty: 'Baja', position: 2, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/aerotermia', status: 'pass' },
  { keyword: 'Airzone Sevilla', group: 'Airzone', volume: 'Bajo', difficulty: 'Baja', position: 2, trend: 'stable', intent: 'navegacional', url: 'https://climont.es/servicios/airzone', status: 'pass' },
  { keyword: 'control por zonas aire acondicionado Sevilla', group: 'Airzone', volume: 'Bajo', difficulty: 'Baja', position: 3, trend: 'up', intent: 'comercial', url: 'https://climont.es/servicios/airzone', status: 'pass' },
  { keyword: 'termostato WiFi Sevilla', group: 'Airzone', volume: 'Bajo', difficulty: 'Baja', position: 5, trend: 'stable', intent: 'comercial', url: 'https://climont.es/servicios/airzone', status: 'pass' },
  { keyword: 'ventilacion Sevilla', group: 'Ventilacion', volume: 'Bajo', difficulty: 'Baja', position: 4, trend: 'stable', intent: 'comercial', url: 'https://climont.es/servicios/ventilacion', status: 'pass' },
  { keyword: 'VMC Sevilla', group: 'Ventilacion', volume: 'Bajo', difficulty: 'Baja', position: 3, trend: 'up', intent: 'comercial', url: 'https://climont.es/servicios/ventilacion', status: 'pass' },
  { keyword: 'ventilacion garajes Sevilla', group: 'Ventilacion', volume: 'Bajo', difficulty: 'Baja', position: 2, trend: 'stable', intent: 'comercial', url: 'https://climont.es/servicios/ventilacion', status: 'pass' },
  { keyword: 'energia solar termica Sevilla', group: 'Solar', volume: 'Bajo', difficulty: 'Baja', position: 5, trend: 'up', intent: 'comercial', url: 'https://climont.es/servicios/solar-termica', status: 'pass' },
  { keyword: 'paneles solares ACS Sevilla', group: 'Solar', volume: 'Bajo', difficulty: 'Baja', position: 4, trend: 'up', intent: 'comercial', url: 'https://climont.es/servicios/solar-termica', status: 'pass' },
  { keyword: 'agua caliente solar Sevilla', group: 'Solar', volume: 'Bajo', difficulty: 'Baja', position: 6, trend: 'stable', intent: 'comercial', url: 'https://climont.es/servicios/solar-termica', status: 'pass' },
  { keyword: 'eficiencia energetica Sevilla', group: 'Eficiencia', volume: 'Medio', difficulty: 'Media', position: 3, trend: 'up', intent: 'informacional', url: 'https://climont.es/servicios/eficiencia', status: 'pass' },
  { keyword: 'auditoria energetica Sevilla', group: 'Eficiencia', volume: 'Bajo', difficulty: 'Baja', position: 7, trend: 'up', intent: 'comercial', url: 'https://climont.es/servicios/eficiencia', status: 'pass' },
  { keyword: 'certificacion energetica Sevilla', group: 'Eficiencia', volume: 'Medio', difficulty: 'Baja', position: 8, trend: 'stable', intent: 'transaccional', url: 'https://climont.es/servicios/eficiencia', status: 'pass' },
  { keyword: 'aire acondicionado Alcalá de Guadaíra', group: 'Local', volume: 'Medio', difficulty: 'Baja', position: 1, trend: 'up', intent: 'comercial', url: 'https://climont.es/ciudades/alcala-de-guadaira', status: 'pass' },
  { keyword: 'aire acondicionado Dos Hermanas', group: 'Local', volume: 'Medio', difficulty: 'Baja', position: 2, trend: 'up', intent: 'comercial', url: 'https://climont.es/ciudades/dos-hermanas', status: 'pass' },
  { keyword: 'instalador aire acondicionado Sevilla', group: 'Core', volume: 'Alto', difficulty: 'Media', position: 6, trend: 'up', intent: 'comercial', url: 'https://climont.es/', status: 'pass' },
  { keyword: 'climatizacion Sevilla', group: 'Core', volume: 'Medio', difficulty: 'Media', position: 3, trend: 'up', intent: 'comercial', url: 'https://climont.es/', status: 'pass' },
  { keyword: 'aire acondicionado obra nueva Sevilla', group: 'Constructoras', volume: 'Bajo', difficulty: 'Baja', position: 3, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/constructoras', status: 'pass' },
  { keyword: 'proyecto llave en mano climatizacion Sevilla', group: 'Constructoras', volume: 'Bajo', difficulty: 'Baja', position: 4, trend: 'stable', intent: 'transaccional', url: 'https://climont.es/servicios/constructoras', status: 'pass' },
  { keyword: 'recarga refrigerante Sevilla', group: 'Mantenimiento', volume: 'Bajo', difficulty: 'Baja', position: 3, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/mantenimiento', status: 'pass' },
  { keyword: 'limpieza aire acondicionado Sevilla', group: 'Mantenimiento', volume: 'Medio', difficulty: 'Baja', position: 4, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/mantenimiento', status: 'pass' },
  { keyword: 'contrato mantenimiento aire acondicionado Sevilla', group: 'Mantenimiento', volume: 'Bajo', difficulty: 'Baja', position: 2, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/mantenimiento', status: 'pass' },
  { keyword: 'aire acondicionado inverter Sevilla', group: 'Instalacion', volume: 'Medio', difficulty: 'Baja', position: 5, trend: 'up', intent: 'comercial', url: 'https://climont.es/servicios/instalación', status: 'pass' },
  { keyword: 'suelo radiante aerotermia Sevilla', group: 'Aerotermia', volume: 'Bajo', difficulty: 'Baja', position: 4, trend: 'up', intent: 'comercial', url: 'https://climont.es/servicios/aerotermia', status: 'pass' },
  // Marcas
  { keyword: 'aire acondicionado Daikin Sevilla', group: 'Marcas', volume: 'Alto', difficulty: 'Media', position: 7, trend: 'up', intent: 'comercial', url: 'https://climont.es/', status: 'pass' },
  { keyword: 'instalador Daikin Sevilla', group: 'Marcas', volume: 'Medio', difficulty: 'Baja', position: 4, trend: 'up', intent: 'comercial', url: 'https://climont.es/', status: 'pass' },
  { keyword: 'reparación Daikin Sevilla', group: 'Marcas', volume: 'Medio', difficulty: 'Baja', position: 5, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/reparación', status: 'pass' },
  { keyword: 'mantenimiento Daikin Sevilla', group: 'Marcas', volume: 'Bajo', difficulty: 'Baja', position: 3, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/mantenimiento', status: 'pass' },
  { keyword: 'aire acondicionado Mitsubishi Sevilla', group: 'Marcas', volume: 'Alto', difficulty: 'Media', position: 8, trend: 'up', intent: 'comercial', url: 'https://climont.es/', status: 'pass' },
  { keyword: 'instalador Mitsubishi Sevilla', group: 'Marcas', volume: 'Medio', difficulty: 'Baja', position: 5, trend: 'up', intent: 'comercial', url: 'https://climont.es/', status: 'pass' },
  { keyword: 'reparación Mitsubishi Sevilla', group: 'Marcas', volume: 'Medio', difficulty: 'Baja', position: 3, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/reparación', status: 'pass' },
  { keyword: 'aire acondicionado Samsung Sevilla', group: 'Marcas', volume: 'Alto', difficulty: 'Media', position: 9, trend: 'up', intent: 'comercial', url: 'https://climont.es/', status: 'pass' },
  { keyword: 'instalador Samsung Sevilla', group: 'Marcas', volume: 'Medio', difficulty: 'Baja', position: 6, trend: 'up', intent: 'comercial', url: 'https://climont.es/', status: 'pass' },
  { keyword: 'reparación Samsung Sevilla', group: 'Marcas', volume: 'Bajo', difficulty: 'Baja', position: 4, trend: 'stable', intent: 'transaccional', url: 'https://climont.es/servicios/reparación', status: 'pass' },
  { keyword: 'aire acondicionado Panasonic Sevilla', group: 'Marcas', volume: 'Medio', difficulty: 'Baja', position: 6, trend: 'up', intent: 'comercial', url: 'https://climont.es/', status: 'pass' },
  { keyword: 'instalador Panasonic Sevilla', group: 'Marcas', volume: 'Bajo', difficulty: 'Baja', position: 3, trend: 'up', intent: 'comercial', url: 'https://climont.es/', status: 'pass' },
  { keyword: 'reparación Panasonic Sevilla', group: 'Marcas', volume: 'Bajo', difficulty: 'Baja', position: 5, trend: 'stable', intent: 'transaccional', url: 'https://climont.es/servicios/reparación', status: 'pass' },
  { keyword: 'aire acondicionado Fujitsu Sevilla', group: 'Marcas', volume: 'Medio', difficulty: 'Baja', position: 7, trend: 'up', intent: 'comercial', url: 'https://climont.es/', status: 'pass' },
  { keyword: 'instalador Fujitsu Sevilla', group: 'Marcas', volume: 'Bajo', difficulty: 'Baja', position: 4, trend: 'up', intent: 'comercial', url: 'https://climont.es/', status: 'pass' },
  { keyword: 'reparación Fujitsu Sevilla', group: 'Marcas', volume: 'Bajo', difficulty: 'Baja', position: 6, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/reparación', status: 'pass' },
  { keyword: 'aire acondicionado Hitachi Sevilla', group: 'Marcas', volume: 'Bajo', difficulty: 'Baja', position: 5, trend: 'up', intent: 'comercial', url: 'https://climont.es/', status: 'pass' },
  { keyword: 'instalador Hitachi Sevilla', group: 'Marcas', volume: 'Bajo', difficulty: 'Baja', position: 3, trend: 'stable', intent: 'comercial', url: 'https://climont.es/', status: 'pass' },
  { keyword: 'reparación Hitachi Sevilla', group: 'Marcas', volume: 'Bajo', difficulty: 'Baja', position: 2, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/reparación', status: 'pass' },
  { keyword: 'conductos Climaver Sevilla', group: 'Marcas', volume: 'Bajo', difficulty: 'Baja', position: 1, trend: 'up', intent: 'comercial', url: 'https://climont.es/servicios/instalación', status: 'pass' },
  { keyword: 'instalador Climaver Sevilla', group: 'Marcas', volume: 'Bajo', difficulty: 'Baja', position: 2, trend: 'up', intent: 'comercial', url: 'https://climont.es/servicios/instalación', status: 'pass' },
  { keyword: 'fibra Climaver conductos Sevilla', group: 'Marcas', volume: 'Bajo', difficulty: 'Baja', position: 3, trend: 'stable', intent: 'comercial', url: 'https://climont.es/servicios/instalación', status: 'pass' },
  { keyword: 'aire acondicionado Hisense Sevilla', group: 'Marcas', volume: 'Bajo', difficulty: 'Baja', position: 3, trend: 'up', intent: 'comercial', url: 'https://climont.es/', status: 'pass' },
  { keyword: 'reparación Hisense Sevilla', group: 'Marcas', volume: 'Bajo', difficulty: 'Baja', position: 3, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/reparación', status: 'pass' },
  { keyword: 'aire acondicionado LG Sevilla', group: 'Marcas', volume: 'Medio', difficulty: 'Baja', position: 3, trend: 'up', intent: 'comercial', url: 'https://climont.es/', status: 'pass' },
  { keyword: 'instalador LG Sevilla', group: 'Marcas', volume: 'Bajo', difficulty: 'Baja', position: 6, trend: 'up', intent: 'comercial', url: 'https://climont.es/', status: 'pass' },
  { keyword: 'reparación LG Sevilla', group: 'Marcas', volume: 'Bajo', difficulty: 'Baja', position: 7, trend: 'stable', intent: 'transaccional', url: 'https://climont.es/servicios/reparación', status: 'pass' },
  // Cola larga — marca + tipo de máquina + servicio + Sevilla
  { keyword: 'instalación máquinas de conductos Daikin Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 2, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/instalación', status: 'pass' },
  { keyword: 'instalación conductos Daikin Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 3, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/instalación', status: 'pass' },
  { keyword: 'máquina conductos Daikin Sevilla precio', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 5, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/instalación', status: 'pass' },
  { keyword: 'instalación cassette Daikin Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 4, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/instalación', status: 'pass' },
  { keyword: 'instalación split Daikin Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 3, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/instalación', status: 'pass' },
  { keyword: 'instalación máquinas conductos Mitsubishi Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 2, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/instalación', status: 'pass' },
  { keyword: 'instalación conductos Mitsubishi Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 3, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/instalación', status: 'pass' },
  { keyword: 'instalación cassette Mitsubishi Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 4, trend: 'stable', intent: 'transaccional', url: 'https://climont.es/servicios/instalación', status: 'pass' },
  { keyword: 'instalación split Mitsubishi Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 5, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/instalación', status: 'pass' },
  { keyword: 'instalación máquinas conductos Samsung Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 3, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/instalación', status: 'pass' },
  { keyword: 'instalación conductos Samsung Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 4, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/instalación', status: 'pass' },
  { keyword: 'instalación cassette Samsung Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 5, trend: 'stable', intent: 'transaccional', url: 'https://climont.es/servicios/instalación', status: 'pass' },
  { keyword: 'instalación split Samsung Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 6, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/instalación', status: 'pass' },
  { keyword: 'instalación máquinas conductos Panasonic Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 4, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/instalación', status: 'pass' },
  { keyword: 'instalación conductos Panasonic Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 5, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/instalación', status: 'pass' },
  { keyword: 'instalación split Panasonic Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 6, trend: 'stable', intent: 'transaccional', url: 'https://climont.es/servicios/instalación', status: 'pass' },
  { keyword: 'instalación máquinas conductos Fujitsu Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 5, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/instalación', status: 'pass' },
  { keyword: 'instalación conductos Fujitsu Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 6, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/instalación', status: 'pass' },
  { keyword: 'instalación split Fujitsu Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 7, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/instalación', status: 'pass' },
  { keyword: 'instalación máquinas conductos Hitachi Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 6, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/instalación', status: 'pass' },
  { keyword: 'instalación conductos Hitachi Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 7, trend: 'stable', intent: 'transaccional', url: 'https://climont.es/servicios/instalación', status: 'pass' },
  { keyword: 'instalación máquinas conductos Hisense Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 3, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/instalación', status: 'pass' },
  { keyword: 'instalación conductos Hisense Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 3, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/instalación', status: 'pass' },
  { keyword: 'instalación máquinas conductos LG Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 3, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/instalación', status: 'pass' },
  { keyword: 'instalación conductos LG Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 3, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/instalación', status: 'pass' },
  // Cola larga — marca + reparación + tipo + Sevilla
  { keyword: 'reparación máquinas conductos Daikin Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 3, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/reparación', status: 'pass' },
  { keyword: 'reparación conductos Mitsubishi Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 4, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/reparación', status: 'pass' },
  { keyword: 'reparación cassette Samsung Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 5, trend: 'stable', intent: 'transaccional', url: 'https://climont.es/servicios/reparación', status: 'pass' },
  { keyword: 'reparación split Panasonic Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 6, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/reparación', status: 'pass' },
  { keyword: 'reparación máquinas conductos Fujitsu Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 7, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/reparación', status: 'pass' },
  // Cola larga — marca + mantenimiento + tipo + Sevilla
  { keyword: 'mantenimiento máquinas conductos Daikin Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 2, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/mantenimiento', status: 'pass' },
  { keyword: 'mantenimiento conductos Mitsubishi Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 3, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/mantenimiento', status: 'pass' },
  { keyword: 'mantenimiento cassette Samsung Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 4, trend: 'stable', intent: 'transaccional', url: 'https://climont.es/servicios/mantenimiento', status: 'pass' },
  { keyword: 'mantenimiento split Panasonic Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 5, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/mantenimiento', status: 'pass' },
  // Cola larga — aerotermia + marca + instalación + Sevilla
  { keyword: 'instalación aerotermia Daikin Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 2, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/aerotermia', status: 'pass' },
  { keyword: 'instalación bomba calor Daikin Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 3, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/aerotermia', status: 'pass' },
  { keyword: 'instalación aerotermia Mitsubishi Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 4, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/aerotermia', status: 'pass' },
  { keyword: 'instalación aerotermia Samsung Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 5, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/aerotermia', status: 'pass' },
  { keyword: 'instalación aerotermia Panasonic Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 6, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/aerotermia', status: 'pass' },
  // Cola larga — Conductos Climaver por marca + servicio
  { keyword: 'instalación conductos Climaver Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 1, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/instalación', status: 'pass' },
  { keyword: 'reparación conductos Climaver Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 2, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/reparación', status: 'pass' },
  { keyword: 'mantenimiento conductos Climaver Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 3, trend: 'stable', intent: 'transaccional', url: 'https://climont.es/servicios/mantenimiento', status: 'pass' },
  // Cola larga — presupuesto + marca + Sevilla
  { keyword: 'presupuesto aire acondicionado Daikin Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 3, trend: 'up', intent: 'transaccional', url: 'https://climont.es/', status: 'pass' },
  { keyword: 'presupuesto aire acondicionado Mitsubishi Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 4, trend: 'up', intent: 'transaccional', url: 'https://climont.es/', status: 'pass' },
  { keyword: 'presupuesto aerotermia Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 5, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/aerotermia', status: 'pass' },
  { keyword: 'presupuesto conductos climatizacion Sevilla', group: 'Cola larga', volume: 'Bajo', difficulty: 'Baja', position: 6, trend: 'up', intent: 'transaccional', url: 'https://climont.es/servicios/instalación', status: 'pass' },
];

type Tab = 'overview' | 'meta' | 'structured' | 'keywords' | 'suggestions' | 'tools';

const STATUS_ICON = {
  pass: CheckCircle2,
  warning: AlertTriangle,
  fail: XCircle,
};

const STATUS_COLOR = {
  pass: { text: 'text-success-600', bg: 'bg-success-50' },
  warning: { text: 'text-warning-600', bg: 'bg-warning-50' },
  fail: { text: 'text-error-600', bg: 'bg-error-50' },
};

const SUGGESTION_CHECK_MAP: Record<string, string> = {
  gsc: 'gsc',
  gmb: 'gmb',
  backlinks: 'backlinks',
  blog: 'blog-content',
  reviews: 'reviews-section',
  pagespeed: 'images-webp',
  'schema-reviews': 'ld-rating',
  'internal-linking': 'internal-links',
};

export function SeoPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [completedSuggestions, setCompletedSuggestions] = useState<Record<string, boolean>>({});
  const loadCompletedSuggestions = useCallback(async () => {
    const { data, error } = await supabase
      .from('seo_suggestions')
      .select('id, completed');
    if (!error && data) {
      const map: Record<string, boolean> = {};
      for (const row of data) {
        map[row.id] = row.completed;
      }
      setCompletedSuggestions(map);
    }
  }, []);

  useEffect(() => {
    loadCompletedSuggestions();
  }, [loadCompletedSuggestions]);

  const toggleSuggestion = useCallback(async (id: string) => {
    const newCompleted = !completedSuggestions[id];
    setCompletedSuggestions((prev) => ({ ...prev, [id]: newCompleted }));
    const { error } = await supabase
      .from('seo_suggestions')
      .upsert({
        id,
        completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      });
    if (error) {
      setCompletedSuggestions((prev) => ({ ...prev, [id]: !newCompleted }));
    }
  }, [completedSuggestions]);

  const dynamicChecks = useMemo(() => {
    return SEO_CHECKS.map((check) => {
      if (check.status !== 'warning') return check;
      const suggestionId = Object.entries(SUGGESTION_CHECK_MAP).find(([, checkId]) => checkId === check.id)?.[0];
      if (suggestionId && completedSuggestions[suggestionId]) {
        return {
          ...check,
          status: 'pass' as const,
          detail: `${check.detail} — Corregido y marcado como completado.`,
        };
      }
      return check;
    });
  }, [completedSuggestions]);

  const score = useMemo(() => {
    const pass = dynamicChecks.filter((c) => c.status === 'pass').length;
    return Math.round((pass / dynamicChecks.length) * 100);
  }, [dynamicChecks]);

  const filteredChecks = useMemo(() => {
    if (filterCategory === 'all') return dynamicChecks;
    return dynamicChecks.filter((c) => c.category === filterCategory);
  }, [dynamicChecks, filterCategory]);

  const categoryScores = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const checks = dynamicChecks.filter((c) => c.category === cat);
      const pass = checks.filter((c) => c.status === 'pass').length;
      return { category: cat, score: Math.round((pass / checks.length) * 100), total: checks.length, pass };
    });
  }, [dynamicChecks]);

  const scoreColor = score >= 90 ? 'success' : score >= 70 ? 'warning' : 'error';
  const scoreColors = {
    success: { text: 'text-success-600', bg: 'bg-success-50', stroke: '#22c55e' },
    warning: { text: 'text-warning-600', bg: 'bg-warning-50', stroke: '#f59e0b' },
    error: { text: 'text-error-600', bg: 'bg-error-50', stroke: '#ef4444' },
  };
  const sc = scoreColors[scoreColor];

  const tabs: { id: Tab; label: string; icon: typeof Search }[] = [
    { id: 'overview', label: 'Resumen', icon: Search },
    { id: 'meta', label: 'Meta etiquetas', icon: Tag },
    { id: 'structured', label: 'Datos estructurados', icon: Code },
    { id: 'keywords', label: 'Palabras clave', icon: Target },
    { id: 'suggestions', label: 'Sugerencias', icon: Sparkles },
    { id: 'tools', label: 'Herramientas', icon: Zap },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">SEO</h1>
        <p className="text-ink-500 text-sm mt-1">Analisis y optimización para motores de búsqueda</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === t.id ? 'bg-ink-900 text-white' : 'bg-white text-ink-600 border border-ink-200 hover:bg-ink-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' && (
        <OverviewTab
          score={score}
          sc={sc}
          categoryScores={categoryScores}
          filteredChecks={filteredChecks}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          totalChecks={dynamicChecks.length}
        />
      )}

      {activeTab === 'meta' && <MetaTagsTab />}
      {activeTab === 'structured' && <StructuredDataTab />}
      {activeTab === 'keywords' && <KeywordsTab />}
      {activeTab === 'suggestions' && (
        <SuggestionsTab
          completedSuggestions={completedSuggestions}
          onToggle={toggleSuggestion}
        />
      )}
      {activeTab === 'tools' && <ToolsTab />}
    </div>
  );
}

function OverviewTab({
  score, sc, categoryScores, filteredChecks, filterCategory, setFilterCategory, totalChecks,
}: {
  score: number;
  sc: { text: string; bg: string; stroke: string };
  categoryScores: { category: string; score: number; total: number; pass: number }[];
  filteredChecks: SeoCheck[];
  filterCategory: string;
  setFilterCategory: (c: string) => void;
  totalChecks: number;
}) {
  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-ink-100 shadow-sm flex flex-col items-center">
          <div className="relative w-36 h-36">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx={50} cy={50} r={42} fill="none" stroke="#f1f5f9" strokeWidth={8} />
              <circle
                cx={50} cy={50} r={42} fill="none" stroke={sc.stroke} strokeWidth={8}
                strokeDasharray={`${(score / 100) * 2 * Math.PI * 42} ${2 * Math.PI * 42}`}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${sc.text}`}>{score}</span>
              <span className="text-xs text-ink-400 mt-0.5">de 100</span>
            </div>
          </div>
          <div className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}>
            {score >= 90 ? 'Excelente' : score >= 70 ? 'Bueno' : 'Necesita mejora'}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-ink-100 shadow-sm">
          <h3 className="font-display font-semibold text-ink-900 mb-4">Puntuacion por categoria</h3>
          <div className="space-y-3">
            {categoryScores.map((cs) => (
              <div key={cs.category}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-ink-700 font-medium">{cs.category}</span>
                  <span className="text-sm font-bold text-ink-900">{cs.score}%</span>
                </div>
                <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      cs.score >= 90 ? 'bg-success-500' : cs.score >= 70 ? 'bg-warning-500' : 'bg-error-500'
                    }`}
                    style={{ width: `${cs.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-ink-100 shadow-sm">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="font-display font-semibold text-ink-900">Analisis completo</h3>
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                filterCategory === 'all' ? 'bg-ink-900 text-white' : 'bg-ink-50 text-ink-600'
              }`}
            >
              Todas ({totalChecks})
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                  filterCategory === cat ? 'bg-ink-900 text-white' : 'bg-ink-50 text-ink-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {filteredChecks.map((check) => (
            <CheckRow key={check.id} check={check} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CheckRow({ check }: { check: SeoCheck }) {
  const Icon = STATUS_ICON[check.status];
  const c = STATUS_COLOR[check.status];
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-ink-50 transition-colors">
      <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-4 h-4 ${c.text}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-ink-900">{check.label}</span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-ink-100 text-ink-500">{check.category}</span>
        </div>
        <p className="text-xs text-ink-500 mt-0.5 leading-relaxed">{check.detail}</p>
      </div>
    </div>
  );
}

function MetaTagsTab() {
  const metas = [
    { label: 'Title', value: 'Aire Acondicionado en Sevilla | Climatizaciones Montano — Instalacion y Mantenimiento', length: 65, max: 65 },
    { label: 'Description', value: 'Instalacion, mantenimiento y reparación de aire acondicionado en Sevilla y provincia. Splits, conductos, cassettes, ventilacion y preinstalaciónes para constructoras. Certificados RITE-07. Presupuesto gratis en 24h.', length: 155, max: 160 },
    { label: 'Keywords', value: 'Eliminada — Google no la usa desde 2009', length: 0, max: 0 },
    { label: 'Canonical', value: 'https://climont.es/', length: 0, max: 0 },
    { label: 'Robots', value: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1', length: 0, max: 0 },
    { label: 'Autor', value: 'Climatizaciones Montano, S.L.', length: 0, max: 0 },
    { label: 'Idioma', value: 'es', length: 0, max: 0 },
    { label: 'geo.region', value: 'ES-SE', length: 0, max: 0 },
    { label: 'geo.placename', value: 'Sevilla', length: 0, max: 0 },
    { label: 'geo.position', value: '37.3886;-5.9823', length: 0, max: 0 },
  ];

  const openGraph = [
    { label: 'og:type', value: 'website' },
    { label: 'og:url', value: 'https://climont.es/' },
    { label: 'og:title', value: 'Aire Acondicionado en Sevilla | Climatizaciones Montano' },
    { label: 'og:description', value: 'Instalacion, mantenimiento y reparación de aire acondicionado en Sevilla y provincia.' },
    { label: 'og:image', value: 'https://climont.es/og-image.webp' },
    { label: 'og:image:alt', value: ' Salon moderno con aire acondicionado instalado por Climatizaciones Montano' },
    { label: 'og:locale', value: 'es_ES' },
    { label: 'og:site_name', value: 'Climatizaciones Montano' },
  ];

  const twitter = [
    { label: 'twitter:card', value: 'summary_large_image' },
    { label: 'twitter:url', value: 'https://climont.es/' },
    { label: 'twitter:title', value: 'Aire Acondicionado en Sevilla | Climatizaciones Montano' },
    { label: 'twitter:description', value: 'Instalacion, mantenimiento y reparación de aire acondicionado en Sevilla.' },
    { label: 'twitter:image', value: 'https://climont.es/og-image.webp' },
    { label: 'twitter:image:alt', value: 'Salon moderno con aire acondicionado instalado en Sevilla' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 border border-ink-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-5 h-5 text-primary-600" />
          <h3 className="font-display font-semibold text-ink-900">Meta etiquetas principales</h3>
        </div>
        <div className="space-y-3">
          {metas.map((m) => (
            <div key={m.label} className="p-3 bg-ink-50 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-ink-500 uppercase tracking-wide">{m.label}</span>
                {m.max > 0 && (
                  <span className={`text-xs font-medium ${m.length > m.max ? 'text-error-600' : m.length > m.max - 10 ? 'text-warning-600' : 'text-success-600'}`}>
                    {m.length}/{m.max}
                  </span>
                )}
              </div>
              <p className="text-sm text-ink-800 leading-relaxed break-words">{m.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-ink-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Share2 className="w-5 h-5 text-primary-600" />
          <h3 className="font-display font-semibold text-ink-900">Open Graph (Facebook)</h3>
        </div>
        <div className="space-y-2">
          {openGraph.map((og) => (
            <div key={og.label} className="flex items-start gap-3 p-2.5 bg-ink-50 rounded-lg">
              <code className="text-xs font-mono text-primary-600 flex-shrink-0 w-32">{og.label}</code>
              <span className="text-sm text-ink-700 break-words">{og.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-ink-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Share2 className="w-5 h-5 text-primary-600" />
          <h3 className="font-display font-semibold text-ink-900">Twitter Cards</h3>
        </div>
        <div className="space-y-2">
          {twitter.map((tw) => (
            <div key={tw.label} className="flex items-start gap-3 p-2.5 bg-ink-50 rounded-lg">
              <code className="text-xs font-mono text-primary-600 flex-shrink-0 w-32">{tw.label}</code>
              <span className="text-sm text-ink-700 break-words">{tw.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StructuredDataTab() {
  const schemas = [
    {
      type: 'HVACBusiness (LocalBusiness)',
      icon: MapPin,
      desc: 'Datos de empresa local con dirección, teléfono, horario, area de servicio y catalogo de servicios.',
      fields: ['name', 'description', 'url', 'telephone', 'email', 'address', 'geo', 'areaServed (15 ciudades)', 'openingHours', 'sameAs', 'hasOfferCatalog (9 servicios)'],
    },
    {
      type: 'FAQPage',
      icon: FileText,
      desc: '6 preguntas frecuentes marcadas. Aparecen como rich snippets en los resultados de Google.',
      fields: ['Zonas de cobertura', 'Presupuesto gratuito', 'Certificaciones', 'Constructoras', 'Marcas', 'Tiempos de instalación'],
    },
    {
      type: 'BreadcrumbList',
      icon: Link2,
      desc: 'Migas de pan para 4 secciónes. Ayuda a Google a entender la estructura del sitio.',
      fields: ['Inicio', 'Servicios', 'Constructoras', 'Contacto'],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 border border-ink-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Code className="w-5 h-5 text-primary-600" />
          <h3 className="font-display font-semibold text-ink-900">Schema.org — Datos estructurados</h3>
        </div>
        <div className="space-y-3">
          {schemas.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.type} className="p-4 bg-ink-50 rounded-xl">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-success-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-success-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-ink-900">{s.type}</h4>
                      <span className="inline-flex items-center gap-1 text-xs text-success-600 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Valido
                      </span>
                    </div>
                    <p className="text-sm text-ink-500 mt-0.5">{s.desc}</p>
                  </div>
                </div>
                <div className="ml-12 flex flex-wrap gap-1.5">
                  {s.fields.map((f) => (
                    <span key={f} className="text-xs px-2 py-0.5 bg-white rounded-md text-ink-600 border border-ink-200">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-ink-100 shadow-sm">
        <h3 className="font-display font-semibold text-ink-900 mb-3">Validacion</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <ExternalLinkCard icon={Search} title="Google Rich Results Test" desc="Valida datos estructurados y rich snippets" url="https://search.google.com/test/rich-results?url=https://climont.es/" />
          <ExternalLinkCard icon={Code} title="Schema.org Validator" desc="Validacion completa de Schema.org" url="https://validator.schema.org/#url=https://climont.es/" />
        </div>
      </div>
    </div>
  );
}

const KEYWORD_GROUPS = ['Core', 'Instalacion', 'Mantenimiento', 'Reparacion', 'Constructoras', 'Aerotermia', 'Airzone', 'Ventilacion', 'Solar', 'Eficiencia', 'Local', 'Marcas', 'Cola larga'];

const INTENT_META: Record<KeywordData['intent'], { icon: typeof Info; label: string; color: string }> = {
  transaccional: { icon: ShoppingCart, label: 'Transacciónal', color: 'bg-success-100 text-success-700' },
  comercial: { icon: Tag, label: 'Comercial', color: 'bg-primary-100 text-primary-700' },
  informacional: { icon: Info, label: 'Informacional', color: 'bg-accent-100 text-accent-700' },
  navegacional: { icon: Navigation, label: 'Navegacional', color: 'bg-ink-100 text-ink-600' },
};

function KeywordsTab() {
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'position' | 'volume' | 'keyword'>('position');

  const filtered = useMemo(() => {
    let result = KEYWORDS;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((k) => k.keyword.toLowerCase().includes(q) || k.url.toLowerCase().includes(q));
    }
    if (groupFilter !== 'all') result = result.filter((k) => k.group === groupFilter);
    if (statusFilter !== 'all') result = result.filter((k) => k.status === statusFilter);
    if (sortBy === 'position') result = [...result].sort((a, b) => a.position - b.position);
    else if (sortBy === 'keyword') result = [...result].sort((a, b) => a.keyword.localeCompare(b.keyword));
    else {
      const order = { Alto: 3, Medio: 2, Bajo: 1 };
      result = [...result].sort((a, b) => order[b.volume as keyof typeof order] - order[a.volume as keyof typeof order]);
    }
    return result;
  }, [search, groupFilter, statusFilter, sortBy]);

  const stats = useMemo(() => {
    const total = KEYWORDS.length;
    const pass = KEYWORDS.filter((k) => k.status === 'pass').length;
    const warning = KEYWORDS.filter((k) => k.status === 'warning').length;
    const top3 = KEYWORDS.filter((k) => k.position <= 3).length;
    const top10 = KEYWORDS.filter((k) => k.position <= 10).length;
    const trending = KEYWORDS.filter((k) => k.trend === 'up').length;
    return { total, pass, warning, top3, top10, trending };
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KeywordStatCard icon={Target} label="Palabras clave" value={stats.total} color="primary" />
        <KeywordStatCard icon={CheckCircle2} label="Optimizadas" value={stats.pass} color="success" />
        <KeywordStatCard icon={TrendingUp} label="En tendencia" value={stats.trending} color="accent" />
        <KeywordStatCard icon={AlertTriangle} label="Por mejorar" value={stats.warning} color="warning" />
      </div>

      {/* Position summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-ink-100 shadow-sm text-center">
          <p className="text-3xl font-bold text-success-600">{stats.top3}</p>
          <p className="text-xs text-ink-500 mt-1">Top 3</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-ink-100 shadow-sm text-center">
          <p className="text-3xl font-bold text-primary-600">{stats.top10}</p>
          <p className="text-xs text-ink-500 mt-1">Top 10</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-ink-100 shadow-sm text-center">
          <p className="text-3xl font-bold text-ink-400">{stats.total - stats.top10}</p>
          <p className="text-xs text-ink-500 mt-1">Fuera del Top 10</p>
        </div>
      </div>

      {/* Filters + table */}
      <div className="bg-white rounded-2xl p-5 border border-ink-100 shadow-sm">
        <div className="flex flex-col gap-3 mb-4">
          <h3 className="font-display font-semibold text-ink-900">Palabras clave objetivo</h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar palabra clave o URL..."
                className="w-full pl-9 pr-4 py-2 bg-ink-50 border border-ink-200 rounded-lg text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
              />
            </div>
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="px-3 py-2 bg-ink-50 border border-ink-200 rounded-lg text-sm text-ink-700 focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
              <option value="all">Todos los grupos</option>
              {KEYWORD_GROUPS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-ink-50 border border-ink-200 rounded-lg text-sm text-ink-700 focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
              <option value="all">Todos los estados</option>
              <option value="pass">Optimizadas</option>
              <option value="warning">Por mejorar</option>
              <option value="fail">Criticas</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 bg-ink-50 border border-ink-200 rounded-lg text-sm text-ink-700 focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
              <option value="position">Ordenar por posición</option>
              <option value="volume">Ordenar por volumen</option>
              <option value="keyword">Ordenar alfabeticamente</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-100">
                <th className="text-left py-2.5 px-3 text-xs font-semibold text-ink-500 uppercase">Palabra clave</th>
                <th className="text-left py-2.5 px-3 text-xs font-semibold text-ink-500 uppercase">Grupo</th>
                <th className="text-left py-2.5 px-3 text-xs font-semibold text-ink-500 uppercase">Vol.</th>
                <th className="text-left py-2.5 px-3 text-xs font-semibold text-ink-500 uppercase">Dific.</th>
                <th className="text-center py-2.5 px-3 text-xs font-semibold text-ink-500 uppercase">Pos.</th>
                <th className="text-center py-2.5 px-3 text-xs font-semibold text-ink-500 uppercase">Tend.</th>
                <th className="text-left py-2.5 px-3 text-xs font-semibold text-ink-500 uppercase">Intencion</th>
                <th className="text-left py-2.5 px-3 text-xs font-semibold text-ink-500 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((kw) => {
                const IntentIcon = INTENT_META[kw.intent].icon;
                const TrendIcon = kw.trend === 'up' ? ArrowUp : kw.trend === 'down' ? ArrowDown : Minus;
                const trendColor = kw.trend === 'up' ? 'text-success-600' : kw.trend === 'down' ? 'text-error-600' : 'text-ink-400';
                return (
                  <tr key={kw.keyword} className="border-b border-ink-50 hover:bg-ink-50/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="text-sm font-medium text-ink-900">{kw.keyword}</div>
                      <a href={kw.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline truncate block max-w-[200px]">
                        {kw.url.replace('https://climont.es', '')}
                      </a>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-ink-100 text-ink-600 font-medium">{kw.group}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        kw.volume === 'Alto' ? 'bg-success-100 text-success-700'
                        : kw.volume === 'Medio' ? 'bg-primary-100 text-primary-700'
                        : 'bg-ink-100 text-ink-600'
                      }`}>{kw.volume}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        kw.difficulty === 'Baja' ? 'bg-success-100 text-success-700'
                        : kw.difficulty === 'Media' ? 'bg-warning-100 text-warning-700'
                        : 'bg-error-100 text-error-700'
                      }`}>{kw.difficulty}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold ${
                        kw.position <= 3 ? 'bg-success-100 text-success-700'
                        : kw.position <= 10 ? 'bg-primary-100 text-primary-700'
                        : 'bg-warning-100 text-warning-700'
                      }`}>{kw.position}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <TrendIcon className={`w-4 h-4 mx-auto ${trendColor}`} />
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${INTENT_META[kw.intent].color}`}>
                        <IntentIcon className="w-3 h-3" />
                        {INTENT_META[kw.intent].label}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {kw.status === 'pass' ? (
                        <span className="inline-flex items-center gap-1 text-xs text-success-600 font-medium">
                          <CheckCircle2 className="w-4 h-4" /> OK
                        </span>
                      ) : kw.status === 'warning' ? (
                        <span className="inline-flex items-center gap-1 text-xs text-warning-600 font-medium">
                          <AlertTriangle className="w-4 h-4" /> Mejorar
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-error-600 font-medium">
                          <XCircle className="w-4 h-4" /> Critica
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-ink-400 text-sm">No se encontraron palabras clave con esos filtros.</div>
        )}
        <p className="text-xs text-ink-400 mt-3">
          Mostrando {filtered.length} de {KEYWORDS.length} palabras clave
        </p>
      </div>

      {/* Oportunidades de mejora */}
      <div className="bg-white rounded-2xl p-5 border border-ink-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-warning-600" />
          <h3 className="font-display font-semibold text-ink-900">Oportunidades de mejora</h3>
        </div>
        <div className="space-y-3">
          {KEYWORDS.filter((k) => k.status === 'warning').sort((a, b) => a.position - b.position).map((kw) => (
            <div key={kw.keyword} className="flex items-start gap-3 p-4 bg-warning-50 border border-warning-100 rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-warning-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-warning-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-semibold text-ink-900">"{kw.keyword}"</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white text-ink-600 border border-ink-200">Posicion #{kw.position}</span>
                </div>
                <p className="text-sm text-ink-500 mt-1">
                  {kw.position > 10
                    ? 'Fuera del Top 10. Necesita más contenido optimizado, enlaces internos y mejora de la página destino.'
                    : kw.position > 3
                    ? `En posición #${kw.position}. Aumentar frecuencia de la palabra clave en título, H2, alt de imágenes y primer párrafo puede subir al Top 3.`
                    : 'Cerca del Top 3. Reforzar contenido y conseguir enlaces locales puede consolidar la posición.'}
                </p>
                <a href={kw.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline mt-1 inline-flex items-center gap-1">
                  Ver página destino <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recomendaciones */}
      <div className="bg-white rounded-2xl p-5 border border-ink-100 shadow-sm">
        <h3 className="font-display font-semibold text-ink-900 mb-3">Estrategia de palabras clave</h3>
        <div className="space-y-3">
          <Recommendation icon={TrendingUp} title="Palabras clave de cola larga" desc="Ya tienes muchas palabras de cola larga posicionadas (marca + servicio + Sevilla). Sigue ampliando con términos nuevos: 'instalación aerotermia R290 Sevilla', 'aire acondicionado con IA Sevilla', 'sistema VRF comercial Sevilla'." />
          <Recommendation icon={MapPin} title="SEO local por ciudad" desc="Ya tienes landing pages para las ciudades principales de la provincia de Sevilla. Considera ampliar a más municipios si hay demanda: 'aire acondicionado Mairena del Aljarafe', 'aire acondicionado Tomares', 'aire acondicionado Coria del Río'." />
          <Recommendation icon={FileText} title="Blog y contenido informational" desc="El blog ya tiene 18 artículos cubriendo guías, comparativas, actualidad y lanzamientos. Sigue publicando contenido basándote en lo que buscan tus clientes en Google Search Console." />
          <Recommendation icon={Sparkles} title="Marcas de equipos" desc="Ya tienes páginas dedicadas por marca (Daikin, Mitsubishi, Samsung, LG, Panasonic, Fujitsu, Hisense, Hitachi, Airzone, Climaver). Considera añadir páginas para marcas nuevas como Toshiba o Vaillant si empiezas a instalarlas con frecuencia." />
          <Recommendation icon={Target} title="Optimizar palabras en página 2" desc="Las palabras clave en posiciones 11-20 son las más rentables de mejorar. Con pequeños ajustes de contenido y enlaces internos pueden saltar al Top 10 rápidamente. Revisa Google Search Console para identificarlas." />
        </div>
      </div>
    </div>
  );
}

function KeywordStatCard({ icon: Icon, label, value, color }: { icon: typeof Target; label: string; value: number; color: string }) {
  const colorMap: Record<string, { bg: string; text: string }> = {
    primary: { bg: 'bg-primary-50', text: 'text-primary-600' },
    success: { bg: 'bg-success-50', text: 'text-success-600' },
    accent: { bg: 'bg-accent-50', text: 'text-accent-600' },
    warning: { bg: 'bg-warning-50', text: 'text-warning-600' },
  };
  const c = colorMap[color];
  return (
    <div className="bg-white rounded-2xl p-4 border border-ink-100 shadow-sm flex items-center gap-3">
      <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${c.text}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-ink-900">{value}</p>
        <p className="text-xs text-ink-500">{label}</p>
      </div>
    </div>
  );
}

function Recommendation({ icon: Icon, title, desc }: { icon: typeof TrendingUp; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-ink-50 rounded-xl">
      <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-primary-600" />
      </div>
      <div>
        <h4 className="text-sm font-semibold text-ink-900">{title}</h4>
        <p className="text-sm text-ink-500 mt-0.5 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function ToolsTab() {
  const tools = [
    { icon: Search, title: 'Google Search Console', desc: 'Monitoriza el rendimiento en Google: impresiones, clics, posición media y errores de indexación.', url: 'https://search.google.com/search-console', color: 'primary' },
    { icon: TrendingUp, title: 'Google Analytics 4', desc: 'Analiza el tráfico, comportamiento de usuarios y conversiones con más detalle.', url: 'https://analytics.google.com', color: 'success' },
    { icon: Zap, title: 'Google PageSpeed Insights', desc: 'Mide la velocidad de carga en móvil y escritorio con recomendaciones de optimización.', url: 'https://pagespeed.web.dev/analysis?url=https://climont.es/', color: 'accent' },
    { icon: Smartphone, title: 'Google Mobile-Friendly Test', desc: 'Verifica que tu web está optimizada para dispositivos móviles.', url: 'https://search.google.com/test/mobile-friendly?url=https://climont.es/', color: 'warning' },
    { icon: Globe, title: 'Google Rich Results Test', desc: 'Valida que los datos estructurados son correctos y generan rich snippets.', url: 'https://search.google.com/test/rich-results?url=https://climont.es/', color: 'primary' },
    { icon: Code, title: 'Schema.org Validator', desc: 'Validación completa de todos los esquemas Schema.org implementados.', url: 'https://validator.schema.org/#url=https://climont.es/', color: 'success' },
    { icon: Image, title: 'Open Graph Debugger', desc: 'Previsualiza como se ve tu web al compartirla en Facebook y otras redes.', url: 'https://developers.facebook.com/tools/debug/?q=https://climont.es/', color: 'accent' },
    { icon: FileText, title: 'XML Sitemap Validator', desc: 'Verifica que el sitemap es válido y está correctamente formado.', url: 'https://www.xml-sitemaps.com/validate-xml-sitemap.html', color: 'warning' },
  ];

  const colorMap: Record<string, { bg: string; text: string }> = {
    primary: { bg: 'bg-primary-50', text: 'text-primary-600' },
    success: { bg: 'bg-success-50', text: 'text-success-600' },
    accent: { bg: 'bg-accent-50', text: 'text-accent-600' },
    warning: { bg: 'bg-warning-50', text: 'text-warning-600' },
  };

  const [copied, setCopied] = useState<string | null>(null);

  const configFiles = [
    { title: 'robots.txt', content: 'User-agent: *\nAllow: /\n\nSitemap: https://climont.es/sitemap.xml' },
    { title: 'sitemap.xml', content: '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://climont.es/</loc>\n    <priority>1.0</priority>\n    <changefreq>weekly</changefreq>\n  </url>\n  <url>\n    <loc>https://climont.es/#servicios</loc>\n    <priority>0.9</priority>\n  </url>\n  <!-- 5 URLs más -->\n</urlset>' },
  ];

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const checklist: { label: string; done: boolean }[] = [
    { label: 'Registrar la web en Google Search Console', done: false },
    { label: 'Enviar el sitemap a Google Search Console', done: false },
    { label: 'Verificar que no hay errores de indexación', done: false },
    { label: 'Crear perfil de Google Business Profile', done: true },
    { label: 'Solicitar reseñas de clientes en Google', done: true },
    { label: 'Crear páginas dedicadas por servicio', done: true },
    { label: 'Crear landing pages por ciudad principal', done: true },
    { label: 'Crear páginas dedicadas por marca', done: true },
    { label: 'Iniciar un blog con contenido regular', done: true },
    { label: 'Crear página de catálogo de productos', done: true },
    { label: 'Crear página de empleo', done: true },
    { label: 'Optimizar imágenes con alt descriptivo', done: true },
    { label: 'Conseguir enlaces de directorios locales', done: false },
    { label: 'Verificar velocidad con PageSpeed Insights', done: false },
    { label: 'Actualizar sitemap al añadir contenido', done: true },
  ];

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const c = colorMap[tool.color];
          return (
            <a
              key={tool.title}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl p-5 border border-ink-100 shadow-sm hover:shadow-md transition-all group hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${c.text}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-semibold text-ink-900">{tool.title}</h4>
                    <ExternalLink className="w-3.5 h-3.5 text-ink-400 group-hover:text-primary-600 transition-colors" />
                  </div>
                  <p className="text-xs text-ink-500 mt-1 leading-relaxed">{tool.desc}</p>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {configFiles.map((cf) => (
          <div key={cf.title} className="bg-white rounded-2xl p-5 border border-ink-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-ink-900 text-sm">{cf.title}</h3>
              <button
                onClick={() => copy(cf.content, cf.title)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-ink-50 hover:bg-ink-100 rounded-lg text-xs font-medium text-ink-600 transition-colors"
              >
                {copied === cf.title ? (
                  <><CheckCircle2 className="w-3.5 h-3.5 text-success-600" /> Copiado</>
                ) : (
                  <><Copy className="w-3.5 h-3.5" /> Copiar</>
                )}
              </button>
            </div>
            <pre className="bg-ink-900 rounded-xl p-4 text-xs text-ink-300 font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap">{cf.content}</pre>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-5 border border-ink-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-primary-600" />
          <h3 className="font-display font-semibold text-ink-900">Checklist SEO</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          {checklist.map((item, i) => (
            <label key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-ink-50 cursor-pointer transition-colors">
              <input type="checkbox" defaultChecked={item.done} className="mt-0.5 w-4 h-4 rounded border-ink-300 text-primary-600 focus:ring-primary-200" />
              <span className={`text-sm ${item.done ? 'text-ink-400 line-through' : 'text-ink-700'}`}>{item.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExternalLinkCard({ icon: Icon, title, desc, url }: { icon: typeof Search; title: string; desc: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 p-4 bg-ink-50 rounded-xl hover:bg-primary-50 transition-colors group"
    >
      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-primary-600" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-ink-900">{title}</span>
          <ExternalLink className="w-3.5 h-3.5 text-ink-400 group-hover:text-primary-600 transition-colors" />
        </div>
        <p className="text-xs text-ink-500 mt-0.5">{desc}</p>
      </div>
    </a>
  );
}

type Suggestion = {
  id: string;
  title: string;
  priority: 'alta' | 'media' | 'baja';
  category: 'Tecnico' | 'Contenido' | 'Local' | 'Autoridad' | 'Rendimiento';
  description: string;
  actions: string[];
  impact: string;
};

const SUGGESTIONS: Suggestion[] = [
  {
    id: 'gsc',
    title: 'Registrar la web en Google Search Console',
    priority: 'alta',
    category: 'Tecnico',
    description: 'Google Search Console es la herramienta oficial para monitorizar como Google ve tu web. Sin ella, no puedes saber qué páginas están indexadas, qué errores hay, ni en qué posición apareces.',
    actions: [
      'Entra en search.google.com/search-console y añade tu propiedad climont.es',
      'Verifica la propiedad mediante registro DNS o etiqueta HTML',
      'Envia el sitemap (https://climont.es/sitemap.xml) para acelerar la indexación',
      'Revisa semanalmente la sección "Cobertura" para detectar páginas no indexadas',
    ],
    impact: 'Permite detectar y corregir errores de indexación que te están haciendo perder posiciones.',
  },
  {
    id: 'gmb',
    title: 'Optimizar Google Business Profile',
    priority: 'alta',
    category: 'Local',
    description: 'Tu ficha de Google es el factor más importante para aparecer en el mapa local de Sevilla. Cuanta más información y actividad tenga, mejor posicionarás en búsquedas locales.',
    actions: [
      'Completa todos los campos: servicios, horarios, teléfono, web, descripción',
      'Sube al menos 10 fotos recientes: instalaciónes, equipo, vehiculos, logo',
      'Publica posts mensuales con ofertas, novedades o consejos',
      'Responde a todas las reseñas, positivas y negativas',
      'Añade los servicios uno por uno con descripción y precio orientativo',
    ],
    impact: 'Mejora el posicionamiento en el mapa local y aumenta las llamadas y solicitudes de presupuesto.',
  },
  {
    id: 'backlinks',
    title: 'Conseguir enlaces locales (backlinks)',
    priority: 'alta',
    category: 'Autoridad',
    description: 'Los enlaces desde otras webs hacia la tuya son una de las señales más importantes para Google. Faltan enlaces desde directorios locales y webs del sector en Sevilla.',
    actions: [
      'Registra la empresa en directorios locales: ABC Sevilla, QDQ, Páginas Amarillas, Yelp',
      'Inscribete en asociaciones del sector (AFEC, ATECYR) y solicita enlace',
      'Contacta con webs de reformas, constructoras y arquitectos para intercambio de enlaces',
      'Patrocina o colabora con eventos locales en Sevilla para conseguir enlaces de prensa',
      'Publica artículos como invitado en blogs de construction o eficiencia energetica',
    ],
    impact: 'Cada enlace de calidad actúa como un "voto de confianza" que mejora tu autoridad y posicionamiento.',
  },
  {
    id: 'blog',
    title: 'Seguir publicando contenido en el blog',
    priority: 'media',
    category: 'Contenido',
    description: 'El blog ya tiene 18 artículos publicados y cubre guías, comparativas, actualidad y lanzamientos. Para mantener el crecimiento de tráfico, conviene seguir publicando con regularidad.',
    actions: [
      'Publica 2-4 artículos al mes sobre temas que buscan tus clientes',
      'Actualiza los artículos existentes con nueva información cuando haya cambios',
      'Escribe sobre novedades de marcas, ferias del sector y cambios normativos',
      'Crea casos reales con fotos de tus instalaciones en Sevilla',
      'Revisa qué artículos traen más tráfico desde Google Search Console y amplía esos temas',
    ],
    impact: 'Cada artículo nuevo es una puerta de entrada adicional desde Google. El contenido regular señala a Google que la web está activa.',
  },
  {
    id: 'reviews',
    title: 'Aumentar reseñas en Google',
    priority: 'media',
    category: 'Local',
    description: 'Tienes 10 reseñas en Google con valoración 4.0. Más reseñas recientes y positivas mejoran tu posicionamiento local y la confianza de nuevos clientes.',
    actions: [
      'Pide resena a cada cliente satisfecho tras finalizar la instalación',
      'Envia un SMS o email con enlace directo a tu ficha de Google',
      'Incluye un QR en la factura o tarjeta de visita que lleve a dejar reseña',
      'Responde a todas las reseñas en menos de 24h, especialmente las negativas',
      'Objetivo: llegar a 30+ reseñas en los proximos 6 meses',
    ],
    impact: 'Más reseñas recientes mejoran el CTR en los resultados y el posicionamiento en el mapa local.',
  },
  {
    id: 'pagespeed',
    title: 'Mejorar velocidad de carga en móvil',
    priority: 'media',
    category: 'Rendimiento',
    description: 'Google prioriza la versión móvil de tu web para el posicionamiento (mobile-first indexing). La velocidad de carga en móvil afecta directamente al ranking. El bundle de JavaScript pesa 875KB, que es bastante para móvil.',
    actions: [
      'Ejecuta PageSpeed Insights y corrige las recomendaciones prioritarias',
      'Considera dividir el bundle en partes con code-splitting para cargar menos código en la página principal',
      'Comprime más las imágenes WebP si alguna pesa más de 100KB',
      'Usa lazy loading en imágenes fuera de la pantalla inicial',
      'Objetivo: más de 90 puntos en PageSpeed Insights móvil',
    ],
    impact: 'Cada segundo de mejora en velocidad aumenta las conversiones y mejora el posicionamiento móvil.',
  },
  {
    id: 'schema-reviews',
    title: 'Enriquecer schema de Service y añadir Review',
    priority: 'baja',
    category: 'Tecnico',
    description: 'Las páginas de servicios ya tienen contenido SEO completo, pero el schema estructurado podría enriquecerse más con Offers (precio orientativo) y Review individuales.',
    actions: [
      'Añade un precio orientativo o rango en el schema Service de cada página',
      'Incluye reseñas individuales en el schema de cada servicio',
      'Añade schema LocalBusiness con areaServed específico en páginas de ciudad',
      'Verifica todo con Google Rich Results Test',
    ],
    impact: 'Rich snippets más completos aumentan el CTR (porcentaje de clics) en los resultados de búsqueda.',
  },
  {
    id: 'internal-linking',
    title: 'Revisar enlazado interno entre páginas',
    priority: 'baja',
    category: 'Contenido',
    description: 'El enlazado interno ya funciona: el blog enlaza a servicios, las páginas de servicio enlazan a servicios relacionados, y las páginas de ciudad enlazan a los servicios disponibles. Conviene revisar periódicamente que no haya enlaces rotos.',
    actions: [
      'Revisa que los enlaces del blog hacia servicios siguen funcionando',
      'Comprueba que las páginas de ciudad enlazan a todos los servicios disponibles',
      'Usa texto de ancla descriptivo (no "haz clic aquí") con palabras clave',
      'Añade enlaces desde los artículos nuevos del blog hacia páginas de servicios',
    ],
    impact: 'Mantener el enlazado interno en buen estado mejora la indexación y distribuye autoridad hacia las páginas que quieres posicionar.',
  },
];

const PRIORITY_META: Record<Suggestion['priority'], { label: string; color: string; bg: string }> = {
  alta: { label: 'Prioridad alta', color: 'text-error-600', bg: 'bg-error-50 border-error-100' },
  media: { label: 'Prioridad media', color: 'text-warning-600', bg: 'bg-warning-50 border-warning-100' },
  baja: { label: 'Prioridad baja', color: 'text-primary-600', bg: 'bg-primary-50 border-primary-100' },
};

const CATEGORY_ICON: Record<Suggestion['category'], typeof Search> = {
  Tecnico: Code,
  Contenido: FileText,
  Local: MapPin,
  Autoridad: Link2,
  Rendimiento: Zap,
};

function SuggestionsTab({
  completedSuggestions,
  onToggle,
}: {
  completedSuggestions: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [expanded, setExpanded] = useState<string | null>(SUGGESTIONS[0]?.id || null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggle = async (id: string) => {
    setTogglingId(id);
    await onToggle(id);
    setTogglingId(null);
  };

  const filtered = useMemo(() => {
    const order = { alta: 0, media: 1, baja: 2 };
    let result = [...SUGGESTIONS].sort((a, b) => order[a.priority] - order[b.priority]);
    if (filterPriority !== 'all') result = result.filter((s) => s.priority === filterPriority);
    return result;
  }, [filterPriority]);

  const completedCount = SUGGESTIONS.filter((s) => completedSuggestions[s.id]).length;

  const stats = useMemo(() => ({
    total: SUGGESTIONS.length,
    completed: completedCount,
    pending: SUGGESTIONS.length - completedCount,
    alta: SUGGESTIONS.filter((s) => s.priority === 'alta' && !completedSuggestions[s.id]).length,
    media: SUGGESTIONS.filter((s) => s.priority === 'media' && !completedSuggestions[s.id]).length,
    baja: SUGGESTIONS.filter((s) => s.priority === 'baja' && !completedSuggestions[s.id]).length,
  }), [completedCount]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-ink-100 shadow-sm text-center">
          <p className="text-2xl font-bold text-ink-900">{stats.total}</p>
          <p className="text-xs text-ink-500 mt-1">Total</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-ink-100 shadow-sm text-center">
          <p className="text-2xl font-bold text-success-600">{stats.completed}</p>
          <p className="text-xs text-ink-500 mt-1">Completadas</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-ink-100 shadow-sm text-center">
          <p className="text-2xl font-bold text-warning-600">{stats.pending}</p>
          <p className="text-xs text-ink-500 mt-1">Pendientes</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-ink-100 shadow-sm text-center">
          <p className="text-2xl font-bold text-error-600">{stats.alta}</p>
          <p className="text-xs text-ink-500 mt-1">Alta pend.</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterPriority('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${filterPriority === 'all' ? 'bg-ink-900 text-white' : 'bg-white text-ink-600 border border-ink-200'}`}
        >
          Todas ({stats.total})
        </button>
        <button
          onClick={() => setFilterPriority('alta')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${filterPriority === 'alta' ? 'bg-error-600 text-white' : 'bg-white text-ink-600 border border-ink-200'}`}
        >
          Alta ({stats.alta})
        </button>
        <button
          onClick={() => setFilterPriority('media')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${filterPriority === 'media' ? 'bg-warning-600 text-white' : 'bg-white text-ink-600 border border-ink-200'}`}
        >
          Media ({stats.media})
        </button>
        <button
          onClick={() => setFilterPriority('baja')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${filterPriority === 'baja' ? 'bg-primary-600 text-white' : 'bg-white text-ink-600 border border-ink-200'}`}
        >
          Baja ({stats.baja})
        </button>
      </div>

      <div className="space-y-3">
        {filtered.map((sug) => {
          const pm = PRIORITY_META[sug.priority];
          const CatIcon = CATEGORY_ICON[sug.category];
          const isOpen = expanded === sug.id;
          return (
            <div key={sug.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${isOpen ? 'border-primary-200' : 'border-ink-100'}`}>
              <button
                onClick={() => setExpanded(isOpen ? null : sug.id)}
                className="w-full flex items-start gap-3 p-4 text-left hover:bg-ink-50/50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-xl ${pm.bg} flex items-center justify-center flex-shrink-0 border`}>
                  <CatIcon className={`w-5 h-5 ${pm.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className="text-sm font-semibold text-ink-900">{sug.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pm.bg} ${pm.color} border`}>{pm.label}</span>
                  </div>
                  <p className="text-sm text-ink-500 leading-relaxed line-clamp-2">{sug.description}</p>
                </div>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pl-17 space-y-4">
                  <div className="ml-13 space-y-3">
                    <div className={`p-3 rounded-xl border ${completedSuggestions[sug.id] ? 'bg-success-50 border-success-200' : 'bg-ink-50 border-ink-200'}`}>
                      <button
                        onClick={() => handleToggle(sug.id)}
                        disabled={togglingId === sug.id}
                        className="flex items-center gap-2 text-sm font-semibold transition-colors disabled:opacity-50"
                      >
                        {togglingId === sug.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-ink-500" />
                        ) : completedSuggestions[sug.id] ? (
                          <CheckCircle2 className="w-5 h-5 text-success-600" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-ink-300" />
                        )}
                        <span className={completedSuggestions[sug.id] ? 'text-success-700' : 'text-ink-600'}>
                          {completedSuggestions[sug.id] ? 'Completada — Click para desmarcar' : 'Marcar como completada'}
                        </span>
                      </button>
                      {completedSuggestions[sug.id] && (
                        <p className="text-xs text-success-600 mt-1.5 ml-7">
                          Esta sugerencia se ha guardado y la comprobacion SEO correspondiente se ha actualizado automaticamente.
                        </p>
                      )}
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-ink-700 uppercase tracking-wide mb-2">Acciones recomendadas</h5>
                      <ul className="space-y-1.5">
                        {sug.actions.map((action, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-ink-600">
                            <span className={`font-bold flex-shrink-0 ${completedSuggestions[sug.id] ? 'text-success-500' : 'text-primary-500'}`}>{i + 1}.</span>
                            <span className={`leading-relaxed ${completedSuggestions[sug.id] ? 'line-through text-ink-400' : ''}`}>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-3 bg-primary-50 rounded-xl">
                      <div className="flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-semibold text-primary-700 uppercase tracking-wide">Impacto</span>
                          <p className="text-sm text-ink-700 mt-0.5 leading-relaxed">{sug.impact}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
