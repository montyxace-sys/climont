export function navigate(path: string) {
  const [pathname, hash] = path.split('#');
  const targetPath = pathname || '/';

  if (window.location.pathname !== targetPath) {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    if (!hash) {
      window.scrollTo(0, 0);
    } else {
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  } else if (hash) {
    const el = document.getElementById(hash);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  } else {
    window.scrollTo(0, 0);
  }
}
