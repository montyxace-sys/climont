import { useEffect } from 'react';
import { updateAnalyticsConsent, trackPageView } from '@/lib/analytics';

function getOrCreateSessionId(): string {
  const KEY = 'climont_session_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

function detectDeviceType(ua: string): string {
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android.*mobile|windows phone/i.test(ua)) return 'mobile';
  return 'desktop';
}

export function usePageTracking(path: string) {
  useEffect(() => {
    updateAnalyticsConsent();
    trackPageView(path);
    const sessionId = getOrCreateSessionId();
    const userAgent = navigator.userAgent;
    const deviceType = detectDeviceType(userAgent);
    const referrer = document.referrer || null;

    // El SDK de Supabase se carga de forma diferida para no bloquear el
    // render inicial de la pagina.
    import('@/lib/supabase').then(({ supabase }) => {
      supabase.from('page_views').insert({
        session_id: sessionId,
        path,
        referrer,
        user_agent: userAgent,
        device_type: deviceType,
      }).then(({ error }) => {
        if (error) console.error('Tracking error:', error);
      });
    });
  }, [path]);
}
