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
];
