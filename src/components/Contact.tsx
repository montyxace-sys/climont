import { useState, type FormEvent } from 'react';
import { HumanCheck } from '@/components/HumanCheck';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';
import { Reveal } from '@/components/Reveal';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabaseConfig';

const SERVICE_OPTIONS = [
  { value: 'instalacion', label: 'Instalación' },
  { value: 'venta_instalacion', label: 'Venta e instalación de equipo (suministrado por la empresa)' },
  { value: 'mantenimiento', label: 'Mantenimiento' },
  { value: 'reparacion', label: 'Reparación' },
  { value: 'ventilacion', label: 'Ventilación y extracción' },
  { value: 'eficiencia', label: 'Eficiencia energética' },
  { value: 'airzone', label: 'Climatización inteligente Airzone' },
  { value: 'aerotermia', label: 'Aerotermia' },
  { value: 'solar-termica', label: 'Energía solar térmica' },
  { value: 'constructoras', label: 'Instalaciones y preinstalaciones para constructoras' },
];

const INSTALLATION_TYPES = [
  { value: 'splits_pared', label: 'Splits de pared' },
  { value: 'conductos', label: 'Centralizado por conductos' },
  { value: 'cassettes', label: 'Cassettes de techo' },
  { value: 'suelo_techo', label: 'Equipos suelo/techo' },
  { value: 'fabricacion_conductos', label: 'Fabricación de conductos (fibra Climaver / chapa galvanizada)' },
  { value: 'preinstalacion_obra', label: 'Preinstalación en obra nueva / nueva construcción' },
  { value: 'instalacion_obra', label: 'Instalación completa en obra nueva' },
  { value: 'ventilacion_viviendas', label: 'Ventilación de viviendas' },
  { value: 'ventilacion_garajes', label: 'Ventilación de garajes' },
  { value: 'airzone', label: 'Climatización inteligente Airzone' },
];

const CONTACT_INFO = [
  { icon: Phone, label: 'Teléfono', value: 'Llamar', href: 'tel:+34676628348' },
  { icon: MessageCircle, label: 'WhatsApp', value: '691 680 706', href: 'https://wa.me/34691680706' },
  { icon: Mail, label: 'Email', value: 'info@climont.es', href: 'mailto:info@climont.es' },
  { icon: MapPin, label: 'Dirección', value: 'C/ Hacienda Guadalupe 35, Alcalá de Guadaíra, Sevilla', href: 'https://maps.google.com/?q=C/Hacienda+Guadalupe+35+Alcalá+de+Guadaíra+Sevilla' },
  { icon: Clock, label: 'Horario', value: 'Lun–Vie: 8:00–14:00 / 15:00–18:00', href: '#contacto' },
];

type Status = 'idle' | 'loading' | 'success' | 'error';

export function Contact() {
  const [status, setStatus] = useState<Status>('idle');
  const [humanVerified, setHumanVerified] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    service_type: '',
    installation_type: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Introduce tu nombre';
    if (!form.email.trim()) next.email = 'Introduce tu email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Email no válido';
    if (!form.phone.trim()) next.phone = 'Introduce tu teléfono';
    if (!form.city.trim()) next.city = 'Introduce tu ciudad';
    if (!form.service_type) next.service_type = 'Selecciona un servicio';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!humanVerified) { setErrors((prev) => ({ ...prev, human: 'Resuelve la verificación anti-spam para continuar' })); return; }
    setStatus('loading');
    const { supabase } = await import('@/lib/supabase');
    const { error } = await supabase.from('contact_requests').insert({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      city: form.city.trim() || null,
      service_type: form.service_type,
      installation_type: form.installation_type || null,
      message: form.message.trim() || null,
    });

    if (error) {
      setStatus('error');
      return;
    }

    try {
      await fetch(`${SUPABASE_URL}/functions/v1/send-contact-email`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          city: form.city.trim(),
          service_type: form.service_type,
          installation_type: form.installation_type,
          message: form.message.trim(),
        }),
      });
    } catch {
      // Email notification is best-effort; the request is already saved in the database
    }

    setStatus('success');
    setForm({ name: '', email: '', phone: '', city: '', service_type: '', installation_type: '', message: '' });
  };

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <section id="contacto" className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* CTA banner */}
        <Reveal>
          <div className="relative rounded-3xl overflow-hidden mb-12">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-900" />
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary-400 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-primary-300 rounded-full blur-3xl" />
            </div>
            <div className="relative px-6 py-12 lg:px-16 lg:py-16 flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="text-center lg:text-left">
                <h2 className="font-display text-2xl lg:text-3xl font-bold text-white mb-2">
                  ¿Necesitas instalar o reparar tu aire acondicionado?
                </h2>
                <p className="text-primary-100 text-base lg:text-lg">
                  Solicita tu presupuesto gratis y sin compromiso. Te respondemos en menos de 24 horas.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => document.querySelector('#contacto form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                  className="group inline-flex items-center justify-center gap-2 px-7 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-all shadow-xl hover:-translate-y-0.5 whitespace-nowrap"
                >
                  Solicitar presupuesto
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="https://wa.me/34691680706"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-success-600 hover:bg-success-700 text-white font-semibold rounded-xl transition-all shadow-xl hover:-translate-y-0.5 whitespace-nowrap"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </a>
                <a
                  href="tel:+34676628348"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 text-white font-semibold rounded-xl transition-all shadow-xl hover:-translate-y-0.5 whitespace-nowrap"
                >
                  <Phone className="w-5 h-5" />
                  Llamar ahora
                </a>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left: contact info */}
          <Reveal className="lg:col-span-2">
            <div>
              <h3 className="font-display text-2xl lg:text-3xl font-bold text-ink-900 mb-4">
                Ponte en contacto
              </h3>
              <p className="text-ink-500 mb-8 leading-relaxed">
                Rellena el formulario y te llamaremos para organizar una visita técnica gratis.
                También puedes contactarnos directamente por teléfono o email, como prefieras.
              </p>

              <div className="space-y-4">
                {CONTACT_INFO.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      className="flex items-center gap-4 p-4 bg-ink-50 rounded-2xl hover:bg-primary-50 transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:bg-primary-600 transition-colors">
                        <Icon className="w-5 h-5 text-primary-600 group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <div className="text-xs text-ink-500 font-medium uppercase tracking-wide">
                          {item.label}
                        </div>
                        <div className="text-ink-800 font-semibold">{item.value}</div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </Reveal>

          {/* Right: form */}
          <Reveal className="lg:col-span-3" delay={150}>
            <div className="bg-white border border-ink-100 rounded-3xl p-6 lg:p-8 shadow-xl shadow-ink-900/5">
              {status === 'success' ? (
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-success-600" />
                  </div>
                  <h4 className="font-display text-xl font-bold text-ink-900 mb-2">
                    ¡Solicitud enviada!
                  </h4>
                  <p className="text-ink-500 mb-6 max-w-md">
                    Gracias por escribirnos. Nuestro equipo te llamará en menos de 24 horas para
                    organizar la visita técnica.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors"
                  >
                    Enviar otra solicitud
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {status === 'error' && (
                    <div className="flex items-center gap-3 p-4 bg-error-50 border border-error-200 rounded-xl text-error-700 text-sm">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      Ha ocurrido un error. Por favor, inténtalo de nuevo o llámanos por teléfono.
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="contact-city" className="block text-sm font-medium text-ink-700 mb-1.5">
                        Ciudad *
                      </label>
                      <input
                        id="contact-city"
                        type="text"
                        value={form.city}
                        onChange={(e) => update('city', e.target.value)}
                        className={`w-full px-4 py-3 bg-ink-50 border rounded-xl text-ink-900 placeholder-ink-300 focus:outline-none focus:ring-2 transition-all ${
                          errors.city
                            ? 'border-error-300 focus:ring-error-200'
                            : 'border-ink-200 focus:ring-primary-200 focus:border-primary-400'
                        }`}
                        placeholder="Sevilla, Madrid..."
                      />
                      {errors.city && (
                        <p className="mt-1 text-xs text-error-600">{errors.city}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="contact-name" className="block text-sm font-medium text-ink-700 mb-1.5">
                        Nombre completo *
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        value={form.name}
                        onChange={(e) => update('name', e.target.value)}
                        className={`w-full px-4 py-3 bg-ink-50 border rounded-xl text-ink-900 placeholder-ink-300 focus:outline-none focus:ring-2 transition-all ${
                          errors.name
                            ? 'border-error-300 focus:ring-error-200'
                            : 'border-ink-200 focus:ring-primary-200 focus:border-primary-400'
                        }`}
                        placeholder="Tu nombre"
                      />
                      {errors.name && (
                        <p className="mt-1 text-xs text-error-600">{errors.name}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="contact-phone" className="block text-sm font-medium text-ink-700 mb-1.5">
                        Teléfono *
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => update('phone', e.target.value)}
                        className={`w-full px-4 py-3 bg-ink-50 border rounded-xl text-ink-900 placeholder-ink-300 focus:outline-none focus:ring-2 transition-all ${
                          errors.phone
                            ? 'border-error-300 focus:ring-error-200'
                            : 'border-ink-200 focus:ring-primary-200 focus:border-primary-400'
                        }`}
                        placeholder="600 123 456"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-error-600">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium text-ink-700 mb-1.5">
                      Email *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      className={`w-full px-4 py-3 bg-ink-50 border rounded-xl text-ink-900 placeholder-ink-300 focus:outline-none focus:ring-2 transition-all ${
                        errors.email
                          ? 'border-error-300 focus:ring-error-200'
                          : 'border-ink-200 focus:ring-primary-200 focus:border-primary-400'
                      }`}
                      placeholder="tu@email.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-error-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="contact-installation-type" className="block text-sm font-medium text-ink-700 mb-1.5">
                      Tipo de instalación <span className="text-ink-500 font-normal">(opcional)</span>
                    </label>
                    <select
                      id="contact-installation-type"
                      value={form.installation_type}
                      onChange={(e) => update('installation_type', e.target.value)}
                      className={`w-full px-4 py-3 bg-ink-50 border rounded-xl text-ink-900 focus:outline-none focus:ring-2 transition-all border-ink-200 focus:ring-primary-200 focus:border-primary-400 ${!form.installation_type ? 'text-ink-300' : ''}`}
                    >
                      <option value="">Selecciona un tipo de instalación</option>
                      {INSTALLATION_TYPES.map((opt) => (
                        <option key={opt.value} value={opt.value} className="text-ink-900">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-service-type" className="block text-sm font-medium text-ink-700 mb-1.5">
                      Tipo de servicio *
                    </label>
                    <select
                      id="contact-service-type"
                      value={form.service_type}
                      onChange={(e) => update('service_type', e.target.value)}
                      className={`w-full px-4 py-3 bg-ink-50 border rounded-xl text-ink-900 focus:outline-none focus:ring-2 transition-all ${
                        errors.service_type
                          ? 'border-error-300 focus:ring-error-200'
                          : 'border-ink-200 focus:ring-primary-200 focus:border-primary-400'
                      } ${!form.service_type ? 'text-ink-300' : ''}`}
                    >
                      <option value="">Selecciona un servicio</option>
                      {SERVICE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="text-ink-900">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {errors.service_type && (
                      <p className="mt-1 text-xs text-error-600">{errors.service_type}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-sm font-medium text-ink-700 mb-1.5">
                      Mensaje <span className="text-ink-500 font-normal">(opcional)</span>
                    </label>
                    <textarea
                      id="contact-message"
                      value={form.message}
                      onChange={(e) => update('message', e.target.value)}
                      rows={4}
                      maxLength={5000}
                      className="w-full px-4 py-3 bg-ink-50 border border-ink-200 rounded-xl text-ink-900 placeholder-ink-300 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all resize-none"
                      placeholder="Cuéntanos qué necesitas: tipo de vivienda, número de habitaciones, etc."
                    />
                  </div>

                  <HumanCheck onVerified={setHumanVerified} className="mb-2" />
                  {errors.human && <p className="text-xs text-error-600 -mt-1 mb-2">{errors.human}</p>}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/30 hover:shadow-xl"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Solicitar presupuesto gratis
                      </>
                    )}
                  </button>

                  <p className="text-xs text-ink-500 text-center">
                    Al enviar aceptas nuestra política de privacidad. No compartimos tus datos.
                  </p>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
