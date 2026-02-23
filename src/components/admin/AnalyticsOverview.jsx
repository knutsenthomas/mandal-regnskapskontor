import React from 'react';

// Dummy/testdata for visning før API-integrasjon
const dummyData = {
  activeUsers: 3,
  events: 40,
  newUsers: 1,
  trafficSources: [
    { source: 'Organic Search', sessions: 1 },
    { source: 'Organic Social', sessions: 2 },
  ],
  usersByCountry: [
    { country: 'Norway', users: 3 },
  ],
};

const AnalyticsOverview = () => (
  <div className="mt-8">
    <div className="flex items-center gap-2 mb-4">
      <Activity className="w-5 h-5 text-[#1B4965]" />
      <h3 className="text-lg font-semibold text-gray-800">Besøksstatistikk (Google Analytics)</h3>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Aktive besøkende */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
        <div className="text-3xl font-bold text-[#1B4965] mb-2">{dummyData.activeUsers}</div>
        <div className="text-sm text-gray-500 font-medium">Aktive besøkende (7 dager)</div>
      </div>
      {/* Antall hendelser */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
        <div className="text-3xl font-bold text-[#1B4965] mb-2">{dummyData.events}</div>
        <div className="text-sm text-gray-500 font-medium">Antall klikk/hendelser</div>
      </div>
      {/* Nye besøkende */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
        <div className="text-3xl font-bold text-[#1B4965] mb-2">{dummyData.newUsers}</div>
        <div className="text-sm text-gray-500 font-medium">Nye besøkende</div>
      </div>
      {/* Trafikkilder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 col-span-1 md:col-span-2 flex flex-col">
        <div className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-gray-400" />
          Hvor kommer de fra?
        </div>
        <ul className="space-y-3">
          {dummyData.trafficSources.map((src, i) => (
            <li key={i} className="flex justify-between items-center text-sm">
              <span className="text-gray-600">{src.source}</span>
              <span className="font-semibold text-gray-900 bg-gray-50 px-2 py-1 rounded">{src.sessions}</span>
            </li>
          ))}
        </ul>
      </div>
      {/* Land-oversikt */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
        <div className="font-semibold text-gray-800 mb-4">Geografi</div>
        <ul className="space-y-3">
          {dummyData.usersByCountry.map((c, i) => (
            <li key={i} className="flex justify-between items-center text-sm">
              <span className="text-gray-600">{c.country}</span>
              <span className="font-semibold text-gray-900 bg-gray-50 px-2 py-1 rounded">{c.users}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

export default AnalyticsOverview;
