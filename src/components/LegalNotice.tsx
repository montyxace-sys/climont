import { ArrowLeft, Home, Scale } from 'lucide-react';

export function LegalNotice() {
  function goHome(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo(0, 0);
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-ink-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" onClick={goHome} className="flex items-center gap-2 font-display font-bold text-ink-900">
            <Scale className="w-5 h-5 text-primary-600" />
            Aviso legal
          </a>
          <a href="/" onClick={goHome} className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-primary-600 transition-colors">
            <Home className="w-4 h-4" />
            Volver al inicio
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="mb-10">
          <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-semibold rounded-full mb-4">Información legal</span>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-900 mb-4">Aviso legal</h1>
          <p className="text-ink-500 text-sm">Última actualización: 18 de octubre de 2026</p>
        </div>

        <div className="space-y-8 text-ink-700 leading-relaxed">
          <section>
            <h2 className="font-display text-2xl font-bold text-ink-900 mb-3">1. Datos identificativos</h2>
            <dl className="grid sm:grid-cols-[180px_1fr] gap-x-6 gap-y-3 rounded-2xl bg-ink-50 border border-ink-100 p-6">
              <dt className="font-semibold text-ink-900">Titular</dt><dd>Climatizaciones Montaño, S.L.</dd>
              <dt className="font-semibold text-ink-900">NIF/CIF</dt><dd>B91310987</dd>
              <dt className="font-semibold text-ink-900">Domicilio</dt><dd>C/ Hacienda Guadalupe 35, 41500 Alcalá de Guadaíra, Sevilla</dd>
              <dt className="font-semibold text-ink-900">Correo electrónico</dt><dd><a href="mailto:info@climont.es" className="text-primary-700 underline underline-offset-2 hover:text-primary-800">info@climont.es</a></dd>
              <dt className="font-semibold text-ink-900">Teléfono</dt><dd><a href="tel:+34676628348" className="text-primary-700 underline underline-offset-2 hover:text-primary-800">Llamar</a></dd>
              <dt className="font-semibold text-ink-900">Sitio web</dt><dd>https://climont.es</dd>
            </dl>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-ink-900 mb-3">2. Objeto y aceptación</h2>
            <p>Este aviso legal regula el acceso y uso del sitio web de Climatizaciones Montaño, S.L. La navegación por el sitio atribuye la condición de usuario e implica la aceptación de este aviso legal, así como de las demás políticas disponibles en la web.</p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-ink-900 mb-3">3. Condiciones de uso</h2>
            <p>El usuario se compromete a utilizar el sitio de forma diligente, lícita y respetuosa con los derechos de terceros. No está permitido utilizar la web para introducir contenidos maliciosos, intentar acceder sin autorización a sistemas o servicios, interferir en su funcionamiento o emplearla con fines contrarios a la legislación vigente.</p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-ink-900 mb-3">4. Propiedad intelectual e industrial</h2>
            <p>Los textos, fotografías, diseños, logotipos, marcas, código y demás elementos del sitio pertenecen a Climatizaciones Montaño, S.L. o se utilizan con autorización de sus titulares. Su reproducción, distribución, transformación o comunicación pública requiere autorización previa, salvo los usos permitidos por la normativa aplicable.</p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-ink-900 mb-3">5. Responsabilidad</h2>
            <p>Climatizaciones Montaño, S.L. procura que la información del sitio sea clara y esté actualizada, pero no garantiza la ausencia absoluta de errores, interrupciones o contenidos desactualizados. La información técnica y los precios publicados son orientativos y deben confirmarse para cada instalación, reparación o presupuesto concreto.</p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-ink-900 mb-3">6. Enlaces a terceros</h2>
            <p>El sitio puede incluir enlaces a páginas externas para facilitar el acceso a información o servicios de terceros. Climatizaciones Montaño, S.L. no controla esos sitios ni asume responsabilidad por sus contenidos, disponibilidad o políticas de privacidad. El acceso a ellos se realiza bajo la responsabilidad del usuario.</p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-ink-900 mb-3">7. Protección de datos y cookies</h2>
            <p>El tratamiento de datos personales y el uso de cookies se explican en sus páginas específicas. Puedes consultar la <a href="/politica-de-cookies" className="text-primary-700 underline underline-offset-2 hover:text-primary-800">Política de Cookies</a> y contactar con la empresa en <a href="mailto:info@climont.es" className="text-primary-700 underline underline-offset-2 hover:text-primary-800">info@climont.es</a> para cualquier cuestión relacionada con la privacidad.</p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold text-ink-900 mb-3">8. Legislación aplicable</h2>
            <p>Este sitio se rige por la legislación española. Para cualquier controversia relacionada con su uso serán competentes los juzgados y tribunales que correspondan conforme a la normativa aplicable.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-ink-100">
          <a href="/" onClick={goHome} className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-primary-500/30">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </a>
        </div>
      </main>
    </div>
  );
}
