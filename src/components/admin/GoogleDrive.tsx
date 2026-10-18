import { useState, useEffect, useCallback } from 'react';
import {
  HardDrive,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Info,
  X,
  Monitor,
  Download,
  Apple,
  FolderOpen,
  FileText,
  Image as ImageIcon,
  Users,
} from 'lucide-react';

const GOOGLE_DRIVE_WEB = 'https://drive.google.com';

const STORAGE_LIMITS = [
  { label: 'Google Drive gratuito', value: '15 GB', icon: HardDrive },
  { label: 'Google One básico', value: '100 GB', icon: FolderOpen },
  { label: 'Google One estándar', value: '200 GB', icon: FileText },
  { label: 'Google One premium', value: '2 TB', icon: ImageIcon },
];

const QUICK_LINKS = [
  { label: 'Mis archivos', url: 'https://drive.google.com/drive/my-drive', icon: HardDrive },
  { label: 'Compartidos conmigo', url: 'https://drive.google.com/drive/shared-with-me', icon: Users },
  { label: 'Recientes', url: 'https://drive.google.com/drive/recent', icon: RefreshCw },
  { label: 'Papelera', url: 'https://drive.google.com/drive/trash', icon: FileText },
];

export function GoogleDrive() {
  const [iframeKey, setIframeKey] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [showAppModal, setShowAppModal] = useState(false);

  const openDesktopApp = () => {
    const protocols = ['googledrive://', 'google-drive://'];
    let idx = 0;

    const tryProtocol = (proto: string) => {
      const link = document.createElement('a');
      link.href = proto;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const tryNext = () => {
      if (idx >= protocols.length) {
        setTimeout(() => setShowAppModal(true), 1200);
        return;
      }
      tryProtocol(protocols[idx++]);
      setTimeout(tryNext, 1200);
    };
    tryNext();
  };

  const checkBlocked = useCallback(() => {
    const timer = setTimeout(() => setBlocked(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const cleanup = checkBlocked();
    return cleanup;
  }, [iframeKey, checkBlocked]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900 flex items-center gap-2">
            <HardDrive className="w-6 h-6 text-primary-600" />
            Google Drive
          </h1>
          <p className="text-ink-500 text-sm mt-1">
            Almacenamiento en la nube de Google para tus archivos
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={openDesktopApp}
            className="flex items-center gap-2 px-4 py-2.5 bg-ink-900 hover:bg-ink-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-ink-900/20"
          >
            <Monitor className="w-4 h-4" />
            App de PC
          </button>
          <a
            href={GOOGLE_DRIVE_WEB}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-primary-500/20"
          >
            <ExternalLink className="w-4 h-4" />
            Web
          </a>
        </div>
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-primary-700">
          Google Drive es el almacenamiento en la nube de Google. Desde aqui puedes acceder a la web
          o abrir la aplicacion de escritorio directamente si la tienes instalada.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STORAGE_LIMITS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="bg-white rounded-2xl border border-ink-100 shadow-sm p-4 flex flex-col items-center text-center"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-primary-600" />
              </div>
              <span className="text-lg font-bold text-ink-900">{item.value}</span>
              <span className="text-xs text-ink-400 mt-0.5">{item.label}</span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {QUICK_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 p-4 bg-white border border-ink-100 rounded-xl hover:border-primary-300 hover:bg-primary-50/50 transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-ink-100 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                <Icon className="w-4.5 h-4.5 text-ink-600 group-hover:text-primary-600" />
              </div>
              <span className="text-sm font-medium text-ink-700 group-hover:text-primary-700 transition-colors">
                {link.label}
              </span>
            </a>
          );
        })}
      </div>

      <div className="relative bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-ink-50 border-b border-ink-100">
          <span className="text-sm font-medium text-ink-600 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-primary-600" />
            Google Drive Web
          </span>
          <button
            onClick={() => { setIframeKey(k => k + 1); setBlocked(false); }}
            className="flex items-center gap-1.5 text-xs text-ink-500 hover:text-primary-600 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Recargar
          </button>
        </div>
        <iframe
          key={iframeKey}
          src={GOOGLE_DRIVE_WEB}
          className="w-full"
          style={{ height: 'calc(100vh - 420px)', minHeight: '450px' }}
          onLoad={() => {
            setTimeout(() => setBlocked(true), 3000);
          }}
          title="Google Drive"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
        {blocked && (
          <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
              <HardDrive className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="font-display text-xl font-bold text-ink-900 mb-2">
              Google Drive no se puede incrustar
            </h3>
            <p className="text-ink-500 max-w-md mb-6 leading-relaxed">
              Google bloquea la carga dentro de otras webs por seguridad. Pulsa el boton para
              abrir Google Drive en una pestana nueva.
            </p>
            <a
              href={GOOGLE_DRIVE_WEB}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-primary-500/20"
            >
              <HardDrive className="w-5 h-5" />
              Abrir Google Drive
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
                App de escritorio Google Drive
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
                    Si la app de Google Drive no se abrio, asegurate de que esta instalada en tu PC.
                    Puedes descargarla con los enlaces de abajo.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-ink-700">Descargar la app de escritorio:</p>
                <a
                  href="https://www.google.com/drive/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 p-4 bg-white border border-ink-200 rounded-xl hover:border-primary-300 hover:bg-primary-50/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-ink-100 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                      <Monitor className="w-5 h-5 text-ink-600 group-hover:text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink-900">Windows</p>
                      <p className="text-xs text-ink-400">Instalador .exe</p>
                    </div>
                  </div>
                  <Download className="w-5 h-5 text-ink-400 group-hover:text-primary-600 transition-colors" />
                </a>
                <a
                  href="https://www.google.com/drive/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 p-4 bg-white border border-ink-200 rounded-xl hover:border-primary-300 hover:bg-primary-50/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-ink-100 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                      <Apple className="w-5 h-5 text-ink-600 group-hover:text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink-900">macOS</p>
                      <p className="text-xs text-ink-400">Universal Disk Image</p>
                    </div>
                  </div>
                  <Download className="w-5 h-5 text-ink-400 group-hover:text-primary-600 transition-colors" />
                </a>
              </div>

              <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 flex items-start gap-2">
                <Info className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-primary-600">
                  Una vez instalada, la app sincronizara tus archivos de Google Drive en tu PC y el
                  boton "App de PC" abrira la aplicacion directamente.
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
    </div>
  );
}
