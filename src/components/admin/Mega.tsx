import { useState, useCallback, useEffect } from 'react';
import {
  Cloud,
  Folder,
  Download,
  RefreshCw,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
  Search,
  AlertCircle,
  Settings,
  X,
  Save,
  HardDrive,
  Eye,
  Music,
} from 'lucide-react';
import { PdfViewer } from '@/components/admin/PdfViewer';
import { ExcelViewer } from '@/components/admin/ExcelViewer';
import { FileTypeIcon } from '@/components/admin/FileTypeIcon';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';

type MegaNode = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size: number | null;
  modifiedDate: string | null;
};

type BreadcrumbItem = {
  id: string;
  name: string;
};

type ConnectionState = 'idle' | 'checking' | 'connected' | 'disconnected';

const MEGA_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/mega-proxy`;

function formatBytes(bytes: number | null): string {
  if (bytes === null || bytes === 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
  };
}

export function Mega() {
  const [connection, setConnection] = useState<ConnectionState>('idle');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [nodes, setNodes] = useState<MegaNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentHandle, setCurrentHandle] = useState<string>('');
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [savingCreds, setSavingCreds] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [rootFileCount, setRootFileCount] = useState(0);
  const [viewingFile, setViewingFile] = useState<MegaNode | null>(null);
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState<string | null>(null);
  const [excelSheets, setExcelSheets] = useState<{ name: string; rows: string[][] }[] | null>(null);
  const [excelActiveSheet, setExcelActiveSheet] = useState(0);
  const [excelVisibleRows, setExcelVisibleRows] = useState(50);

  const isViewable = (name: string): boolean => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    return ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'txt', 'csv', 'json', 'html', 'css', 'js', 'xml', 'xlsx', 'xls', 'ods', 'mp4', 'webm', 'mp3', 'wav', 'ogg', 'mov', 'md'].includes(ext);
  };

  const handleView = async (node: MegaNode) => {
    setViewingFile(node);
    setViewLoading(true);
    setViewUrl(null);
    setViewError(null);
    setExcelSheets(null);
    setExcelActiveSheet(0);
    setExcelVisibleRows(50);
    try {
      const res = await fetch(`${MEGA_FUNCTION_URL}?action=view&handle=${encodeURIComponent(node.id)}`, {
        headers: await getAuthHeaders(),
      });
      if (!res.ok) {
        let errMsg = 'Error al abrir archivo';
        try {
          const data = await res.json();
          errMsg = data.error || errMsg;
        } catch {
          errMsg = `Error ${res.status}: ${res.statusText}`;
        }
        setViewError(errMsg);
        setViewLoading(false);
        return;
      }
      const blob = await res.blob();
      if (blob.size === 0) {
        setViewError('El archivo está vacío o no se pudo descargar');
        setViewLoading(false);
        return;
      }
      const ext = node.name.split('.').pop()?.toLowerCase() || '';
      if (['xlsx', 'xls', 'ods', 'csv'].includes(ext)) {
        try {
          const XLSX = await import('xlsx');
          const arrayBuffer = await blob.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const sheets = workbook.SheetNames.map((sheetName) => {
            const sheet = workbook.Sheets[sheetName];
            const jsonRows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: '' });
            return { name: sheetName, rows: jsonRows.map((r) => r.map((c) => String(c))) };
          });
          if (sheets.length === 0 || sheets.every((s) => s.rows.length === 0)) {
            setViewError('El archivo Excel no contiene datos');
          } else {
            setExcelSheets(sheets);
          }
        } catch (e) {
          setViewError('No se pudo leer el archivo Excel: ' + (e instanceof Error ? e.message : 'formato no válido'));
        }
      } else {
        const url = URL.createObjectURL(blob);
        setViewUrl(url);
      }
    } catch (e) {
      setViewError('Error de red al abrir archivo: ' + (e instanceof Error ? e.message : ''));
    }
    setViewLoading(false);
  };

  const closeViewer = () => {
    if (viewUrl) URL.revokeObjectURL(viewUrl);
    setViewUrl(null);
    setViewingFile(null);
    setViewLoading(false);
    setViewError(null);
    setExcelSheets(null);
    setExcelActiveSheet(0);
    setExcelVisibleRows(50);
  };

  const checkConnection = useCallback(async () => {
    setConnection('checking');
    setConnectionError(null);
    try {
      const res = await fetch(`${MEGA_FUNCTION_URL}?action=check`, {
        headers: await getAuthHeaders(),
      });
      const data = await res.json();
      if (data.connected) {
        setConnection('connected');
        setRootFileCount(data.rootFiles || 0);
      } else {
        setConnection('disconnected');
        setConnectionError(data.error || 'No se pudo conectar');
      }
    } catch {
      setConnection('disconnected');
      setConnectionError('Error de red al contactar con el servidor');
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const loadFolder = useCallback(async (handle: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${MEGA_FUNCTION_URL}?action=list&handle=${encodeURIComponent(handle)}`, {
        headers: await getAuthHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al cargar archivos');
        setNodes([]);
      } else {
        setNodes(data.files || []);
      }
    } catch {
      setError('Error de red al cargar archivos');
      setNodes([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (connection === 'connected') {
      loadFolder('');
    }
  }, [connection, loadFolder]);

  const handleRefresh = () => {
    loadFolder(currentHandle);
  };

  const navigateToFolder = (folder: MegaNode) => {
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
    setCurrentHandle(folder.id);
    setSearchTerm('');
    loadFolder(folder.id);
  };

  const navigateToBreadcrumb = (index: number) => {
    const target = breadcrumbs[index];
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
    setCurrentHandle(target.id);
    setSearchTerm('');
    loadFolder(target.id);
  };

  const navigateToRoot = () => {
    setBreadcrumbs([]);
    setCurrentHandle('');
    setSearchTerm('');
    loadFolder('');
  };

  const handleDownload = async (node: MegaNode) => {
    setDownloadingId(node.id);
    try {
      const res = await fetch(`${MEGA_FUNCTION_URL}?action=download&handle=${encodeURIComponent(node.id)}`, {
        headers: await getAuthHeaders(),
      });
      if (!res.ok) {
        let errMsg = 'Error al descargar archivo';
        try {
          const data = await res.json();
          errMsg = data.error || errMsg;
        } catch {
          errMsg = `Error ${res.status}: ${res.statusText}`;
        }
        setError(errMsg);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = node.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError('Error de red al descargar archivo');
    }
    setDownloadingId(null);
  };

  const handleSaveCredentials = async () => {
    if (!credentials.email.trim() || !credentials.password.trim()) {
      setError('Email y contraseña son obligatorios');
      return;
    }
    setSavingCreds(true);
    setError(null);
    try {
      const res = await fetch(`${MEGA_FUNCTION_URL}?action=update-credentials`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ email: credentials.email.trim(), password: credentials.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al guardar credenciales');
      } else {
        setShowSettings(false);
        setCredentials({ email: '', password: '' });
        checkConnection();
      }
    } catch {
      setError('Error de red al guardar credenciales');
    }
    setSavingCreds(false);
  };

  const filteredNodes = searchTerm.trim()
    ? nodes.filter((n) => n.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : nodes;

  const folders = filteredNodes.filter((n) => n.type === 'folder');
  const files = filteredNodes.filter((n) => n.type === 'file');
  const totalSize = files.reduce((sum, f) => sum + (f.size || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 flex items-center gap-2">
            <Cloud className="w-6 h-6 text-primary-600" />
            MEGA Cloud
          </h1>
          <p className="text-ink-500 text-sm mt-1">
            Documentos y archivos de tu cuenta de MEGA
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-ink-200 text-ink-600 hover:bg-ink-50 text-sm font-medium rounded-xl transition-colors"
          >
            <Settings className="w-4 h-4" /> Configurar
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading || connection !== 'connected'}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-primary-500/20"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar
          </button>
        </div>
      </div>

      {/* Connection status */}
      {connection === 'checking' && (
        <div className="bg-primary-50 border border-primary-200 rounded-2xl p-4 flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
          <span className="text-sm text-primary-700">Conectando con MEGA...</span>
        </div>
      )}

      {connection === 'connected' && (
        <div className="bg-success-50 border border-success-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-success-600 flex-shrink-0" />
          <div className="flex-1">
            <span className="text-sm font-medium text-success-700">Cuenta MEGA conectada</span>
            {rootFileCount > 0 && (
              <span className="text-xs text-success-600 ml-2">· {rootFileCount} elementos en raíz</span>
            )}
          </div>
        </div>
      )}

      {connection === 'disconnected' && (
        <div className="bg-error-50 border border-error-200 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-5 h-5 text-error-600 flex-shrink-0" />
            <span className="text-sm font-medium text-error-700">No se pudo conectar con MEGA</span>
          </div>
          <p className="text-xs text-error-600 mb-3">
            {connectionError || 'Verifica que las credenciales sean correctas.'}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setError(null); checkConnection(); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-ink-900 hover:bg-ink-800 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reintentar
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-error-600 hover:bg-error-700 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <Settings className="w-3.5 h-3.5" /> Configurar credenciales
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-error-50 border border-error-200 rounded-xl text-error-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {connection === 'connected' && (
        <>
          {/* Breadcrumb + stats */}
          <div className="bg-white rounded-2xl border border-ink-100 p-4">
            <div className="flex items-center gap-1.5 flex-wrap mb-3">
              <button
                onClick={navigateToRoot}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <HardDrive className="w-4 h-4" /> Raíz
              </button>
              {breadcrumbs.map((crumb, i) => (
                <div key={crumb.id} className="flex items-center gap-1.5">
                  <ChevronRight className="w-4 h-4 text-ink-300" />
                  <button
                    onClick={() => navigateToBreadcrumb(i)}
                    className="px-2.5 py-1.5 text-sm font-medium text-ink-600 hover:bg-ink-50 rounded-lg transition-colors max-w-[200px] truncate"
                  >
                    {crumb.name}
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 text-xs text-ink-400 pt-3 border-t border-ink-50">
              <span>{folders.length} carpetas</span>
              <span>{files.length} archivos</span>
              <span>Tamaño total: {formatBytes(totalSize)}</span>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar archivos en esta carpeta..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-ink-200 rounded-xl text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          {/* File browser */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
          ) : filteredNodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Cloud className="w-12 h-12 text-ink-300 mb-4" />
              <p className="text-ink-500 text-sm">
                {searchTerm ? 'No se encontraron archivos.' : 'Esta carpeta está vacía.'}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {/* Folders */}
              {folders.map((folder) => (
                <div key={folder.id} className="bg-white rounded-xl border border-ink-100 overflow-hidden hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-3 p-3.5">
                    <button
                      onClick={() => navigateToFolder(folder)}
                      className="flex items-center gap-2.5 flex-1 min-w-0 text-left group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                        <Folder className="w-5 h-5 text-primary-600" />
                      </div>
                      <span className="text-sm font-medium text-ink-800 truncate group-hover:text-primary-600 transition-colors">
                        {folder.name}
                      </span>
                    </button>
                    <span className="text-xs text-ink-400 flex-shrink-0">
                      {formatDate(folder.modifiedDate)}
                    </span>
                  </div>
                </div>
              ))}

              {/* Files */}
              {files.map((file) => {
                const isDownloading = downloadingId === file.id;
                const viewable = isViewable(file.name);
                return (
                  <div
                    key={file.id}
                    className={`bg-white rounded-xl border border-ink-100 overflow-hidden transition-all ${viewable ? 'cursor-pointer hover:shadow-md hover:border-success-300' : 'hover:shadow-sm'}`}
                    onClick={() => viewable && !isDownloading && handleView(file)}
                  >
                    <div className="flex items-center gap-3 p-3.5">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${viewable ? 'bg-success-50' : 'bg-ink-50'}`}>
                        <FileTypeIcon name={file.name} className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${viewable ? 'text-ink-900 group-hover:text-success-700' : 'text-ink-800'}`}>{file.name}</p>
                        <div className="flex items-center gap-3 text-xs text-ink-400 mt-0.5">
                          <span>{formatBytes(file.size)}</span>
                          <span>{formatDate(file.modifiedDate)}</span>
                          {viewable && (
                            <span className="flex items-center gap-0.5 text-success-600 font-medium">
                              <Eye className="w-3 h-3" /> Visualizable
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        {viewable && (
                          <button
                            onClick={() => handleView(file)}
                            disabled={isDownloading}
                            className="flex items-center gap-1.5 px-3 py-2 bg-success-50 text-success-700 text-xs font-medium rounded-lg hover:bg-success-100 disabled:opacity-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Ver
                          </button>
                        )}
                        <button
                          onClick={() => handleDownload(file)}
                          disabled={isDownloading}
                          className="flex items-center gap-1.5 px-3 py-2 bg-primary-50 text-primary-700 text-xs font-medium rounded-lg hover:bg-primary-100 disabled:opacity-50 transition-colors"
                        >
                          {isDownloading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                          {isDownloading ? '...' : 'Descargar'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Settings modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-sm" onClick={() => setShowSettings(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
              <h2 className="font-display font-bold text-lg text-ink-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary-600" />
                Cuenta MEGA
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {error && (
                <div className="flex items-center gap-3 p-4 bg-error-50 border border-error-200 rounded-xl text-error-700 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 flex items-start gap-3">
                <Cloud className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-primary-700">
                  <p className="font-medium mb-1">Conexión con MEGA</p>
                  <p className="text-primary-600 text-xs">
                    Introduce el email y la contraseña de tu cuenta de MEGA.
                    Las credenciales se guardan de forma segura y nunca se exponen en el navegador.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Email de MEGA</label>
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  placeholder="tu-email@mega.nz"
                  className="w-full px-4 py-2.5 bg-ink-50 border border-ink-200 rounded-xl text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Contraseña</label>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  placeholder="Tu contraseña de MEGA"
                  className="w-full px-4 py-2.5 bg-ink-50 border border-ink-200 rounded-xl text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-ink-100">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2.5 text-sm font-medium text-ink-600 rounded-xl hover:bg-ink-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCredentials}
                disabled={savingCreds}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Save className="w-4 h-4" />
                {savingCreds ? 'Guardando...' : 'Guardar y conectar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File viewer modal */}
      {viewingFile && (
        <div className="fixed inset-0 z-50 flex flex-col bg-ink-950/80 backdrop-blur-sm" onClick={closeViewer}>
          <div className="flex items-center justify-between px-4 py-3 bg-ink-900 text-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 min-w-0">
              <Eye className="w-5 h-5 text-success-400 flex-shrink-0" />
              <span className="text-sm font-medium truncate">{viewingFile.name}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => viewingFile && handleDownload(viewingFile)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-success-600 hover:bg-success-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Descargar
              </button>
              <button
                onClick={closeViewer}
                className="p-2 hover:bg-ink-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center overflow-auto p-4" onClick={(e) => e.stopPropagation()}>
            {viewLoading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-3 border-success-200 border-t-success-600 rounded-full animate-spin" />
                <span className="text-success-300 text-sm">Cargando archivo...</span>
              </div>
            ) : viewError ? (
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-error-400">
                  <AlertCircle className="w-8 h-8" />
                  <span className="text-sm max-w-md text-center">{viewError}</span>
                </div>
                <button
                  onClick={() => viewingFile && handleDownload(viewingFile)}
                  className="flex items-center gap-2 px-4 py-2 bg-success-600 hover:bg-success-700 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" /> Descargar archivo
                </button>
              </div>
            ) : viewUrl ? (
              (() => {
                const ext = viewingFile.name.split('.').pop()?.toLowerCase() || '';
                if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) {
                  return <img src={viewUrl} alt={viewingFile.name} className="max-w-full max-h-full rounded-lg shadow-2xl" />;
                }
                if (ext === 'pdf') {
                  return <PdfViewer url={viewUrl} fileName={viewingFile.name} onDownload={() => viewingFile && handleDownload(viewingFile)} />;
                }
                if (['mp4', 'webm', 'mov', 'ogg'].includes(ext)) {
                  return (
                    <video
                      src={viewUrl}
                      controls
                      autoPlay
                      className="max-w-full max-h-full rounded-lg shadow-2xl bg-black"
                    />
                  );
                }
                if (['mp3', 'wav'].includes(ext)) {
                  return (
                    <div className="flex flex-col items-center gap-6 w-full max-w-lg">
                      <div className="w-24 h-24 rounded-full bg-success-500/20 flex items-center justify-center">
                        <Music className="w-10 h-10 text-success-400" />
                      </div>
                      <span className="text-white text-sm font-medium">{viewingFile.name}</span>
                      <audio src={viewUrl} controls autoPlay className="w-full" />
                    </div>
                  );
                }
                return <iframe src={viewUrl} className="w-full h-full bg-white rounded-lg" title={viewingFile.name} />;
              })()
            ) : excelSheets ? (
              <ExcelViewer
                sheets={excelSheets}
                activeSheet={excelActiveSheet}
                setActiveSheet={(i) => { setExcelActiveSheet(i); setExcelVisibleRows(50); }}
                visibleRows={excelVisibleRows}
                loadMore={() => setExcelVisibleRows((v) => v + 50)}
                fileName={viewingFile?.name}
                onDownload={() => viewingFile && handleDownload(viewingFile)}
              />
            ) : (
              <span className="text-error-400 text-sm">No se pudo mostrar el archivo</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
