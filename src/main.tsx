import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import './fonts.css';
import './index.css';

// Tras un despliegue, un navegador con el HTML antiguo en caché intenta cargar
// un JS que ya no existe y la página se queda en blanco. En ese caso se recarga
// una sola vez para coger la versión nueva.
const CHUNK_ERROR_RE =
  /dynamically imported module|Importing a module script failed|ChunkLoadError|Loading chunk \d+ failed/i;

let reloading = false;

function reloadOnChunkError(value: unknown) {
  if (reloading) return;
  const message =
    typeof value === 'string'
      ? value
      : value instanceof Error
        ? value.message
        : '';
  if (!CHUNK_ERROR_RE.test(message)) return;
  try {
    if (sessionStorage.getItem('climont-chunk-reload') === '1') return;
    sessionStorage.setItem('climont-chunk-reload', '1');
  } catch {
    return;
  }
  reloading = true;
  window.location.reload();
}

window.addEventListener('error', (event) => {
  reloadOnChunkError(event.error ?? event.message);
});
window.addEventListener('unhandledrejection', (event) => {
  reloadOnChunkError(event.reason);
});

// Si la aplicación arranca bien, se borra la marca para permitir otra recarga
// automática en un despliegue futuro.
window.setTimeout(() => {
  try {
    sessionStorage.removeItem('climont-chunk-reload');
  } catch {
    /* sin almacenamiento: da igual */
  }
}, 10000);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
