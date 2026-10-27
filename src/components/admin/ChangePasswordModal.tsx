import { useEffect, useState, type FormEvent } from 'react';
import { X, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, KeyRound, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Props = {
  open: boolean;
  onClose: () => void;
  /** Cuando se llega desde el enlace de recuperación por email no se pide la contraseña actual. */
  recoveryMode?: boolean;
  onPasswordChanged?: () => void;
};

const MIN_LENGTH = 10;

function scorePassword(value: string) {
  let score = 0;
  if (value.length >= MIN_LENGTH) score += 1;
  if (value.length >= 14) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return Math.min(score, 4);
}

const STRENGTH = [
  { label: 'Muy débil', color: 'bg-error-500', width: 'w-1/4' },
  { label: 'Débil', color: 'bg-error-500', width: 'w-1/4' },
  { label: 'Aceptable', color: 'bg-warning-500', width: 'w-2/4' },
  { label: 'Buena', color: 'bg-success-500', width: 'w-3/4' },
  { label: 'Excelente', color: 'bg-success-500', width: 'w-full' },
];

export function ChangePasswordModal({ open, onClose, recoveryMode = false, onPasswordChanged }: Props) {
  const [email, setEmail] = useState('');
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [repeat, setRepeat] = useState('');
  const [show, setShow] = useState(false);
  const [closeOthers, setCloseOthers] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError('');
    setDone(false);
    setCurrent('');
    setNext('');
    setRepeat('');
    setShow(false);
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ''));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, loading, onClose]);

  if (!open) return null;

  const strength = scorePassword(next);
  const meta = STRENGTH[strength];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!recoveryMode && !current) {
      setError('Escribe tu contraseña actual.');
      return;
    }
    if (next.length < MIN_LENGTH) {
      setError(`La nueva contraseña debe tener al menos ${MIN_LENGTH} caracteres.`);
      return;
    }
    if (next !== repeat) {
      setError('Las dos contraseñas nuevas no coinciden.');
      return;
    }
    if (next === current) {
      setError('La nueva contraseña debe ser distinta de la actual.');
      return;
    }
    if (email && next.toLowerCase() === email.toLowerCase()) {
      setError('La contraseña no puede ser tu dirección de correo.');
      return;
    }

    setLoading(true);
    try {
      if (!recoveryMode && current) {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password: current });
        if (authError) {
          setError('La contraseña actual no es correcta.');
          return;
        }
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: next });
      if (updateError) {
        setError(
          /same|identical|different/i.test(updateError.message)
            ? 'La nueva contraseña debe ser distinta de la actual.'
            : /weak|short|characters/i.test(updateError.message)
              ? `La contraseña no es lo bastante segura. Usa al menos ${MIN_LENGTH} caracteres con mayúsculas, minúsculas y números.`
              : 'No se ha podido cambiar la contraseña. Inténtalo de nuevo.',
        );
        return;
      }

      if (closeOthers) {
        await supabase.auth.signOut({ scope: 'others' });
      }

      setDone(true);
      onPasswordChanged?.();
    } catch {
      setError('Sin conexión con el servidor. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/70 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-ink-700/60 bg-ink-900 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-ink-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600/20 text-primary-400">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-base font-bold text-white">Cambiar contraseña</h2>
              <p className="text-xs text-ink-500">{email || 'Cuenta de administración'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            aria-label="Cerrar"
            className="rounded-lg p-2 text-ink-500 transition-colors hover:bg-ink-800 hover:text-ink-300 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {done ? (
          <div className="px-6 py-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-500/15">
              <CheckCircle2 className="h-7 w-7 text-success-400" />
            </div>
            <h3 className="font-display text-lg font-bold text-white">Contraseña actualizada</h3>
            <p className="mx-auto mt-2 max-w-xs text-sm text-ink-400">
              Ya puedes usar la nueva contraseña la próxima vez que entres al panel.
            </p>
            <button
              onClick={onClose}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-500"
            >
              Entendido
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
            {recoveryMode && (
              <p className="rounded-xl border border-primary-500/20 bg-primary-500/10 px-3.5 py-2.5 text-xs text-primary-200">
                Has llegado desde el enlace de recuperación. Elige tu nueva contraseña.
              </p>
            )}

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-error-500/20 bg-error-500/10 px-3.5 py-2.5 text-xs text-error-300">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!recoveryMode && (
              <div>
                <label htmlFor="current-password" className="mb-1.5 block text-xs font-medium text-ink-400">
                  Contraseña actual
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-600" />
                  <input
                    id="current-password"
                    type={show ? 'text' : 'password'}
                    value={current}
                    onChange={(e) => setCurrent(e.target.value)}
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-ink-700 bg-ink-800/60 py-2.5 pl-10 pr-11 text-sm text-white placeholder-ink-600 transition-colors focus:border-primary-500/50 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                    placeholder="Tu contraseña actual"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="new-password" className="mb-1.5 block text-xs font-medium text-ink-400">
                Nueva contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-600" />
                <input
                  id="new-password"
                  type={show ? 'text' : 'password'}
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-ink-700 bg-ink-800/60 py-2.5 pl-10 pr-11 text-sm text-white placeholder-ink-600 transition-colors focus:border-primary-500/50 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                  placeholder={`Mínimo ${MIN_LENGTH} caracteres`}
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  aria-label={show ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink-500 transition-colors hover:text-ink-300"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {next && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-ink-800">
                    <div className={`h-full rounded-full transition-all ${meta.color} ${meta.width}`} />
                  </div>
                  <span className="text-[11px] text-ink-500">{meta.label}</span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="repeat-password" className="mb-1.5 block text-xs font-medium text-ink-400">
                Repite la nueva contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-600" />
                <input
                  id="repeat-password"
                  type={show ? 'text' : 'password'}
                  value={repeat}
                  onChange={(e) => setRepeat(e.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-ink-700 bg-ink-800/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-ink-600 transition-colors focus:border-primary-500/50 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
                  placeholder="Repite la contraseña"
                />
              </div>
              {repeat && repeat !== next && (
                <p className="mt-1.5 text-[11px] text-error-400">Las contraseñas no coinciden.</p>
              )}
            </div>

            <label className="flex items-start gap-2.5 rounded-xl border border-ink-800 bg-ink-800/40 px-3.5 py-3">
              <input
                type="checkbox"
                checked={closeOthers}
                onChange={(e) => setCloseOthers(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-ink-600 bg-ink-800 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-xs leading-relaxed text-ink-400">
                Cerrar la sesión en el resto de dispositivos
                <span className="mt-0.5 block text-[11px] text-ink-600">
                  Protege la cuenta si alguien más tenía acceso.
                </span>
              </span>
            </label>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-ink-400 transition-colors hover:bg-ink-800 hover:text-ink-200 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 transition-colors hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Guardando...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" /> Guardar contraseña
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
