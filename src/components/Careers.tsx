import { useState, type FormEvent, type ChangeEvent } from 'react';
import {
  Snowflake,
  ArrowLeft,
  Wrench,
  Users,
  Award,
  TrendingUp,
  Heart,
  Upload,
  FileText,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSeo } from '@/hooks/useSeo';
import { Reveal } from '@/components/Reveal';


type Status = 'idle' | 'loading' | 'success' | 'error';

const POSITIONS = [
  'Técnico en climatización',
  'Técnico en aerotermia',
  'Técnico en ventilación',
  'Ayudante de técnico',
  'Administrativo/a',
  'Comercial',
  'Jefe de equipo',
  'Otro',
];

const PERKS = [
  { icon: TrendingUp, title: 'Proyección real', text: 'Empresa en crecimiento continuo desde 2004 con oportunidades de desarrollo profesional.' },
  { icon: Award, title: 'Formación continua', text: 'Cursos de certificación RITE, marcas y nuevas tecnologías a cargo de la empresa.' },
  { icon: Heart, title: 'Buen ambiente', text: 'Equipo humano cercano, estable y con valores. No somos un número, somos un equipo.' },
  { icon: Users, title: 'Estabilidad', text: 'Contrato fijo tras periodo de prueba. Trabajo durante todo el año, sin temporada baja.' },
];

const STEPS = [
  { num: '01', title: 'Envíanos tu CV', text: 'Rellena el formulario de esta página y adjunta tu currículum en PDF o Word.' },
  { num: '02', title: 'Conversamos', text: 'Si tu perfil encaja, te llamamos para una primera entrevista por teléfono o en persona.' },
  { num: '03', title: 'Entrevista', text: 'Visitamos nuestras instalaciones en Alcalá de Guadaíra y conoces al equipo de cerca.' },
  { num: '04', title: 'Bienvenido', text: 'Si todo va bien, empezamos cuanto antes con un periodo de prueba y formación.' },
];

export function Careers() {
  useSeo({
    title: '¿Eres profesional del aire acondicionado? Trabaja con nosotros | Climatizaciones Montaño',
    description: 'Únete al equipo de Climatizaciones Montaño. Buscamos técnicos certificados en climatización, aerotermia y ventilación. Estabilidad, formación continua y buen ambiente. Envíanos tu CV.',
    canonicalPath: '/empleo',
    keywords: 'empleo aire acondicionado Sevilla, trabajo climatización Sevilla, técnico aire acondicionado Sevilla, ofertas empleo climatización, trabajar Climatizaciones Montaño',
  });

  const [status, setStatus] = useState<Status>('idle');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience_years: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = 'Introduce tu nombre';
    if (!form.email.trim()) next.email = 'Introduce tu email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Email no válido';
    if (!form.phone.trim()) next.phone = 'Introduce tu teléfono';
    if (!form.position) next.position = 'Selecciona un puesto';
    if (!file) next.file = 'Adjunta tu CV en PDF o Word';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const selected = e.target.files?.[0];
    if (!selected) {
      setFile(null);
      return;
    }
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const validExt = /\.(pdf|doc|docx)$/i.test(selected.name);
    if (!allowed.includes(selected.type) && !validExt) {
      setFileError('El archivo debe ser PDF, DOC o DOCX');
      setFile(null);
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setFileError('El archivo no puede superar los 5 MB');
      setFile(null);
      return;
    }
    setFile(selected);
    if (errors.file) setErrors((prev) => ({ ...prev, file: '' }));
  };

  const removeFile = () => {
    setFile(null);
    setFileError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus('loading');

    let cvFilePath: string | null = null;
    if (file) {
      const ext = file.name.split('.').pop() || 'pdf';
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('cvs')
        .upload(fileName, file);

      if (uploadError) {
        setStatus('error');
        return;
      }
      cvFilePath = fileName;
    }

    const { error: insertError } = await supabase.from('job_applications').insert({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      position: form.position,
      experience_years: form.experience_years ? parseInt(form.experience_years) : null,
      message: form.message.trim() || null,
      cv_file_path: cvFilePath,
      cv_file_name: file?.name || null,
    });

    if (insertError) {
      if (cvFilePath) {
        await supabase.storage.from('cvs').remove([cvFilePath]);
      }
      setStatus('error');
      return;
    }

    setStatus('success');
    setForm({ name: '', email: '', phone: '', position: '', experience_years: '', message: '' });
    setFile(null);
  };

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const inputClass = (field: string) => `w-full px-4 py-3 bg-ink-50 border rounded-xl text-ink-900 placeholder-ink-300 focus:outline-none focus:ring-2 transition-all ${
    errors[field] ? 'border-error-300 focus:ring-error-200' : 'border-ink-200 focus:ring-primary-200 focus:border-primary-400'
  }`;

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-ink-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:scale-105 transition-transform">
              <Snowflake className="w-6 h-6 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-ink-900 hidden sm:inline">
              Climatizaciones <span className="text-primary-700">Montaño</span>
            </span>
          </a>
          <a href="/" className="flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-primary-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </a>
        </div>
      </div>

      <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink-950 pt-20 pb-32 lg:pt-32 lg:pb-40">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-primary-700 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-500/20 text-primary-300 text-sm font-semibold rounded-full mb-6 border border-primary-500/30">
              <Wrench className="w-4 h-4" />
              Únete a nuestro equipo
            </span>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              ¿Eres profesional del{' '}
              <br />
              <span className="text-primary-400">aire acondicionado?</span>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-lg lg:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-8">
              En Climatizaciones Montaño buscamos técnicos con ganas de crecer.
              Si te apasiona la climatización y quieres trabajar en una empresa estable,
              envíanos tu CV.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <a
              href="#formulario"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-xl shadow-primary-500/30 hover:-translate-y-0.5"
            >
              <Send className="w-5 h-5" />
              Enviar mi CV
            </a>
          </Reveal>
        </div>
      </section>

      {/* Perks */}
      <section className="py-20 lg:py-28 bg-ink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink-900 mb-4">
              ¿Por qué trabajar con nosotros?
            </h2>
            <p className="text-ink-500 max-w-2xl mx-auto">
              Más de 20 años de experiencia nos respaldan. Buscamos personas que quieran
              crecer profesionalmente con nosotros.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PERKS.map((perk, i) => {
              const Icon = perk.icon;
              return (
                <Reveal key={perk.title} delay={i * 100}>
                  <div className="bg-white rounded-3xl p-6 lg:p-8 border border-ink-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                    <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center mb-5">
                      <Icon className="w-6 h-6 text-primary-600" />
                    </div>
                    <h3 className="font-display font-bold text-lg text-ink-900 mb-2">{perk.title}</h3>
                    <p className="text-ink-500 text-sm leading-relaxed">{perk.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink-900 mb-4">
              Cómo es el proceso
            </h2>
            <p className="text-ink-500">Cuatro pasos sencillos para empezar a trabajar con nosotros</p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <Reveal key={step.num} delay={i * 100}>
                <div className="relative">
                  <div className="font-display text-5xl font-bold text-primary-200 mb-3">{step.num}</div>
                  <h3 className="font-display font-bold text-lg text-ink-900 mb-2">{step.title}</h3>
                  <p className="text-ink-500 text-sm leading-relaxed">{step.text}</p>
                  {i < STEPS.length - 1 && (
                    <div className="hidden lg:block absolute top-6 -right-3 w-6 h-px bg-ink-200" />
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Form section */}
      <section id="formulario" className="py-20 lg:py-32 bg-ink-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-primary-50 text-primary-700 text-sm font-semibold rounded-full mb-4">
              Envíanos tu candidatura
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink-900 mb-4">
              ¿Quieres trabajar con nosotros?
            </h2>
            <p className="text-ink-500 max-w-xl mx-auto">
              Rellena el formulario y adjunta tu CV. Nos pondremos en contacto contigo
              si tu perfil encaja con lo que buscamos.
            </p>
          </Reveal>

          <Reveal>
            <div className="bg-white border border-ink-100 rounded-3xl p-6 lg:p-10 shadow-xl shadow-ink-900/5">
              {status === 'success' ? (
                <div className="flex flex-col items-center justify-center text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-success-100 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-success-600" />
                  </div>
                  <h4 className="font-display text-xl font-bold text-ink-900 mb-2">¡CV enviado correctamente!</h4>
                  <p className="text-ink-500 mb-6 max-w-md">
                    Gracias por tu interés en trabajar con nosotros. Revisaremos tu candidatura
                    y nos pondremos en contacto contigo si tu perfil encaja con nuestras necesidades.
                  </p>
                  <button
                    onClick={() => setStatus('idle')}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors"
                  >
                    Enviar otro CV
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {status === 'error' && (
                    <div className="flex items-center gap-3 p-4 bg-error-50 border border-error-200 rounded-xl text-error-700 text-sm">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      Ha ocurrido un error al enviar tu CV. Por favor, inténtalo de nuevo o llámanos al 676 628 348.
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="empleo-nombre" className="block text-sm font-medium text-ink-700 mb-1.5">Nombre completo *</label>
                      <input
                        id="empleo-nombre"
                        type="text"
                        value={form.name}
                        onChange={(e) => update('name', e.target.value)}
                        className={inputClass('name')}
                        placeholder="Tu nombre y apellidos"
                      />
                      {errors.name && <p className="mt-1 text-xs text-error-600">{errors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="empleo-telefono" className="block text-sm font-medium text-ink-700 mb-1.5">Teléfono *</label>
                      <input
                        id="empleo-telefono"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => update('phone', e.target.value)}
                        className={inputClass('phone')}
                        placeholder="600 123 456"
                      />
                      {errors.phone && <p className="mt-1 text-xs text-error-600">{errors.phone}</p>}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="empleo-email" className="block text-sm font-medium text-ink-700 mb-1.5">Email *</label>
                      <input
                        id="empleo-email"
                        type="email"
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                        className={inputClass('email')}
                        placeholder="tu@email.com"
                      />
                      {errors.email && <p className="mt-1 text-xs text-error-600">{errors.email}</p>}
                    </div>
                    <div>
                      <label htmlFor="empleo-puesto" className="block text-sm font-medium text-ink-700 mb-1.5">Puesto deseado *</label>
                      <select
                        id="empleo-puesto"
                        value={form.position}
                        onChange={(e) => update('position', e.target.value)}
                        className={`${inputClass('position')} ${!form.position ? 'text-ink-300' : ''}`}
                      >
                        <option value="">Selecciona un puesto</option>
                        {POSITIONS.map((p) => (
                          <option key={p} value={p} className="text-ink-900">{p}</option>
                        ))}
                      </select>
                      {errors.position && <p className="mt-1 text-xs text-error-600">{errors.position}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1.5">
                      Años de experiencia <span className="text-ink-500 font-normal">(opcional)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={form.experience_years}
                      onChange={(e) => update('experience_years', e.target.value)}
                      className={inputClass('experience_years')}
                      placeholder="Ej. 5"
                    />
                  </div>

                  {/* CV upload */}
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1.5">
                      Currículum (PDF, DOC o DOCX) <span className="text-error-500">*</span>
                    </label>
                    {file ? (
                      <div className="flex items-center gap-3 p-4 bg-primary-50 border border-primary-200 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink-800 truncate">{file.name}</p>
                          <p className="text-xs text-ink-500">{(file.size / 1024).toFixed(0)} KB</p>
                        </div>
                        <button
                          type="button"
                          onClick={removeFile}
                          className="p-2 rounded-lg text-ink-500 hover:bg-error-50 hover:text-error-600 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <label
                        className={`flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                          errors.file ? 'border-error-300 bg-error-50' : 'border-ink-200 bg-ink-50 hover:border-primary-400 hover:bg-primary-50/50'
                        }`}
                      >
                        <Upload className="w-8 h-8 text-ink-300" />
                        <span className="text-sm text-ink-500 font-medium">
                          Haz clic para subir tu CV
                        </span>
                        <span className="text-xs text-ink-500">PDF, DOC o DOCX — máximo 5 MB</span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    )}
                    {errors.file && <p className="mt-1 text-xs text-error-600">{errors.file}</p>}
                    {fileError && <p className="mt-1 text-xs text-error-600">{fileError}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1.5">
                      Cuéntanos sobre ti <span className="text-ink-500 font-normal">(opcional)</span>
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) => update('message', e.target.value)}
                      rows={4}
                      maxLength={3000}
                      className="w-full px-4 py-3 bg-ink-50 border border-ink-200 rounded-xl text-ink-900 placeholder-ink-300 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all resize-none"
                      placeholder="Experiencia, certificaciones, disponibilidad, zona de residencia..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/30 hover:shadow-xl"
                  >
                    {status === 'loading' ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</>
                    ) : (
                      <><Send className="w-5 h-5" /> Enviar candidatura</>
                    )}
                  </button>
                  <p className="text-xs text-ink-500 text-center">
                    Al enviar aceptas nuestra política de privacidad. Tus datos se usarán únicamente para el proceso de selección.
                  </p>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Contact info */}
      <section className="py-16 bg-white border-t border-ink-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center">
            <h3 className="font-display text-xl font-bold text-ink-900 mb-2">¿Prefieres contactar directamente?</h3>
            <p className="text-ink-500 text-sm mb-6">Llámanos o escríbenos y hablamos</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="tel:+34676628348" className="flex items-center gap-2 px-5 py-3 bg-ink-50 rounded-xl text-ink-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                <Phone className="w-4 h-4 text-primary-600" /> Llamar
              </a>
              <a href="mailto:info@climont.es" className="flex items-center gap-2 px-5 py-3 bg-ink-50 rounded-xl text-ink-700 hover:bg-primary-50 hover:text-primary-700 transition-colors">
                <Mail className="w-4 h-4 text-primary-600" /> info@climont.es
              </a>
              <div className="flex items-center gap-2 px-5 py-3 bg-ink-50 rounded-xl text-ink-700">
                <MapPin className="w-4 h-4 text-primary-600" /> Alcalá de Guadaíra, Sevilla
              </div>
            </div>
          </Reveal>
        </div>
      </section>
      </main>

    </div>
  );
}
