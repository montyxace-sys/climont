import { useState, type FormEvent } from 'react';
import { Snowflake, Lock, Mail, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

type LoginProps = {
  onSignIn: (email: string, password: string) => Promise<void>;
};

export function AdminLogin({ onSignIn }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSignIn(email, password);
    } catch {
      setError('Email o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
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
            <h1 className="font-display text-xl font-bold text-white">Panel de Administración</h1>
            <p className="text-ink-400 text-sm mt-1">Climatizaciones Montaño, S.L.</p>
          </div>

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
              <label className="block text-sm font-medium text-ink-300 mb-1.5">Contraseña</label>
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
