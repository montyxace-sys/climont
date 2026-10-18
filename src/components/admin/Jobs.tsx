import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Save, Wrench, Calendar, Euro, Phone, MapPin, User, Filter, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type JobStatus = 'pendiente' | 'en_progreso' | 'completado' | 'cancelado';
type JobPriority = 'baja' | 'normal' | 'alta' | 'urgente';

type Job = {
  id: string;
  title: string;
  description: string;
  client_name: string;
  client_phone: string | null;
  client_email: string | null;
  address: string | null;
  city: string | null;
  status: JobStatus;
  priority: JobPriority;
  scheduled_date: string | null;
  completed_date: string | null;
  price: number;
  notes: string | null;
  is_active: boolean;
  pue_required: boolean;
  pue_status: string;
  created_at: string;
};

type JobForm = {
  title: string;
  description: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  address: string;
  city: string;
  status: JobStatus;
  priority: JobPriority;
  scheduled_date: string;
  price: string;
  notes: string;
  pue_required: boolean;
};

const EMPTY_FORM: JobForm = {
  title: '',
  description: '',
  client_name: '',
  client_phone: '',
  client_email: '',
  address: '',
  city: '',
  status: 'pendiente',
  priority: 'normal',
  scheduled_date: '',
  price: '',
  notes: '',
  pue_required: false,
};

const STATUS_CONFIG: Record<JobStatus, { label: string; color: string; dot: string }> = {
  pendiente: { label: 'Pendiente', color: 'bg-warning-100 text-warning-700', dot: 'bg-warning-500' },
  en_progreso: { label: 'En progreso', color: 'bg-primary-100 text-primary-700', dot: 'bg-primary-500' },
  completado: { label: 'Completado', color: 'bg-success-100 text-success-700', dot: 'bg-success-500' },
  cancelado: { label: 'Cancelado', color: 'bg-ink-100 text-ink-500', dot: 'bg-ink-400' },
};

const PRIORITY_CONFIG: Record<JobPriority, { label: string; color: string }> = {
  baja: { label: 'Baja', color: 'bg-ink-100 text-ink-500' },
  normal: { label: 'Normal', color: 'bg-ink-100 text-ink-600' },
  alta: { label: 'Alta', color: 'bg-accent-100 text-accent-700' },
  urgente: { label: 'Urgente', color: 'bg-error-100 text-error-700' },
};

const STATUS_OPTIONS: JobStatus[] = ['pendiente', 'en_progreso', 'completado', 'cancelado'];
const PRIORITY_OPTIONS: JobPriority[] = ['baja', 'normal', 'alta', 'urgente'];

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(price);
}

export function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<JobForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'todos'>('todos');

  const loadJobs = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('jobs').select('*').order('created_at', { ascending: false });
    if (statusFilter !== 'todos') {
      query = query.eq('status', statusFilter);
    }
    const { data, error: err } = await query;
    if (err) {
      setError('No se pudieron cargar los trabajos.');
    } else {
      setJobs(data || []);
      setError(null);
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const openNewForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (j: Job) => {
    setForm({
      title: j.title,
      description: j.description,
      client_name: j.client_name,
      client_phone: j.client_phone || '',
      client_email: j.client_email || '',
      address: j.address || '',
      city: j.city || '',
      status: j.status,
      priority: j.priority,
      scheduled_date: j.scheduled_date || '',
      price: j.price > 0 ? String(j.price) : '',
      notes: j.notes || '',
      pue_required: j.pue_required,
    });
    setEditingId(j.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.client_name.trim()) {
      setError('Título, descripción y cliente son obligatorios.');
      return;
    }

    const priceNum = form.price ? parseFloat(form.price) : 0;
    if (isNaN(priceNum) || priceNum < 0) {
      setError('El precio debe ser un número válido.');
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      client_name: form.client_name.trim(),
      client_phone: form.client_phone.trim() || null,
      client_email: form.client_email.trim() || null,
      address: form.address.trim() || null,
      city: form.city.trim() || null,
      status: form.status,
      priority: form.priority,
      scheduled_date: form.scheduled_date || null,
      completed_date: form.status === 'completado' && !editingId
        ? new Date().toISOString().split('T')[0]
        : form.status === 'completado'
          ? undefined
          : null,
      price: priceNum,
      notes: form.notes.trim() || null,
      pue_required: form.pue_required,
      pue_status: 'no_registrado',
    };

    if (editingId) {
      const { error: err } = await supabase
        .from('jobs')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', editingId);
      if (err) {
        setError('Error al actualizar el trabajo.');
      } else {
        closeForm();
        loadJobs();
      }
    } else {
      const { error: err } = await supabase.from('jobs').insert(payload);
      if (err) {
        setError('Error al crear el trabajo.');
      } else {
        closeForm();
        loadJobs();
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar este trabajo?')) return;
    const { error: err } = await supabase.from('jobs').delete().eq('id', id);
    if (err) {
      setError('Error al eliminar el trabajo.');
    } else {
      loadJobs();
    }
  };

  const cycleStatus = async (j: Job) => {
    const idx = STATUS_OPTIONS.indexOf(j.status);
    const next = STATUS_OPTIONS[(idx + 1) % STATUS_OPTIONS.length];
    const { error: err } = await supabase
      .from('jobs')
      .update({
        status: next,
        completed_date: next === 'completado' ? new Date().toISOString().split('T')[0] : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', j.id);
    if (err) {
      setError('Error al cambiar el estado.');
    } else {
      loadJobs();
    }
  };

  const inputClass = 'w-full px-4 py-2.5 bg-ink-50 border border-ink-200 rounded-xl text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all';

  const stats = {
    total: jobs.length,
    pendiente: jobs.filter((j) => j.status === 'pendiente').length,
    en_progreso: jobs.filter((j) => j.status === 'en_progreso').length,
    completado: jobs.filter((j) => j.status === 'completado').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Trabajos</h1>
          <p className="text-ink-500 text-sm mt-1">
            Gestiona los trabajos y asignaciones del taller
          </p>
        </div>
        <button
          onClick={openNewForm}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-primary-500/20"
        >
          <Plus className="w-4 h-4" /> Añadir trabajo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-ink-900' },
          { label: 'Pendientes', value: stats.pendiente, color: 'text-warning-600' },
          { label: 'En progreso', value: stats.en_progreso, color: 'text-primary-600' },
          { label: 'Completados', value: stats.completado, color: 'text-success-600' },
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
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Wrench className="w-12 h-12 text-ink-300 mb-4" />
          <p className="text-ink-500 text-sm mb-4">No hay trabajos registrados todavía.</p>
          <button
            onClick={openNewForm}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Crear el primer trabajo
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((j) => {
            const statusCfg = STATUS_CONFIG[j.status];
            const priorityCfg = PRIORITY_CONFIG[j.priority];
            return (
              <div key={j.id} className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-4 lg:p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-display font-semibold text-ink-900 text-sm lg:text-base">{j.title}</h3>
                        <button
                          onClick={() => cycleStatus(j)}
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded-full transition-colors ${statusCfg.color}`}
                          title="Click para cambiar estado"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                          {statusCfg.label}
                        </button>
                        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${priorityCfg.color}`}>
                          {priorityCfg.label}
                        </span>
                        {j.pue_required && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-700">
                            <FileText className="w-3 h-3" />
                            PUE
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-ink-500 line-clamp-2">{j.description}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => openEditForm(j)}
                        className="p-2 rounded-lg text-ink-500 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(j.id)}
                        className="p-2 rounded-lg text-ink-500 hover:bg-error-50 hover:text-error-600 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-500">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-ink-400" />
                      {j.client_name}
                    </span>
                    {j.client_phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-ink-400" />
                        {j.client_phone}
                      </span>
                    )}
                    {j.city && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-ink-400" />
                        {j.city}
                      </span>
                    )}
                    {j.scheduled_date && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-ink-400" />
                        {formatDate(j.scheduled_date)}
                      </span>
                    )}
                    {j.price > 0 && (
                      <span className="flex items-center gap-1.5 font-medium text-ink-700">
                        <Euro className="w-3.5 h-3.5 text-ink-400" />
                        {formatPrice(j.price)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="font-display font-bold text-lg text-ink-900">
                {editingId ? 'Editar trabajo' : 'Nuevo trabajo'}
              </h2>
              <button
                onClick={closeForm}
                className="p-2 rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-600 transition-colors"
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

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  Título <span className="text-error-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ej. Instalación split Daikin 3500 frigorías"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  Descripción <span className="text-error-500">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="Describe el trabajo a realizar, materiales, especificaciones..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">
                    Cliente <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.client_name}
                    onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                    placeholder="Nombre del cliente"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">Teléfono</label>
                  <input
                    type="tel"
                    value={form.client_phone}
                    onChange={(e) => setForm({ ...form, client_phone: e.target.value })}
                    placeholder="600 123 456"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={form.client_email}
                    onChange={(e) => setForm({ ...form, client_email: e.target.value })}
                    placeholder="cliente@email.com"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">Ciudad</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Sevilla, Alcalá..."
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Dirección</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Calle, número, piso..."
                  className={inputClass}
                />
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">Estado</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as JobStatus })}
                    className={inputClass}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">Prioridad</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as JobPriority })}
                    className={inputClass}
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">Fecha planificada</label>
                  <input
                    type="date"
                    value={form.scheduled_date}
                    onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">Precio (€)</label>
                  <div className="relative">
                    <Euro className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="0.00"
                      className={`w-full pl-10 pr-4 py-2.5 bg-ink-50 border border-ink-200 rounded-xl text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.pue_required}
                    onChange={(e) => setForm({ ...form, pue_required: e.target.checked })}
                    className="w-4 h-4 rounded border-ink-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-ink-700 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-primary-600" />
                    Requiere PUE (alta en Junta de Andalucía)
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Notas internas</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  placeholder="Notas para el equipo técnico..."
                  className={`${inputClass} resize-none`}
                />
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
