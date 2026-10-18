import { useEffect, useState } from 'react';
import { TrendingUp, Mail, Eye, Users, Clock, Smartphone, Monitor, Tablet } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BarChart, DonutChart, LineChart } from '@/components/admin/Charts';

type Stats = {
  totalVisits: number;
  uniqueVisitors: number;
  totalRequests: number;
  pendingRequests: number;
  todayVisits: number;
  todayRequests: number;
  visitsTrend: { label: string; value: number }[];
  requestsByService: { label: string; value: number; color: string }[];
  deviceBreakdown: { label: string; value: number; color: string }[];
  recentRequests: { id: string; name: string; service_type: string; created_at: string; status: string }[];
};

const SERVICE_COLORS: Record<string, string> = {
  instalacion: '#0891b2',
  mantenimiento: '#22c55e',
  reparacion: '#f97316',
  ventilacion: '#a5f3fc',
  eficiencia: '#fbbf24',
  airzone: '#06b6d4',
  constructoras: '#475569',
};

const SERVICE_LABELS: Record<string, string> = {
  instalacion: 'Instalación',
  mantenimiento: 'Mantenimiento',
  reparacion: 'Reparación',
  ventilacion: 'Ventilación',
  eficiencia: 'Eficiencia',
  airzone: 'Airzone',
  constructoras: 'Constructoras',
};

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const sevenDaysAgo = new Date(now.getTime() - 6 * 86400000).toISOString();

    const [visits, uniqueVisitors, requests, pendingReq, todayVisits, todayRequests, recentReq] = await Promise.all([
      supabase.from('page_views').select('id', { count: 'exact', head: true }),
      supabase.from('page_views').select('session_id'),
      supabase.from('contact_requests').select('id', { count: 'exact', head: true }),
      supabase.from('contact_requests').select('id', { count: 'exact', head: true }).eq('status', 'pendiente'),
      supabase.from('page_views').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
      supabase.from('contact_requests').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
      supabase.from('contact_requests').select('id, name, service_type, created_at, status').order('created_at', { ascending: false }).limit(5),
    ]);

    // Last 7 days visits trend
    const visitsLast7 = await supabase
      .from('page_views')
      .select('created_at')
      .gte('created_at', sevenDaysAgo);

    const dayLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const dayMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      dayMap.set(key, 0);
    }
    visitsLast7.data?.forEach((v) => {
      const key = v.created_at.slice(0, 10);
      if (dayMap.has(key)) dayMap.set(key, dayMap.get(key)! + 1);
    });
    const visitsTrend = Array.from(dayMap.entries()).map(([key, value]) => {
      const d = new Date(key);
      const dayName = dayLabels[(d.getDay() + 6) % 7];
      return { label: dayName, value };
    });

    // Requests by service
    const allRequests = await supabase.from('contact_requests').select('service_type');
    const serviceMap = new Map<string, number>();
    allRequests.data?.forEach((r) => {
      const k = r.service_type || 'otros';
      serviceMap.set(k, (serviceMap.get(k) || 0) + 1);
    });
    const requestsByService = Array.from(serviceMap.entries()).map(([key, value]) => ({
      label: SERVICE_LABELS[key] || key,
      value,
      color: SERVICE_COLORS[key] || '#94a3b8',
    })).sort((a, b) => b.value - a.value);

    // Device breakdown
    const deviceMap = new Map<string, number>();
    const allVisits = await supabase.from('page_views').select('device_type');
    allVisits.data?.forEach((v) => {
      const k = v.device_type || 'desktop';
      deviceMap.set(k, (deviceMap.get(k) || 0) + 1);
    });
    const deviceBreakdown = [
      { label: 'Escritorio', value: deviceMap.get('desktop') || 0, color: '#0891b2' },
      { label: 'Móvil', value: deviceMap.get('mobile') || 0, color: '#f97316' },
      { label: 'Tablet', value: deviceMap.get('tablet') || 0, color: '#22c55e' },
    ].filter((d) => d.value > 0);

    const uniqueSessionIds = new Set(uniqueVisitors.data?.map((v) => v.session_id));

    setStats({
      totalVisits: visits.count || 0,
      uniqueVisitors: uniqueSessionIds.size,
      totalRequests: requests.count || 0,
      pendingRequests: pendingReq.count || 0,
      todayVisits: todayVisits.count || 0,
      todayRequests: todayRequests.count || 0,
      visitsTrend,
      requestsByService,
      deviceBreakdown,
      recentRequests: recentReq.data || [],
    });
    setLoading(false);
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Visitas totales', value: stats.totalVisits, icon: Eye, color: 'primary', sub: `${stats.todayVisits} hoy` },
    { label: 'Visitantes únicos', value: stats.uniqueVisitors, icon: Users, color: 'success', sub: 'Sesiones distintas' },
    { label: 'Solicitudes totales', value: stats.totalRequests, icon: Mail, color: 'accent', sub: `${stats.todayRequests} hoy` },
    { label: 'Pendientes', value: stats.pendingRequests, icon: Clock, color: 'warning', sub: 'Por responder' },
  ];

  const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
    primary: { bg: 'bg-primary-50', text: 'text-primary-700', icon: 'text-primary-600' },
    success: { bg: 'bg-success-50', text: 'text-success-700', icon: 'text-success-600' },
    accent: { bg: 'bg-accent-50', text: 'text-accent-700', icon: 'text-accent-600' },
    warning: { bg: 'bg-warning-50', text: 'text-warning-700', icon: 'text-warning-600' },
  };

  const deviceIcons: Record<string, typeof Smartphone> = {
    Escritorio: Monitor,
    Móvil: Smartphone,
    Tablet: Tablet,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Resumen general</h1>
        <p className="text-ink-500 text-sm mt-1">Estadísticas de visitantes y solicitudes de presupuesto</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const c = colorMap[card.color];
          return (
            <div key={card.label} className="bg-white rounded-2xl p-5 border border-ink-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${c.icon}`} />
                </div>
                <span className="text-xs text-ink-400">{card.sub}</span>
              </div>
              <div className="text-2xl font-bold text-ink-900">{card.value}</div>
              <div className="text-sm text-ink-500 mt-0.5">{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Visits trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-ink-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h3 className="font-display font-semibold text-ink-900">Visitas últimos 7 días</h3>
          </div>
          <LineChart data={stats.visitsTrend} height={220} />
        </div>

        {/* Device breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-ink-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-5 h-5 text-primary-600" />
            <h3 className="font-display font-semibold text-ink-900">Dispositivos</h3>
          </div>
          {stats.deviceBreakdown.length > 0 ? (
            <DonutChart data={stats.deviceBreakdown} size={140} />
          ) : (
            <div className="flex items-center justify-center py-12 text-ink-400 text-sm">Sin datos</div>
          )}
          <div className="mt-4 space-y-2">
            {stats.deviceBreakdown.map((d) => {
              const Icon = deviceIcons[d.label] || Monitor;
              return (
                <div key={d.label} className="flex items-center gap-2 text-sm">
                  <Icon className="w-4 h-4 text-ink-400" />
                  <span className="text-ink-600 flex-1">{d.label}</span>
                  <span className="font-semibold text-ink-900">{d.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Requests by service + Recent requests */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-ink-100 shadow-sm">
          <h3 className="font-display font-semibold text-ink-900 mb-4">Solicitudes por servicio</h3>
          {stats.requestsByService.length > 0 ? (
            <BarChart data={stats.requestsByService.map((r) => ({ label: r.label, value: r.value }))} height={200} />
          ) : (
            <div className="flex items-center justify-center py-12 text-ink-400 text-sm">Sin solicitudes todavía</div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 border border-ink-100 shadow-sm">
          <h3 className="font-display font-semibold text-ink-900 mb-4">Solicitudes recientes</h3>
          {stats.recentRequests.length > 0 ? (
            <div className="space-y-3">
              {stats.recentRequests.map((req) => (
                <div key={req.id} className="flex items-center gap-3 p-3 bg-ink-50 rounded-xl">
                  <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-ink-900 text-sm truncate">{req.name}</div>
                    <div className="text-xs text-ink-500">{SERVICE_LABELS[req.service_type] || req.service_type}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                      req.status === 'pendiente' ? 'bg-warning-100 text-warning-700'
                      : req.status === 'contactado' ? 'bg-primary-100 text-primary-700'
                      : req.status === 'completado' ? 'bg-success-100 text-success-700'
                      : 'bg-ink-100 text-ink-600'
                    }`}>
                      {req.status}
                    </span>
                    <div className="text-xs text-ink-400 mt-1">
                      {new Date(req.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-ink-400 text-sm">Sin solicitudes todavía</div>
          )}
        </div>
      </div>
    </div>
  );
}
