import { useEffect } from 'react';

type SeoOptions = {
  title?: string;
  description?: string;
  canonicalPath?: string;
  keywords?: string;
  noIndex?: boolean;
  ogImage?: string;
};

const BASE_URL = 'https://climont.es';
const DEFAULT_TITLE = 'Aire acondicionado en Sevilla | Climatizaciones Montaño';
const DEFAULT_DESCRIPTION = 'Instalación, mantenimiento y reparación de aire acondicionado en Sevilla y provincia. Splits, conductos, cassettes, aerotermia, ventilación, energía solar térmica y preinstalaciones para constructoras. Certificados RITE-07. Presupuesto gratis en 24h.';

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function useSeo({ title, description, canonicalPath, keywords, noIndex, ogImage }: SeoOptions) {
  useEffect(() => {
    const fullTitle = title || DEFAULT_TITLE;
    const desc = description || DEFAULT_DESCRIPTION;
    const normalizedCanonicalPath = canonicalPath && canonicalPath !== '/'
      ? `/${canonicalPath.replace(/^\/+|\/+$/g, '')}`
      : '/';
    const canonical = `${BASE_URL}${normalizedCanonicalPath}`;

    document.title = fullTitle;
    setMeta('name', 'title', fullTitle);
    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:url', canonical);
    setMeta('property', 'og:image', ogImage || `${BASE_URL}/og-image.webp`);
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', desc);
    setMeta('name', 'twitter:url', canonical);
    setMeta('name', 'twitter:image', ogImage || `${BASE_URL}/og-image.webp`);
    setLink('canonical', canonical);

    setMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    if (keywords) {
      setMeta('name', 'keywords', keywords);
    } else {
      const el = document.head.querySelector<HTMLMetaElement>('meta[name="keywords"]');
      if (el) el.remove();
    }
  }, [title, description, canonicalPath, keywords, noIndex, ogImage]);
}
