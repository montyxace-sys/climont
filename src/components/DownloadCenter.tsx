import { useState, useEffect, useCallback, type FormEvent } from 'react';
import {
  Snowflake, Lock, Mail, Loader2, AlertCircle, ArrowLeft, ArrowRight,
  Download, FileText, ShieldCheck, User, Building2, Phone, CheckCircle2,
  XCircle, Clock, KeyRound, LogOut, FolderOpen, Eye, X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { useSeo } from '@/hooks/useSeo';
import { navigate } from '@/lib/navigate';
import { Footer } from '@/components/Footer';
import { FloatingPhoneButton } from '@/components/FloatingPhoneButton';

type View = 'login' | 'register' | 'forgot' | 'reset';
type DownloadFile = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  created_at: string;
};

type DownloadUser = {
  status: string;
  full_name: string;
};

export function DownloadCenter() {
  useSeo({
    title: 'Centro de Descargas | Climatizaciones Montaño, S.L.',
    description: 'Acceso para clientes registrados a certificados, fichas técnicas y documentación profesional.',
    canonicalPath: '/centro-de-descargas',
    noIndex: true,
  });

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('login');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (session) {
    return <DownloadCenterContent session={session} onSignOut={signOut} />;
  }

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-primary-700 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-ink-900/80 backdrop-blur-xl border border-ink-700/50 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 mb-4">
              <Download className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-xl font-bold text-white">Centro de Descargas</h1>
            <p className="text-ink-400 text-sm mt-1">Climatizaciones Montaño, S.L.</p>
          </div>

          {view === 'login' && <LoginForm onSwitchView={setView} />}
          {view === 'register' && <RegisterForm onSwitchView={setView} />}
          {view === 'forgot' && <ForgotForm onSwitchView={setView} />}
          {view === 'reset' && <ResetForm onSwitchView={setView} />}

          <button
            onClick={() => navigate('/')}
            className="mt-6 w-full flex items-center justify-center gap-2 text-sm text-ink-500 hover:text-ink-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la web
          </button>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onSwitchView }: { onSwitchView: (v: View) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch {
      setError('Email o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/centro-de-descargas' },
    });
    if (oauthError) {
      setError('No se ha podido iniciar sesion con Google: ' + (oauthError.message || 'error desconocido'));
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="flex items-center gap-3 p-3.5 bg-error-500/10 border border-error-500/20 rounded-xl text-error-400 text-sm mb-5">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-ink-300 mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full pl-11 pr-4 py-3 bg-ink-800/60 border border-ink-700 rounded-xl text-white placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
              placeholder="tu@email.com" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-300 mb-1.5">Contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full pl-11 pr-4 py-3 bg-ink-800/60 border border-ink-700 rounded-xl text-white placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
              placeholder="••••••••" />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/30">
          {loading ? (<><Loader2 className="w-5 h-5 animate-spin" /> Accediendo...</>) : 'Acceder'}
        </button>
      </form>
      <div className="my-5 flex items-center gap-3 text-xs text-ink-500">
        <span className="h-px flex-1 bg-ink-700/60" />
        o
        <span className="h-px flex-1 bg-ink-700/60" />
      </div>
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-ink-600 hover:border-ink-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 0 1-2.19 3.32v2.76h3.56c2.08-1.92 3.28-4.75 3.28-8.09Z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.24 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853" />
          <path d="M5.84 14.11A6.96 6.96 0 0 1 5.46 12c0-.74.13-1.46.38-2.11V7.05H2.18A11.96 11.96 0 0 0 0 12c0 1.93.47 3.75 1.31 5.35l3.32-2.6c.08-.14.14-.28.21-.64Z" fill="#FBBC05" />
          <path d="M12 4.75c1.62 0 3.07.56 4.21 1.64l3.15-3.15C17.45 1.19 14.97 0 12 0 7.7 0 3.99 2.47 2.18 6.05l3.66 2.84C6.71 6.27 9.14 4.75 12 4.75Z" fill="#EA4335" />
        </svg>
        Continuar con Google
      </button>

      <div className="mt-5 flex flex-col gap-2 text-center">
        <button onClick={() => onSwitchView('forgot')} className="text-sm text-ink-400 hover:text-primary-400 transition-colors">
          ¿Olvidaste tu contraseña?
        </button>
        <button onClick={() => onSwitchView('register')} className="text-sm text-ink-300 hover:text-primary-400 transition-colors">
          ¿No tienes cuenta? <span className="font-semibold text-primary-400">Regístrate</span>
        </button>
      </div>
    </>
  );
}

function RegisterForm({ onSwitchView }: { onSwitchView: (v: View) => void }) {
  const [form, setForm] = useState({ email: '', password: '', fullName: '', company: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });
      if (signUpError) throw signUpError;
      if (data.user) {
        const { error: profileError } = await supabase.from('download_users').insert({
          user_id: data.user.id,
          full_name: form.fullName,
          company: form.company || null,
          phone: form.phone || null,
          status: 'aprobado',
        });
        if (profileError) throw profileError;
        setSuccess(true);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al registrar.';
      setError(msg.includes('already') ? 'Ya existe una cuenta con este email.' : msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-full bg-success-500/15 flex items-center justify-center mb-4 mx-auto">
          <CheckCircle2 className="w-8 h-8 text-success-400" />
        </div>
        <h3 className="font-display text-lg font-bold text-white mb-2">Registro enviado</h3>
        <p className="text-ink-400 text-sm leading-relaxed mb-6">
          Hemos recibido tu solicitud de registro. Nuestro equipo revisará tu petición y
          te notificaremos por email cuando tu cuenta sea aprobada. Este proceso suele
          tardar 24-48 horas laborables.
        </p>
        <button onClick={() => onSwitchView('login')}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl transition-colors">
          Volver a iniciar sesión
        </button>
      </div>
    );
  }

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/centro-de-descargas' },
    });
    if (oauthError) {
      setError('No se ha podido registrarse con Google: ' + (oauthError.message || 'error desconocido'));
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-11 pr-4 py-3 bg-ink-800/60 border border-ink-700 rounded-xl text-white placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all";
  const inputClassShort = "w-full px-4 py-3 bg-ink-800/60 border border-ink-700 rounded-xl text-white placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all";

  return (
    <>
      {error && (
        <div className="flex items-center gap-3 p-3.5 bg-error-500/10 border border-error-500/20 rounded-xl text-error-400 text-sm mb-5">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />{error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink-300 mb-1.5">Nombre completo *</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500" />
            <input type="text" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className={inputClass} placeholder="Tu nombre y apellidos" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-ink-300 mb-1.5">Empresa</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
              <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                className={inputClassShort} placeholder="Empresa" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-300 mb-1.5">Teléfono</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={inputClassShort} placeholder="Teléfono" />
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-300 mb-1.5">Email *</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500" />
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClass} placeholder="tu@email.com" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink-300 mb-1.5">Contraseña *</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500" />
            <input type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={inputClass} placeholder="Mínimo 6 caracteres" />
          </div>
        </div>
        <div className="bg-ink-800/40 border border-ink-700/50 rounded-xl p-3.5 text-ink-400 text-xs leading-relaxed">
          <ShieldCheck className="w-4 h-4 inline mr-1.5 text-primary-400" />
          Tu cuenta deberá ser aprobada manualmente por nuestro equipo antes de poder acceder a las descargas.
        </div>
        <button type="submit" disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/30">
          {loading ? (<><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</>) : 'Solicitar acceso'}
        </button>
      </form>
      <div className="mt-5 text-center">
        <button onClick={() => onSwitchView('login')} className="text-sm text-ink-400 hover:text-primary-400 transition-colors">
          ¿Ya tienes cuenta? <span className="font-semibold text-primary-400">Inicia sesión</span>
        </button>
      </div>
      <div className="my-4 flex items-center gap-3 text-xs text-ink-500">
        <span className="h-px flex-1 bg-ink-700/60" />
        o
        <span className="h-px flex-1 bg-ink-700/60" />
      </div>
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-ink-600 hover:border-ink-500 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.07 5.07 0 0 1-2.19 3.32v2.76h3.56c2.08-1.92 3.28-4.75 3.28-8.09Z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.24 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853" />
          <path d="M5.84 14.11A6.96 6.96 0 0 1 5.46 12c0-.74.13-1.46.38-2.11V7.05H2.18A11.96 11.96 0 0 0 0 12c0 1.93.47 3.75 1.31 5.35l3.32-2.6c.08-.14.14-.28.21-.64Z" fill="#FBBC05" />
          <path d="M12 4.75c1.62 0 3.07.56 4.21 1.64l3.15-3.15C17.45 1.19 14.97 0 12 0 7.7 0 3.99 2.47 2.18 6.05l3.66 2.84C6.71 6.27 9.14 4.75 12 4.75Z" fill="#EA4335" />
        </svg>
        Registrarse con Google
      </button>
      <div className="mt-5 flex flex-col gap-2 text-center">
        <button onClick={() => onSwitchView('login')} className="text-sm text-ink-400 hover:text-primary-400 transition-colors">
          ¿Ya tienes cuenta? <span className="font-semibold text-primary-400">Inicia sesión</span>
        </button>
      </div>
    </>
  );
}

function ForgotForm({ onSwitchView }: { onSwitchView: (v: View) => void }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/centro-de-descargas`,
      });
      if (error) throw error;
      setSuccess(true);
    } catch {
      setError('No se pudo enviar el email de recuperación.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-full bg-success-500/15 flex items-center justify-center mb-4 mx-auto">
          <Mail className="w-8 h-8 text-success-400" />
        </div>
        <h3 className="font-display text-lg font-bold text-white mb-2">Email enviado</h3>
        <p className="text-ink-400 text-sm leading-relaxed mb-6">
          Te hemos enviado un enlace para restablecer tu contraseña. Revisa tu bandeja
          de entrada (y la carpeta de spam).
        </p>
        <button onClick={() => onSwitchView('login')}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl transition-colors">
          Volver a iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="flex items-center gap-3 p-3.5 bg-error-500/10 border border-error-500/20 rounded-xl text-error-400 text-sm mb-5">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />{error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <p className="text-ink-400 text-sm">Introduce tu email y te enviaremos un enlace para crear una nueva contraseña.</p>
        <div>
          <label className="block text-sm font-medium text-ink-300 mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500" />
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-ink-800/60 border border-ink-700 rounded-xl text-white placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
              placeholder="tu@email.com" />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/30">
          {loading ? (<><Loader2 className="w-5 h-5 animate-spin" /> Enviando...</>) : (<><KeyRound className="w-5 h-5" /> Enviar enlace</>)}
        </button>
      </form>
      <div className="mt-5 text-center">
        <button onClick={() => onSwitchView('login')} className="text-sm text-ink-400 hover:text-primary-400 transition-colors">
          Volver a iniciar sesión
        </button>
      </div>
    </>
  );
}

function ResetForm({ onSwitchView }: { onSwitchView: (v: View) => void }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes('type=recovery') && !hash.includes('access_token')) {
      onSwitchView('login');
    }
  }, [onSwitchView]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
    } catch {
      setError('No se pudo actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 rounded-full bg-success-500/15 flex items-center justify-center mb-4 mx-auto">
          <CheckCircle2 className="w-8 h-8 text-success-400" />
        </div>
        <h3 className="font-display text-lg font-bold text-white mb-2">Contraseña actualizada</h3>
        <p className="text-ink-400 text-sm leading-relaxed mb-6">Ya puedes iniciar sesión con tu nueva contraseña.</p>
        <button onClick={() => onSwitchView('login')}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-xl transition-colors">
          Iniciar sesión
        </button>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="flex items-center gap-3 p-3.5 bg-error-500/10 border border-error-500/20 rounded-xl text-error-400 text-sm mb-5">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />{error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-ink-300 mb-1.5">Nueva contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500" />
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-ink-800/60 border border-ink-700 rounded-xl text-white placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
              placeholder="Mínimo 6 caracteres" />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/30">
          {loading ? (<><Loader2 className="w-5 h-5 animate-spin" /> Actualizando...</>) : 'Actualizar contraseña'}
        </button>
      </form>
    </>
  );
}

function DownloadCenterContent({ session, onSignOut }: { session: import('@supabase/supabase-js').Session; onSignOut: () => Promise<void> }) {
  const [userProfile, setUserProfile] = useState<DownloadUser | null>(null);
  const [files, setFiles] = useState<DownloadFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [previewFile, setPreviewFile] = useState<DownloadFile | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('download_users')
          .select('status, full_name')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        // Acceso directo: no se requiere aprobacion por el admin.
        // Si el perfil no existe, se crea con estado 'aprobado'.
        let finalProfile: DownloadUser;
        if (!profile) {
          const displayName = (session.user.user_metadata?.full_name as string | undefined)
            || (session.user.user_metadata?.name as string | undefined)
            || session.user.email
            || '';
          const { error: insertError } = await supabase.from('download_users').insert({
            user_id: session.user.id,
            full_name: displayName,
            company: null,
            phone: null,
            status: 'aprobado',
          });
          if (insertError) throw insertError;
          finalProfile = { status: 'aprobado', full_name: displayName } as DownloadUser;
        } else {
          finalProfile = profile as DownloadUser;
          if (finalProfile.status !== 'aprobado') {
            await supabase
              .from('download_users')
              .update({ status: 'aprobado' })
              .eq('user_id', session.user.id);
            finalProfile = { ...finalProfile, status: 'aprobado' };
          }
        }
        setUserProfile(finalProfile);

        const { data: fileList, error: filesError } = await supabase
          .from('download_files')
          .select('id, title, description, category, file_path, file_size, file_type, created_at')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (filesError) throw filesError;
        setFiles(fileList || []);
      } catch {
        setError('Error al cargar los datos.');
      } finally {
        setLoading(false);
      }
    })();
  }, [session]);

  const getSignedUrl = async (filePath: string): Promise<string | null> => {
    const { data, error: urlError } = await supabase.storage
      .from('downloads')
      .createSignedUrl(filePath, 300);
    if (urlError || !data?.signedUrl) return null;
    return data.signedUrl;
  };

  const handleDownload = async (file: DownloadFile) => {
    if (file.external_url) {
      window.open(file.external_url, '_blank', 'noopener,noreferrer');
      return;
    }
    setDownloading(file.id);
    try {
      const url = await getSignedUrl(file.file_path);
      if (!url) throw new Error('No URL');

      const link = document.createElement('a');
      link.href = url;
      link.download = file.title;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      setError('No se pudo descargar el archivo.');
    } finally {
      setDownloading(null);
    }
  };

  const handlePreview = async (file: DownloadFile) => {
    if (file.external_url) { window.open(file.external_url, '_blank', 'noopener,noreferrer'); return; }
    setPreviewLoading(true);
    setPreviewFile(file);
    setPreviewUrl(null);
    try {
      const url = await getSignedUrl(file.file_path);
      if (!url) throw new Error('No URL');
      setPreviewUrl(url);
    } catch {
      setError('No se pudo abrir el archivo para visualización.');
      setPreviewFile(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    setPreviewFile(null);
    setPreviewUrl(null);
  };

  const isPdf = (file: DownloadFile) => {
    const ext = (file.file_type || '').toUpperCase();
    const path = file.file_path.toUpperCase();
    return ext === 'PDF' || path.endsWith('.PDF');
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50 px-4">
        <div className="max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-warning-500 mx-auto mb-4" />
          <h1 className="font-display text-xl font-bold text-ink-900 mb-2">No tienes perfil de descargas</h1>
          <p className="text-ink-500 mb-6">Tu cuenta no está vinculada al centro de descargas. Contacta con nosotros para más información.</p>
          <button onClick={onSignOut} className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors">Cerrar sesión</button>
        </div>
      </div>
    );
  }

  if (userProfile.status === 'pendiente') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50 px-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-warning-100 flex items-center justify-center mb-4 mx-auto">
            <Clock className="w-8 h-8 text-warning-600" />
          </div>
          <h1 className="font-display text-xl font-bold text-ink-900 mb-2">Registro en revisión</h1>
          <p className="text-ink-500 mb-2">Hola, {userProfile.full_name}.</p>
          <p className="text-ink-500 mb-6">Tu solicitud de acceso está pendiente de aprobación. Nuestro equipo la revisará y te notificará por email cuando sea aprobada. Este proceso suele tardar 24-48 horas laborables.</p>
          <button onClick={onSignOut} className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors">Cerrar sesión</button>
        </div>
      </div>
    );
  }

  if (userProfile.status === 'rechazado') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50 px-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-error-100 flex items-center justify-center mb-4 mx-auto">
            <XCircle className="w-8 h-8 text-error-600" />
          </div>
          <h1 className="font-display text-xl font-bold text-ink-900 mb-2">Acceso denegado</h1>
          <p className="text-ink-500 mb-6">Tu solicitud de acceso al centro de descargas no ha sido aprobada. Si crees que es un error, contáctanos por teléfono.</p>
          <button onClick={onSignOut} className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors">Cerrar sesión</button>
        </div>
      </div>
    );
  }

  const categories = [...new Set(files.map((f) => f.category))].sort();

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Top bar */}
      <div className="bg-ink-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-sm sm:text-base">Centro de Descargas</h1>
              <p className="text-ink-400 text-xs">Bienvenido, {userProfile.full_name}</p>
            </div>
          </div>
          <button onClick={onSignOut} className="flex items-center gap-2 px-3 py-2 bg-ink-800 hover:bg-ink-700 text-ink-300 hover:text-white text-sm font-medium rounded-lg transition-colors">
            <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {error && (
          <div className="flex items-center gap-3 p-4 bg-error-50 border border-error-200 rounded-xl text-error-700 text-sm mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />{error}
          </div>
        )}

        {files.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen className="w-12 h-12 text-ink-300 mx-auto mb-4" />
            <h2 className="font-display text-lg font-bold text-ink-900 mb-2">Sin archivos disponibles</h2>
            <p className="text-ink-500">Todavía no hay documentos para descargar. Vuelve a consultar más tarde.</p>
          </div>
        ) : (
          <>
            {categories.map((cat) => (
              <div key={cat} className="mb-8">
                <h2 className="font-display text-lg font-bold text-ink-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-600" />
                  {cat}
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {files.filter((f) => f.category === cat).map((file) => (
                    <div key={file.id} className="bg-white border border-ink-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-ink-900 text-sm mb-1">{file.title}</h3>
                          {file.description && <p className="text-ink-500 text-xs leading-relaxed mb-2">{file.description}</p>}
                          <div className="flex items-center gap-3 text-xs text-ink-400 mb-3">
                            {file.file_type && <span>{file.file_type}</span>}
                            {file.file_size && <span>{formatSize(file.file_size)}</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            {isPdf(file) && (
                              <button onClick={() => handlePreview(file)} disabled={previewLoading && previewFile?.id === file.id}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-ink-100 hover:bg-ink-200 disabled:opacity-60 text-ink-700 text-sm font-semibold rounded-lg transition-colors">
                                {previewLoading && previewFile?.id === file.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                                Ver PDF
                              </button>
                            )}
                            <button onClick={() => handleDownload(file)} disabled={downloading === file.id}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors">
                              {downloading === file.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                              Descargar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      <Footer />
      <FloatingPhoneButton />

      {previewFile && (
        <div className="fixed inset-0 z-[100] bg-ink-950/80 backdrop-blur-sm flex flex-col" onClick={closePreview}>
          <div className="bg-white flex items-center justify-between px-4 py-3 border-b border-ink-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-5 h-5 text-primary-600 flex-shrink-0" />
              <span className="font-semibold text-ink-900 text-sm truncate">{previewFile.title}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {previewUrl && (
                <a href={previewUrl} download={previewFile.title} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors">
                  <Download className="w-4 h-4" /> Descargar
                </a>
              )}
              <button onClick={closePreview}
                className="flex items-center justify-center w-10 h-10 bg-ink-100 hover:bg-ink-200 text-ink-700 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 bg-ink-200 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {previewLoading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                <p className="text-ink-500 text-sm">Cargando documento...</p>
              </div>
            ) : previewUrl ? (
              <iframe src={previewUrl} title={previewFile.title} className="w-full h-full border-0" />
            ) : (
              <p className="text-ink-500 text-sm">No se pudo cargar el documento.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
