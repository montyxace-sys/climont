import { useState, useCallback, useEffect } from 'react';
import {
  Mail,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Info,
  Settings,
  X,
  Save,
  CheckCircle2,
  XCircle,
  Loader2,
  Shield,
  Monitor,
  Download,
  Apple,
} from 'lucide-react';
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase';

type ConnectionState = 'idle' | 'checking' | 'connected' | 'disconnected';

const PROTON_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/proton-proxy`;

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
  };
}

export function ProtonMail() {
  const [connection, setConnection] = useState<ConnectionState>('idle');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [connectedUser, setConnectedUser] = useState<string | null>(null);
  const [has2fa, setHas2fa] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '', twofa: '' });
  const [savingCreds, setSavingCreds] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAppModal, setShowAppModal] = useState(false);

  const openDesktopApp = () => {
    const protocols = ['mailto:', 'protonmail://', 'proton-mail://'];
    let idx = 0;
    let launched = false;

    const tryNext = () => {
      if (idx >= protocols.length) {
        if (!launched) setTimeout(() => setShowAppModal(true), 800);
        return;
      }
      const proto = protocols[idx++];
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      const cleanup = () => {
        if (iframe.parentNode) document.body.removeChild(iframe);
      };
      iframe.onload = () => {
        launched = true;
        cleanup();
      };
      iframe.src = proto;
      setTimeout(() => {
        cleanup();
        tryNext();
      }, 800);
    };
    tryNext();
  };

  const checkConnection = useCallback(async () => {
    setConnection('checking');
    setConnectionError(null);
    try {
      const res = await fetch(`${PROTON_FUNCTION_URL}?action=check&service=mail`, {
        headers: await getAuthHeaders(),
      });
      const data = await res.json();
      if (data.connected) {
        setConnection('connected');
        setConnectedUser(data.username || null);
        setHas2fa(data.has2fa || false);
      } else {
        setConnection('disconnected');
        setConnectionError(data.error || 'No se pudo conectar');
      }
    } catch {
      setConnection('disconnected');
      setConnectionError('Error de red al contactar con el servidor');
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const handleSaveCredentials = async () => {
    if (!credentials.username.trim() || !credentials.password.trim()) {
      setError('Email y contrasena son obligatorios');
      return;
    }
    setSavingCreds(true);
    setError(null);
    try {
      const res = await fetch(`${PROTON_FUNCTION_URL}?action=update-credentials`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          service: 'mail',
          username: credentials.username.trim(),
          password: credentials.password,
          twofa: credentials.twofa.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al guardar credenciales');
      } else {
        setShowSettings(false);
        setCredentials({ username: '', password: '', twofa: '' });
        checkConnection();
      }
    } catch {
      setError('Error de red al guardar credenciales');
    }
    setSavingCreds(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 flex items-center gap-2">
            <Mail className="w-6 h-6 text-accent-600" />
            Proton Mail
          </h1>
          <p className="text-ink-500 text-sm mt-1">
            Correo electronico cifrado y seguro de Proton
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-ink-200 text-ink-600 hover:bg-ink-50 text-sm font-medium rounded-xl transition-colors"
          >
            <Settings className="w-4 h-4" /> Configurar
          </button>
          <button
            onClick={openDesktopApp}
            className="flex items-center gap-2 px-4 py-2.5 bg-ink-900 hover:bg-ink-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-ink-900/20"
          >
            <Monitor className="w-4 h-4" />
            App de PC
          </button>
          <a
            href="https://mail.proton.me"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-accent-600 hover:bg-accent-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-accent-500/20"
          >
            <ExternalLink className="w-4 h-4" />
            Web
          </a>
        </div>
      </div>

      <div className="bg-accent-50 border border-accent-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-accent-700">
          Proton Mail es el correo electronico cifrado de extremo a extremo de Proton. Tus mensajes estan protegidos con cifrado de extremo a extremo. Desde aqui puedes acceder a la web de Proton Mail directamente.
        </p>
      </div>

      {connection === 'checking' && (
        <div className="bg-accent-50 border border-accent-200 rounded-2xl p-4 flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-accent-600 animate-spin" />
          <span className="text-sm text-accent-700">Verificando credenciales de Proton...</span>
        </div>
      )}

      {connection === 'connected' && (
        <div className="bg-success-50 border border-success-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-success-600 flex-shrink-0" />
          <div className="flex-1">
            <span className="text-sm font-medium text-success-700">Credenciales configuradas</span>
            {connectedUser && (
              <span className="text-xs text-success-600 ml-2">Â· {connectedUser}</span>
            )}
            {has2fa && (
              <span className="text-xs text-success-600 ml-2 flex items-center gap-1 inline-flex">
                <Shield className="w-3 h-3" /> 2FA activado
              </span>
            )}
          </div>
        </div>
      )}

      {connection === 'disconnected' && (
        <div className="bg-error-50 border border-error-200 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-5 h-5 text-error-600 flex-shrink-0" />
            <span className="text-sm font-medium text-error-700">Credenciales no configuradas</span>
          </div>
          <p className="text-xs text-error-600 mb-3">
            {connectionError || 'Configura tu email y contrasena de Proton para acceder.'}
          </p>
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-error-600 hover:bg-error-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            <Settings className="w-3.5 h-3.5" /> Configurar credenciales
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-error-50 border border-error-200 rounded-xl text-error-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="relative bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-ink-50 border-b border-ink-100">
          <span className="text-sm font-medium text-ink-600 flex items-center gap-2">
            <Mail className="w-4 h-4 text-accent-600" />
            Proton Mail Web
          </span>
          <button
            onClick={() => { setIframeKey(k => k + 1); setBlocked(false); }}
            className="flex items-center gap-1.5 text-xs text-ink-500 hover:text-accent-600 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Recargar
          </button>
        </div>
        <iframe
          key={iframeKey}
          src="https://mail.proton.me"
          className="w-full"
          style={{ height: 'calc(100vh - 380px)', minHeight: '450px' }}
          onLoad={() => {
            setTimeout(() => setBlocked(true), 2500);
          }}
          title="Proton Mail"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
        {blocked && (
          <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-accent-100 flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 text-accent-600" />
            </div>
            <h3 className="font-display text-xl font-bold text-ink-900 mb-2">
              Proton Mail no se puede incrustar
            </h3>
            <p className="text-ink-500 max-w-md mb-6 leading-relaxed">
              Proton bloquea la carga dentro de otras webs por seguridad. Pulsa el boton para
              abrir Proton Mail en una pestana nueva.
            </p>
            <a
              href="https://mail.proton.me"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-accent-500/20"
            >
              <Mail className="w-5 h-5" />
              Abrir Proton Mail
            </a>
          </div>
        )}
      </div>

      {showAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-sm" onClick={() => setShowAppModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
              <h2 className="font-display font-bold text-lg text-ink-900 flex items-center gap-2">
                <Monitor className="w-5 h-5 text-ink-700" />
                App de escritorio Proton Mail
              </h2>
              <button
                onClick={() => setShowAppModal(false)}
                className="p-2 rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-ink-50 border border-ink-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-ink-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-ink-600">
                  <p className="font-medium mb-1">No se pudo abrir la app automaticamente</p>
                  <p className="text-ink-500 text-xs">
                    Para que el boton abra la app directamente, configura Proton Mail como tu
                    aplicacion de correo predeterminada en Windows:
                    Ajustes â†’ Aplicaciones â†’ Aplicaciones predeterminadas â†’ Proton Mail â†’
                    establecer como predeterminada para enlaces MAILTO.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-ink-700">Descargar la app de escritorio:</p>
                <a
                  href="https://proton.me/mail/download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 p-4 bg-white border border-ink-200 rounded-xl hover:border-accent-300 hover:bg-accent-50/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-ink-100 flex items-center justify-center group-hover:bg-accent-100 transition-colors">
                      <Monitor className="w-5 h-5 text-ink-600 group-hover:text-accent-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink-900">Windows</p>
                      <p className="text-xs text-ink-400">Instalador .exe</p>
                    </div>
                  </div>
                  <Download className="w-5 h-5 text-ink-400 group-hover:text-accent-600 transition-colors" />
                </a>
                <a
                  href="https://proton.me/mail/download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 p-4 bg-white border border-ink-200 rounded-xl hover:border-accent-300 hover:bg-accent-50/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-ink-100 flex items-center justify-center group-hover:bg-accent-100 transition-colors">
                      <Apple className="w-5 h-5 text-ink-600 group-hover:text-accent-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink-900">macOS</p>
                      <p className="text-xs text-ink-400">Universal Disk Image</p>
                    </div>
                  </div>
                  <Download className="w-5 h-5 text-ink-400 group-hover:text-accent-600 transition-colors" />
                </a>
              </div>

              <div className="bg-accent-50 border border-accent-200 rounded-xl p-3 flex items-start gap-2">
                <Info className="w-4 h-4 text-accent-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-accent-600">
                  Una vez instalada y configurada como app de correo predeterminada, el boton
                  "App de PC" abrira Proton Mail directamente sin pasar por el navegador.
                </p>
              </div>

              <button
                onClick={openDesktopApp}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-ink-900 hover:bg-ink-800 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Monitor className="w-4 h-4" />
                Reintentar abrir la app
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/50 backdrop-blur-sm" onClick={() => setShowSettings(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
              <h2 className="font-display font-bold text-lg text-ink-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-accent-600" />
                Cuenta de Proton Mail
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {error && (
                <div className="flex items-center gap-3 p-4 bg-error-50 border border-error-200 rounded-xl text-error-700 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="bg-accent-50 border border-accent-200 rounded-xl p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-accent-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-accent-700">
                  <p className="font-medium mb-1">Conexion segura con Proton</p>
                  <p className="text-accent-600 text-xs">
                    Introduce el email y la contrasena de tu cuenta de Proton.
                    Las credenciales se guardan de forma segura en la base de datos y nunca se exponen en el navegador.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Email de Proton</label>
                <input
                  type="email"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  placeholder="tu-email@proton.me"
                  className="w-full px-4 py-2.5 bg-ink-50 border border-ink-200 rounded-xl text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Contrasena</label>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  placeholder="Tu contrasena de Proton"
                  className="w-full px-4 py-2.5 bg-ink-50 border border-ink-200 rounded-xl text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  Codigo 2FA <span className="text-ink-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={credentials.twofa}
                  onChange={(e) => setCredentials({ ...credentials, twofa: e.target.value })}
                  placeholder="Solo si tienes 2FA activado"
                  className="w-full px-4 py-2.5 bg-ink-50 border border-ink-200 rounded-xl text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-ink-100">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2.5 text-sm font-medium text-ink-600 rounded-xl hover:bg-ink-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCredentials}
                disabled={savingCreds}
                className="flex items-center gap-2 px-5 py-2.5 bg-accent-600 hover:bg-accent-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Save className="w-4 h-4" />
                {savingCreds ? 'Guardando...' : 'Guardar y conectar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
