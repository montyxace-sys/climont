import { useEffect, useState, useCallback } from 'react';
import { Download, Trash2, X, Mail, Phone, Clock, Filter, Briefcase, FileText, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type AppStatus = 'pendiente' | 'revisado' | 'descartado' | 'contratado';

type Application = {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  experience_years: number | null;
  message: string | null;
  cv_file_path: string | null;
  cv_file_name: string | null;
  status: AppStatus;
  created_at: string;
};

const STATUS_CONFIG: Record<AppStatus, { label: string; color: string }> = {
  pendiente: { label: 'Pendiente', color: 'bg-warning-100 text-warning-700' },
  revisado: { label: 'Revisado', color: 'bg-primary-100 text-primary-700' },
  descartado: { label: 'Descartado', color: 'bg-ink-100 text-ink-500' },
  contratado: { label: 'Contratado', color: 'bg-success-100 text-success-700' },
};

const STATUS_OPTIONS: AppStatus[] = ['pendiente', 'revisado', 'descartado', 'contratado'];

function formatRelative(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return 'Hace un momento';
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `Hace ${Math.floor(diff / 86400)} días`;
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function Applications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Application | null>(null);
  const [statusFilter, setStatusFilter] = useState<AppStatus | 'todos'>('todos');

  const loadApplications = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('job_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (statusFilter !== 'todos') {
      query = query.eq('status', statusFilter);
    }

    const { data, error: err } = await query;
    if (err) {
      setError('No se pudieron cargar las candidaturas.');
    } else {
      setApplications(data || []);
      setError(null);
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const updateStatus = async (app: Application, newStatus: AppStatus) => {
    const { error: err } = await supabase
      .from('job_applications')
      .update({ status: newStatus })
      .eq('id', app.id);
    if (err) {
      setError('Error al actualizar el estado.');
    } else {
      loadApplications();
      if (selected?.id === app.id) {
        setSelected({ ...app, status: newStatus });
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar esta candidatura?')) return;
    const { error: err } = await supabase.from('job_applications').delete().eq('id', id);
    if (err) {
      setError('Error al eliminar la candidatura.');
    } else {
      if (selected?.id === id) setSelected(null);
      loadApplications();
    }
  };

  const downloadCv = async (app: Application) => {
    if (!app.cv_file_path) return;
    const { data, error: err } = await supabase.storage
      .from('cvs')
      .download(app.cv_file_path);
    if (err || !data) {
      setError('No se pudo descargar el CV.');
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = app.cv_file_name || app.cv_file_path;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const stats = {
    total: applications.length,
    pendiente: applications.filter((a) => a.status === 'pendiente').length,
    revisado: applications.filter((a) => a.status === 'revisado').length,
    contratado: applications.filter((a) => a.status === 'contratado').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Candidaturas</h1>
        <p className="text-ink-500 text-sm mt-1">
          Gestiona los CV recibidos a través de la página de empleo
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-ink-900' },
          { label: 'Pendientes', value: stats.pendiente, color: 'text-warning-600' },
          { label: 'Revisados', value: stats.revisado, color: 'text-primary-600' },
          { label: 'Contratados', value: stats.contratado, color: 'text-success-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-ink-100 p-4">
            <div className="text-xs text-ink-400 font-medium uppercase tracking-wide">{s.label}</div>
            <div className={`font-display text-2xl font-bold mt-1 ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-error-50 border border-error-200 text-error-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-ink-400" />
        <button
          onClick={() => setStatusFilter('todos')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            statusFilter === 'todos' ? 'bg-primary-600 text-white' : 'bg-white text-ink-600 border border-ink-200 hover:bg-ink-50'
          }`}
        >
          Todos
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              statusFilter === s ? 'bg-primary-600 text-white' : 'bg-white text-ink-600 border border-ink-200 hover:bg-ink-50'
            }`}
          >
            {STATUS_CONFIG[s].label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Briefcase className="w-12 h-12 text-ink-300 mb-4" />
          <p className="text-ink-500 text-sm">No hay candidaturas todavía.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const statusCfg = STATUS_CONFIG[app.status];
            return (
              <div key={app.id} className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4 lg:p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-display font-semibold text-ink-900 text-sm lg:text-base">{app.name}</h3>
                        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-ink-500 mb-1">
                        <Briefcase className="w-3.5 h-3.5 text-ink-400" />
                        {app.position}
                        {app.experience_years !== null && (
                          <span className="text-ink-400">· {app.experience_years} años exp.</span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-400">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {app.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {app.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatRelative(app.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {app.cv_file_path && (
                        <button
                          onClick={() => downloadCv(app)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-primary-50 text-primary-700 text-xs font-medium rounded-lg hover:bg-primary-100 transition-colors"
                          title="Descargar CV"
                        >
                          <Download className="w-4 h-4" /> CV
                        </button>
                      )}
                      <button
                        onClick={() => setSelected(app)}
                        className="p-2 rounded-lg text-ink-500 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        title="Ver detalle"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(app.id)}
                        className="p-2 rounded-lg text-ink-500 hover:bg-error-50 hover:text-error-600 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Quick status buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-ink-50">
                    {STATUS_OPTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(app, s)}
                        className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                          app.status === s
                            ? STATUS_CONFIG[s].color
                            : 'bg-ink-50 text-ink-400 hover:bg-ink-100'
                        }`}
                      >
                        {STATUS_CONFIG[s].label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <div className="min-w-0">
                <h2 className="font-display font-bold text-lg text-ink-900 truncate">{selected.name}</h2>
                <p className="text-xs text-ink-400">{selected.position}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-600 transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Contact info */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-ink-50 rounded-xl">
                  <Mail className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-ink-400">Email</div>
                    <a href={`mailto:${selected.email}`} className="text-sm text-ink-800 hover:text-primary-600 truncate block">
                      {selected.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-ink-50 rounded-xl">
                  <Phone className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-ink-400">Teléfono</div>
                    <a href={`tel:${selected.phone}`} className="text-sm text-ink-800 hover:text-primary-600">
                      {selected.phone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 bg-ink-50 rounded-xl">
                  <div className="text-xs text-ink-400 mb-1">Puesto deseado</div>
                  <div className="text-sm font-medium text-ink-800">{selected.position}</div>
                </div>
                {selected.experience_years !== null && (
                  <div className="p-4 bg-ink-50 rounded-xl">
                    <div className="text-xs text-ink-400 mb-1 flex items-center gap-1">
                      <Award className="w-3 h-3" /> Experiencia
                    </div>
                    <div className="text-sm font-medium text-ink-800">{selected.experience_years} años</div>
                  </div>
                )}
              </div>

              {/* Message */}
              {selected.message && (
                <div>
                  <div className="text-xs text-ink-400 font-medium uppercase tracking-wide mb-2">Mensaje</div>
                  <div className="p-4 bg-ink-50 rounded-xl text-sm text-ink-700 leading-relaxed whitespace-pre-wrap">
                    {selected.message}
                  </div>
                </div>
              )}

              {/* CV download */}
              {selected.cv_file_path && (
                <button
                  onClick={() => downloadCv(selected)}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Descargar CV{selected.cv_file_name ? ` — ${selected.cv_file_name}` : ''}
                </button>
              )}

              {/* Status change */}
              <div className="border-t border-ink-100 pt-4">
                <div className="text-xs text-ink-400 font-medium uppercase tracking-wide mb-2">Estado</div>
                <div className="flex items-center gap-2 flex-wrap">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected, s)}
                      className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                        selected.status === s
                          ? STATUS_CONFIG[s].color
                          : 'bg-ink-50 text-ink-500 hover:bg-ink-100'
                      }`}
                    >
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
