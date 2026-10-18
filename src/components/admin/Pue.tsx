import { useEffect, useState, useCallback } from 'react';
import { ExternalLink, Pencil, X, Save, Wrench, FileText, CheckCircle2, Clock3, CircleDashed, Filter, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type PueStatus = 'no_registrado' | 'pendiente' | 'registrado';

type Job = {
  id: string;
  title: string;
  description: string;
  client_name: string;
  client_phone: string | null;
  client_email: string | null;
  address: string | null;
  city: string | null;
  status: string;
  scheduled_date: string | null;
  completed_date: string | null;
  pue_required: boolean;
  pue_status: PueStatus;
  pue_registration_number: string | null;
  pue_registered_date: string | null;
  equipment_brand: string | null;
  equipment_model: string | null;
  equipment_serial: string | null;
  equipment_power_kw: number | null;
  equipment_type: string | null;
  created_at: string;
};

type PueForm = {
  pue_status: PueStatus;
  pue_registration_number: string;
  pue_registered_date: string;
  equipment_brand: string;
  equipment_model: string;
  equipment_serial: string;
  equipment_power_kw: string;
  equipment_type: string;
};

const PUE_STATUS_CONFIG: Record<PueStatus, { label: string; color: string; icon: typeof CircleDashed }> = {
  no_registrado: { label: 'No registrado', color: 'bg-ink-100 text-ink-500', icon: CircleDashed },
  pendiente: { label: 'Pendiente', color: 'bg-warning-100 text-warning-700', icon: Clock3 },
  registrado: { label: 'Registrado', color: 'bg-success-100 text-success-700', icon: CheckCircle2 },
};

const EQUIPMENT_TYPES = [
  'Split',
  'Conductos',
  'Cassette',
  'Aerotermia',
  'Solar térmica',
  'Ventilación',
  'Suelo radiante',
  'Otro',
];

const PUE_PORTAL_URL = 'https://www.juntadeandalucia.es/empleoempresaycomercio/oficinavirtual/pues_bandeja/inicioSesion.do';

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function Pue() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [form, setForm] = useState<PueForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<PueStatus | 'todos'>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const loadJobs = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('jobs')
      .select('*')
      .eq('pue_required', true)
      .order('created_at', { ascending: false });

    if (statusFilter !== 'todos') {
      query = query.eq('pue_status', statusFilter);
    }

    const { data, error: err } = await query;
    if (err) {
      setError('No se pudieron cargar los trabajos PUE.');
    } else {
      setJobs(data || []);
      setError(null);
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const openEditForm = (job: Job) => {
    setEditingJob(job);
    setForm({
      pue_status: job.pue_status,
      pue_registration_number: job.pue_registration_number || '',
      pue_registered_date: job.pue_registered_date || '',
      equipment_brand: job.equipment_brand || '',
      equipment_model: job.equipment_model || '',
      equipment_serial: job.equipment_serial || '',
      equipment_power_kw: job.equipment_power_kw ? String(job.equipment_power_kw) : '',
      equipment_type: job.equipment_type || '',
    });
  };

  const closeForm = () => {
    setEditingJob(null);
    setForm(null);
    setError(null);
  };

  const handleSave = async () => {
    if (!editingJob || !form) return;
    setSaving(true);
    setError(null);

    const powerKw = form.equipment_power_kw ? parseFloat(form.equipment_power_kw) : null;

    const payload = {
      pue_status: form.pue_status,
      pue_registration_number: form.pue_registration_number.trim() || null,
      pue_registered_date: form.pue_status === 'registrado'
        ? (form.pue_registered_date || new Date().toISOString().split('T')[0])
        : null,
      equipment_brand: form.equipment_brand.trim() || null,
      equipment_model: form.equipment_model.trim() || null,
      equipment_serial: form.equipment_serial.trim() || null,
      equipment_power_kw: powerKw,
      equipment_type: form.equipment_type || null,
      updated_at: new Date().toISOString(),
    };

    const { error: err } = await supabase
      .from('jobs')
      .update(payload)
      .eq('id', editingJob.id);

    if (err) {
      setError('Error al guardar los datos PUE.');
    } else {
      closeForm();
      loadJobs();
    }
    setSaving(false);
  };

  const cyclePueStatus = async (job: Job) => {
    const order: PueStatus[] = ['no_registrado', 'pendiente', 'registrado'];
    const idx = order.indexOf(job.pue_status);
    const next = order[(idx + 1) % order.length];
    const { error: err } = await supabase
      .from('jobs')
      .update({
        pue_status: next,
        pue_registered_date: next === 'registrado' ? new Date().toISOString().split('T')[0] : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', job.id);
    if (err) {
      setError('Error al cambiar el estado PUE.');
    } else {
      loadJobs();
    }
  };

  const inputClass = 'w-full px-4 py-2.5 bg-ink-50 border border-ink-200 rounded-xl text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all';

  const filteredJobs = searchTerm.trim()
    ? jobs.filter((j) => {
        const s = searchTerm.toLowerCase();
        return (
          j.title.toLowerCase().includes(s) ||
          j.client_name.toLowerCase().includes(s) ||
          (j.equipment_brand || '').toLowerCase().includes(s) ||
          (j.equipment_model || '').toLowerCase().includes(s) ||
          (j.equipment_serial || '').toLowerCase().includes(s) ||
          (j.pue_registration_number || '').toLowerCase().includes(s)
        );
      })
    : jobs;

  const stats = {
    total: jobs.length,
    no_registrado: jobs.filter((j) => j.pue_status === 'no_registrado').length,
    pendiente: jobs.filter((j) => j.pue_status === 'pendiente').length,
    registrado: jobs.filter((j) => j.pue_status === 'registrado').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">PUE — Junta de Andalucía</h1>
          <p className="text-ink-500 text-sm mt-1">
            Alta de equipos instalados en el registro PUE
          </p>
        </div>
        <a
          href={PUE_PORTAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-primary-500/20"
        >
          <ExternalLink className="w-4 h-4" /> Abrir portal PUE
        </a>
      </div>

      {/* Info banner */}
      <div className="bg-primary-50 border border-primary-200 rounded-2xl p-4 flex items-start gap-3">
        <FileText className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-primary-800">
          <p className="font-medium mb-1">¿Qué es el PUE?</p>
          <p className="text-primary-700">
            El Puesta en Servicio de Equipos es el registro obligatorio de la Junta de Andalucía para dar de alta
            los equipos de climatización instalados. Marca los trabajos que lo requieran desde la pestaña de Trabajos
            y gestiona aquí su estado de registro.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total PUE', value: stats.total, color: 'text-ink-900' },
          { label: 'No registrados', value: stats.no_registrado, color: 'text-ink-500' },
          { label: 'Pendientes', value: stats.pendiente, color: 'text-warning-600' },
          { label: 'Registrados', value: stats.registrado, color: 'text-success-600' },
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

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, equipo, nº registro..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-ink-200 rounded-xl text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>
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
          {(['no_registrado', 'pendiente', 'registrado'] as PueStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                statusFilter === s ? 'bg-primary-600 text-white' : 'bg-white text-ink-600 border border-ink-200 hover:bg-ink-50'
              }`}
            >
              {PUE_STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FileText className="w-12 h-12 text-ink-300 mb-4" />
          <p className="text-ink-500 text-sm mb-2">
            {jobs.length === 0
              ? 'No hay trabajos marcados como PUE todavía.'
              : 'No se encontraron resultados para tu búsqueda.'}
          </p>
          {jobs.length === 0 && (
            <p className="text-ink-400 text-xs max-w-md">
              Ve a la pestaña de Trabajos y marca «Requiere PUE» en los trabajos que necesiten alta en la Junta de Andalucía.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((j) => {
            const statusCfg = PUE_STATUS_CONFIG[j.pue_status];
            const StatusIcon = statusCfg.icon;
            return (
              <div key={j.id} className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4 lg:p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-display font-semibold text-ink-900 text-sm lg:text-base">{j.title}</h3>
                        <button
                          onClick={() => cyclePueStatus(j)}
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full transition-colors ${statusCfg.color}`}
                          title="Click para cambiar estado PUE"
                        >
                          <StatusIcon className="w-3 h-3" />
                          {statusCfg.label}
                        </button>
                      </div>
                      <p className="text-sm text-ink-500 line-clamp-1">{j.client_name} — {j.city || 'Sin ciudad'}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => openEditForm(j)}
                        className="p-2 rounded-lg text-ink-500 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        title="Editar datos PUE"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <a
                        href={PUE_PORTAL_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg text-ink-500 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        title="Ir al portal PUE"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {/* Equipment info */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-ink-500">
                      <span className="text-ink-400 font-medium">Equipo:</span>
                      <span className="text-ink-700">{[j.equipment_brand, j.equipment_model].filter(Boolean).join(' ') || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-ink-500">
                      <span className="text-ink-400 font-medium">Nº serie:</span>
                      <span className="text-ink-700">{j.equipment_serial || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-ink-500">
                      <span className="text-ink-400 font-medium">Potencia:</span>
                      <span className="text-ink-700">{j.equipment_power_kw ? `${j.equipment_power_kw} kW` : '—'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-ink-500">
                      <span className="text-ink-400 font-medium">Nº registro PUE:</span>
                      <span className="text-ink-700 font-medium">{j.pue_registration_number || '—'}</span>
                    </div>
                  </div>

                  {j.pue_registered_date && (
                    <div className="mt-2 text-xs text-success-600 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Registrado el {formatDate(j.pue_registered_date)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit modal */}
      {editingJob && form && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <div className="min-w-0">
                <h2 className="font-display font-bold text-lg text-ink-900 truncate">Datos PUE</h2>
                <p className="text-xs text-ink-400 truncate">{editingJob.title} — {editingJob.client_name}</p>
              </div>
              <button
                onClick={closeForm}
                className="p-2 rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-600 transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {error && (
                <div className="bg-error-50 border border-error-200 text-error-700 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              {/* Equipment section */}
              <div>
                <h3 className="text-sm font-semibold text-ink-700 mb-3 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-primary-600" />
                  Equipo instalado
                </h3>
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-1.5">Marca</label>
                      <input
                        type="text"
                        value={form.equipment_brand}
                        onChange={(e) => setForm({ ...form, equipment_brand: e.target.value })}
                        placeholder="Daikin, Mitsubishi, Samsung..."
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-1.5">Modelo</label>
                      <input
                        type="text"
                        value={form.equipment_model}
                        onChange={(e) => setForm({ ...form, equipment_model: e.target.value })}
                        placeholder="FTXB35C, MSZ-HR35VF..."
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-1.5">Número de serie</label>
                      <input
                        type="text"
                        value={form.equipment_serial}
                        onChange={(e) => setForm({ ...form, equipment_serial: e.target.value })}
                        placeholder="S/N del equipo"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-1.5">Tipo de equipo</label>
                      <select
                        value={form.equipment_type}
                        onChange={(e) => setForm({ ...form, equipment_type: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">Selecciona un tipo</option>
                        {EQUIPMENT_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-1.5">Potencia (kW)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.equipment_power_kw}
                        onChange={(e) => setForm({ ...form, equipment_power_kw: e.target.value })}
                        placeholder="3.50"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Registration section */}
              <div className="border-t border-ink-100 pt-5">
                <h3 className="text-sm font-semibold text-ink-700 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary-600" />
                  Estado del registro PUE
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1.5">Estado PUE</label>
                    <select
                      value={form.pue_status}
                      onChange={(e) => setForm({ ...form, pue_status: e.target.value as PueStatus })}
                      className={inputClass}
                    >
                      <option value="no_registrado">No registrado</option>
                      <option value="pendiente">Pendiente</option>
                      <option value="registrado">Registrado</option>
                    </select>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-1.5">Nº de registro PUE</label>
                      <input
                        type="text"
                        value={form.pue_registration_number}
                        onChange={(e) => setForm({ ...form, pue_registration_number: e.target.value })}
                        placeholder="Nº asignado por la Junta"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-1.5">Fecha de registro</label>
                      <input
                        type="date"
                        value={form.pue_registered_date}
                        onChange={(e) => setForm({ ...form, pue_registered_date: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Link to portal */}
              <div className="bg-primary-50 rounded-xl p-4 flex items-center gap-3">
                <ExternalLink className="w-5 h-5 text-primary-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-primary-800 font-medium">Portal PUE Junta de Andalucía</p>
                  <p className="text-xs text-primary-600">Abre el portal para registrar el equipo</p>
                </div>
                <a
                  href={PUE_PORTAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0"
                >
                  Abrir
                </a>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-ink-100 sticky bottom-0 bg-white rounded-b-2xl">
              <button
                onClick={closeForm}
                className="px-4 py-2.5 text-sm font-medium text-ink-600 rounded-xl hover:bg-ink-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
