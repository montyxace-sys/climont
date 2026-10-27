import { useEffect, useState } from 'react';
import { Cookie, X, Check, ExternalLink } from 'lucide-react';
import { updateAnalyticsConsent } from '@/lib/analytics';

const STORAGE_KEY = 'cookie-consent';

type Consent = {
  accepted: boolean;
  analytics: boolean;
  timestamp: string;
};

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const save = (consent: Consent) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    updateAnalyticsConsent();
    setVisible(false);
  };

  const acceptAll = () => {
    save({ accepted: true, analytics: true, timestamp: new Date().toISOString() });
  };

  const acceptSelection = () => {
    save({ accepted: true, analytics, timestamp: new Date().toISOString() });
  };

  const rejectAll = () => {
    save({ accepted: true, analytics: false, timestamp: new Date().toISOString() });
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6" role="dialog" aria-label="Consentimiento de cookies" aria-live="polite">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl shadow-ink-900/15 border border-ink-100 overflow-hidden">
        <div className="flex items-start gap-3 p-5 sm:p-6">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
            <Cookie className="w-5 h-5 text-primary-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-base font-bold text-ink-900 mb-1">
              Uso de cookies
            </h3>
            <p className="text-sm text-ink-500 leading-relaxed">
              Utilizamos cookies propias y de terceros con fines analíticos para mejorar
              tu experiencia. Puedes aceptar todas, rechazar las opcionales o personalizar
              tu elección. Consulta nuestra{' '}
              <a
                href="/politica-de-cookies"
                className="text-primary-600 font-medium hover:underline inline-flex items-center gap-0.5"
              >
                política de cookies
                <ExternalLink className="w-3 h-3" />
              </a>
              .
            </p>
          </div>
          <button
            onClick={() => { rejectAll(); }}
            className="text-ink-300 hover:text-ink-600 transition-colors flex-shrink-0"
            aria-label="Cerrar y rechazar cookies opcionales"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {expanded && (
          <div className="px-5 sm:px-6 pb-4 border-t border-ink-100 pt-4">
            <label className="flex items-center justify-between gap-3 py-2">
              <div>
                <span className="text-sm font-medium text-ink-800">Cookies técnicas (necesarias)</span>
                <p className="text-xs text-ink-500">Imprescindibles para el funcionamiento del sitio.</p>
              </div>
              <span className="text-xs font-medium text-ink-500 bg-ink-100 px-3 py-1.5 rounded-lg">
                Siempre activas
              </span>
            </label>
            <label className="flex items-center justify-between gap-3 py-2 cursor-pointer">
              <div>
                <span className="text-sm font-medium text-ink-800">Cookies analíticas</span>
                <p className="text-xs text-ink-500">Nos ayudan a entender cómo usas la web para mejorarla.</p>
              </div>
              <button
                type="button"
                onClick={() => setAnalytics((prev) => !prev)}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${analytics ? 'bg-primary-600' : 'bg-ink-200'}`}
                aria-pressed={analytics}
                aria-label="Activar cookies analíticas"
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${analytics ? 'translate-x-5' : ''}`}
                />
              </button>
            </label>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 px-5 sm:px-6 pb-5 sm:pb-6">
          {!expanded ? (
            <>
              <button
                onClick={rejectAll}
                className="px-4 py-2.5 text-sm font-medium text-ink-600 hover:text-ink-900 hover:bg-ink-50 rounded-xl transition-colors"
              >
                Rechazar opcionales
              </button>
              <button
                onClick={() => setExpanded(true)}
                className="px-4 py-2.5 text-sm font-medium text-ink-600 hover:text-ink-900 hover:bg-ink-50 rounded-xl transition-colors"
              >
                Personalizar
              </button>
              <button
                onClick={acceptAll}
                className="sm:ml-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors shadow-sm"
              >
                <Check className="w-4 h-4" />
                Aceptar todas
              </button>
            </>
          ) : (
            <>
              <button
                onClick={rejectAll}
                className="px-4 py-2.5 text-sm font-medium text-ink-600 hover:text-ink-900 hover:bg-ink-50 rounded-xl transition-colors"
              >
                Rechazar todas
              </button>
              <button
                onClick={acceptSelection}
                className="sm:ml-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors shadow-sm"
              >
                <Check className="w-4 h-4" />
                Guardar selección
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
