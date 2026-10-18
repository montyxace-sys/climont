import { useState, useCallback, useEffect } from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { FileTypeIcon } from '@/components/admin/FileTypeIcon';

type GoogleApp = {
  name: string;
  description: string;
  url: string;
  color: string;
  icon: React.ReactNode;
};

const GOOGLE_APPS: GoogleApp[] = [
  {
    name: 'Drive',
    description: 'Almacenamiento y archivos en la nube',
    url: 'https://drive.google.com',
    color: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
        <path d="M9.04 21.54c.96.29 1.93.46 2.96.46a10 10 0 0 0 10-10A10 10 0 0 0 12 2 10 10 0 0 0 2 12c0 1.5.35 2.92.96 4.18L9.04 21.54Z" fill="#1FA463" fillOpacity=".9"/>
        <path d="M7.5 16.5h6.5l-3.5 6-3-6Z" fill="#4285F4"/>
        <path d="M3.5 17.5 7 11.5 4 6 0 12l3.5 5.5Z" fill="#FDBD00" fillOpacity=".9"/>
        <path d="M9 6.5h7l3 5.5h-6L9 6.5Z" fill="#E8433D" fillOpacity=".9"/>
      </svg>
    ),
  },
  {
    name: 'Docs',
    description: 'Documentos de texto',
    url: 'https://docs.google.com/document',
    color: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
        <path d="M14.727 6.727H14V0H4a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.001h-6.273v-1.273Z" fill="#4285F4"/>
        <path d="M14.727 6.727H20L14 0v6.727h.727Z" fill="#A1C2FA"/>
        <path d="M10 13h4v1.5h-4V13Zm0-2.5h4V12h-4v-1.5ZM10 8h2v1.5h-2V8Z" fill="#fff"/>
      </svg>
    ),
  },
  {
    name: 'Sheets',
    description: 'Hojas de calculo',
    url: 'https://docs.google.com/spreadsheets',
    color: 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
        <path d="M14.727 6.727H14V0H4a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.001h-6.273v-1.273Z" fill="#0F9D58"/>
        <path d="M14.727 6.727H20L14 0v6.727h.727Z" fill="#87CEAC"/>
        <path d="M6 10.5h6v6H6v-6Zm1.5 1.5v1h3v-1h-3Zm0 2.5v1h3v-1h-3Z" fill="#fff"/>
      </svg>
    ),
  },
  {
    name: 'Slides',
    description: 'Presentaciones',
    url: 'https://docs.google.com/presentation',
    color: 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
        <path d="M14.727 6.727H14V0H4a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8.001h-6.273v-1.273Z" fill="#F4B400"/>
        <path d="M14.727 6.727H20L14 0v6.727h.727Z" fill="#FADA80"/>
        <path d="M6 11h8v6H6v-6Z" fill="#fff"/>
      </svg>
    ),
  },
  {
    name: 'Gmail',
    description: 'Correo electronico',
    url: 'https://mail.google.com',
    color: 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
        <path d="M22 6.5V18a2 2 0 0 1-2 2h-3V9.5L12 13 7 9.5V20H4a2 2 0 0 1-2-2V6.5L3 6l9 6 9-6 1 .5Z" fill="#EA4335"/>
        <path d="M17 4v5.5L12 13 7 9.5V4h10Z" fill="#4285F4"/>
      </svg>
    ),
  },
  {
    name: 'Calendar',
    description: 'Calendario y eventos',
    url: 'https://calendar.google.com',
    color: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
        <rect x="3" y="4" width="18" height="18" rx="2" fill="#fff"/>
        <rect x="3" y="4" width="18" height="18" rx="2" fill="none" stroke="#4285F4" strokeWidth="1.5"/>
        <path d="M3 8h18v2H3V8Z" fill="#4285F4"/>
        <path d="M8 2v4M16 2v4" stroke="#4285F4" strokeWidth="1.5" strokeLinecap="round"/>
        <text x="12" y="17" textAnchor="middle" fontSize="7" fontWeight="700" fill="#4285F4">31</text>
      </svg>
    ),
  },
  {
    name: 'Forms',
    description: 'Formularios y encuestas',
    url: 'https://docs.google.com/forms',
    color: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
        <rect x="4" y="2" width="16" height="20" rx="2" fill="#7248B9"/>
        <path d="M7 7h6v1.5H7V7Zm0 3.5h10V12H7v-1.5Zm0 3.5h10v1.5H7V14Zm0 3.5h7V19H7v-1.5Z" fill="#fff"/>
      </svg>
    ),
  },
  {
    name: 'Keep',
    description: 'Notas y recordatorios',
    url: 'https://keep.google.com',
    color: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
        <path d="M19 3H5a2 2 0 0 0-2 2v14l4-2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z" fill="#FBB144"/>
        <path d="M8 8h8v1.5H8V8Zm0 3h6v1.5H8V11Z" fill="#fff"/>
      </svg>
    ),
  },
  {
    name: 'Contacts',
    description: 'Contactos y agenda',
    url: 'https://contacts.google.com',
    color: 'bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
        <circle cx="12" cy="8" r="4" fill="#00897B"/>
        <path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="#00897B"/>
      </svg>
    ),
  },
  {
    name: 'Tasks',
    description: 'Tareas y listas',
    url: 'https://tasks.google.com',
    color: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
        <circle cx="12" cy="12" r="10" fill="#1A73E8"/>
        <path d="M7 12l3.5 3.5L17 8.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    name: 'Meet',
    description: 'Videoconferencias',
    url: 'https://meet.google.com',
    color: 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
        <rect x="2" y="6" width="12" height="12" rx="2" fill="#00832D"/>
        <path d="M14 10l6-3v10l-6-3v-4Z" fill="#00AC47"/>
      </svg>
    ),
  },
  {
    name: 'Chat',
    description: 'Mensajeria de equipo',
    url: 'https://chat.google.com',
    color: 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200',
    icon: (
      <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
        <path d="M3 5h18v12H8l-5 4V5Z" fill="#00AC47"/>
        <circle cx="8" cy="11" r="1.2" fill="#fff"/>
        <circle cx="12" cy="11" r="1.2" fill="#fff"/>
        <circle cx="16" cy="11" r="1.2" fill="#fff"/>
      </svg>
    ),
  },
];

const SHEETS_EMBED = 'https://docs.google.com/spreadsheets';

export function OfimaticaTab() {
  const [iframeKey, setIframeKey] = useState(0);
  const [blocked, setBlocked] = useState(false);

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
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Ofimatica Google</h1>
        <p className="text-ink-500 text-sm mt-1">Acceso rapido a todas las herramientas de Google Workspace</p>
      </div>

      <div className="bg-primary-50 border border-primary-200 rounded-2xl p-4 flex items-start gap-3">
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93Zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39Z" />
        </svg>
        <p className="text-sm text-primary-700">
          Al pulsar una aplicacion se abrira en una pestana nueva. Asegurate de haber iniciado sesion
          con tu cuenta de Google para acceder a tus archivos.
        </p>
      </div>

      {/* Embedded Google Sheets viewer */}
      <div className="relative bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-ink-50 border-b border-ink-100">
          <span className="text-sm font-medium text-ink-600 flex items-center gap-2">
            <FileTypeIcon name="file.xlsx" className="w-4 h-4" />
            Google Sheets
          </span>
          <div className="flex items-center gap-3">
            <a
              href={SHEETS_EMBED}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-ink-500 hover:text-primary-600 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Abrir en pestana
            </a>
            <button
              onClick={() => { setIframeKey(k => k + 1); setBlocked(false); }}
              className="flex items-center gap-1.5 text-xs text-ink-500 hover:text-primary-600 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Recargar
            </button>
          </div>
        </div>
        <iframe
          key={iframeKey}
          src={SHEETS_EMBED}
          className="w-full"
          style={{ height: 'calc(100vh - 380px)', minHeight: '500px' }}
          onLoad={() => {
            setTimeout(() => setBlocked(true), 3000);
          }}
          title="Google Sheets"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
        {blocked && (
          <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <FileTypeIcon name="file.xlsx" className="w-8 h-8" />
            </div>
            <h3 className="font-display text-xl font-bold text-ink-900 mb-2">
              Google Sheets no se puede incrustar
            </h3>
            <p className="text-ink-500 max-w-md mb-6 leading-relaxed">
              Google bloquea la carga dentro de otras webs por seguridad. Pulsa el boton para
              abrir Google Sheets en una pestana nueva.
            </p>
            <a
              href={SHEETS_EMBED}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-green-500/20"
            >
              <FileTypeIcon name="file.xlsx" className="w-5 h-5" />
              Abrir Google Sheets
            </a>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {GOOGLE_APPS.map((app) => (
          <a
            key={app.name}
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex flex-col items-center p-5 bg-white rounded-2xl border-2 transition-all hover:shadow-lg hover:-translate-y-0.5 ${app.color}`}
          >
            <div className="mb-3 transition-transform group-hover:scale-110">
              {app.icon}
            </div>
            <div className="font-display font-bold text-base mb-1">{app.name}</div>
            <div className="text-xs text-ink-500 text-center leading-snug">{app.description}</div>
            <ExternalLink className="w-4 h-4 mt-2 text-ink-300 group-hover:text-ink-500 transition-colors" />
          </a>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-ink-100 p-5">
        <h2 className="font-display text-lg font-bold text-ink-900 mb-3">Crear documento nuevo</h2>
        <div className="flex flex-wrap gap-3">
          <a href="https://docs.google.com/document/create" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm2 16H8v-2h8v2Zm0-4H8v-2h8v2Zm-3-5V3.5L18.5 9H13Z"/></svg>
            Nuevo documento
          </a>
          <a href="https://docs.google.com/spreadsheets/create" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm-2 14H8v-2h4v2Zm0-4H8v-2h4v2Zm0-4H8V6h4v2Z"/></svg>
            Nueva hoja
          </a>
          <a href="https://docs.google.com/presentation/create" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM4 22V2h10v6h6v14H4Z"/></svg>
            Nueva presentacion
          </a>
          <a href="https://docs.google.com/forms/create" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6ZM8 14h8v2H8v-2Zm0-4h8v2H8v-2Z"/></svg>
            Nuevo formulario
          </a>
        </div>
      </div>
    </div>
  );
}
