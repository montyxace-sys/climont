import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminLayout, type AdminTab } from '@/components/admin/AdminLayout';
import { Dashboard } from '@/components/admin/Dashboard';
import { Requests } from '@/components/admin/Requests';
import { Analytics } from '@/components/admin/Analytics';
import { SeoPanel } from '@/components/admin/SeoPanel';
import { Products } from '@/components/admin/Products';
import { Reviews } from '@/components/admin/Reviews';
import { Jobs } from '@/components/admin/Jobs';
import { Pue } from '@/components/admin/Pue';
import { Applications } from '@/components/admin/Applications';
import { Mega } from '@/components/admin/Mega';
import { RecursosTab } from '@/components/admin/RecursosTab';
import { OfimaticaTab } from '@/components/admin/OfimaticaTab';
import { ChatbotQueries } from '@/components/admin/ChatbotQueries';
import { ProtonDrive } from '@/components/admin/ProtonDrive';
import { ProtonMail } from '@/components/admin/ProtonMail';
import { GoogleDrive } from '@/components/admin/GoogleDrive';
import { GoogleTools } from '@/components/admin/GoogleTools';
import { PCloud } from '@/components/admin/PCloud';
import { DocumentVault } from '@/components/admin/DocumentVault';
import { DownloadCenterAdmin } from '@/components/admin/DownloadCenterAdmin';
import { BlogEditor } from '@/components/admin/BlogEditor';

export function AdminPanel() {
  const { session, loading, signIn, signOut, recovery, clearRecovery } = useAuth();
  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingApplications, setPendingApplications] = useState(0);

  useEffect(() => {
    if (!session) return;
    supabase
      .from('contact_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pendiente')
      .then(({ count }) => setPendingCount(count || 0));
    supabase
      .from('job_applications')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pendiente')
      .then(({ count }) => setPendingApplications(count || 0));
  }, [session, tab]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-ink-950">
        <div className="w-8 h-8 border-3 border-primary-700 border-t-primary-400 rounded-full animate-spin" />
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="text-sm text-ink-500 underline-offset-4 transition-colors hover:text-ink-300 hover:underline"
        >
          Si tarda demasiado, recarga la página
        </button>
      </div>
    );
  }

  if (!session) {
    return <AdminLogin onSignIn={async (email, password) => { await signIn(email, password); }} />;
  }

  return (
    <AdminLayout activeTab={tab} onTabChange={setTab} onSignOut={signOut} requestCount={pendingCount} applicationCount={pendingApplications} recoveryMode={recovery} onRecoveryHandled={clearRecovery}>
      {tab === 'dashboard' && <Dashboard />}
      {tab === 'requests' && <Requests />}
      {tab === 'products' && <Products />}
      {tab === 'reviews' && <Reviews />}
      {tab === 'jobs' && <Jobs />}
      {tab === 'pue' && <Pue />}
      {tab === 'applications' && <Applications />}
      {tab === 'mega' && <Mega />}
      {tab === 'analytics' && <Analytics />}
      {tab === 'seo' && <SeoPanel />}
      {tab === 'blog' && <BlogEditor />}
      {tab === 'recursos' && <RecursosTab />}
      {tab === 'ofimatica' && <OfimaticaTab />}
      {tab === 'chatbot' && <ChatbotQueries />}
      {tab === 'proton-drive' && <ProtonDrive />}
      {tab === 'proton-mail' && <ProtonMail />}
      {tab === 'google-drive' && <GoogleDrive />}
      {tab === 'google-tools' && <GoogleTools />}
      {tab === 'pcloud' && <PCloud />}
      {tab === 'document-vault' && <DocumentVault />}
      {tab === 'downloads' && <DownloadCenterAdmin />}
    </AdminLayout>
  );
}
