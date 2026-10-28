import { useEffect, useState } from 'react';

interface HumanCheckProps {
  onVerified: (verified: boolean) => void;
  className?: string;
}

export function HumanCheck({ onAnswer, className }: HumanCheckProps) {
  const [a] = useState(() => Math.floor(Math.random() * 9) + 1);
  const [b] = useState(() => Math.floor(Math.random() * 9) + 1);
  const [input, setInput] = useState('');

  useEffect(() => {
    const sum = a + b;
    onVerified(input.trim() === String(sum));
  }, [a, b, input, onVerified]);

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-2 ${className ?? ''}`}>
      <label htmlFor="human-check" className="text-sm font-medium text-ink-700">
        Verificación anti-spam: ¿cuánto es {a} + {b}?
      </label>
      <input
        id="human-check"
        type="text"
        inputMode="numeric"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="w-24 px-3 py-2 bg-white border border-ink-200 rounded-lg text-ink-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
        placeholder="?"
        autoComplete="off"
      />
    </div>
  );
}
