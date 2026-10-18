const GA_ID = 'G-WFPTWE598W';
const STORAGE_KEY = 'cookie-consent';

type Consent = {
  accepted: boolean;
  analytics: boolean;
  timestamp: string;
};

export function getConsent(): Consent | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Consent;
  } catch {
    return null;
  }
}

export function updateAnalyticsConsent() {
  const consent = getConsent();
  const granted = consent?.accepted && consent.analytics;
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      analytics_storage: granted ? 'granted' : 'denied',
    });
  }
}

export function trackPageView(path: string) {
  if (typeof window.gtag === 'function') {
    window.gtag('config', GA_ID, { page_path: path });
  }
}

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}
