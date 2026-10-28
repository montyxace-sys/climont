import { useEffect, useState } from 'react';
import { MessageCircle, Phone } from 'lucide-react';

export function FloatingPhoneButton() {
  const [isScrollingDown, setIsScrollingDown] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (Math.abs(currentScrollY - lastScrollY) > 4) {
        setIsScrollingDown(currentScrollY > lastScrollY && currentScrollY > 80);
        lastScrollY = currentScrollY;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const visibilityClass = isScrollingDown
    ? 'translate-y-24 opacity-0 pointer-events-none'
    : 'translate-y-0 opacity-100';

  return (
    <div className={`fixed bottom-24 right-6 z-[100] flex items-center gap-3 transition-all duration-300 ${visibilityClass}`}>
      <a
        href="https://wa.me/34691680706"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp con Climatizaciones Montaño"
        className="flex items-center justify-center w-14 h-14 bg-success-600 hover:bg-success-700 text-white rounded-full shadow-2xl shadow-success-500/40 ring-4 ring-white/30 transition-transform hover:scale-110"
      >
        <MessageCircle className="w-7 h-7" />
      </a>
      <a
        href="tel:+34676628348"
        aria-label="Llamar a Climatizaciones Montaño"
        className="flex items-center justify-center w-16 h-16 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-2xl shadow-primary-500/40 ring-4 ring-white/30 transition-transform hover:scale-110"
      >
        <span className="absolute w-16 h-16 rounded-full bg-primary-500 animate-ping opacity-20" />
        <Phone className="w-7 h-7 relative z-10" />
      </a>
    </div>
  );
}
