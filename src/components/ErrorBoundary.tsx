import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

type Props = {
  children: ReactNode;
  /** Texto opcional para identificar la zona que falló. */
  label?: string;
};

type State = {
  error: Error | null;
};

const CHUNK_ERROR_RE =
  /dynamically imported module|Importing a module script failed|ChunkLoadError|Loading chunk \d+ failed/i;

function isChunkLoadError(error: Error | null): boolean {
  return !!error && CHUNK_ERROR_RE.test(error.message);
}

function reloadOnceForStaleBundle(): boolean {
  try {
    if (sessionStorage.getItem('climont-chunk-reload') === '1') return false;
    sessionStorage.setItem('climont-chunk-reload', '1');
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}

/**
 * Evita la pantalla en blanco: si un componente falla (por ejemplo porque el
 * navegador tiene cacheado un HTML antiguo que apunta a un JS ya borrado),
 * se muestra un aviso con botón de recarga en lugar de quedarse en negro.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (isChunkLoadError(error) && reloadOnceForStaleBundle()) return;
    console.error('ErrorBoundary', this.props.label || '', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const stale = isChunkLoadError(error);

    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-950 px-4">
        <div className="w-full max-w-md rounded-3xl border border-ink-700/60 bg-ink-900/80 p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-warning-500/15">
            <AlertTriangle className="h-6 w-6 text-warning-400" />
          </div>
          <h1 className="font-display text-lg font-semibold text-white">
            {stale ? 'Hay una versión nueva de la web' : 'Algo ha ido mal'}
          </h1>
          <p className="mt-2 text-sm text-ink-400">
            {stale
              ? 'Tu navegador guardó una versión antigua de esta página. Recarga para cargar la última.'
              : 'No se ha podido mostrar esta sección. Recarga la página e inténtalo de nuevo.'}
          </p>
          <button
            type="button"
            onClick={() => {
              try {
                sessionStorage.removeItem('climont-chunk-reload');
              } catch {
                /* sin almacenamiento: da igual */
              }
              window.location.reload();
            }}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-500"
          >
            <RefreshCw className="h-4 w-4" />
            Recargar página
          </button>
          <a
            href="/"
            className="mt-4 block text-sm text-ink-500 transition-colors hover:text-ink-300"
          >
            Volver a la web
          </a>
        </div>
      </div>
    );
  }
}
