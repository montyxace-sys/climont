import { useEffect, useState, useMemo } from 'react';
import { Eye, Users, Globe, Monitor, Smartphone, Tablet, TrendingUp, Calendar, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BarChart, LineChart, DonutChart } from '@/components/admin/Charts';

type PageView = {
  id: string;
  session_id: string;
  path: string;
  referrer: string | null;
  user_agent: string | null;
  device_type: string | null;
  created_at: string;
};

type Range = '7d' | '30d' | '90d';

export function Analytics() {
  const [views, setViews] = useState<PageView[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<Range>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [range]);

  const loadAnalytics = async () => {
    setLoading(true);
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const since = new Date(Date.now() - days * 86400000).toISOString();

    const { data, error } = await supabase
      .from('page_views')
      .select('*')
      .gte('created_at', since)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading analytics:', error);
    } else {
      setViews(data || []);
    }
    setLoading(false);
  };

  const metrics = useMemo(() => {
    const totalVisits = views.length;
    const uniqueVisitors = new Set(views.map((v) => v.session_id)).size;
    const avgPerVisitor = uniqueVisitors > 0 ? (totalVisits / uniqueVisitors).toFixed(1) : '0';

    // Daily trend
    const dayMap = new Map<string, number>();
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      dayMap.set(d.toISOString().slice(0, 10), 0);
    }
    views.forEach((v) => {
      const key = v.created_at.slice(0, 10);
      if (dayMap.has(key)) dayMap.set(key, dayMap.get(key)! + 1);
    });

    const dayLabels: Record<number, string> = { 0: 'Dom', 1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb' };
    const trend = Array.from(dayMap.entries()).map(([key, value]) => {
      const d = new Date(key);
      if (days <= 7) {
        return { label: dayLabels[d.getDay()], value };
      }
      return { label: `${d.getDate()}/${d.getMonth() + 1}`, value };
    });

    // Page breakdown
    const pageMap = new Map<string, number>();
    views.forEach((v) => {
      const p = v.path || '/';
      pageMap.set(p, (pageMap.get(p) || 0) + 1);
    });
    const pages = Array.from(pageMap.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    // Device breakdown
    const deviceMap = new Map<string, number>();
    views.forEach((v) => {
      const d = v.device_type || 'desktop';
      deviceMap.set(d, (deviceMap.get(d) || 0) + 1);
    });
    const devices = [
      { label: 'Escritorio', value: deviceMap.get('desktop') || 0, color: '#0891b2' },
      { label: 'Móvil', value: deviceMap.get('mobile') || 0, color: '#f97316' },
      { label: 'Tablet', value: deviceMap.get('tablet') || 0, color: '#22c55e' },
    ].filter((d) => d.value > 0);

    // Referrer breakdown
    const refMap = new Map<string, number>();
    views.forEach((v) => {
      if (v.referrer) {
        try {
          const url = new URL(v.referrer);
          const host = url.hostname;
          refMap.set(host, (refMap.get(host) || 0) + 1);
        } catch {
          refMap.set('Otros', (refMap.get('Otros') || 0) + 1);
        }
      } else {
        refMap.set('Acceso directo', (refMap.get('Acceso directo') || 0) + 1);
      }
    });
    const referrers = Array.from(refMap.entries())
      .map(([label, value]) => ({ label, value, color: getColorForIndex(Array.from(refMap.keys()).indexOf(label)) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // Hourly distribution
    const hourMap = new Array(24).fill(0);
    views.forEach((v) => {
      const h = new Date(v.created_at).getHours();
      hourMap[h]++;
    });
    const hourly = hourMap.map((value, h) => ({
      label: h % 3 === 0 ? `${h}h` : '',
      value,
    }));

    // Day of week distribution
    const dowMap = new Array(7).fill(0);
    views.forEach((v) => {
      const d = new Date(v.created_at).getDay();
      dowMap[d]++;
    });
    const dowLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const dow = dowLabels.map((label, i) => ({ label, value: dowMap[i] }));

    return { totalVisits, uniqueVisitors, avgPerVisitor, trend, pages, devices, referrers, hourly, dow };
  }, [views, range]);

  const deviceIcons: Record<string, typeof Smartphone> = {
    Escritorio: Monitor,
    Móvil: Smartphone,
    Tablet: Tablet,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  const ranges: { id: Range; label: string }[] = [
    { id: '7d', label: '7 días' },
    { id: '30d', label: '30 días' },
    { id: '90d', label: '90 días' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Analítica de visitantes</h1>
          <p className="text-ink-500 text-sm mt-1">Comportamiento y procedencia de los visitantes</p>
        </div>
        <div className="flex gap-2">
          {ranges.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                range === r.id ? 'bg-ink-900 text-white' : 'bg-white text-ink-600 border border-ink-200 hover:bg-ink-50'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Eye} label="Visitas totales" value={metrics.totalVisits} color="primary" />
        <MetricCard icon={Users} label="Visitantes únicos" value={metrics.uniqueVisitors} color="success" />
        <MetricCard icon={TrendingUp} label="Páginas/visitante" value={metrics.avgPerVisitor} color="accent" />
        <MetricCard icon={Calendar} label="Periodo" value={ranges.find(r => r.id === range)?.label || ''} color="warning" />
      </div>

      {/* Trend chart */}
      <div className="bg-white rounded-2xl p-5 border border-ink-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary-600" />
          <h3 className="font-display font-semibold text-ink-900">Tendencia de visitas</h3>
        </div>
        {metrics.totalVisits > 0 ? (
          <LineChart data={metrics.trend} height={240} />
        ) : (
          <div className="flex items-center justify-center py-12 text-ink-400 text-sm">Sin datos en este periodo</div>
        )}
      </div>

      {/* Two columns */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Devices */}
        <div className="bg-white rounded-2xl p-5 border border-ink-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-5 h-5 text-primary-600" />
            <h3 className="font-display font-semibold text-ink-900">Dispositivos</h3>
          </div>
          {metrics.devices.length > 0 ? (
            <>
              <DonutChart data={metrics.devices} size={140} />
              <div className="mt-4 space-y-2">
                {metrics.devices.map((d) => {
                  const Icon = deviceIcons[d.label] || Monitor;
                  return (
                    <div key={d.label} className="flex items-center gap-2 text-sm">
                      <Icon className="w-4 h-4 text-ink-400" />
                      <span className="text-ink-600 flex-1">{d.label}</span>
                      <span className="font-semibold text-ink-900">{d.value}</span>
                      <span className="text-ink-400 text-xs w-10 text-right">
                        {Math.round((d.value / metrics.totalVisits) * 100)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-12 text-ink-400 text-sm">Sin datos</div>
          )}
        </div>

        {/* Referrers */}
        <div className="bg-white rounded-2xl p-5 border border-ink-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-primary-600" />
            <h3 className="font-display font-semibold text-ink-900">Procedencia</h3>
          </div>
          {metrics.referrers.length > 0 ? (
            <div className="space-y-2.5">
              {metrics.referrers.map((r) => (
                <div key={r.label} className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: r.color }} />
                  <span className="text-sm text-ink-700 flex-1 truncate">{r.label}</span>
                  <span className="font-semibold text-ink-900 text-sm">{r.value}</span>
                  <span className="text-ink-400 text-xs w-10 text-right">
                    {Math.round((r.value / metrics.totalVisits) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-ink-400 text-sm">Sin datos</div>
          )}
        </div>
      </div>

      {/* Hourly + Day of week */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-ink-100 shadow-sm">
          <h3 className="font-display font-semibold text-ink-900 mb-4">Visitas por hora del día</h3>
          {metrics.totalVisits > 0 ? (
            <BarChart data={metrics.hourly} height={200} color="#0891b2" />
          ) : (
            <div className="flex items-center justify-center py-12 text-ink-400 text-sm">Sin datos</div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 border border-ink-100 shadow-sm">
          <h3 className="font-display font-semibold text-ink-900 mb-4">Visitas por día de la semana</h3>
          {metrics.totalVisits > 0 ? (
            <BarChart data={metrics.dow} height={200} color="#f97316" />
          ) : (
            <div className="flex items-center justify-center py-12 text-ink-400 text-sm">Sin datos</div>
          )}
        </div>
      </div>

      {/* Page breakdown */}
      <div className="bg-white rounded-2xl p-5 border border-ink-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-primary-600" />
          <h3 className="font-display font-semibold text-ink-900">Páginas más visitadas</h3>
        </div>
        {metrics.pages.length > 0 ? (
          <div className="space-y-2.5">
            {metrics.pages.map((p) => {
              const maxVal = metrics.pages[0].value;
              return (
                <div key={p.label} className="flex items-center gap-3">
                  <span className="text-sm text-ink-700 w-32 truncate flex-shrink-0">{p.label}</span>
                  <div className="flex-1 h-6 bg-ink-50 rounded-lg overflow-hidden">
                    <div
                      className="h-full bg-primary-500/80 rounded-lg transition-all duration-500"
                      style={{ width: `${(p.value / maxVal) * 100}%` }}
                    />
                  </div>
                  <span className="font-semibold text-ink-900 text-sm w-10 text-right">{p.value}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 text-ink-400 text-sm">Sin datos</div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color }: { icon: typeof Eye; label: string; value: string | number; color: string }) {
  const colorMap: Record<string, { bg: string; text: string }> = {
    primary: { bg: 'bg-primary-50', text: 'text-primary-600' },
    success: { bg: 'bg-success-50', text: 'text-success-600' },
    accent: { bg: 'bg-accent-50', text: 'text-accent-600' },
    warning: { bg: 'bg-warning-50', text: 'text-warning-600' },
  };
  const c = colorMap[color] || colorMap.primary;
  return (
    <div className="bg-white rounded-2xl p-5 border border-ink-100 shadow-sm">
      <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${c.text}`} />
      </div>
      <div className="text-2xl font-bold text-ink-900">{value}</div>
      <div className="text-sm text-ink-500 mt-0.5">{label}</div>
    </div>
  );
}

const CHART_COLORS = ['#0891b2', '#f97316', '#22c55e', '#fbbf24', '#475569', '#06b6d4'];
function getColorForIndex(i: number): string {
  return CHART_COLORS[i % CHART_COLORS.length];
}
