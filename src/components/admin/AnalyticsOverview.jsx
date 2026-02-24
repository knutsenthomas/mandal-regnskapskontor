import React, { useEffect, useState } from 'react';
import { Activity, RefreshCw, AlertCircle, Users, Globe, Layout, MousePointer2, Smartphone, Monitor } from 'lucide-react';

const REFRESH_MS = 60_000;

const emptyState = {
  activeUsersRealtime: null,
  activeUsers30d: 0,
  events30d: 0,
  newUsers30d: 0,
  trafficSources: [],
  usersByCountry: [],
  landingPages: [],
  devices: [],
  topPages: [],
  browsers: [],
  updatedAt: null,
};

const MetricCard = ({ value, label, loading, icon: Icon }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col group hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-2">
      <div className="text-3xl font-bold text-[#1B4965]">
        {loading ? <div className="h-9 w-16 bg-gray-100 animate-pulse rounded"></div> : value}
      </div>
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
        <Icon className="w-5 h-5 text-gray-400 group-hover:text-white" />
      </div>
    </div>
    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{label}</div>
  </div>
);

const AnalyticsOverview = () => {
  const [stats, setStats] = useState(emptyState);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const fetchAnalytics = async ({ silent = false } = {}) => {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      try {
        const response = await fetch('/api/ga4-overview', {
          method: 'GET',
          headers: { Accept: 'application/json' },
        });

        const json = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(json?.message || json?.error || 'Kunne ikke hente analytics-data.');
        }

        if (!mounted) return;
        setStats({
          activeUsersRealtime: json.activeUsersRealtime ?? null,
          activeUsers30d: json.activeUsers30d ?? 0,
          events30d: json.events30d ?? 0,
          newUsers30d: json.newUsers30d ?? 0,
          trafficSources: Array.isArray(json.trafficSources) ? json.trafficSources : [],
          usersByCountry: Array.isArray(json.usersByCountry) ? json.usersByCountry : [],
          landingPages: Array.isArray(json.landingPages) ? json.landingPages : [],
          devices: Array.isArray(json.devices) ? json.devices : [],
          topPages: Array.isArray(json.topPages) ? json.topPages : [],
          browsers: Array.isArray(json.browsers) ? json.browsers : [],
          updatedAt: json.updatedAt || null,
        });
        setError('');
      } catch (err) {
        if (!mounted) return;
        setError(err?.message || 'Kunne ikke hente analytics-data.');
      } finally {
        if (!mounted) return;
        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchAnalytics();
    const intervalId = window.setInterval(() => fetchAnalytics({ silent: true }), REFRESH_MS);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const trafficSources = stats.trafficSources.length > 0
    ? stats.trafficSources
    : [{ source: 'Ingen data ennå', sessions: 0 }];

  const usersByCountry = stats.usersByCountry.length > 0
    ? stats.usersByCountry
    : [{ country: 'Ingen data ennå', users: 0 }];

  const topPages = stats.topPages.length > 0
    ? stats.topPages
    : [{ page: 'Ingen data ennå', views: 0 }];

  const devices = stats.devices.length > 0
    ? stats.devices
    : [{ category: 'Ingen data ennå', users: 0 }];

  const realtimeLabel = stats.activeUsersRealtime === null
    ? 'Aktive nå (Estimert)'
    : 'Aktive besøkende nå';

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1B4965]/5 flex items-center justify-center">
            <Activity className="w-5 h-5 text-[#1B4965]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Besøksstatistikk</h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Google Analytics 4 Data</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {stats.updatedAt && !error && (
            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full uppercase tracking-widest border border-gray-100">
              Oppdatert {new Date(stats.updatedAt).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {refreshing && <RefreshCw className="w-4 h-4 text-primary animate-spin" />}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border-none bg-red-50 p-6 flex items-start gap-4 shadow-sm ring-1 ring-red-100">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <div className="font-bold text-red-900 mb-1">Analytics koble-feil</div>
            <p className="text-sm text-red-700/80 leading-relaxed mb-3">{error}</p>
            <div className="text-[10px] font-bold text-red-800 uppercase tracking-widest opacity-60">Sjekk konfigurasjon i miljøvariabler</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          value={stats.activeUsersRealtime ?? stats.activeUsers30d}
          label={realtimeLabel}
          loading={loading}
          icon={Users}
        />
        <MetricCard
          value={stats.events30d}
          label="Interaksjoner (30 dager)"
          loading={loading}
          icon={MousePointer2}
        />
        <MetricCard
          value={stats.newUsers30d}
          label="Nye brukere (30 dager)"
          loading={loading}
          icon={Activity}
        />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col group min-h-[300px]">
          <div className="font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-50 pb-4">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-sm uppercase tracking-widest font-bold text-gray-400 text-[10px]">Trafikkilder</span>
          </div>
          <ul className="space-y-4 flex-1">
            {trafficSources.map((src, i) => (
              <li key={`${src.source}-${i}`} className="flex justify-between items-center group/item">
                <span className="text-sm font-medium text-gray-600 truncate max-w-[150px] group-hover/item:text-primary transition-colors">{src.source}</span>
                <span className="font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded-lg text-xs shadow-sm ring-1 ring-gray-100 group-hover/item:bg-primary group-hover/item:text-white transition-all">{src.sessions}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col group min-h-[300px]">
          <div className="font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-50 pb-4">
            <Layout className="w-4 h-4 text-primary" />
            <span className="text-sm uppercase tracking-widest font-bold text-gray-400 text-[10px]">Topp sider</span>
          </div>
          <ul className="space-y-4 flex-1">
            {topPages.map((tp, i) => (
              <li key={`${tp.page}-${i}`} className="flex justify-between items-center group/item">
                <span className="text-sm font-medium text-gray-600 truncate max-w-[150px] group-hover/item:text-primary transition-colors" title={tp.page}>
                  {tp.page === '/' ? 'Forsiden' : tp.page}
                </span>
                <span className="font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded-lg text-xs shadow-sm ring-1 ring-gray-100 group-hover/item:bg-primary group-hover/item:text-white transition-all">{tp.views}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col group min-h-[300px]">
          <div className="font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-50 pb-4">
            <Smartphone className="w-4 h-4 text-primary" />
            <span className="text-sm uppercase tracking-widest font-bold text-gray-400 text-[10px]">Enheter & Geografi</span>
          </div>
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-gray-300 uppercase px-1">Enhetstyper</p>
              {devices.slice(0, 3).map((d, i) => (
                <div key={`${d.category}-${i}`} className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    {d.category === 'mobile' ? <Smartphone className="w-3 h-3 text-gray-400" /> : <Monitor className="w-3 h-3 text-gray-400" />}
                    <span className="capitalize">{d.category}</span>
                  </div>
                  <span className="font-bold text-xs text-gray-900">{d.users}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3 pt-4 border-t border-gray-50">
              <p className="text-[10px] font-bold text-gray-300 uppercase px-1">Hvor i verden</p>
              {usersByCountry.slice(0, 3).map((c, i) => (
                <div key={`${c.country}-${i}`} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600 truncate max-w-[150px]">{c.country}</span>
                  <span className="font-bold text-xs text-gray-900">{c.users}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverview;
