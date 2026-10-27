import { useState, type FormEvent } from 'react';
import { Snowflake, Lock, Mail, Loader2, AlertCircle, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type LoginProps = {
  onSignIn: (email: string, password: string) => Promise<void>;
};

type Mode = 'login' | 'reset';

export function AdminLogin({ onSignIn }: LoginProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSignIn(email, password);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      setError(
        /timeout/i.test(message)
          ? 'El servidor no responde. Recarga la página e inténtalo de nuevo.'
          : 'Email o contraseña incorrectos.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin`,
      });
      if (resetError) throw resetError;
      setResetSent(true);
    } catch {
      setError('No se ha podido enviar el correo. Comprueba la dirección e inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError('');
    setResetSent(false);
    setPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-primary-700 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-ink-900/80 backdrop-blur-xl border border-ink-700/50 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 mb-4">
              <Snowflake className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-display text-xl font-bold text-white">
              {mode === 'login' ? 'Panel de Administración' : 'Recuperar contraseña'}
            </h1>
            <p className="text-ink-400 text-sm mt-1">Climatizaciones Montaño, S.L.</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-3.5 bg-error-500/10 border border-error-500/20 rounded-xl text-error-400 text-sm mb-5">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {mode === 'reset' && resetSent ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-500/15">
                <CheckCircle2 className="h-7 w-7 text-success-400" />
              </div>
              <p className="text-sm text-ink-300">
                Si <span className="font-medium text-white">{email}</span> es una cuenta de administración, recibirás un
                correo con un enlace para elegir una nueva contraseña.
              </p>
              <p className="mt-2 text-xs text-ink-500">Revisa también la carpeta de spam. El enlace caduca en una hora.</p>
              <button
                type="button"
                onClick={() => switchMode('login')}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-500"
              >
                <ArrowLeft className="h-4 w-4" /> Volver al acceso
              </button>
            </div>
          ) : mode === 'login' ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-ink-300 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-ink-800/60 border border-ink-700 rounded-xl text-white placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                    placeholder="admin@climont.es"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-sm font-medium text-ink-300">Contraseña</label>
                  <button
                    type="button"
                    onClick={() => switchMode('reset')}
                    className="text-xs font-medium text-primary-400 transition-colors hover:text-primary-300"
                  >
                    ¿La has olvidado?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-ink-800/60 border border-ink-700 rounded-xl text-white placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/30"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Accediendo...
                  </>
                ) : (
                  'Acceder al panel'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              <p className="text-sm text-ink-400">
                Escribe el email del panel y te enviaremos un enlace para crear una contraseña nueva.
              </p>
              <div>
                <label className="block text-sm font-medium text-ink-300 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-ink-800/60 border border-ink-700 rounded-xl text-white placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                    placeholder="admin@climont.es"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/30"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Enviando...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-5 h-5" /> Enviar enlace de recuperación
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => switchMode('login')}
                className="flex w-full items-center justify-center gap-2 text-sm text-ink-500 transition-colors hover:text-ink-300"
              >
                <ArrowLeft className="w-4 h-4" /> Volver al acceso
              </button>
            </form>
          )}

          <a
            href="/"
            className="mt-6 flex items-center justify-center gap-2 text-sm text-ink-500 hover:text-ink-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la web
          </a>
        </div>
      </div>
    </div>
  );
}
