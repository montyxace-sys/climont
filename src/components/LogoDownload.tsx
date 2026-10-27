import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Snowflake, Download, ArrowLeft, LogOut, Image as ImageIcon } from 'lucide-react';
import { navigate } from '@/lib/navigate';

export function LogoDownload() {
  const { session, loading, signIn, signOut } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-950">
        <div className="w-8 h-8 border-3 border-primary-700 border-t-primary-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    const handleSignIn = async (e: React.FormEvent) => {
      e.preventDefault();
      setSigningIn(true);
      setError(null);
      try {
        await signIn(email, password);
      } catch (err) {
        void err;
        setError('Email o contraseña incorrectos.');
        setSigningIn(false);
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ink-950 via-ink-900 to-primary-950 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30 mb-3">
                <Snowflake className="w-8 h-8 text-white" />
              </div>
              <h1 className="font-display font-bold text-xl text-ink-900">Acceso privado</h1>
              <p className="text-ink-500 text-sm mt-1 text-center">Inicia sesión para descargar el logo</p>
            </div>
            {error && (
              <div className="bg-error-50 border border-error-200 text-error-700 text-sm rounded-xl px-4 py-3 mb-4">
                {error}
              </div>
            )}
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-ink-50 border border-ink-200 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Contraseña</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-ink-50 border border-ink-200 rounded-xl text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={signingIn}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors"
              >
                {signingIn ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </form>
          </div>
          <div className="text-center mt-4">
            <button
              onClick={() => navigate('/')}
              className="text-white/60 hover:text-white text-sm transition-colors"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Top bar */}
      <div className="bg-ink-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <Snowflake className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-sm">Climont · Descarga privada</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-ink-400 hover:text-white text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Volver</span>
            </button>
            <button
              onClick={signOut}
              className="flex items-center gap-2 text-ink-400 hover:text-error-400 text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
        <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-6 sm:p-8 lg:p-10">
          <h1 className="font-display text-2xl font-bold text-ink-900 mb-2">Logo de alta calidad</h1>
          <p className="text-ink-500 text-sm mb-8">
            Imagen en alta resolución del logo de Climatizaciones Montaño, S.L. Descarga el archivo
            para usarlo en documentos, tarjetas, redes sociales o donde necesites.
          </p>

          {/* Preview */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-3xl overflow-hidden shadow-xl shadow-ink-900/10 bg-ink-100">
              <img
                src="/logo-hd.webp"
                alt="Logo Climatizaciones Montaño"
                className="w-full h-full object-cover"
               width={1184} height={896} />
            </div>
            <div className="mt-4 flex items-center gap-2 text-ink-400 text-sm">
              <ImageIcon className="w-4 h-4" />
              <span>Alta resolución · Disponible en PNG y WebP</span>
            </div>
          </div>

          {/* Download */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/logo-hd.png"
              download="logo-climont-hd.png"
              className="flex items-center gap-2.5 px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary-500/20 hover:-translate-y-0.5"
            >
              <Download className="w-5 h-5" />
              Descargar PNG
            </a>
            <a
              href="/logo-hd.webp"
              download="logo-climont-hd.webp"
              className="flex items-center gap-2.5 px-6 py-3.5 bg-white border border-ink-200 hover:bg-ink-50 text-ink-700 font-semibold rounded-xl transition-all hover:-translate-y-0.5"
            >
              <Download className="w-5 h-5" />
              Descargar WebP
            </a>
          </div>

          <p className="text-center text-ink-400 text-xs mt-6">
            Esta página es privada. Solo tú puedes acceder con tu cuenta de administrador.
          </p>
        </div>
      </div>
    </div>
  );
}
