import { useState, useEffect, type FormEvent } from 'react';
import {
  Download, CheckCircle2, XCircle, Clock, Trash2, Upload, Loader2,
  AlertCircle, FileText, Plus, Search,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type DownloadUser = {
  user_id: string;
  full_name: string;
  company: string | null;
  phone: string | null;
  status: string;
  created_at: string;
  approved_at: string | null;
  email: string;
};

type DownloadFile = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  is_active: boolean;
  created_at: string;
  external_url: string | null;
};
type AdminSubTab = 'users' | 'files';

export function DownloadCenterAdmin() {
  const [subTab, setSubTab] = useState<AdminSubTab>('users');

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
          <Download className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-ink-900">Centro de Descargas</h1>
          <p className="text-ink-500 text-sm">Gestión de usuarios y archivos</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setSubTab('users')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${subTab === 'users' ? 'bg-primary-600 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'}`}>
          Usuarios registrados
        </button>
        <button onClick={() => setSubTab('files')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${subTab === 'files' ? 'bg-primary-600 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'}`}>
          Archivos
        </button>
      </div>

      {subTab === 'users' && <UsersTab />}
      {subTab === 'files' && <FilesTab />}
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<DownloadUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('download_users')
      .select('user_id, full_name, company, phone, status, created_at, approved_at')
      .order('created_at', { ascending: false });
    if (!error && data) {
      const usersWithEmail = await Promise.all(
        data.map(async (u) => {
          const { data: authData } = await supabase.auth.admin.getUserById(u.user_id);
          return { ...u, email: authData?.user?.email || 'N/A' };
        })
      );
      setUsers(usersWithEmail);
    }
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const updateStatus = async (userId: string, status: 'aprobado' | 'rechazado') => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('download_users')
        .update({ status, approved_at: status === 'aprobado' ? new Date().toISOString() : null })
        .eq('user_id', userId);
      if (error) throw error;
      await loadUsers();
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.company || '').toLowerCase().includes(q);
  });

  const statusBadge = (status: string) => {
    if (status === 'aprobado') return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-100 text-success-700"><CheckCircle2 className="w-3 h-3" /> Aprobado</span>;
    if (status === 'rechazado') return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-error-100 text-error-700"><XCircle className="w-3 h-3" /> Rechazado</span>;
    return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-warning-100 text-warning-700"><Clock className="w-3 h-3" /> Pendiente</span>;
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-primary-600 animate-spin" /></div>;
  }

  const pendingCount = users.filter((u) => u.status === 'pendiente').length;

  return (
    <div>
      {pendingCount > 0 && (
        <div className="flex items-center gap-2 p-3 bg-warning-50 border border-warning-200 rounded-xl text-warning-700 text-sm mb-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Tienes {pendingCount} solicitud{pendingCount > 1 ? 'es' : ''} de registro pendiente{pendingCount > 1 ? 's' : ''} de revisión.
        </div>
      )}

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre, email o empresa..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-ink-200 rounded-xl text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-ink-400 text-sm">No hay usuarios registrados.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-ink-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 border-b border-ink-100">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-ink-700">Nombre</th>
                  <th className="text-left px-4 py-3 font-semibold text-ink-700">Email</th>
                  <th className="text-left px-4 py-3 font-semibold text-ink-700">Empresa</th>
                  <th className="text-left px-4 py-3 font-semibold text-ink-700">Teléfono</th>
                  <th className="text-left px-4 py-3 font-semibold text-ink-700">Estado</th>
                  <th className="text-left px-4 py-3 font-semibold text-ink-700">Registro</th>
                  <th className="text-right px-4 py-3 font-semibold text-ink-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-50">
                {filtered.map((u) => (
                  <tr key={u.user_id} className="hover:bg-ink-50/50">
                    <td className="px-4 py-3 font-medium text-ink-900">{u.full_name}</td>
                    <td className="px-4 py-3 text-ink-600">{u.email}</td>
                    <td className="px-4 py-3 text-ink-600">{u.company || '-'}</td>
                    <td className="px-4 py-3 text-ink-600">{u.phone || '-'}</td>
                    <td className="px-4 py-3">{statusBadge(u.status)}</td>
                    <td className="px-4 py-3 text-ink-400 text-xs">{new Date(u.created_at).toLocaleDateString('es-ES')}</td>
                    <td className="px-4 py-3 text-right">
                      {u.status !== 'aprobado' && (
                        <button onClick={() => updateStatus(u.user_id, 'aprobado')} disabled={actionLoading === u.user_id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-success-600 hover:bg-success-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors mr-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Aprobar
                        </button>
                      )}
                      {u.status !== 'rechazado' && (
                        <button onClick={() => updateStatus(u.user_id, 'rechazado')} disabled={actionLoading === u.user_id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-error-600 hover:bg-error-700 disabled:opacity-60 text-white text-xs font-semibold rounded-lg transition-colors">
                          <XCircle className="w-3.5 h-3.5" /> Rechazar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function FilesTab() {
  const [files, setFiles] = useState<DownloadFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [batchMode, setBatchMode] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'Certificados' });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [batchCategory, setBatchCategory] = useState('Certificados');
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; name: string } | null>(null);
  const [batchResults, setBatchResults] = useState<{ ok: number; fail: number } | null>(null);
  const [showExternal, setShowExternal] = useState(false);
  const [extUploading, setExtUploading] = useState(false);
  const [extForm, setExtForm] = useState({ title: '', description: '', category: 'Catalogos', url: '', thumb: '' });

  const loadFiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('download_files')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setFiles(data);
    setLoading(false);
  };

  useEffect(() => { loadFiles(); }, []);

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (batchMode) {
      if (selectedFiles.length === 0) { setError('Selecciona al menos un archivo.'); return; }
      setError('');
      setUploading(true);
      setBatchResults(null);
      let ok = 0;
      let fail = 0;
      const failures: string[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const f = selectedFiles[i];
        setBatchProgress({ current: i + 1, total: selectedFiles.length, name: f.name });
        try {
          const ext = f.name.split('.').pop() || 'file';
          const baseName = f.name.replace(/\.[^.]+$/, '');
          const filePath = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${i}.${ext}`;
          const { error: uploadError } = await supabase.storage.from('downloads').upload(filePath, f);
          if (uploadError) throw uploadError;
          const { error: insertError } = await supabase.from('download_files').insert({
            title: baseName,
            description: null,
            category: batchCategory,
            file_path: filePath,
            file_size: f.size,
            file_type: ext.toUpperCase(),
            is_active: true,
          });
          if (insertError) throw insertError;
          ok++;
        } catch {
          fail++;
          failures.push(f.name);
        }
      }
      setBatchProgress(null);
      setBatchResults({ ok, fail });
      setSelectedFiles([]);
      if (fail > 0 && failures.length > 0) {
        setError(`No se pudieron subir: ${failures.join(', ')}`);
      }
      await loadFiles();
      setUploading(false);
      return;
    }
    if (selectedFiles.length === 0) { setError('Selecciona un archivo.'); return; }
    setError('');
    setUploading(true);
    try {
      const selectedFile = selectedFiles[0];
      const ext = selectedFile.name.split('.').pop() || 'file';
      const filePath = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('downloads')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase.from('download_files').insert({
        title: form.title,
        description: form.description || null,
        category: form.category,
        file_path: filePath,
        file_size: selectedFile.size,
        file_type: ext.toUpperCase(),
        is_active: true,
      });

      if (insertError) throw insertError;

      setForm({ title: '', description: '', category: 'Certificados' });
      setSelectedFiles([]);
      setShowUpload(false);
      await loadFiles();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al subir.';
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleExternalUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!extForm.title.trim()) { setError('Introduce un titulo.'); return; }
    if (!extForm.url.trim()) { setError('Introduce la URL del PDF.'); return; }
    setError('');
    setExtUploading(true);
    try {
      const { error: insertError } = await supabase.from('download_files').insert({
        title: extForm.title.trim(),
        description: extForm.description || null,
        category: extForm.category,
        file_path: extForm.url.trim(),
        file_size: null,
        file_type: 'PDF',
        is_active: true,
        external_url: extForm.url.trim(),
        thumbnail_url: extForm.thumb.trim() || null,
      });
      if (insertError) throw insertError;
      setExtForm({ title: '', description: '', category: 'Catalogos', url: '', thumb: '' });
      setShowExternal(false);
      await loadFiles();
    } catch (err) {
      setError('No se ha podido guardar el enlace externo.');
    } finally {
      setExtUploading(false);
    }
  };


  const handleDelete = async (file: DownloadFile) => {
    if (!confirm(`¿Eliminar "${file.title}"?`)) return;
    try {
      await supabase.storage.from('downloads').remove([file.file_path]);
      await supabase.from('download_files').delete().eq('id', file.id);
      await loadFiles();
    } catch {
      // ignore
    }
  };

  const toggleActive = async (file: DownloadFile) => {
    await supabase.from('download_files').update({ is_active: !file.is_active }).eq('id', file.id);
    await loadFiles();
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '-';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const CATEGORIES = ['Certificados', 'Fichas técnicas', 'Manuales', 'Documentación', 'Garantías', 'Otros'];

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-primary-600 animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-ink-600 text-sm">{files.length} archivo{files.length !== 1 ? 's' : ''} en el centro de descargas</p>
        <button onClick={() => { setShowUpload(!showUpload); setBatchResults(null); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Subir archivo
        </button>
        <button
          type="button"
          onClick={() => setShowExternal((v) => !v)}
          className="ml-2 inline-flex items-center gap-2 px-4 py-2.5 bg-ink-100 hover:bg-ink-200 text-ink-700 text-sm font-semibold rounded-lg transition-colors"
        >
          Enlace externo
        </button>
      </div>

      {showExternal && (
        <form onSubmit={handleExternalUpload} className="bg-white border border-ink-100 rounded-2xl p-6 mb-6 space-y-4">
          <h3 className="font-display font-bold text-ink-900">Añadir enlace a PDF externo</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Título *</label>
              <input type="text" value={extForm.title} onChange={(e) => setExtForm({ ...extForm, title: e.target.value })} placeholder="Ej: Tarifa LG 2026"
                className="w-full px-4 py-2.5 bg-ink-50 border border-ink-200 rounded-xl text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Categoría</label>
              <input type="text" value={extForm.category} onChange={(e) => setExtForm({ ...extForm, category: e.target.value })} placeholder="Tarifas"
                className="w-full px-4 py-2.5 bg-ink-50 border border-ink-200 rounded-xl text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">URL del PDF *</label>
            <input type="url" value={extForm.url} onChange={(e) => setExtForm({ ...extForm, url: e.target.value })} placeholder="https://..."
              className="w-full px-4 py-2.5 bg-ink-50 border border-ink-200 rounded-xl text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Portada/thumbnail URL (opcional)</label>
            <input type="url" value={extForm.thumb} onChange={(e) => setExtForm({ ...extForm, thumb: e.target.value })} placeholder="/downloads-covers/mi-catalogo.jpg o https://..."
              className="w-full px-4 py-2.5 bg-ink-50 border border-ink-200 rounded-xl text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Descripción</label>
            <input type="text" value={extForm.description} onChange={(e) => setExtForm({ ...extForm, description: e.target.value })} placeholder="Opcional"
              className="w-full px-4 py-2.5 bg-ink-50 border border-ink-200 rounded-xl text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all" />
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowExternal(false)} className="px-4 py-2.5 text-sm font-medium text-ink-600 hover:bg-ink-50 rounded-xl transition-colors">Cancelar</button>
            <button type="submit" disabled={extUploading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors">
              {extUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Guardar enlace
            </button>
          </div>
        </form>
      )}

      {showUpload && (
        <div className="bg-white border border-ink-100 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-ink-900">Subir archivos</h3>
            <div className="flex gap-1 bg-ink-100 rounded-lg p-1">
              <button type="button" onClick={() => { setBatchMode(false); setBatchResults(null); setError(''); }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${!batchMode ? 'bg-white text-primary-700 shadow-sm' : 'text-ink-500'}`}>
                Individual
              </button>
              <button type="button" onClick={() => { setBatchMode(true); setBatchResults(null); setError(''); }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${batchMode ? 'bg-white text-primary-700 shadow-sm' : 'text-ink-500'}`}>
                Por lotes
              </button>
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-3 p-3.5 bg-error-50 border border-error-200 rounded-xl text-error-700 text-sm mb-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />{error}
            </div>
          )}
          {batchResults && (
            <div className="flex items-center gap-3 p-3.5 bg-success-50 border border-success-200 rounded-xl text-success-700 text-sm mb-4">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              Subida completada: {batchResults.ok} archivo(s) correcto(s){batchResults.fail > 0 ? `, ${batchResults.fail} fallido(s)` : ''}.
            </div>
          )}
          {batchProgress && (
            <div className="p-3.5 bg-primary-50 border border-primary-200 rounded-xl text-sm mb-4">
              <div className="flex items-center gap-2 text-primary-700 mb-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Subiendo {batchProgress.current} de {batchProgress.total}: {batchProgress.name}
              </div>
              <div className="w-full h-2 bg-primary-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }} />
              </div>
            </div>
          )}
          <form onSubmit={handleUpload} className="space-y-4">
            {!batchMode ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">Título *</label>
                  <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-ink-50 border border-ink-200 rounded-lg text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
                    placeholder="Ej: Certificado RITE instalación" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1.5">Categoría *</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-2.5 bg-ink-50 border border-ink-200 rounded-lg text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all">
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1.5">Archivo *</label>
                    <input type="file" onChange={(e) => setSelectedFiles(e.target.files ? Array.from(e.target.files) : [])}
                      className="w-full text-sm text-ink-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 file:font-semibold hover:file:bg-primary-100 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">Descripción</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                    className="w-full px-4 py-2.5 bg-ink-50 border border-ink-200 rounded-lg text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all resize-none"
                    placeholder="Descripción del documento..." />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">Categoría para todos los archivos *</label>
                  <select value={batchCategory} onChange={(e) => setBatchCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-ink-50 border border-ink-200 rounded-lg text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">Selecciona uno o varios archivos *</label>
                  <input type="file" multiple onChange={(e) => setSelectedFiles(e.target.files ? Array.from(e.target.files) : [])}
                    className="w-full text-sm text-ink-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-50 file:text-primary-700 file:font-semibold hover:file:bg-primary-100 transition-colors" />
                </div>
                {selectedFiles.length > 0 && (
                  <div className="bg-ink-50 border border-ink-200 rounded-xl p-3">
                    <p className="text-xs font-semibold text-ink-600 mb-2">{selectedFiles.length} archivo(s) seleccionado(s):</p>
                    <ul className="space-y-1 max-h-32 overflow-y-auto">
                      {selectedFiles.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-ink-600">
                          <FileText className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                          {f.name}
                          <span className="text-ink-400">({formatSize(f.size)})</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-ink-400 mt-2">El título de cada archivo será su nombre original (sin extensión).</p>
                  </div>
                )}
              </>
            )}
            <div className="flex gap-3">
              <button type="submit" disabled={uploading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors">
                {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Subiendo...</> : <><Upload className="w-4 h-4" /> Subir{batchMode && selectedFiles.length > 1 ? ` (${selectedFiles.length})` : ''}</>}
              </button>
              <button type="button" onClick={() => { setShowUpload(false); setSelectedFiles([]); setBatchResults(null); setError(''); }}
                className="px-5 py-2.5 bg-ink-100 hover:bg-ink-200 text-ink-700 text-sm font-semibold rounded-lg transition-colors">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {files.length === 0 ? (
        <div className="text-center py-12 text-ink-400 text-sm">No hay archivos subidos todavía.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <div key={file.id} className="bg-white border border-ink-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${file.is_active ? 'bg-primary-50' : 'bg-ink-100'}`}>
                  <FileText className={`w-5 h-5 ${file.is_active ? 'text-primary-600' : 'text-ink-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-ink-900 text-sm truncate">{file.title}</h3>
                  <p className="text-xs text-primary-600 font-medium">{file.category}</p>
                </div>
              </div>
              {file.description && <p className="text-ink-500 text-xs leading-relaxed mb-3 line-clamp-2">{file.description}</p>}
              <div className="flex items-center gap-2 text-xs text-ink-400 mb-3">
                <span>{file.file_type}</span>
                <span>·</span>
                <span>{formatSize(file.file_size)}</span>
                <span>·</span>
                <span className={file.is_active ? 'text-success-600' : 'text-ink-400'}>{file.is_active ? 'Activo' : 'Oculto'}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleActive(file)}
                  className="px-3 py-1.5 bg-ink-100 hover:bg-ink-200 text-ink-700 text-xs font-semibold rounded-lg transition-colors">
                  {file.is_active ? 'Ocultar' : 'Mostrar'}
                </button>
                <button onClick={() => handleDelete(file)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-error-50 hover:bg-error-100 text-error-700 text-xs font-semibold rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
