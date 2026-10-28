export interface ManufacturerCatalog {
  brand: string;
  title: string;
  url: string;
  year?: number;
  note?: string;
}

export const MANUFACTURER_CATALOGS: ManufacturerCatalog[] = [
  { brand: 'LG', title: 'Tarifa de climatización LG (digital)', year: 2026, url: 'https://www.lg.com/content/dam/channel/wcms/es/business/climatizacion/buscador-documentacion/pdf/Tarifa_2026_digital.pdf', note: 'Toda la gama LG 2026 en un solo documento.' },
  { brand: 'LG (MX)', title: 'HVAC Catalogue 2026', year: 2026, url: 'https://www.lg.com/content/dam/channel/wcms/mx/business/download/airsolution/2026_LG_HVAC_Catalogo_20260227_031245_.pdf', note: 'Catálogo completo HVAC LG para México.' },
  { brand: 'Mitsubishi Electric', title: 'Tarifa 2026 (PDF)', year: 2026, url: 'https://vainsmon.es/catalogos/catalogo-tarifa-mitsubishi-electric-2026/', note: 'Splits, VRF, aerotermia y sistemas eficientes.' },
  { brand: 'Mitsubishi Electric', title: 'Catálogos comerciales (oficial)', year: 2026, url: 'https://www.mitsubishielectric.es/aire-acondicionado/catalogos/', note: 'Línea completa: paneles, fan-coils, etc.' },
  { brand: 'Hisense', title: 'Tarifa de climatización 2026 (PDF)', year: 2026, url: 'https://deac.mobi/es/docs/all/HISENSE', note: 'Entradas: TARIFA HISENSE 2026 DEAC.pdf' },
  { brand: 'Hitachi', title: 'Catálogos y tarifas 2026', year: 2026, url: 'https://www.hitachiaircon.com/es/recursos', note: 'En la sección Catálogos/Tarifas Hitachi.' },
  { brand: 'Panasonic', title: 'Tarifas Panasonic 2026 (soporte)', year: 2026, url: 'https://deac.mobi/es/docs/all/PANASONIC', note: 'TARIFA PANASONIC 2026 (PDF, 22,96 MB).' },
  { brand: 'Panasonic', title: 'Folletos V/Air (2026-2027)', year: 2026, url: 'https://www.aircon.panasonic.eu/ES_es/downloads/catalogues-and-leaflets/', note: 'Folletos de gama y VRF.' },
  { brand: 'Fujitsu', title: 'Catálogo Halcyon/Series 2026', year: 2026, url: 'https://www.airstagehvac.com/support/downloads/halcyon/ctlg/', note: 'Catálogos A/C de Fujitsu / AIRSTAGE.' },
  { brand: 'Fujitsu', title: 'Catálogos oficiales Airstage', year: 2026, url: 'https://fujitsu-airstage.bg/en/content/catalogs.html', note: 'RAC/VRF catálogos.' },
  { brand: 'Daikin', title: 'Hub de tarifas Daikin (Julio 2026)', year: 2026, url: 'https://www.elcomair.es/pages/catalogos-de-climatizacion', note: '“Tarifa de precios recomendados · Julio 2026 · PDF”.' },
  { brand: 'Daikin', title: 'Catálogos Daikin Clidama', year: 2026, url: 'https://www.clidama.es/catalogos/', note: 'Gama split/multisplit 2025-2026, aerotermia VRV.' },
  { brand: 'Samsung', title: 'Documentación HVAC (no hay tarifa pública 2026 única)', year: 2025, url: 'https://es.scribd.com/document/871350410/HVACHandbook-2025-mayo', note: 'Manual técnico HVAC (Mayo 2025). Revisar portal mayorista para tarifas 2026.' },
  { brand: 'Airzone', title: 'Documentación Airzone', year: 2026, url: 'https://www.airzone.com/es/documentacion/', note: 'Manuales, catálogos y sistemas de zonificación.' },
  { brand: 'Carrier / Others', title: 'Hubs de documentación técnica', year: 2026, url: 'https://www.airefrio.com/catalogos-fabricantes-aire-acondicionado', note: 'Tarifas y fichas de muchos fabricantes.' },

// Fabricantes adicionales (2026)
  { brand: 'Midea', title: 'Midea Catalogue 2026-27 (PDF)', year: 2026, url: 'https://www.midea.com/content/dam/midea-aem/gulf/catalogue-2026/Midea-Catalogue-2026-27.pdf', note: 'Catálogo completo de producto (incluye A/C split, cassette, conductos, VRF).' },
  { brand: 'Mitsubishi Heavy Industries', title: 'SR/FD Series Residential Air Conditioners 2026 (PDF)', year: 2026, url: 'https://www.mhi.com/group/maco/products/downloads', note: 'Hub de descargas oficiales (PDFs por serie: SR, FD, dedicados a logística comercial/UE/Asia).' },
  { brand: 'Haier', title: 'Haier Air Conditioning Catalogue 2026 (PDF)', year: 2026, url: 'https://haierhvac.eu/sites/haierhvac-eu/files/2025-12/Haier_RAC_Catalogue_2026_ENG-min_0.pdf', note: 'Catálogo residencial/comercial Haier 2026 (PDF completo 140 MB).' },
  { brand: 'Carrier/Midea', title: 'Catalogues 2026 (Carrier y Midea India)', year: 2026, url: 'https://carriermideaindia.com/catalogues', note: 'Tarifas y catálogos Carrier 2026 + Midea (gama residencial/comercial).' },
  { brand: 'Carrier', title: 'Residential Air Conditióners 2025-2026', year: 2026, url: 'https://www.carrier.com/commercial/en/eu/media/catalogue-split-systems-2022_tcm201-176583.pdf', note: 'Catálogo gama Carrier (doc oficial, revisar año final en portada).' },
  { brand: 'Mitsubishi Heavy Industries (italia)', title: 'GENERAL CATALOGUE 2026 (PDF)', year: 2026, url: 'https://www.mitsubishi-termal.it/wp-content/uploads/2025/05/MHI_CATALOGUE_2025_EN.pdf', note: 'Catálogo general HVAC MHI 2025 (ed. nueva publicación 2026 en web).' },
  { brand: 'Vaillant', title: 'Catálogo Tarifa 2026 (PDF)', year: 2026, url: 'https://www.myvaillantpro.es/downloads/tarifa/2026-1/catalogo-general-2026-3167843.pdf', note: 'Tarifa y catálogo general Vaillant 2026.' },
  { brand: 'Bosch Home Comfort', title: '2026 Bosch HVAC/products catalog (hub)', year: 2026, url: 'https://www.bosch-homecomfort.com/us/en/residential/technical-documentation/product-catalogue', note: 'Especificaciones del catálogo 2026 (sitio oficial).' },
  { brand: 'Junkers/Bosch', title: 'Tarifa-Catálogo febrero 2026 (HVAC/calderas)', year: 2026, url: 'https://www.my.grupofyce.com/web/pdfjs/web/viewer.html?file=%2Fimg%2Fuploads%2Fpdf_tarifas%2F69f0c813d8614_Tarifa-Catalogo-JUNKERS-BOSCH-febrero-2026-Calentadores-Termos-Bombas-Calor-AACC-Calderas.pdf', note: 'Tarifa/catálogo febrero 2026 Junkers/Bosch (ystems mixtos).' },
  { brand: 'Helios', title: 'Catálogos y documentos 2026 (hub)', year: 2026, url: 'https://www.heliosventilatoren.de/en/service/info-center-en/catalogues-and-documents', note: 'Catálogos de ventilación (RAC, VRF, balizas).' },
  { brand: 'Panasonic', title: ' GENERAL 2026-2027 AQUAREA (PDF)', year: 2026, url: 'https://www.panasonicproclub.com/uploads//UA/catalogues/2026-2027/01%20Aquarea/01%20EU%20INTRO-AQUAREA%20GEN%2026%20LR.pdf', note: 'General Aquarea 2026/27 (PDF).' },
  { brand: 'Haier (Italia)', title: 'Haier HVAC European Range', year: 2026, url: 'https://haierhvac.eu/handbooks-and-downloads', note: 'Descargas oficiales (tarifas y catálogos).' },
];
