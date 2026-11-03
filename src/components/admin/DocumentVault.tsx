import { useEffect, useState, useCallback, useRef } from 'react';
import { Download, Trash2, FileText, FileSpreadsheet, File, Search, X, ShieldCheck, CloudUpload, FolderSync, RefreshCw, CheckCircle2, Pause, Play, CheckSquare, Square } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type DocCategory = 'factura' | 'presupuesto' | 'otro';

type VaultDoc = {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: bigint;
  category: DocCategory;
  description: string | null;
  created_at: string;
};

const CATEGORY_LABELS: Record<DocCategory, string> = {
  factura: 'Factura',
  presupuesto: 'Presupuesto',
  otro: 'Otro',
};

const CATEGORY_COLORS: Record<DocCategory, string> = {
  factura: 'bg-primary-100 text-primary-700',
  presupuesto: 'bg-success-100 text-success-700',
  otro: 'bg-ink-100 text-ink-600',
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getFileIcon(type: string) {
  if (type.includes('pdf')) return FileText;
  if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv')) return FileSpreadsheet;
  return File;
}

const ACCEPTED_TYPES = '.pdf,.xlsx,.xls,.csv,.ods';
const VALID_EXTS = ['.pdf', '.xlsx', '.xls', '.csv', '.ods'];
const SYNC_INTERVAL_MS = 8000;

export function DocumentVault() {
  const [docs, setDocs] = useState<VaultDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<DocCategory | 'todas'>('todas');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchBusy, setBatchBusy] = useState(false);
  const [syncDir, setSyncDir] = useState<any>(null);
  const [syncDirName, setSyncDirName] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncActive, setSyncActive] = useState(false);
  const [syncAutoCategory, setSyncAutoCategory] = useState<DocCategory>('otro');
  const [syncStats, setSyncStats] = useState({ uploaded: 0, skipped: 0, errors: 0 });
  const [syncLog, setSyncLog] = useState<string[]>([]);
  const syncedFilesRef = useRef<Set<string>>(new Set());
  const syncDirRef = useRef<any>(null);
  const syncCategoryRef = useRef<DocCategory>('otro');
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadDocs = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('document_vault')
      .select('*')
      .order('created_at', { ascending: false });

    if (err) {
      setError('No se pudieron cargar los documentos.');
    } else {
      setDocs((data || []) as unknown as VaultDoc[]);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  const uploadFile = async (file: File | Blob, name: string, type: string, size: number, category: DocCategory = 'otro'): Promise<boolean> => {
    const ext = name.slice(name.lastIndexOf('.')).toLowerCase();
    if (!VALID_EXTS.includes(ext)) {
      return false;
    }

    setError(null);
    const filePath = `${crypto.randomUUID()}/${name}`;
    const { error: uploadErr } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadErr) {
      return false;
    }

    const { error: dbErr } = await supabase.from('document_vault').insert({
      file_name: name,
      file_path: filePath,
      file_type: type || 'application/octet-stream',
      file_size: size,
      category,
    });

    if (dbErr) {
      await supabase.storage.from('documents').remove([filePath]);
      return false;
    }

    loadDocs();
    return true;
  };

  const uploadFileInput = async (file: File, category: DocCategory = 'otro') => {
    setUploading(true);
    setError(null);
    const ok = await uploadFile(file, file.name, file.type, file.size, category);
    if (!ok) {
      setError(`No se pudo subir "${file.name}". Formato no permitido o error.`);
    }
    setUploading(false);
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      uploadFileInput(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDownload = async (doc: VaultDoc) => {
    const { data, error: err } = await supabase.storage
      .from('documents')
      .createSignedUrl(doc.file_path, 60);

    if (err || !data) {
      setError('No se pudo generar el enlace de descarga.');
      return;
    }

    const a = window.document.createElement('a');
    a.href = data.signedUrl;
    a.download = doc.file_name;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
  };

  const handleDelete = async (doc: VaultDoc) => {
    if (!confirm(`¿Eliminar "${doc.file_name}"? Esta acción no se puede deshacer.`)) return;

    const { error: storageErr } = await supabase.storage
      .from('documents')
      .remove([doc.file_path]);

    if (storageErr) {
      setError('Error al eliminar el archivo del almacenamiento.');
      return;
    }

    const { error: dbErr } = await supabase
      .from('document_vault')
      .delete()
      .eq('id', doc.id);

    if (dbErr) {
      setError('Error al eliminar el registro.');
    } else {
      loadDocs();
    }
  };

  const changeCategory = async (doc: VaultDoc, category: DocCategory) => {
    const { error: err } = await supabase
      .from('document_vault')
      .update({ category, updated_at: new Date().toISOString() })
      .eq('id', doc.id);

    if (err) {
      setError('Error al actualizar la categoría.');
    } else {
      loadDocs();
    }
  };

  // --- Folder sync via File System Access API ---

  const collectFilesFromDir = async (dir: any): Promise<{ file: File; relativePath: string }[]> => {
    const results: { file: File; relativePath: string }[] = [];
    for await (const entry of dir.values()) {
      if (entry.kind === 'file') {
        const file = await entry.getFile();
        const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
        if (VALID_EXTS.includes(ext)) {
          results.push({ file, relativePath: file.name });
        }
      } else if (entry.kind === 'directory') {
        const nested = await collectFilesFromDir(entry);
        for (const n of nested) {
          results.push({ file: n.file, relativePath: `${entry.name}/${n.relativePath}` });
        }
      }
    }
    return results;
  };

  const pickSyncFolder = async () => {
    if (!('showDirectoryPicker' in window)) {
      setError('Tu navegador no soporta selección de carpetas. Usa Chrome o Edge en escritorio.');
      return;
    }
    try {
      const dir = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
      setSyncDir(dir);
      setSyncDirName(dir.name);
      syncDirRef.current = dir;
      setSyncLog((prev) => [`Carpeta "${dir.name}" seleccionada.`, ...prev].slice(0, 20));
    } catch {
      // user cancelled
    }
  };

  const runSync = useCallback(async (isAuto = false) => {
    const dir = syncDirRef.current;
    if (!dir) return;

    setSyncing(true);
    const cat = syncCategoryRef.current;
    const files = await collectFilesFromDir(dir);
    let uploaded = 0;
    let skipped = 0;
    let errors = 0;
    const newLog: string[] = [];

    for (const { file, relativePath } of files) {
      if (syncedFilesRef.current.has(relativePath + file.lastModified)) {
        skipped++;
        continue;
      }
      const ok = await uploadFile(file, file.name, file.type, file.size, cat);
      if (ok) {
        syncedFilesRef.current.add(relativePath + file.lastModified);
        uploaded++;
        newLog.push(`✓ ${relativePath}`);
      } else {
        errors++;
        newLog.push(`✗ ${relativePath}`);
      }
    }

    if (uploaded > 0 || isAuto) {
      setSyncLog((prev) => [
        ...(uploaded > 0 ? [`${isAuto ? 'Auto' : 'Sincronización'}: ${uploaded} subido(s), ${skipped} ya sincronizado(s)${errors > 0 ? ', ' + errors + ' error(es)' : ''}`] : []),
        ...newLog.slice(0, 10),
        ...prev,
      ].slice(0, 30));
    }

    setSyncStats((prev) => ({
      uploaded: prev.uploaded + uploaded,
      skipped: prev.skipped + skipped,
      errors: prev.errors + errors,
    }));
    setSyncing(false);
  }, []);

  const startAutoSync = () => {
    if (!syncDir) return;
    setSyncActive(true);
    syncCategoryRef.current = syncAutoCategory;
    runSync(false);
    syncIntervalRef.current = setInterval(() => runSync(true), SYNC_INTERVAL_MS);
    setSyncLog((prev) => ['Vigilancia automática activada. Revisando cada 8 segundos...', ...prev].slice(0, 30));
  };

  const stopAutoSync = () => {
    setSyncActive(false);
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
    setSyncLog((prev) => ['Vigilancia automática detenida.', ...prev].slice(0, 30));
  };

  useEffect(() => {
    syncCategoryRef.current = syncAutoCategory;
  }, [syncAutoCategory]);

  useEffect(() => {
    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filtered.map((d) => d.id)));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const selectedDocs = () => docs.filter((d) => selectedIds.has(d.id));

  const batchDelete = async () => {
    const targets = selectedDocs();
    if (targets.length === 0) return;
    if (!confirm(`¿Eliminar ${targets.length} archivo(s)? Esta acción no se puede deshacer.`)) return;

    setBatchBusy(true);
    const paths = targets.map((d) => d.file_path);
    const ids = targets.map((d) => d.id);

    const { error: storageErr } = await supabase.storage.from('documents').remove(paths);
    if (storageErr) {
      setError('Error al eliminar algunos archivos del almacenamiento.');
      setBatchBusy(false);
      return;
    }

    const { error: dbErr } = await supabase.from('document_vault').delete().in('id', ids);
    if (dbErr) {
      setError('Error al eliminar algunos registros.');
    }

    setSelectedIds(new Set());
    setBatchBusy(false);
    loadDocs();
  };

  const batchDownload = async () => {
    const targets = selectedDocs();
    if (targets.length === 0) return;

    setBatchBusy(true);
    for (const doc of targets) {
      const { data, error: err } = await supabase.storage
        .from('documents')
        .createSignedUrl(doc.file_path, 60);
      if (err || !data) continue;
      const a = window.document.createElement('a');
      a.href = data.signedUrl;
      a.download = doc.file_name;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
    }
    setBatchBusy(false);
  };

  const batchChangeCategory = async (category: DocCategory) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    setBatchBusy(true);
    const { error: err } = await supabase
      .from('document_vault')
      .update({ category, updated_at: new Date().toISOString() })
      .in('id', ids);

    if (err) {
      setError('Error al actualizar la categoría de los archivos.');
    } else {
      setSelectedIds(new Set());
      loadDocs();
    }
    setBatchBusy(false);
  };

  const filtered = docs.filter((d) => {
    const matchesCategory = activeCategory === 'todas' || d.category === activeCategory;
    const matchesSearch = !search || d.file_name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const counts = {
    factura: docs.filter((d) => d.category === 'factura').length,
    presupuesto: docs.filter((d) => d.category === 'presupuesto').length,
    otro: docs.filter((d) => d.category === 'otro').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Caja fuerte de documentos</h1>
        <p className="text-ink-500 text-sm mt-1">
          Facturas y presupuestos guardados en la nube, siempre disponibles y protegidos.
        </p>
      </div>

      {error && (
        <div className="bg-error-50 border border-error-200 text-error-700 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-error-400 hover:text-error-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer p-8 text-center ${
          dragOver ? 'border-primary-500 bg-primary-50' : 'border-ink-200 bg-white hover:border-primary-300 hover:bg-ink-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES}
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        <div className="flex flex-col items-center gap-3">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
            dragOver ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-600'
          }`}>
            <CloudUpload className="w-7 h-7" />
          </div>
          <div>
            <p className="font-semibold text-ink-900 text-sm">
              {uploading ? 'Subiendo...' : 'Arrastra archivos aquí o haz clic para subir'}
            </p>
            <p className="text-xs text-ink-400 mt-1">
              PDF, Excel (xlsx, xls), CSV u ODS. Se suben como "Otro" por defecto.
            </p>
          </div>
        </div>
      </div>

      {/* Folder sync section */}
      <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
            <FolderSync className="w-5 h-5 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-ink-900 text-base">Sincronizar carpeta del PC</h3>
            <p className="text-xs text-ink-400 mt-0.5">
              Elige una carpeta de tu ordenador. Se subirán todos los archivos y se vigilará si aparecen nuevos mientras tengas el panel abierto.
            </p>
          </div>
        </div>

        {!syncDir ? (
          <button
            onClick={pickSyncFolder}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-ink-50 hover:bg-ink-100 text-ink-700 text-sm font-medium rounded-xl transition-colors border border-ink-200"
          >
            <FolderSync className="w-4 h-4" /> Elegir carpeta a sincronizar
          </button>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-ink-50 rounded-xl text-sm text-ink-700 flex-1 min-w-0">
                <FolderSync className="w-4 h-4 text-primary-600 flex-shrink-0" />
                <span className="truncate font-medium">{syncDirName}</span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={syncAutoCategory}
                  onChange={(e) => setSyncAutoCategory(e.target.value as DocCategory)}
                  disabled={syncActive}
                  className="px-3 py-2 text-sm rounded-xl border border-ink-200 text-ink-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  <option value="factura">Subir como Factura</option>
                  <option value="presupuesto">Subir como Presupuesto</option>
                  <option value="otro">Subir como Otro</option>
                </select>
                <button
                  onClick={pickSyncFolder}
                  disabled={syncActive}
                  className="px-3 py-2 text-sm rounded-xl border border-ink-200 text-ink-600 hover:bg-ink-50 disabled:opacity-50 transition-colors"
                >
                  Cambiar
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => runSync(false)}
                disabled={syncing || syncActive}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Sincronizando...' : 'Sincronizar ahora'}
              </button>
              {syncActive ? (
                <button
                  onClick={stopAutoSync}
                  className="flex items-center gap-2 px-4 py-2.5 bg-error-50 hover:bg-error-100 text-error-700 text-sm font-semibold rounded-xl transition-colors"
                >
                  <Pause className="w-4 h-4" /> Detener vigilancia
                </button>
              ) : (
                <button
                  onClick={startAutoSync}
                  disabled={syncing}
                  className="flex items-center gap-2 px-4 py-2.5 bg-success-50 hover:bg-success-100 text-success-700 text-sm font-semibold rounded-xl transition-colors"
                >
                  <Play className="w-4 h-4" /> Vigilar automáticamente
                </button>
              )}
              {syncActive && (
                <span className="flex items-center gap-1.5 text-xs text-success-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" /> Activo
                </span>
              )}
            </div>

            {/* Sync stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center bg-ink-50 rounded-xl py-3">
                <div className="font-display font-bold text-lg text-ink-900">{syncStats.uploaded}</div>
                <div className="text-xs text-ink-400">Subidos</div>
              </div>
              <div className="text-center bg-ink-50 rounded-xl py-3">
                <div className="font-display font-bold text-lg text-ink-900">{syncStats.skipped}</div>
                <div className="text-xs text-ink-400">Ya sincronizados</div>
              </div>
              <div className="text-center bg-ink-50 rounded-xl py-3">
                <div className="font-display font-bold text-lg text-ink-900">{syncStats.errors}</div>
                <div className="text-xs text-ink-400">Errores</div>
              </div>
            </div>

            {/* Sync log */}

            {syncLog.length > 0 && (
              <div className="bg-ink-900 rounded-xl p-4 max-h-40 overflow-y-auto">
                <div className="space-y-1">
                  {syncLog.map((line, i) => (
                    <div key={i} className={`text-xs font-mono ${line.startsWith('✓') ? 'text-success-400' : line.startsWith('✗') ? 'text-error-400' : 'text-ink-400'}`}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex items-start gap-2 text-xs text-ink-400 bg-ink-50 rounded-xl px-4 py-3">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-ink-400" />
          <span>
            Funciona en Chrome y Edge de escritorio. La vigilancia automática revisa la carpeta cada 8 segundos y sube los archivos nuevos. Solo funciona mientras el panel esté abierto; al cerrar la pestaña se detiene.
          </span>
        </div>
      </div>

      {/* Stats + filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2 flex-wrap">
          {(['todas', 'factura', 'presupuesto', 'otro'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                  : 'bg-white text-ink-600 border border-ink-200 hover:border-primary-300 hover:text-primary-600'
              }`}
            >
              {cat === 'todas' ? `Todas (${docs.length})` : `${CATEGORY_LABELS[cat]} (${counts[cat]})`}
            </button>
          ))}
        </div>
        <div className="relative flex-1 sm:max-w-xs sm:ml-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar archivo..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-ink-200 rounded-xl text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Batch selection toolbar */}
      {!loading && filtered.length > 0 && (
        <div className={`flex flex-col sm:flex-row sm:items-center gap-3 bg-white rounded-2xl border shadow-sm px-4 py-3 transition-all ${
          selectedIds.size > 0 ? 'border-primary-300 shadow-primary-500/10' : 'border-ink-100'
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={selectedIds.size === filtered.length ? clearSelection : selectAll}
              className="flex items-center gap-2 text-sm font-medium text-ink-700 hover:text-primary-600 transition-colors"
            >
              {selectedIds.size === filtered.length && selectedIds.size > 0 ? (
                <CheckSquare className="w-5 h-5 text-primary-600" />
              ) : (
                <Square className="w-5 h-5 text-ink-400" />
              )}
              {selectedIds.size > 0
                ? `${selectedIds.size} seleccionado(s)`
                : 'Seleccionar todos'}
            </button>
            {selectedIds.size > 0 && (
              <button
                onClick={clearSelection}
                className="text-xs text-ink-400 hover:text-ink-600 transition-colors"
              >
                Limpiar
              </button>
            )}
          </div>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) batchChangeCategory(e.target.value as DocCategory);
                  e.target.value = '';
                }}
                disabled={batchBusy}
                className="px-3 py-2 text-sm rounded-xl border border-ink-200 text-ink-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
              >
                <option value="">Cambiar categoría...</option>
                <option value="factura">→ Factura</option>
                <option value="presupuesto">→ Presupuesto</option>
                <option value="otro">→ Otro</option>
              </select>
              <button
                onClick={batchDownload}
                disabled={batchBusy}
                className="flex items-center gap-1.5 px-3 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" /> Descargar
              </button>
              <button
                onClick={batchDelete}
                disabled={batchBusy}
                className="flex items-center gap-1.5 px-3 py-2 bg-error-50 hover:bg-error-100 text-error-700 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" /> Eliminar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Document list */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-ink-100">
          <ShieldCheck className="w-12 h-12 text-ink-300 mb-4" />
          <p className="text-ink-500 text-sm mb-1">
            {docs.length === 0 ? 'Aún no has subido ningún documento.' : 'No hay documentos con esos criterios.'}
          </p>
          <p className="text-ink-400 text-xs">
            Sube facturas y presupuestos para tenerlos siempre guardados y protegidos.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/50">
                  <th className="text-left px-3 py-3.5 w-10">
                    <button
                      onClick={selectedIds.size === filtered.length && selectedIds.size > 0 ? clearSelection : selectAll}
                      className="flex items-center"
                    >
                      {selectedIds.size === filtered.length && selectedIds.size > 0 ? (
                        <CheckSquare className="w-5 h-5 text-primary-600" />
                      ) : (
                        <Square className="w-5 h-5 text-ink-300 hover:text-ink-500" />
                      )}
                    </button>
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-ink-500 uppercase tracking-wide">Archivo</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-ink-500 uppercase tracking-wide">Categoría</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-ink-500 uppercase tracking-wide">Tamaño</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-ink-500 uppercase tracking-wide">Fecha</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold text-ink-500 uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((doc) => {
                  const Icon = getFileIcon(doc.file_type);
                  const size = Number(doc.file_size);
                  return (
                    <tr key={doc.id} className={`hover:bg-ink-50/50 transition-colors ${selectedIds.has(doc.id) ? 'bg-primary-50/40' : ''}`}>
                      <td className="px-3 py-4">
                        <button onClick={() => toggleSelect(doc.id)} className="flex items-center">
                          {selectedIds.has(doc.id) ? (
                            <CheckSquare className="w-5 h-5 text-primary-600" />
                          ) : (
                            <Square className="w-5 h-5 text-ink-300 hover:text-ink-500" />
                          )}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-primary-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-ink-900 text-sm truncate max-w-xs">{doc.file_name}</div>
                            {doc.description && (
                              <div className="text-xs text-ink-400 truncate max-w-xs">{doc.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={doc.category}
                          onChange={(e) => changeCategory(doc, e.target.value as DocCategory)}
                          className={`px-2.5 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${CATEGORY_COLORS[doc.category]}`}
                        >
                          <option value="factura">Factura</option>
                          <option value="presupuesto">Presupuesto</option>
                          <option value="otro">Otro</option>
                        </select>
                      </td>
                      <td className="px-5 py-4 text-right text-sm text-ink-500">{formatSize(size)}</td>
                      <td className="px-5 py-4 text-sm text-ink-500">{formatDate(doc.created_at)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleDownload(doc)}
                            className="p-2 rounded-lg text-ink-500 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                            title="Descargar"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(doc)}
                            className="p-2 rounded-lg text-ink-500 hover:bg-error-50 hover:text-error-600 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-ink-100">
            {filtered.map((doc) => {
              const Icon = getFileIcon(doc.file_type);
              const size = Number(doc.file_size);
              return (
                <div key={doc.id} className={`p-4 ${selectedIds.has(doc.id) ? 'bg-primary-50/40' : ''}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <button onClick={() => toggleSelect(doc.id)} className="flex-shrink-0 mt-1">
                      {selectedIds.has(doc.id) ? (
                        <CheckSquare className="w-5 h-5 text-primary-600" />
                      ) : (
                        <Square className="w-5 h-5 text-ink-300" />
                      )}
                    </button>
                    <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-ink-900 text-sm truncate">{doc.file_name}</div>
                      <div className="text-xs text-ink-400 mt-0.5">{formatSize(size)} · {formatDate(doc.created_at)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={doc.category}
                      onChange={(e) => changeCategory(doc, e.target.value as DocCategory)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-full border-0 ${CATEGORY_COLORS[doc.category]}`}
                    >
                      <option value="factura">Factura</option>
                      <option value="presupuesto">Presupuesto</option>
                      <option value="otro">Otro</option>
                    </select>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Descargar
                    </button>
                    <button
                      onClick={() => handleDelete(doc)}
                      className="p-2 rounded-lg text-ink-500 hover:bg-error-50 hover:text-error-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
