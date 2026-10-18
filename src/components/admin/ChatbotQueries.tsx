import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { MessageCircleQuestion, CheckCircle2, Trash2, RefreshCw, Search, AlertCircle } from 'lucide-react';

type Query = {
  id: string;
  query: string;
  normalized_query: string;
  response_given: string | null;
  times_asked: number;
  resolved: boolean;
  created_at: string;
  last_asked_at: string;
};

export function ChatbotQueries() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unresolved'>('unresolved');
  const [search, setSearch] = useState('');

  const loadQueries = useCallback(async () => {
    setLoading(true);
    setError(null);
    let q = supabase
      .from('chatbot_unanswered_queries')
      .select('*')
      .order('last_asked_at', { ascending: false });

    if (filter === 'unresolved') {
      q = q.eq('resolved', false);
    }

    const { data, error: err } = await q.limit(200);
    if (err) {
      setError('No se pudieron cargar las consultas.');
      setQueries([]);
    } else {
      setQueries(data || []);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    loadQueries();
  }, [loadQueries]);

  const handleResolve = async (id: string) => {
    const { error: err } = await supabase
      .from('chatbot_unanswered_queries')
      .update({ resolved: true })
      .eq('id', id);
    if (err) {
      setError('No se pudo marcar como resuelta.');
      return;
    }
    setQueries((prev) => prev.map((q) => q.id === id ? { ...q, resolved: true } : q));
  };

  const handleDelete = async (id: string) => {
    const { error: err } = await supabase
      .from('chatbot_unanswered_queries')
      .delete()
      .eq('id', id);
    if (err) {
      setError('No se pudo eliminar la consulta.');
      return;
    }
    setQueries((prev) => prev.filter((q) => q.id !== id));
  };

  const filtered = search
    ? queries.filter((q) =>
        q.query.toLowerCase().includes(search.toLowerCase()) ||
        q.normalized_query.includes(search.toLowerCase())
      )
    : queries;

  const unresolvedCount = queries.filter((q) => !q.resolved).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-ink-900 flex items-center gap-2">
            <MessageCircleQuestion className="w-7 h-7 text-primary-600" />
            Consultas del Chatbot
          </h1>
          <p className="text-sm text-ink-500 mt-1">
            Preguntas que el chatbot no supo responder. Revisa estas consultas para mejorar sus respuestas.
            {unresolvedCount > 0 && (
              <span className="ml-2 text-accent-600 font-semibold">· {unresolvedCount} sin resolver</span>
            )}
          </p>
        </div>
        <button
          onClick={loadQueries}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-ink-200 rounded-xl text-sm font-medium text-ink-700 hover:bg-ink-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {error && (
        <div className="bg-error-50 border border-error-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-error-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-error-800">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex bg-ink-100 rounded-lg p-1">
          <button
            onClick={() => setFilter('unresolved')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              filter === 'unresolved' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
            }`}
          >
            Sin resolver
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              filter === 'all' ? 'bg-white text-ink-900 shadow-sm' : 'text-ink-500 hover:text-ink-700'
            }`}
          >
            Todas
          </button>
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar consultas..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-ink-200 rounded-lg text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-700 border-t-primary-400 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-ink-200 rounded-2xl p-12 text-center">
          <MessageCircleQuestion className="w-12 h-12 text-ink-300 mx-auto mb-3" />
          <p className="text-ink-500 font-medium">No hay consultas para mostrar</p>
          <p className="text-sm text-ink-400 mt-1">
            {filter === 'unresolved'
              ? 'Todas las consultas han sido resueltas.'
              : 'Cuando el chatbot no sepa responder una pregunta, aparecerá aquí.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((q) => (
            <div
              key={q.id}
              className={`bg-white border rounded-xl p-4 transition-all ${
                q.resolved ? 'border-ink-200 opacity-60' : 'border-ink-200 hover:border-primary-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink-900 break-words">{q.query}</p>
                  {q.response_given && (
                    <p className="text-xs text-ink-400 mt-1.5 line-clamp-2">
                      Respuesta dada: {q.response_given.slice(0, 120)}...
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2.5 text-xs text-ink-400">
                    <span className="flex items-center gap-1">
                      Preguntada {q.times_asked} {q.times_asked === 1 ? 'vez' : 'veces'}
                    </span>
                    <span>·</span>
                    <span>
                      Última: {new Date(q.last_asked_at).toLocaleDateString('es-ES', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                    {q.resolved && (
                      <>
                        <span>·</span>
                        <span className="text-success-600 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Resuelta
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!q.resolved && (
                    <button
                      onClick={() => handleResolve(q.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-success-50 hover:bg-success-100 text-success-700 text-xs font-medium rounded-lg transition-colors"
                      title="Marcar como resuelta"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolver
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-1.5 text-ink-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
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
    </div>
  );
}
