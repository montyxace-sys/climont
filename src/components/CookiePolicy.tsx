import { useEffect } from 'react';
import { Cookie, ArrowLeft, Home } from 'lucide-react';

const COOKIE_TYPES = [
  {
    name: 'Cookies técnicas',
    required: true,
    purpose: 'Permiten al usuario la navegación a través de la página web y la utilización de las diferentes opciones y servicios que en ella existen.',
    examples: 'Identificar la sesión, controlar el tráfico y la comunicación de datos, recordar los elementos de un carrito, compartir enlaces en redes sociales.',
    duration: 'Sesión o persistente',
  },
  {
    name: 'Cookies de análisis',
    required: false,
    purpose: 'Cuantificar el número de usuarios y realizar la medición y análisis estadístico de la utilización que hacen los usuarios del servicio prestado.',
    examples: 'Google Analytics: _ga, _gat, _gid. Permiten observar la actividad del usuario y elaborar perfiles de navegación para mejorar el sitio web.',
    duration: 'Hasta 2 años',
  },
];

export function CookiePolicy() {
  useEffect(() => {
    document.title = 'Política de Cookies | Climatizaciones Montaño, S.L.';
    window.scrollTo(0, 0);
  }, []);

  const goHome = (e: React.MouseEvent) => {
    e.preventDefault();
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header bar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-ink-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a
            href="/"
            onClick={goHome}
            className="flex items-center gap-2 font-display font-bold text-ink-900"
          >
            <Cookie className="w-5 h-5 text-primary-600" />
            Política de Cookies
          </a>
          <a
            href="/"
            onClick={goHome}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-primary-600 transition-colors"
          >
            <Home className="w-4 h-4" />
            Volver al inicio
          </a>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="mb-10">
          <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-semibold rounded-full mb-4">
            Legal
          </span>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-900 mb-4">
            Política de Cookies
          </h1>
          <p className="text-ink-500 text-sm">
            Última actualización: {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="space-y-8 text-ink-700 leading-relaxed">
          <section>
            <p>
              Esta política de cookies explica qué son las cookies, qué tipos utilizamos,
              para qué sirven y cómo puedes gestionarlas. Al utilizar nuestro sitio web,
              consientes el uso de cookies de acuerdo con esta política.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-ink-900 mb-3">
              1. ¿Qué son las cookies?
            </h2>
            <p>
              Las cookies son pequeños archivos de texto que un sitio web envía al navegador
              del usuario y se almacenan en su dispositivo. Permiten recordar información
              sobre la visita, como el idioma preferido o las opciones de visualización,
              facilitando la navegación y mejorando la experiencia del usuario en visitas
              posteriores.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-ink-900 mb-3">
              2. Tipos de cookies que utilizamos
            </h2>
            <div className="space-y-4">
              {COOKIE_TYPES.map((cookie) => (
                <div
                  key={cookie.name}
                  className="p-6 bg-ink-50 rounded-2xl border border-ink-100"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-display text-lg font-bold text-ink-900">
                      {cookie.name}
                    </h3>
                    {cookie.required ? (
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">
                        Necesarias
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-ink-200 text-ink-600 text-xs font-semibold rounded-full">
                        Opcionales
                      </span>
                    )}
                  </div>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="font-semibold text-ink-800">Finalidad:</dt>
                      <dd className="text-ink-600">{cookie.purpose}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-ink-800">Ejemplos:</dt>
                      <dd className="text-ink-600">{cookie.examples}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-ink-800">Duración:</dt>
                      <dd className="text-ink-600">{cookie.duration}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-ink-900 mb-3">
              3. Consentimiento
            </h2>
            <p>
              Al acceder por primera vez a nuestro sitio web te mostramos un banner
              informativo en el que puedes aceptar todas las cookies, rechazar las
              opcionales o personalizar tu elección. Tu consentimiento se almacena para
              futuras visitas y puedes modificarlo en cualquier momento borrando las
              cookies de tu navegador.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-ink-900 mb-3">
              4. Cómo gestionar y desactivar las cookies
            </h2>
            <p className="mb-3">
              Puedes permitir, bloquear o eliminar las cookies instaladas en tu
              dispositivo mediante las opciones de configuración de tu navegador.
              A continuación te indicamos los enlaces a las instrucciones de los
              principales navegadores:
            </p>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://support.google.com/chrome/answer/95647"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-700 underline underline-offset-2 hover:text-primary-800"
                >
                  Google Chrome
                </a>
              </li>
              <li>
                <a
                  href="https://support.mozilla.org/es/kb/Borrar%20cookies"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-700 underline underline-offset-2 hover:text-primary-800"
                >
                  Mozilla Firefox
                </a>
              </li>
              <li>
                <a
                  href="https://support.apple.com/es-es/guide/safari/sfri11471/mac"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-700 underline underline-offset-2 hover:text-primary-800"
                >
                  Safari
                </a>
              </li>
              <li>
                <a
                  href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-700 underline underline-offset-2 hover:text-primary-800"
                >
                  Microsoft Edge
                </a>
              </li>
            </ul>
            <p className="mt-3 text-sm text-ink-500">
              Si desactivas las cookies técnicas, es posible que algunas funcionalidades
              del sitio web no estén disponibles.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-ink-900 mb-3">
              5. Actualizaciones de la política
            </h2>
            <p>
              Climatizaciones Montaño, S.L. se reserva el derecho de modificar esta
              política de cookies para adaptarla a novedades legislativas o
              jurisdiccionales, así como a instrucciones dictadas por la Agencia
              Española de Protección de Datos (AEPD). Te recomendamos revisar
              periódicamente esta página para estar al tanto de los cambios.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-ink-900 mb-3">
              6. Contacto
            </h2>
            <p>
              Si tienes cualquier duda sobre nuestra política de cookies, puedes
              contactar con nosotros en{' '}
              <a
                href="mailto:info@climont.es"
                className="text-primary-700 underline underline-offset-2 hover:text-primary-800"
              >
                info@climont.es
              </a>{' '}
              o en el teléfono 676 628 348.
            </p>
          </section>
        </div>

        {/* Back button */}
        <div className="mt-12 pt-8 border-t border-ink-100">
          <a
            href="/"
            onClick={goHome}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-primary-500/30"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </a>
        </div>
      </main>
    </div>
  );
}
