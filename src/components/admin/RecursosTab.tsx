import { useState, useMemo } from 'react';
import { Download, Image as ImageIcon, Wrench, Building2, Tag, Search, FolderOpen } from 'lucide-react';
import assetManifest from 'virtual:asset-manifest';

type AssetEntry = {
  src: string;
  name: string;
  format: string;
  category: string;
  segments: string[];
};

const BRAND_NAMES: Record<string, string> = {
  'airzone.svg': 'Airzone',
  'casals.svg': 'Casals',
  'climaver.svg': 'Climaver',
  'daikin.svg': 'Daikin',
  'fujitsu.svg': 'Fujitsu',
  'giatsu.svg': 'Giatsu',
  'haier.svg': 'Haier',
  'hisense.svg': 'Hisense',
  'hitachi.svg': 'Hitachi',
  'johnson.svg': 'Johnson',
  'koolair.svg': 'Koolair',
  'koolnova.svg': 'Koolnova',
  'lg.svg': 'LG',
  'madel.svg': 'Madel',
  'mitsubishi.svg': 'Mitsubishi Electric',
  'mysair.svg': 'MYSAir',
  'novovent.svg': 'Novovent',
  'panasonic.svg': 'Panasonic',
  'samsung.svg': 'Samsung',
  'siber.svg': 'Siber',
  'sodeca.svg': 'Sodeca',
  'soler-palau.svg': 'Soler & Palau',
};

const ROOT_DESCRIPTIONS: Record<string, string> = {
  'logo-hd.webp': 'Logo principal en alta resolución (WebP)',
  'logo-hd.png': 'Logo principal en alta resolución (PNG)',
  'favicon.svg': 'Icono de pestaña del navegador',
  'og-image.webp': 'Imagen para redes sociales (1200×630)',
  'office-cassette-ac.webp': 'Aire acondicionado cassette en oficina',
  'maintenance-filter-cleaning.webp': 'Limpieza de filtros y mantenimiento',
  'reparacion-mitsubishi-tecnico.webp': 'Técnico reparando equipo',
  'energy-efficiency-green-world.webp': 'Auditoría de eficiencia energética',
  'energy-efficient-building.webp': 'Edificio con sistema de ventilación',
  'aerotermia-daikin-installer.webp': 'Instalación de aerotermia Daikin',
  'solar-thermosiphon-acs-installer.webp': 'Instalación solar térmica para ACS',
  'conductos-climaver-plus-obra-nueva.webp': 'Conductos Climaver en obra nueva',
  'conductos-climaver-constructora.webp': 'Conductos para constructoras',
  'edificio-moderno-obra-nueva.webp': 'Edificio moderno con climatización',
};

function describeAsset(entry: AssetEntry): string {
  if (entry.category === 'brands') {
    return BRAND_NAMES[entry.name] || entry.name.replace(/\.svg$/i, '');
  }
  if (ROOT_DESCRIPTIONS[entry.name]) {
    return ROOT_DESCRIPTIONS[entry.name];
  }
  const baseName = entry.name.replace(/\.[^.]+$/, '').replace(/-/g, ' ');
  return baseName.charAt(0).toUpperCase() + baseName.slice(1);
}

function AssetCard({ item }: { item: AssetEntry & { description: string } }) {
  return (
    <div className="group bg-white rounded-2xl border border-ink-100 shadow-sm hover:shadow-lg hover:shadow-ink-900/5 transition-all duration-300 overflow-hidden flex flex-col">
      <div className="relative aspect-[4/3] bg-ink-100 overflow-hidden flex items-center justify-center">
        <img
          src={item.src}
          alt={item.description}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-white/90 backdrop-blur text-ink-600 text-[10px] font-semibold rounded-full shadow-sm uppercase tracking-wide">
          {item.format}
        </span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h4 className="font-medium text-ink-900 text-sm mb-1">{item.description}</h4>
        <p className="text-xs text-ink-400 mb-3 font-mono break-all">{item.name}</p>
        <a
          href={item.src}
          download={item.name}
          className="mt-auto flex items-center justify-center gap-2 px-3 py-2 bg-primary-50 text-primary-700 text-xs font-semibold rounded-lg hover:bg-primary-100 transition-colors"
        >
          <Download className="w-4 h-4" />
          Descargar
        </a>
      </div>
    </div>
  );
}

function BrandCard({ item }: { item: AssetEntry & { description: string } }) {
  return (
    <div className="group bg-white rounded-xl border border-ink-100 shadow-sm hover:shadow-md transition-all p-4 flex flex-col items-center">
      <div className="w-full h-16 flex items-center justify-center bg-ink-50 rounded-lg mb-3 p-2">
        <img
          src={item.src}
          alt={item.description}
          className="max-h-full max-w-full object-contain"
        />
      </div>
      <span className="text-xs font-medium text-ink-700 mb-0.5">{item.description}</span>
      <a
        href={item.src}
        download={item.name}
        className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 text-xs font-semibold rounded-lg hover:bg-primary-100 transition-colors w-full justify-center"
      >
        <Download className="w-3.5 h-3.5" />
        SVG
      </a>
    </div>
  );
}

export function RecursosTab() {
  const [search, setSearch] = useState('');

  const { brandItems, rootItems, imageGroups, totalAssets } = useMemo(() => {
    const entries = assetManifest as AssetEntry[];

    const brands = entries
      .filter((e) => e.category === 'brands')
      .map((e) => ({ ...e, description: describeAsset(e) }));

    const root = entries
      .filter((e) => e.category === 'root')
      .map((e) => ({ ...e, description: describeAsset(e) }));

    const images = entries
      .filter((e) => e.category === 'images')
      .map((e) => ({ ...e, description: describeAsset(e) }));

    const rootBrands = root.filter((e) => e.format === 'SVG' && e.name !== 'favicon.svg');
    const rootPhotos = root.filter((e) => e.format !== 'SVG');

    const groupMap = new Map<string, { id: string; title: string; items: typeof rootPhotos }>();

    for (const img of images) {
      const subPath = img.segments.slice(1, -1).join(' / ') || 'General';
      const existing = groupMap.get(subPath);
      if (existing) {
        existing.items.push(img);
      } else {
        groupMap.set(subPath, {
          id: subPath.replace(/\s/g, '-').toLowerCase(),
          title: subPath,
          items: [img],
        });
      }
    }

    const sortedGroups = Array.from(groupMap.values()).sort((a, b) => a.title.localeCompare(b.title));

    return {
      brandItems: [...brands, ...rootBrands],
      rootItems: rootPhotos,
      imageGroups: sortedGroups,
      totalAssets: entries.length,
    };
  }, []);

  const filteredRootItems = rootItems.filter(
    (item) => !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredImageGroups = imageGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter((group) => group.items.length > 0);

  const filteredBrands = brandItems.filter(
    (item) => !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Recursos e imágenes</h1>
          <p className="text-ink-500 text-sm mt-1">
            {totalAssets} archivos detectados automáticamente · Se actualizan al compilar
          </p>
        </div>
      </div>

      <div className="bg-success-50 border border-success-200 rounded-xl p-4 flex items-start gap-3">
        <FolderOpen className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-success-700">
          Los recursos se detectan automáticamente al añadir archivos a la carpeta <code className="text-success-800 bg-success-100 px-1.5 py-0.5 rounded text-xs font-mono">public/</code>. No necesitas editar código: la próxima compilación los incluirá.
        </p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
        <input
          type="text"
          placeholder="Buscar recurso..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-ink-200 rounded-xl text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
        />
      </div>

      {filteredRootItems.length === 0 && filteredImageGroups.length === 0 && filteredBrands.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ImageIcon className="w-12 h-12 text-ink-300 mb-4" />
          <p className="text-ink-500 text-sm">No se encontraron recursos con ese criterio.</p>
        </div>
      )}

      {filteredRootItems.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-ink-900">Imágenes principales</h2>
              <p className="text-xs text-ink-400">{filteredRootItems.length} archivo{filteredRootItems.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredRootItems.map((item) => (
              <AssetCard key={item.src} item={item} />
            ))}
          </div>
        </section>
      )}

      {filteredImageGroups.map((group) => {
        return (
          <section key={group.id} className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 className="font-display font-bold text-lg text-ink-900">{group.title}</h2>
                <p className="text-xs text-ink-400">{group.items.length} archivo{group.items.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {group.items.map((item) => (
                <AssetCard key={item.src} item={item} />
              ))}
            </div>
          </section>
        );
      })}

      {filteredBrands.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
              <Tag className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-ink-900">Logos de marcas</h2>
              <p className="text-xs text-ink-400">{filteredBrands.length} archivo{filteredBrands.length !== 1 ? 's' : ''} SVG</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredBrands.map((item) => (
              <BrandCard key={item.src} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
