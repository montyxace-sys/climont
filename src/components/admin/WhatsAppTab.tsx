import { useState, useEffect } from 'react';
import { MessageCircle, ExternalLink, RefreshCw, AlertCircle, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type ContactRequest = {
  id: string;
  name: string;
  phone: string;
  city: string | null;
  service_type: string;
  status: string;
  created_at: string;
};

const SERVICE_LABELS: Record<string, string> = {
  instalacion: 'Instalación',
  mantenimiento: 'Mantenimiento',
  reparacion: 'Reparación',
  ventilacion: 'Ventilación y extracción',
  eficiencia: 'Eficiencia energética',
  airzone: 'Climatización inteligente Airzone',
  constructoras: 'Instalaciones y preinstalaciones para constructoras',
};

function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/[\s\-.$$()]/g, '');
  if (cleaned.startsWith('+')) cleaned = cleaned.slice(1);
  if (cleaned.startsWith('00')) cleaned = cleaned.slice(2);
  if (cleaned.startsWith('34') && cleaned.length > 10) {
    // already has country code
  } else if (cleaned.length === 9) {
    cleaned = '34' + cleaned;
  }
  return cleaned;
}

export function WhatsAppTab() {
  const [iframeKey, setIframeKey] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [contacts, setContacts] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('contact_requests')
      .select('id, name, phone, city, service_type, status, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!error && data) {
      setContacts(data);
    }
    setLoading(false);
  };

  const filteredContacts = contacts.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.city || '').toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-success-600" />
            WhatsApp
          </h1>
          <p className="text-ink-500 text-sm mt-1">Chatea con tus clientes directamente desde aquí</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setIframeKey(k => k + 1); setBlocked(false); }}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-ink-200 rounded-xl text-sm font-medium text-ink-700 hover:bg-ink-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Recargar
          </button>
          <a
            href="https://web.whatsapp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-success-600 hover:bg-success-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Abrir en pestaña nueva
          </a>
        </div>
      </div>

      {/* WhatsApp Web iframe attempt */}
      <div className="relative bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden">
        <iframe
          key={iframeKey}
          src="https://web.whatsapp.com"
          className="w-full"
          style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}
          onLoad={() => {
            // WhatsApp blocks framing; show fallback after a short delay
            setTimeout(() => setBlocked(true), 2500);
          }}
          title="WhatsApp Web"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
        {blocked && (
          <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-success-600" />
            </div>
            <h3 className="font-display text-xl font-bold text-ink-900 mb-2">
              WhatsApp Web no se puede incrustar
            </h3>
            <p className="text-ink-500 max-w-md mb-6 leading-relaxed">
              WhatsApp bloquea la carga dentro de otras webs por seguridad. Pulsa el botón para
              abrir WhatsApp Web en una pestaña nueva, o usa los accesos rapidos abajo para escribir
              a tus clientes.
            </p>
            <a
              href="https://web.whatsapp.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-success-600 hover:bg-success-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-success-500/20"
            >
              <MessageCircle className="w-5 h-5" />
              Abrir WhatsApp Web
            </a>
          </div>
        )}
      </div>

      {/* Quick contacts */}
      <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-ink-900">Contactos recientes</h2>
          <span className="text-sm text-ink-400">{filteredContacts.length} contactos</span>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, teléfono o ciudad..."
            className="w-full pl-11 pr-4 py-2.5 bg-ink-50 border border-ink-200 rounded-xl text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-success-200 focus:border-success-400 transition-all"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-3 border-success-200 border-t-success-600 rounded-full animate-spin" />
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-10">
            <AlertCircle className="w-10 h-10 text-ink-300 mx-auto mb-2" />
            <p className="text-ink-500 text-sm">No hay contactos que mostrar</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredContacts.map((contact) => {
              const phone = normalizePhone(contact.phone);
              const waUrl = `https://wa.me/${phone}`;
              return (
                <div
                  key={contact.id}
                  className="flex items-center justify-between gap-3 p-3 bg-ink-50 rounded-xl hover:bg-success-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-ink-900 text-sm truncate">{contact.name}</div>
                    <div className="text-xs text-ink-400 flex items-center gap-2 mt-0.5">
                      <span>{contact.phone}</span>
                      {contact.city && <span>· {contact.city}</span>}
                      <span>· {SERVICE_LABELS[contact.service_type] || contact.service_type}</span>
                    </div>
                  </div>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 bg-success-600 hover:bg-success-700 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Escribir
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
