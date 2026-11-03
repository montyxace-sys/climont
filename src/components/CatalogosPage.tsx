import { useEffect, useState } from 'react';
import { Download, BookOpen, Eye, Lock, FileText } from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { useSeo } from '@/hooks/useSeo';
import { MANUFACTURER_CATALOGS } from '@/data/catalogs';
import { supabase } from '@/lib/supabase';

type HostedCatalog = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  external_url: string | null;
  thumbnail_url: string | null;
};

export function CatalogosPage() {
  const [hosted, setHosted] = useState<HostedCatalog[]>([]);
  const [loadingHosted, setLoadingHosted] = useState(true);

  useSeo({
    title: 'Catálogos y tarifas de aire acondicionado 2026 | Climatizaciones Montaño, S.L.',
    description:
      'Enlaces directos a catálogos y tarifas oficiales 2026 de Daikin, Mitsubishi, LG, Samsung, Panasonic, Fujitsu, Hisense, Hitachi, Airzone y otros fabricantes. Catálogos subidos por Climatizaciones Montaño disponibles en el centro de descargas.',
    canonicalPath: '/catalogos',
  });

  const brands = [...new Set(MANUFACTURER_CATALOGS.map((c) => c.brand))];

  const isExternal = (file: HostedCatalog) => Boolean(file.external_url);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from('download_files')
          .select('id,title,description,category,file_path,file_size,file_type,external_url,thumbnail_url')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        if (!cancelled && data) setHosted(data as HostedCatalog[]);
      } catch {
        // silently ignore
      } finally {
        if (!cancelled) setLoadingHosted(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const formatSize = (b: number | null) => {
    if (!b) return '';
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  };

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
            Enlaces directos a los catálogos y tarifas oficiales más recientes. La disponibilidad y el contenido dependen de cada marca.
            También mostramos documentos subidos por nuestro equipo.
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
                  <div className="group bg-white border border-ink-100 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-primary-200 transition-all">
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-ink-700 bg-white border border-ink-200 hover:border-primary-300 hover:text-primary-700 rounded-lg transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" /> Descargar
                      </a>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        ))}

        {hosted.length > 0 && (
          <section className="mb-12">
            <h2 className="font-display text-2xl font-bold text-ink-900 mb-4">
              Catálogos alojados por Climatizaciones Montaño
            </h2>
            <p className="text-ink-500 text-sm mb-6">
              PDFs subidos en nuestro centro de descargas (se abren sin iniciar sesión si el documento es público, sino te pide acceso).
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {hosted.map((file) => {
                const url = file.external_url || (file.file_path.startsWith('http') ? file.file_path : `/descargas/${file.file_path}`);
                return (
                  <div
                    key={file.id}
                    className="group bg-white border border-ink-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-primary-200 transition-all"
                  >
                    {file.thumbnail_url ? (
                      <img src={file.thumbnail_url} alt={file.title} className="w-full h-40 object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-24 bg-ink-50 flex items-center justify-center">
                        <FileText className="w-8 h-8 text-ink-300" />
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="font-display font-semibold text-ink-900 text-sm sm:text-base leading-snug mb-1">
                        {file.title}
                      </h3>
                      {file.description && <p className="text-ink-500 text-xs leading-relaxed mb-3">{file.description}</p>}
                      <div className="flex items-center gap-3 text-xs text-ink-400 mb-3">
                        <span>{file.category}</span>
                        {file.file_size ? <span>{formatSize(file.file_size)}</span> : null}
                      </div>
                      <div className="flex items-center gap-2">
                        {isExternal(file) ? (
                          <>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" /> Ver
                            </a>
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              download
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-ink-700 bg-white border border-ink-200 hover:border-primary-300 hover:text-primary-700 rounded-lg transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" /> Descargar
                            </a>
                          </>
                        ) : (
                          <a
                            href="/centro-de-descargas"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-ink-700 bg-white border border-ink-200 hover:border-primary-300 hover:text-primary-700 rounded-lg transition-colors"
                          >
                            <Lock className="w-3.5 h-3.5" /> Acceso clientes
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {loadingHosted && (
          <p className="text-sm text-ink-500 py-4">Cargando catálogos del centro...</p>
        )}

        <p className="text-ink-500 text-xs leading-relaxed mt-8 max-w-3xl">
          Nota: los enlaces públicos apuntan a documentos oficiales de los fabricantes o a sus centros de
          descargas oficiales. Algunas tarifas se actualizan anualmente; si encuentras un enlace
          desactualizado, comunícanos y lo revisamos.
        </p>
      </main>
    </div>
  );
}
