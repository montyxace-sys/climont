import { useState, useEffect } from 'react';
import { Download, FileText, Eye, X, ArrowLeft } from 'lucide-react';
import { useSeo } from '@/hooks/useSeo';
import { navigate } from '@/lib/navigate';

type PdfItem = {
  title: string;
  file: string;
  description?: string | null;
  category?: string;
  size?: string;
  thumbnail?: string | null;
};

const isPdf = (file: string) => file.toLowerCase().endsWith('.pdf');

export default function PublicDownloads() {
  useSeo({ title: 'Documentos y PDFs | Climatizaciones Montaño, S.L.', description: 'Descarga certificados, fichas técnicas, tarifas y documentación profesional en PDF.', canonicalPath: '/documentos' });
  const [items, setItems] = useState<PdfItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<PdfItem | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/documentos.json', { cache: 'no-cache' });
        if (!res.ok) throw new Error('no manifest');
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('[documentos] load failed', err);
        setError('No se pudo cargar el listado de documentos.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getFileUrl = (file: string) => {
    if (/^https?:\/\//.test(file)) return file;
    return `/descargas/${file}`;
  };

  const handleDownload = (item: PdfItem) => {
    const url = getFileUrl(item.file);
    const a = document.createElement('a');
    a.href = url; a.download = item.title; a.target = '_blank'; a.click();
  };

  const handlePreview = (item: PdfItem) => {
    setPreviewFile(item);
    setPreviewUrl(getFileUrl(item.file));
  };

  const closePreview = () => { setPreviewFile(null); setPreviewUrl(null); };

  const categories = [...new Set(items.map((i) => i.category || 'General'))].sort();

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="bg-ink-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-sm sm:text-base">Documentos y PDFs</h1>
              <p className="text-ink-400 text-xs">Climatizaciones Montaño, S.L.</p>
            </div>
          </div>
          <button onClick={() => navigate('/')} className="flex items-center gap-2 px-3 py-2 bg-ink-800 hover:bg-ink-700 text-ink-300 hover:text-white text-sm font-medium rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Volver al inicio</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <p className="text-ink-500 text-sm mb-6">
          Documentación técnica, tarifas y certificados en PDF. Pulsa "Ver PDF" para previsualizar o "Descargar" para guardar el archivo.
        </p>

        {loading && <p className="text-ink-500">Cargando…</p>}
        {error && <p className="text-red-600 mb-4">{error}</p>}

        {!loading && items.length === 0 && !error && (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-ink-300 mx-auto mb-4" />
            <h2 className="font-display text-lg font-bold text-ink-900 mb-2">Sin documentos disponibles</h2>
            <p className="text-ink-500">Todavía no hay PDFs publicados. Vuelve a consultar más tarde.</p>
          </div>
        )}

        {categories.map((cat) => (
          <div key={cat} className="mb-8">
            <h2 className="font-display text-lg font-bold text-ink-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-600" />
              {cat}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {items.filter((i) => (i.category || 'General') === cat).map((item, idx) => (
                <div key={idx} className="bg-white border border-ink-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0 ring-1 ring-ink-100" />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-primary-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-ink-900 text-sm mb-1">{item.title}</h3>
                      {item.description && <p className="text-ink-500 text-xs leading-relaxed mb-2">{item.description}</p>}
                      {item.size && <div className="text-xs text-ink-400 mb-3">{item.size}</div>}
                      <div className="flex items-center gap-2">
                        {isPdf(item.file) && (
                          <button onClick={() => handlePreview(item)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-ink-100 hover:bg-ink-200 text-ink-700 text-sm font-semibold rounded-lg transition-colors">
                            <Eye className="w-4 h-4" /> Ver PDF
                          </button>
                        )}
                        <button onClick={() => handleDownload(item)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors">
                          <Download className="w-4 h-4" /> Descargar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {previewFile && (
        <div className="fixed inset-0 z-[100] bg-ink-950/80 backdrop-blur-sm flex flex-col" onClick={closePreview}>
          <div className="bg-white flex items-center justify-between px-4 py-3 border-b border-ink-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-5 h-5 text-primary-600 flex-shrink-0" />
              <span className="font-semibold text-ink-900 text-sm truncate">{previewFile.title}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {previewUrl && (
                <a href={previewUrl} download={previewFile.title} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors">
                  <Download className="w-4 h-4" /> Descargar
                </a>
              )}
              <button onClick={closePreview}
                className="flex items-center justify-center w-10 h-10 bg-ink-100 hover:bg-ink-200 text-ink-700 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 bg-ink-200 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {previewUrl ? (
              <iframe src={previewUrl} title={previewFile.title} className="w-full h-full border-0" />
            ) : (
              <p className="text-ink-500 text-sm">No se pudo cargar el documento.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
