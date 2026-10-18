import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Star, Eye, EyeOff, Save, MessageSquare, ArrowUp, ArrowDown, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';

type Review = {
  id: string;
  author_name: string;
  author_initial: string;
  rating: number;
  review_text: string;
  review_date: string;
  service_label: string;
  is_visible: boolean;
  sort_order: number;
  created_at: string;
  auto_synced: boolean;
  google_review_id: string | null;
};

type ReviewForm = {
  author_name: string;
  author_initial: string;
  rating: string;
  review_text: string;
  review_date: string;
  service_label: string;
  is_visible: boolean;
  sort_order: string;
};

const EMPTY_FORM: ReviewForm = {
  author_name: '',
  author_initial: '',
  rating: '5',
  review_text: '',
  review_date: '',
  service_label: '',
  is_visible: true,
  sort_order: '0',
};

export function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ReviewForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ added: number; skipped: number } | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const loadReviews = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('reviews')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (err) {
      setError('No se pudieron cargar las reseÃ±as.');
    } else {
      setReviews(data || []);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const openNewForm = () => {
    setForm({ ...EMPTY_FORM, sort_order: String(reviews.length) });
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (r: Review) => {
    setForm({
      author_name: r.author_name,
      author_initial: r.author_initial,
      rating: String(r.rating),
      review_text: r.review_text,
      review_date: r.review_date,
      service_label: r.service_label,
      is_visible: r.is_visible,
      sort_order: String(r.sort_order),
    });
    setEditingId(r.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  };

  const handleSave = async () => {
    if (!form.author_name.trim() || !form.review_text.trim()) {
      setError('El nombre del autor y el texto de la reseÃ±a son obligatorios.');
      return;
    }

    const ratingNum = parseInt(form.rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      setError('La valoraciÃ³n debe estar entre 1 y 5.');
      return;
    }

    setSaving(true);
    setError(null);

    const initial = form.author_initial.trim() || form.author_name.trim().charAt(0).toUpperCase();

    const payload = {
      author_name: form.author_name.trim(),
      author_initial: initial,
      rating: ratingNum,
      review_text: form.review_text.trim(),
      review_date: form.review_date.trim(),
      service_label: form.service_label.trim(),
      is_visible: form.is_visible,
      sort_order: parseInt(form.sort_order) || 0,
    };

    if (editingId) {
      const { error: err } = await supabase.from('reviews').update(payload).eq('id', editingId);
      if (err) {
        setError('Error al actualizar la reseÃ±a.');
      } else {
        closeForm();
        loadReviews();
      }
    } else {
      const { error: err } = await supabase.from('reviews').insert(payload);
      if (err) {
        setError('Error al crear la reseÃ±a.');
      } else {
        closeForm();
        loadReviews();
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Â¿Seguro que quieres eliminar esta reseÃ±a?')) return;
    const { error: err } = await supabase.from('reviews').delete().eq('id', id);
    if (err) {
      setError('Error al eliminar la reseÃ±a.');
    } else {
      loadReviews();
    }
  };

  const toggleVisible = async (r: Review) => {
    const { error: err } = await supabase
      .from('reviews')
      .update({ is_visible: !r.is_visible })
      .eq('id', r.id);
    if (err) {
      setError('Error al cambiar la visibilidad.');
    } else {
      loadReviews();
    }
  };

  const moveReview = async (r: Review, direction: 'up' | 'down') => {
    const sorted = [...reviews].sort((a, b) => a.sort_order - b.sort_order);
    const index = sorted.findIndex((x) => x.id === r.id);
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sorted.length - 1) return;

    const swapWith = direction === 'up' ? sorted[index - 1] : sorted[index + 1];
    const updates = [
      { id: r.id, sort_order: swapWith.sort_order },
      { id: swapWith.id, sort_order: r.sort_order },
    ];

    for (const u of updates) {
      await supabase.from('reviews').update({ sort_order: u.sort_order }).eq('id', u.id);
    }
    loadReviews();
  };

  const handleSyncGoogle = async () => {
    setSyncing(true);
    setSyncResult(null);
    setSyncError(null);
    try {
      const fnUrl = `${SUPABASE_URL}/functions/v1/google-reviews?sync=true`;
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const res = await fetch(fnUrl, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Error ${res.status} al contactar con Google`);
      }
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      if (data.synced) {
        setSyncResult({ added: data.synced.added, skipped: data.synced.skipped });
        await loadReviews();
      }
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : 'Error al sincronizar con Google');
    }
    setSyncing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">ReseÃ±as de clientes</h1>
          <p className="text-ink-500 text-sm mt-1">
            {reviews.length} reseÃ±a{reviews.length !== 1 ? 's' : ''} en total Â· {reviews.filter((r) => r.is_visible).length} visibles en la web
            {reviews.filter((r) => r.auto_synced).length > 0 && ` Â· ${reviews.filter((r) => r.auto_synced).length} sincronizadas de Google`}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSyncGoogle}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-ink-200 hover:bg-ink-50 text-ink-700 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sincronizando...' : 'Sincronizar con Google'}
          </button>
          <button
            onClick={openNewForm}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-primary-500/20"
          >
            <Plus className="w-4 h-4" /> AÃ±adir reseÃ±a
          </button>
        </div>
      </div>

      {syncResult && (
        <div className="bg-success-50 border border-success-200 text-success-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {syncResult.added > 0
            ? `Se importaron ${syncResult.added} reseÃ±a${syncResult.added !== 1 ? 's' : ''} nueva${syncResult.added !== 1 ? 's' : ''} de Google.`
            : 'No hay reseÃ±as nuevas para importar. Las reseÃ±as existentes ya estaban sincronizadas.'}
          {syncResult.skipped > 0 && ` (${syncResult.skipped} ya existÃ­an)`}
        </div>
      )}

      {syncError && (
        <div className="bg-error-50 border border-error-200 text-error-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {syncError}
        </div>
      )}

      {error && (
        <div className="bg-error-50 border border-error-200 text-error-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <MessageSquare className="w-12 h-12 text-ink-300 mb-4" />
          <p className="text-ink-500 text-sm mb-4">No hay reseÃ±as todavÃ­a.</p>
          <button
            onClick={openNewForm}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Crear la primera reseÃ±a
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {[...reviews].sort((a, b) => a.sort_order - b.sort_order).map((r, idx, arr) => (
            <div
              key={r.id}
              className={`bg-white rounded-2xl border border-ink-100 shadow-sm p-5 ${!r.is_visible ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveReview(r, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Subir"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveReview(r, 'down')}
                    disabled={idx === arr.length - 1}
                    className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Bajar"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i <= r.rating ? 'text-warning-400 fill-warning-400' : 'text-ink-200 fill-ink-200'}`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-ink-900 text-sm">{r.author_name}</span>
                    {r.review_date && <span className="text-ink-400 text-xs">Â· {r.review_date}</span>}
                    {r.service_label && (
                      <span className="inline-block px-2 py-0.5 bg-primary-50 text-primary-600 text-xs font-medium rounded-full">
                        {r.service_label}
                      </span>
                    )}
                    {r.auto_synced && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-success-50 text-success-600 text-xs font-medium rounded-full">
                        <RefreshCw className="w-3 h-3" /> Google
                      </span>
                    )}
                  </div>
                  <p className="text-ink-600 text-sm leading-relaxed line-clamp-3">{r.review_text}</p>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => toggleVisible(r)}
                    className={`p-2 rounded-lg transition-colors ${r.is_visible ? 'text-success-600 hover:bg-success-50' : 'text-ink-400 hover:bg-ink-100'}`}
                    title={r.is_visible ? 'Ocultar' : 'Mostrar'}
                  >
                    {r.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEditForm(r)}
                    className="p-2 rounded-lg text-ink-500 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-2 rounded-lg text-ink-500 hover:bg-error-50 hover:text-error-600 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink-950/60">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100 bg-white rounded-t-2xl flex-shrink-0">
              <h2 className="font-display font-bold text-lg text-ink-900">
                {editingId ? 'Editar reseÃ±a' : 'Nueva reseÃ±a'}
              </h2>
              <button
                onClick={closeForm}
                className="p-2 rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {error && (
                <div className="bg-error-50 border border-error-200 text-error-700 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">
                    Nombre del cliente <span className="text-error-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.author_name}
                    onChange={(e) => setForm({ ...form, author_name: e.target.value })}
                    placeholder="Ej. Francisco J."
                    className="w-full px-4 py-2.5 bg-white border border-ink-200 rounded-xl text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">Inicial (avatar)</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={form.author_initial}
                    onChange={(e) => setForm({ ...form, author_initial: e.target.value })}
                    placeholder="Auto (primera letra)"
                    className="w-full px-4 py-2.5 bg-white border border-ink-200 rounded-xl text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">ValoraciÃ³n</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      onClick={() => setForm({ ...form, rating: String(i) })}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${i <= parseInt(form.rating) ? 'text-warning-400 fill-warning-400' : 'text-ink-200 fill-ink-200'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  Texto de la reseÃ±a <span className="text-error-500">*</span>
                </label>
                <textarea
                  value={form.review_text}
                  onChange={(e) => setForm({ ...form, review_text: e.target.value })}
                  rows={6}
                  placeholder="Copia aquÃ­ la reseÃ±a del cliente..."
                  className="w-full px-4 py-2.5 bg-white border border-ink-200 rounded-xl text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-y min-h-[140px]"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">Fecha</label>
                  <input
                    type="text"
                    value={form.review_date}
                    onChange={(e) => setForm({ ...form, review_date: e.target.value })}
                    placeholder="Ej. Septiembre 2026"
                    className="w-full px-4 py-2.5 bg-white border border-ink-200 rounded-xl text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">Etiqueta de servicio</label>
                  <input
                    type="text"
                    value={form.service_label}
                    onChange={(e) => setForm({ ...form, service_label: e.target.value })}
                    placeholder="Ej. InstalaciÃ³n por conductos"
                    className="w-full px-4 py-2.5 bg-white border border-ink-200 rounded-xl text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">Orden</label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2.5 bg-white border border-ink-200 rounded-xl text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_visible}
                      onChange={(e) => setForm({ ...form, is_visible: e.target.checked })}
                      className="w-4 h-4 rounded border-ink-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-ink-700">Visible en la web</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-ink-100 bg-white rounded-b-2xl flex-shrink-0">
              <button
                onClick={closeForm}
                className="px-4 py-2.5 text-sm font-medium text-ink-600 rounded-xl hover:bg-ink-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-primary-500/20"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : 'Guardar reseÃ±a'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
