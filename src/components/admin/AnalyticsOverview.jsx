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
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
    {/* Aktive brukere */}
    <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
      <div className="text-3xl font-bold text-primary mb-2">{dummyData.activeUsers}</div>
      <div className="text-gray-500">Aktive brukere (7 dager)</div>
    </div>
    {/* Antall hendelser */}
    <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
      <div className="text-3xl font-bold text-primary mb-2">{dummyData.events}</div>
      <div className="text-gray-500">Antall hendelser</div>
    </div>
    {/* Nye brukere */}
    <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
      <div className="text-3xl font-bold text-primary mb-2">{dummyData.newUsers}</div>
      <div className="text-gray-500">Nye brukere</div>
    </div>
    {/* Trafikkilder */}
    <div className="bg-white rounded-lg shadow p-6 col-span-1 md:col-span-2 flex flex-col">
      <div className="font-semibold mb-2">Trafikkilder</div>
      <ul>
        {dummyData.trafficSources.map((src, i) => (
          <li key={i} className="flex justify-between text-gray-700 border-b py-1">
            <span>{src.source}</span>
            <span>{src.sessions}</span>
          </li>
        ))}
      </ul>
    </div>
    {/* Kart over brukere per land (forenklet) */}
    <div className="bg-white rounded-lg shadow p-6 flex flex-col">
      <div className="font-semibold mb-2">Brukere per land</div>
      <ul>
        {dummyData.usersByCountry.map((c, i) => (
          <li key={i} className="flex justify-between text-gray-700 border-b py-1">
            <span>{c.country}</span>
            <span>{c.users}</span>
          </li>
        ))}
      </ul>
      {/* Her kan du integrere et kart senere */}
    </div>
  </div>
);

export default AnalyticsOverview;
