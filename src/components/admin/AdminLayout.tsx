import { type ReactNode, useState, useEffect } from 'react';
import { Snowflake, LayoutDashboard, Mail, BarChart3, LogOut, ExternalLink, Search, Package, Image as ImageIcon, Wrench, FileText, Briefcase, Cloud, Grid3x3, Star, MessageCircleQuestion, HardDrive, Mail as MailIcon, FolderOpen, CloudSnow, ChevronDown, Globe, ShieldCheck, Download, Newspaper } from 'lucide-react';

export type AdminTab = 'dashboard' | 'requests' | 'products' | 'reviews' | 'jobs' | 'pue' | 'applications' | 'analytics' | 'seo' | 'blog' | 'mega' | 'recursos' | 'ofimatica' | 'chatbot' | 'proton-drive' | 'proton-mail' | 'google-drive' | 'pcloud' | 'google-tools' | 'document-vault' | 'downloads';

type LayoutProps = {
  children: ReactNode;
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  onSignOut: () => void;
  requestCount: number;
  applicationCount: number;
};

type NavItem = { id: AdminTab; label: string; icon: typeof LayoutDashboard };
type NavSection = { title: string; items: NavItem[] };

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Principal',
    items: [
      { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
      { id: 'requests', label: 'Solicitudes', icon: Mail },
      { id: 'products', label: 'Productos', icon: Package },
      { id: 'reviews', label: 'Reseñas', icon: Star },
    ],
  },
  {
    title: 'Gestión',
    items: [
      { id: 'jobs', label: 'Trabajos', icon: Wrench },
      { id: 'pue', label: 'PUE', icon: FileText },
      { id: 'applications', label: 'Candidaturas', icon: Briefcase },
      { id: 'analytics', label: 'Analítica', icon: BarChart3 },
      { id: 'seo', label: 'SEO', icon: Search },
      { id: 'blog', label: 'Blog', icon: Newspaper },
    ],
  },
  {
    title: 'Nube',
    items: [
      { id: 'mega', label: 'MEGA Cloud', icon: Cloud },
      { id: 'proton-drive', label: 'Proton Drive', icon: HardDrive },
      { id: 'proton-mail', label: 'Proton Mail', icon: MailIcon },
      { id: 'google-drive', label: 'Google Drive', icon: FolderOpen },
      { id: 'pcloud', label: 'pCloud', icon: CloudSnow },
    ],
  },
  {
    title: 'Herramientas',
    items: [
      { id: 'recursos', label: 'Recursos', icon: ImageIcon },
      { id: 'ofimatica', label: 'Ofimática', icon: Grid3x3 },
      { id: 'chatbot', label: 'Chatbot', icon: MessageCircleQuestion },
      { id: 'google-tools', label: 'Google', icon: Globe },
      { id: 'document-vault', label: 'Caja fuerte', icon: ShieldCheck },
      { id: 'downloads', label: 'Descargas', icon: Download },
    ],
  },
];

const ALL_NAV_ITEMS = NAV_SECTIONS.flatMap((s) => s.items);

function getInitialExpanded(activeTab: AdminTab): Set<string> {
  const expanded = new Set<string>();
  for (const section of NAV_SECTIONS) {
    if (section.items.some((item) => item.id === activeTab)) {
      expanded.add(section.title);
    }
  }
  return expanded;
}

export function AdminLayout({ children, activeTab, onTabChange, onSignOut, requestCount, applicationCount }: LayoutProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => getInitialExpanded(activeTab));

  useEffect(() => {
    setExpanded((prev) => {
      const next = new Set(prev);
      for (const section of NAV_SECTIONS) {
        if (section.items.some((item) => item.id === activeTab)) {
          next.add(section.title);
        }
      }
      return next;
    });
  }, [activeTab]);

  const toggleSection = (title: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => onTabChange(item.id)}
        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
          isActive
            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
            : 'text-ink-400 hover:text-white hover:bg-ink-800'
        }`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="truncate">{item.label}</span>
        {item.id === 'requests' && requestCount > 0 && (
          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${
            isActive ? 'bg-white/20 text-white' : 'bg-accent-500/20 text-accent-400'
          }`}>
            {requestCount}
          </span>
        )}
        {item.id === 'applications' && applicationCount > 0 && (
          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${
            isActive ? 'bg-white/20 text-white' : 'bg-accent-500/20 text-accent-400'
          }`}>
            {applicationCount}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-ink-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-ink-900 flex flex-col fixed inset-y-0 left-0 z-30 hidden lg:flex">
        <div className="p-5 border-b border-ink-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Snowflake className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-display font-bold text-white text-sm">Climont</div>
              <div className="text-ink-500 text-xs">Admin Panel</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_SECTIONS.map((section) => {
            const isOpen = expanded.has(section.title);
            const hasActiveChild = section.items.some((item) => item.id === activeTab);
            return (
              <div key={section.title}>
                <button
                  onClick={() => toggleSection(section.title)}
                  className={`w-full flex items-center gap-2 px-3.5 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                    hasActiveChild ? 'text-primary-400' : 'text-ink-600 hover:text-ink-400'
                  }`}
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`}
                  />
                  {section.title}
                </button>
                <div
                  className="overflow-hidden transition-all duration-200 ease-out"
                  style={{
                    maxHeight: isOpen ? `${section.items.length * 48 + 8}px` : '0px',
                    opacity: isOpen ? 1 : 0,
                  }}
                >
                  <div className="space-y-1 pt-1">
                    {section.items.map(renderNavItem)}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="p-3 border-t border-ink-800 space-y-1">
          <a
            href="/"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-ink-400 hover:text-white hover:bg-ink-800 transition-all"
          >
            <ExternalLink className="w-5 h-5" />
            Ver web pública
          </a>
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-ink-400 hover:text-error-400 hover:bg-ink-800 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 bg-ink-900 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <Snowflake className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-white text-sm">Climont Admin</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onSignOut}
            className="p-2 text-ink-400 hover:text-error-400"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-ink-900 border-t border-ink-800 flex overflow-x-auto">
        {ALL_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex-1 min-w-[64px] flex flex-col items-center gap-1 py-2.5 relative ${
                isActive ? 'text-primary-400' : 'text-ink-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] leading-tight text-center">{item.label}</span>
              {item.id === 'requests' && requestCount > 0 && (
                <span className="absolute top-1 right-1/4 w-4 h-4 bg-accent-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                  {requestCount > 9 ? '9+' : requestCount}
                </span>
              )}
              {item.id === 'applications' && applicationCount > 0 && (
                <span className="absolute top-1 right-1/4 w-4 h-4 bg-accent-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
                  {applicationCount > 9 ? '9+' : applicationCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pt-14 pb-16 lg:pt-0 lg:pb-0 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
