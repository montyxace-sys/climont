import { useEffect, useState, useMemo } from 'react';
import {
  Mail, Phone, MapPin, Calendar, Search, X, CheckCircle2,
  Clock, MessageCircle, ChevronDown, Inbox, Send, AlertCircle, Loader2,
  Trash2, FileText, XCircle,
} from 'lucide-react';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';

type ContactRequest = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string | null;
  service_type: string;
  installation_type: string | null;
  message: string | null;
  status: string;
  created_at: string;
};

const SERVICE_LABELS: Record<string, string> = {
  instalacion: 'Instalación',
  venta_instalacion: 'Venta e instalación de equipo',
  mantenimiento: 'Mantenimiento',
  reparacion: 'Reparación',
  ventilacion: 'Ventilación y extracción',
  eficiencia: 'Eficiencia energética',
  airzone: 'Climatización inteligente Airzone',
  constructoras: 'Instalaciones y preinstalaciones para constructoras',
};

const INSTALLATION_LABELS: Record<string, string> = {
  splits_pared: 'Splits de pared',
  conductos: 'Centralizado por conductos',
  cassettes: 'Cassettes de techo',
  suelo_techo: 'Equipos suelo/techo',
  fabricacion_conductos: 'Fabricación de conductos (fibra Climaver / chapa galvanizada)',
  preinstalacion_obra: 'Preinstalación en obra nueva / nueva construcción',
  instalacion_obra: 'Instalación completa en obra nueva',
  ventilacion_viviendas: 'Ventilación de viviendas',
  ventilacion_garajes: 'Ventilación de garajes',
  airzone: 'Climatización inteligente Airzone',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pendiente: { label: 'Pendiente', color: 'text-warning-700', bg: 'bg-warning-100' },
  contactado: { label: 'Contactado', color: 'text-primary-700', bg: 'bg-primary-100' },
  presupuestado: { label: 'Presupuestado', color: 'text-accent-700', bg: 'bg-accent-100' },
  completado: { label: 'Completado', color: 'text-success-700', bg: 'bg-success-100' },
  descartado: { label: 'Descartado', color: 'text-ink-600', bg: 'bg-ink-100' },
};

const STATUS_ORDER = ['pendiente', 'contactado', 'presupuestado', 'completado', 'descartado'] as const;

const REPLY_TEMPLATES: { label: string; subject: string; body: string }[] = [
  {
    label: 'Presupuesto inicial',
    subject: 'Presupuesto de aire acondicionado - Climatizaciones Montaño, S.L.',
    body: 'Gracias por contactar con Climatizaciones Montaño, S.L..\n\nHemos recibido tu solicitud y nos gustaría visitarte para evaluar la instalación y prepararte un presupuesto sin compromiso.\n\n¿Te viene bien que pasemos esta semana? Indícanos qué día y franja horaria te va mejor (mañana 8:00-14:00 o tarde 15:00-18:00).\n\nUn saludo,\nEquipo de Climatizaciones Montaño, S.L.',
  },
  {
    label: 'Confirmar visita',
    subject: 'Confirmación de visita técnica - Climatizaciones Montaño, S.L.',
    body: 'Hola,\n\nConfirmamos nuestra visita técnica para el día acordado. Nuestro técnico pasará para evaluar la instalación y asesorarte sobre la mejor opción.\n\nSi necesitas cambiar la fecha o hora, contáctanos en el Llamar.\n\nUn saludo,\nEquipo de Climatizaciones Montaño, S.L.',
  },
  {
    label: 'Seguimiento',
    subject: 'Seguimiento de tu solicitud - Climatizaciones Montaño, S.L.',
    body: 'Hola,\n\nNos ponemos en contacto contigo para dar seguimiento a tu solicitud. ¿Tienes alguna duda o necesitas información adicional?\n\nEstamos a tu disposición en el Llamar o respondiendo a este email.\n\nUn saludo,\nEquipo de Climatizaciones Montaño, S.L.',
  },
  {
    label: 'Cierre',
    subject: 'Gracias por confiar en Climatizaciones Montaño, S.L.',
    body: 'Hola,\n\nGracias por confiar en Climatizaciones Montaño, S.L. para tu proyecto de climatización.\n\nSi en el futuro necesitas mantenimiento, reparación o cualquier otro servicio, no dudes en contactarnos. Recordamos que el mantenimiento periódico alarga la vida útil de tu equipo y reduce el consumo eléctrico.\n\nUn saludo,\nEquipo de Climatizaciones Montaño, S.L.',
  },
];

export function Requests() {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState<ContactRequest | null>(null);
  const [updating, setUpdating] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ContactRequest | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase
      .from('contact_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading requests:', error);
      setLoadError('No se pudieron cargar las solicitudes. Revisa tu conexión e inténtalo de nuevo.');
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(true);
    setStatusError(null);
    const { error } = await supabase
      .from('contact_requests')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating status:', error);
      setStatusError('No se pudo actualizar el estado. Inténtalo de nuevo.');
    } else {
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
      setSelected((prev) => prev ? { ...prev, status } : prev);
    }
    setUpdating(false);
  };

  const deleteRequest = async (id: string) => {
    setDeleting(true);
    setDeleteError(null);
    const { error } = await supabase
      .from('contact_requests')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting request:', error);
      setDeleteError('No se pudo eliminar la solicitud. Inténtalo de nuevo.');
      setDeleting(false);
    } else {
      setRequests((prev) => prev.filter((r) => r.id !== id));
      setSelected(null);
      setDeleteConfirm(null);
      setDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        return r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.phone.includes(q) ||
          (r.city || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [requests, search, filterStatus]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: requests.length, pendiente: 0, contactado: 0, presupuestado: 0, completado: 0, descartado: 0 };
    requests.forEach((r) => { c[r.status] = (c[r.status] || 0) + 1; });
    return c;
  }, [requests]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Solicitudes de presupuesto</h1>
        <p className="text-ink-500 text-sm mt-1">{requests.length} solicitudes en total</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email, teléfono..."
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-ink-200 rounded-xl text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <FilterPill label="Todas" count={counts.all} active={filterStatus === 'all'} onClick={() => setFilterStatus('all')} />
          {STATUS_ORDER.map((s) => (
            <FilterPill
              key={s}
              label={STATUS_CONFIG[s]?.label || s}
              count={counts[s] || 0}
              active={filterStatus === s}
              onClick={() => setFilterStatus(s)}
            />
          ))}
        </div>
      </div>

      {loadError && (
        <div className="bg-error-50 border border-error-200 text-error-700 text-sm rounded-xl px-4 py-3 flex items-center justify-between gap-3">
          <span>{loadError}</span>
          <button
            onClick={loadRequests}
            className="px-3 py-1.5 bg-error-600 hover:bg-error-700 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0"
          >
            Reintentar
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-ink-100 shadow-sm text-center">
          <Inbox className="w-12 h-12 text-ink-300 mx-auto mb-3" />
          <p className="text-ink-500 font-medium">No hay solicitudes que mostrar</p>
          <p className="text-ink-400 text-sm mt-1">
            {search || filterStatus !== 'all' ? 'Prueba a cambiar los filtros' : 'Las solicitudes del formulario aparecerán aquí'}
          </p>
        </div>
      ) : (
        <>
          <div className="hidden lg:block bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-ink-100 bg-ink-50/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wide">Cliente</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wide">Contacto</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wide">Servicio</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wide">Fecha</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-ink-500 uppercase tracking-wide">Estado</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((req) => {
                  const sc = STATUS_CONFIG[req.status] || { label: req.status, color: 'text-ink-600', bg: 'bg-ink-100' };
                  return (
                    <tr
                      key={req.id}
                      onClick={() => setSelected(req)}
                      className="border-b border-ink-50 hover:bg-ink-50/50 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-ink-900 text-sm">{req.name}</div>
                        {req.city && <div className="text-xs text-ink-400">{req.city}</div>}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-sm text-ink-700">{req.email}</div>
                        <div className="text-xs text-ink-400">{req.phone}</div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-ink-700">
                        {SERVICE_LABELS[req.service_type] || req.service_type}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-ink-500">
                        {new Date(req.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${sc.bg} ${sc.color}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <ChevronDown className="w-4 h-4 text-ink-400 -rotate-90" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden space-y-3">
            {filtered.map((req) => {
              const sc = STATUS_CONFIG[req.status] || { label: req.status, color: 'text-ink-600', bg: 'bg-ink-100' };
              return (
                <div
                  key={req.id}
                  onClick={() => setSelected(req)}
                  className="bg-white rounded-2xl p-4 border border-ink-100 shadow-sm active:scale-[0.99] transition-transform cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="font-medium text-ink-900">{req.name}</div>
                      <div className="text-xs text-ink-400">{req.city || 'Sin ciudad'}</div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${sc.bg} ${sc.color} flex-shrink-0`}>
                      {sc.label}
                    </span>
                  </div>
                  <div className="text-sm text-ink-600">{SERVICE_LABELS[req.service_type] || req.service_type}</div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-ink-400">
                    <span>{req.phone}</span>
                    <span>{new Date(req.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {selected && (
        <RequestDrawer
          request={selected}
          onClose={() => setSelected(null)}
          onStatusChange={updateStatus}
          updating={updating}
          statusError={statusError}
          onDelete={() => setDeleteConfirm(selected)}
        />
      )}

      {deleteConfirm && (
        <DeleteConfirmDialog
          request={deleteConfirm}
          deleting={deleting}
          deleteError={deleteError}
          onConfirm={() => deleteRequest(deleteConfirm.id)}
          onCancel={() => { setDeleteConfirm(null); setDeleteError(null); }}
        />
      )}
    </div>
  );
}

function FilterPill({ label, count, active, onClick }: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
        active ? 'bg-ink-900 text-white' : 'bg-white text-ink-600 border border-ink-200 hover:bg-ink-50'
      }`}
    >
      {label}
      <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-ink-100'}`}>
        {count}
      </span>
    </button>
  );
}

function RequestDrawer({
  request,
  onClose,
  onStatusChange,
  updating,
  statusError,
  onDelete,
}: {
  request: ContactRequest;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
  updating: boolean;
  statusError: string | null;
  onDelete: () => void;
}) {
  const [showReply, setShowReply] = useState(false);
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const sc = STATUS_CONFIG[request.status] || { label: request.status, color: 'text-ink-600', bg: 'bg-ink-100' };

  const details = [
    { icon: Mail, label: 'Email', value: request.email, href: `mailto:${request.email}` },
    { icon: Phone, label: 'Teléfono', value: request.phone, href: `tel:${request.phone}` },
    { icon: MessageCircle, label: 'WhatsApp', value: 'Escribir por WhatsApp', href: `https://wa.me/34${request.phone.replace(/\s/g, '')}` },
    { icon: MapPin, label: 'Ciudad', value: request.city || '—', href: null },
    { icon: Calendar, label: 'Fecha', value: new Date(request.created_at).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' }), href: null },
  ];

  const applyTemplate = (template: typeof REPLY_TEMPLATES[0]) => {
    setReplySubject(template.subject);
    setReplyBody(template.body);
    setSendResult(null);
  };

  const sendReply = async () => {
    if (!replySubject.trim() || !replyBody.trim()) return;
    setSending(true);
    setSendResult(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const response = await fetch(`${SUPABASE_URL}/functions/v1/send-reply-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          to_email: request.email,
          to_name: request.name,
          subject: replySubject,
          message: replyBody,
          original_request: {
            service_type: SERVICE_LABELS[request.service_type] || request.service_type,
            message: request.message,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar');
      }

      setSendResult({ type: 'success', message: 'Email enviado correctamente al cliente' });
      if (request.status === 'pendiente') {
        onStatusChange(request.id, 'contactado');
      }
    } catch (err) {
      setSendResult({ type: 'error', message: err instanceof Error ? err.message : 'Error al enviar el email' });
    }
    setSending(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-ink-950/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed right-0 inset-y-0 w-full max-w-md bg-white z-50 shadow-2xl overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-ink-100 px-5 py-4 flex items-center justify-between z-10">
          <h3 className="font-display font-bold text-ink-900">Detalle de solicitud</h3>
          <button onClick={onClose} className="p-2 hover:bg-ink-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-ink-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="font-display text-xl font-bold text-ink-900">{request.name}</h4>
              <p className="text-sm text-ink-500 mt-0.5">
                {SERVICE_LABELS[request.service_type] || request.service_type}
              </p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${sc.bg} ${sc.color} flex-shrink-0`}>
              {sc.label}
            </span>
          </div>

          <div className="space-y-2">
            {details.map((d) => {
              const Icon = d.icon;
              const content = (
                <div className="flex items-center gap-3 p-3 bg-ink-50 rounded-xl hover:bg-primary-50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-ink-400 uppercase tracking-wide font-medium">{d.label}</div>
                    <div className="text-sm text-ink-800 font-medium truncate">{d.value}</div>
                  </div>
                </div>
              );
              return d.href ? (
                <a key={d.label} href={d.href} target={d.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">{content}</a>
              ) : (
                <div key={d.label}>{content}</div>
              );
            })}
          </div>

          {request.installation_type && (
            <div>
              <div className="text-xs text-ink-400 uppercase tracking-wide font-medium mb-1.5">Tipo de instalación</div>
              <div className="p-3 bg-ink-50 rounded-xl text-sm text-ink-800">
                {INSTALLATION_LABELS[request.installation_type] || request.installation_type}
              </div>
            </div>
          )}

          {request.message && (
            <div>
              <div className="text-xs text-ink-400 uppercase tracking-wide font-medium mb-1.5">Mensaje del cliente</div>
              <div className="p-4 bg-ink-50 rounded-xl text-sm text-ink-700 leading-relaxed whitespace-pre-wrap">
                {request.message}
              </div>
            </div>
          )}

          {/* Reply section */}
          <div>
            {!showReply ? (
              <button
                onClick={() => {
                  setShowReply(true);
                  const tmpl = REPLY_TEMPLATES[0];
                  setReplySubject(tmpl.subject);
                  setReplyBody(tmpl.body);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-primary-500/20"
              >
                <Send className="w-4 h-4" />
                Responder al cliente
              </button>
            ) : (
              <div className="space-y-3 p-4 bg-primary-50/50 rounded-2xl border border-primary-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-ink-900 flex items-center gap-2">
                    <Send className="w-4 h-4 text-primary-600" />
                    Responder a {request.name}
                  </h4>
                  <button
                    onClick={() => {
                      setShowReply(false);
                      setSendResult(null);
                    }}
                    className="p-1.5 hover:bg-ink-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-ink-500" />
                  </button>
                </div>

                {/* Templates */}
                <div className="flex gap-1.5 flex-wrap">
                  {REPLY_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.label}
                      onClick={() => applyTemplate(tmpl)}
                      className="px-2.5 py-1 bg-white border border-ink-200 rounded-lg text-xs font-medium text-ink-600 hover:bg-primary-50 hover:border-primary-300 transition-all"
                    >
                      {tmpl.label}
                    </button>
                  ))}
                </div>

                {/* Subject */}
                <div>
                  <label className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-1 block">Asunto</label>
                  <input
                    type="text"
                    value={replySubject}
                    onChange={(e) => setReplySubject(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-ink-200 rounded-lg text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
                  />
                </div>

                {/* Body */}
                <div>
                  <label className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-1 block">Mensaje</label>
                  <textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    rows={7}
                    className="w-full px-3 py-2 bg-white border border-ink-200 rounded-lg text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all resize-none"
                  />
                </div>

                {/* Send result */}
                {sendResult && (
                  <div className={`flex items-start gap-2 p-3 rounded-xl text-sm ${
                    sendResult.type === 'success' ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'
                  }`}>
                    {sendResult.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    )}
                    <span className="leading-relaxed">{sendResult.message}</span>
                  </div>
                )}

                {/* Send button */}
                <button
                  onClick={sendReply}
                  disabled={sending || !replySubject.trim() || !replyBody.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Enviar respuesta</>
                  )}
                </button>

                <p className="text-xs text-ink-400 text-center">
                  Se enviará a {request.email}
                </p>
              </div>
            )}
          </div>

          {/* Delete button */}
          <div className="pt-2 border-t border-ink-100">
            <button
              onClick={onDelete}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-error-600 hover:bg-error-50 text-sm font-medium rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar solicitud
            </button>
          </div>

          {/* Status changer */}
          <div>
            <div className="text-xs text-ink-400 uppercase tracking-wide font-medium mb-2">Cambiar estado</div>
            {statusError && (
              <div className="mb-2 text-xs text-error-600 bg-error-50 rounded-lg px-3 py-2">{statusError}</div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STATUS_ORDER.map((s) => {
                const cfg = STATUS_CONFIG[s];
                const isActive = request.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => onStatusChange(request.id, s)}
                    disabled={updating || isActive}
                    className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? `${cfg.bg} ${cfg.color} ring-2 ring-current ring-offset-1`
                        : 'bg-ink-50 text-ink-500 hover:bg-ink-100'
                    } disabled:opacity-50`}
                  >
                    {s === 'completado' && <CheckCircle2 className="w-4 h-4" />}
                    {s === 'pendiente' && <Clock className="w-4 h-4" />}
                    {s === 'contactado' && <Mail className="w-4 h-4" />}
                    {s === 'presupuestado' && <FileText className="w-4 h-4" />}
                    {s === 'descartado' && <XCircle className="w-4 h-4" />}
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function DeleteConfirmDialog({
  request,
  deleting,
  deleteError,
  onConfirm,
  onCancel,
}: {
  request: ContactRequest;
  deleting: boolean;
  deleteError: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 bg-ink-950/50 backdrop-blur-sm z-50" onClick={onCancel} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl shadow-2xl z-50 overflow-hidden">
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-error-50 flex items-center justify-center mb-4">
            <Trash2 className="w-6 h-6 text-error-600" />
          </div>
          <h3 className="font-display font-bold text-lg text-ink-900 mb-2">¿Eliminar solicitud?</h3>
          <p className="text-sm text-ink-500 mb-1">
            Vas a eliminar la solicitud de <span className="font-semibold text-ink-700">{request.name}</span>.
          </p>
          <p className="text-sm text-ink-500 mb-6">
            Esta acción no se puede deshacer.
          </p>
          {deleteError && (
            <div className="mb-4 text-xs text-error-600 bg-error-50 rounded-lg px-3 py-2">{deleteError}</div>
          )}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={deleting}
              className="flex-1 py-2.5 bg-ink-100 hover:bg-ink-200 text-ink-700 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={deleting}
              className="flex-1 py-2.5 bg-error-600 hover:bg-error-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {deleting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Eliminando...</>
              ) : (
                <><Trash2 className="w-4 h-4" /> Eliminar</>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
