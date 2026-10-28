import { Download, ArrowRight, BookOpen, Eye } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { useSeo } from '@/hooks/useSeo';
import { MANUFACTURER_CATALOGS } from '@/data/catalogs';

export function CatalogosPage() {
  useSeo({
    title: 'Catálogos y tarifas de aire acondicionado 2026 | Climatizaciones Montaño',
    description:
      'Enlaces directos a catálogos y tarifas oficiales 2026 de Daikin, Mitsubishi, LG, Samsung, Panasonic, Fujitsu, Hisense, Hitachi, Airzone y otros fabricantes.',
    canonicalPath: '/catalogos',
  });

  const brands = [...new Set(MANUFACTURER_CATALOGS.map((c) => c.brand))];

  return (
    <div className="min-h-screen bg-white">
      <div className="pt-12 pb-20 lg:pt-20 lg:pb-32 bg-ink-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-300 text-sm font-medium mb-6">
            <BookOpen className="w-4 h-4" />
            Catálogos y tarifas
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4 max-w-3xl">
            Catálogos de fabricantes 2026
          </h1>
          <p className="text-white/70 text-lg max-w-3xl">
            Enlaces directos a los catálogos y tarifas oficiales más recientes de los fabricantes con los que trabajamos.
            La disponibilidad y el contenido dependen de cada marca.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {brands.map((brand) => (
          <section key={brand} className="mb-12">
            <h2 className="font-display text-2xl font-bold text-ink-900 mb-4">{brand}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {MANUFACTURER_CATALOGS.filter((c) => c.brand === brand).map((c) => (
                <Reveal key={c.url}>
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block bg-white border border-ink-100 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-primary-200 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-lg">
                        {c.year ?? 'PDF'}
                      </span>
                      <Download className="w-4 h-4 text-ink-400 group-hover:text-primary-600 transition-colors" />
                    </div>
                    <h3 className="font-display font-semibold text-ink-900 text-sm sm:text-base leading-snug mb-2">
                      {c.title}
                    </h3>
                    {c.note && <p className="text-ink-500 text-xs leading-relaxed">{c.note}</p>}
                    <div className="mt-4 flex items-center gap-2">
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Ver
                      </a>
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={c.title.replace(/[^\\w.-]+/g, '-') + '.pdf'}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-ink-700 bg-white border border-ink-200 hover:border-primary-300 hover:text-primary-700 rounded-lg transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> Descargar
                      </a>
                    </div>
                  </a>
                </Reveal>
              ))}
            </div>
          </section>
        ))}

        <p className="text-ink-500 text-xs leading-relaxed mt-8 max-w-3xl">
          Nota: los enlaces apuntan a documentos oficiales de los fabricantes o a sus centros de
          descargas oficiales. Algunas tarifas se actualizan anualmente; si encuentras un enlace
          desactualizado, comunícalo y lo revisamos.
        </p>
      </main>
    </div>
  );
}
