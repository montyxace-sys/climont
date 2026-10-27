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
    <div
      className="fixed bottom-0 left-0 right-0 z-[60] px-3 pb-3 sm:bottom-4 sm:left-4 sm:right-auto sm:px-0 sm:pb-0 sm:max-w-[390px]"
      role="dialog"
      aria-label="Consentimiento de cookies"
      aria-live="polite"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg shadow-ink-900/10 border border-ink-100 overflow-hidden">
        {!expanded ? (
          <div className="p-3 sm:p-4">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                <Cookie className="w-4 h-4 text-primary-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-sm font-bold text-ink-900 leading-tight">
                  Cookies
                </h3>
                <p className="text-xs text-ink-500 leading-snug mt-0.5">
                  Usamos cookies propias y de terceros con fines analíticos. Puedes
                  aceptarlas, rechazarlas o personalizar tu elección.{' '}
                  <a
                    href="/politica-de-cookies"
                    className="text-primary-600 font-medium hover:underline"
                  >
                    Política
                  </a>
                  .
                </p>
              </div>
              <button
                onClick={rejectAll}
                className="text-ink-300 hover:text-ink-600 transition-colors flex-shrink-0 -mt-0.5"
                aria-label="Cerrar y rechazar cookies opcionales"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 mt-2.5">
              <button
                onClick={() => setExpanded(true)}
                className="px-2.5 py-1.5 text-xs font-medium text-ink-600 hover:text-ink-900 hover:bg-ink-50 rounded-lg transition-colors"
              >
                Personalizar
              </button>
              <button
                onClick={rejectAll}
                className="px-2.5 py-1.5 text-xs font-medium text-ink-600 hover:text-ink-900 hover:bg-ink-50 rounded-lg transition-colors"
              >
                Rechazar
              </button>
              <button
                onClick={acceptAll}
                className="ml-auto inline-flex items-center justify-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                Aceptar todas
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 sm:p-4 border-t border-ink-100">
            <label className="flex items-center justify-between gap-3 py-1.5">
              <div>
                <span className="text-xs sm:text-sm font-medium text-ink-800">
                  Cookies técnicas (necesarias)
                </span>
                <p className="text-[11px] text-ink-500">Imprescindibles para el funcionamiento del sitio.</p>
              </div>
              <span className="text-[11px] font-medium text-ink-500 bg-ink-100 px-2.5 py-1 rounded-lg">
                Siempre activas
              </span>
            </label>
            <label className="flex items-center justify-between gap-3 py-1.5 cursor-pointer">
              <div>
                <span className="text-xs sm:text-sm font-medium text-ink-800">Cookies analíticas</span>
                <p className="text-[11px] text-ink-500">Nos ayudan a entender cómo usas la web.</p>
              </div>
              <button
                type="button"
                onClick={() => setAnalytics((prev) => !prev)}
                className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${analytics ? 'bg-primary-600' : 'bg-ink-200'}`}
                aria-pressed={analytics}
                aria-label="Activar cookies analíticas"
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${analytics ? 'translate-x-4' : ''}`}
                />
              </button>
            </label>

            <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-ink-100">
              <button
                onClick={rejectAll}
                className="px-2.5 py-1.5 text-xs font-medium text-ink-600 hover:text-ink-900 hover:bg-ink-50 rounded-lg transition-colors"
              >
                Rechazar todas
              </button>
              <button
                onClick={acceptAll}
                className="px-2.5 py-1.5 text-xs font-medium text-ink-600 hover:text-ink-900 hover:bg-ink-50 rounded-lg transition-colors"
              >
                Aceptar todas
              </button>
              <button
                onClick={acceptSelection}
                className="ml-auto inline-flex items-center justify-center gap-1 px-3.5 py-1.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                Guardar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
