import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { useSeo } from '@/hooks/useSeo';
import { supabase } from '@/lib/supabase';

type FileRow = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  external_url: string | null;
  thumbnail_url: string | null;
  created_at: string;
};

export default function PublicDownloads() {
  useSeo({ title: 'Centro de Descargas | Climatizaciones Montaño, S.L.', description: 'Descarga certificados, fichas técnicas y documentación profesional.', canonicalPath: '/centro-de-descargas/' });
  const [files, setFiles] = useState<FileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data, error: e } = await supabase
          .from('download_files')
          .select('id, title, description, category, file_path, file_size, file_type, created_at, external_url, thumbnail_url')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        if (e) throw e;
        setFiles(data || []);
      } catch (err) {
        console.error('[download center] public load failed', err);
        setError('No se pudo cargar el centro de descargas. Inténtalo más tarde.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDownload = async (file: FileRow) => {
    if (file.external_url) { window.open(file.external_url, '_blank', 'noopener,noreferrer'); return; }
    try {
      const { data } = supabase.storage.from('downloads').getPublicUrl(file.file_path);
      if (data?.publicUrl) {
        const a = document.createElement('a');
        a.href = data.publicUrl; a.download = file.title; a.target = '_blank'; a.click(); return;
      }
      throw new Error('no signed url');
    } catch { setError('No se pudo descargar el archivo.'); }
  };

  return (
    <div className="min-h-screen bg-ink-50 px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-ink-900 mb-6">Centro de descargas — acceso público</h1>
        <p className="text-ink-500 mb-6">Todos los archivos están disponibles sin necesidad de registrarse.</p>
        {loading && <p className="text-ink-500">Cargando…</p>}
        {error && <p className="text-red-600 mb-4">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((file) => (
            <div key={file.id} className="bg-white rounded-2xl border border-ink-100 shadow-sm p-4">
              {file.thumbnail_url && (
                <img src={file.thumbnail_url} alt={file.title} className="w-full h-32 object-cover rounded-lg mb-3" loading="lazy" decoding="async" />
              )}
              <h3 className="font-semibold text-ink-900 text-sm truncate">{file.title}</h3>
              {file.description && <p className="text-xs text-ink-500 mt-1 line-clamp-2">{file.description}</p>}
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-xs text-ink-400">
                  {file.file_type || 'Archivo'}
                  {file.file_size ? ` · ${Math.round(file.file_size / (1024 * 1024))} MB` : ''}
                </span>
                <button
                  onClick={() => handleDownload(file)}
                  className="rounded bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700"
                >
                  Descargar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
