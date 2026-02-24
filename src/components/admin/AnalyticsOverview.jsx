import React, { useEffect, useState } from 'react';
import { Activity, RefreshCw, AlertCircle } from 'lucide-react';

const REFRESH_MS = 60_000;

const emptyState = {
  activeUsersRealtime: null,
  activeUsers7d: 0,
  events7d: 0,
  newUsers7d: 0,
  trafficSources: [],
  usersByCountry: [],
  landingPages: [],
  devices: [],
  topPages: [],
  updatedAt: null,
};

const MetricCard = ({ value, label, loading }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
    <div className="text-3xl font-bold text-[#1B4965] mb-2">
      {loading ? '...' : value}
    </div>
    <div className="text-sm text-gray-500 font-medium text-center">{label}</div>
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
          activeUsers7d: json.activeUsers7d ?? 0,
          events7d: json.events7d ?? 0,
          newUsers7d: json.newUsers7d ?? 0,
          trafficSources: Array.isArray(json.trafficSources) ? json.trafficSources : [],
          usersByCountry: Array.isArray(json.usersByCountry) ? json.usersByCountry : [],
          landingPages: Array.isArray(json.landingPages) ? json.landingPages : [],
          devices: Array.isArray(json.devices) ? json.devices : [],
          topPages: Array.isArray(json.topPages) ? json.topPages : [],
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

  const landingPages = stats.landingPages.length > 0
    ? stats.landingPages
    : [{ page: 'Ingen data ennå', sessions: 0 }];

  const topPages = stats.topPages.length > 0
    ? stats.topPages
    : [{ page: 'Ingen data ennå', views: 0 }];

  const devices = stats.devices.length > 0
    ? stats.devices
    : [{ category: 'Ingen data ennå', users: 0 }];

  const realtimeLabel = stats.activeUsersRealtime === null
    ? 'Aktive besøkende (realtime utilgjengelig)'
    : 'Aktive besøkende (nå)';

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#1B4965]" />
          <h3 className="text-lg font-semibold text-gray-800">Besøksstatistikk (Google Analytics)</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {stats.updatedAt && !error && (
            <span>
              Oppdatert {new Date(stats.updatedAt).toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
          {refreshing && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <div className="font-medium">Analytics kunne ikke lastes</div>
            <div>{error}</div>
            <div className="mt-1 text-red-600/80">
              Sjekk Vercel env vars: `GA4_PROPERTY_ID`, `GA_SERVICE_ACCOUNT_EMAIL`, `GA_SERVICE_ACCOUNT_PRIVATE_KEY`.
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          value={stats.activeUsersRealtime ?? stats.activeUsers7d}
          label={realtimeLabel}
          loading={loading}
        />
        <MetricCard
          value={stats.events7d}
          label="Antall hendelser (7 dager)"
          loading={loading}
        />
        <MetricCard
          value={stats.newUsers7d}
          label="Nye besøkende (7 dager)"
          loading={loading}
        />

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 col-span-1 md:col-span-2 flex flex-col">
          <div className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-gray-400" />
            Hvor kommer de fra? (7 dager)
          </div>
          <ul className="space-y-3">
            {trafficSources.map((src, i) => (
              <li key={`${src.source}-${i}`} className="flex justify-between items-center text-sm gap-3">
                <span className="text-gray-600 truncate">{src.source}</span>
                <span className="font-semibold text-gray-900 bg-gray-50 px-2 py-1 rounded shrink-0">{src.sessions}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="font-semibold text-gray-800 mb-4">Mest populære inngangssider (7 dager)</div>
          <ul className="space-y-3">
            {landingPages.map((lp, i) => (
              <li key={`${lp.page}-${i}`} className="flex justify-between items-center text-sm gap-3">
                <span className="text-gray-600 truncate" title={lp.page}>
                  {lp.page === '/' ? 'Forsiden' : lp.page}
                </span>
                <span className="font-semibold text-gray-900 bg-gray-50 px-2 py-1 rounded shrink-0">{lp.sessions}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="font-semibold text-gray-800 mb-4">Mest besøkte sider (7 dager)</div>
          <ul className="space-y-3">
            {topPages.map((tp, i) => (
              <li key={`${tp.page}-${i}`} className="flex justify-between items-center text-sm gap-3">
                <span className="text-gray-600 truncate" title={tp.page}>
                  {tp.page === '/' ? 'Forsiden' : tp.page}
                </span>
                <span className="font-semibold text-gray-900 bg-gray-50 px-2 py-1 rounded shrink-0">{tp.views}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="font-semibold text-gray-800 mb-4">Enhetstyper (7 dager)</div>
          <ul className="space-y-3">
            {devices.map((d, i) => (
              <li key={`${d.category}-${i}`} className="flex justify-between items-center text-sm gap-3">
                <span className="text-gray-600 capitalize">{d.category}</span>
                <span className="font-semibold text-gray-900 bg-gray-50 px-2 py-1 rounded shrink-0">{d.users}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="font-semibold text-gray-800 mb-4">Geografi (7 dager)</div>
          <ul className="space-y-3">
            {usersByCountry.map((c, i) => (
              <li key={`${c.country}-${i}`} className="flex justify-between items-center text-sm gap-3">
                <span className="text-gray-600 truncate">{c.country}</span>
                <span className="font-semibold text-gray-900 bg-gray-50 px-2 py-1 rounded shrink-0">{c.users}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverview;
