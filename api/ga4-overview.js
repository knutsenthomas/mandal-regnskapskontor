import crypto from 'node:crypto';

const GA_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GA_DATA_BASE = 'https://analyticsdata.googleapis.com/v1beta';

const base64UrlEncode = (input) => {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
};

const signJwt = ({ clientEmail, privateKey }) => {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: clientEmail,
    scope: GA_SCOPE,
    aud: GOOGLE_TOKEN_URL,
    iat: now,
    exp: now + 3600,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedToken);
  signer.end();

  const signature = signer.sign(privateKey);
  return `${unsignedToken}.${base64UrlEncode(signature)}`;
};

const getAccessToken = async ({ clientEmail, privateKey }) => {
  const assertion = signJwt({ clientEmail, privateKey });
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion,
  });

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const json = await response.json();
  if (!response.ok || !json?.access_token) {
    throw new Error(json?.error_description || json?.error || 'Failed to get Google access token');
  }

  return json.access_token;
};

const googlePost = async ({ path, accessToken, body }) => {
  const response = await fetch(`${GA_DATA_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const json = await response.json();
  if (!response.ok) {
    const msg = json?.error?.message || 'Google Analytics Data API request failed';
    throw new Error(msg);
  }
  return json;
};

const metricValue = (report, rowIndex = 0, metricIndex = 0) => {
  const raw = report?.rows?.[rowIndex]?.metricValues?.[metricIndex]?.value;
  const num = Number(raw);
  return Number.isFinite(num) ? num : 0;
};

const mapDimensionMetricRows = (report) => (
  (report?.rows || []).map((row) => ({
    dimension: row?.dimensionValues?.[0]?.value || 'Unknown',
    metric: Number(row?.metricValues?.[0]?.value || 0),
  }))
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const propertyId = String(process.env.GA4_PROPERTY_ID || '').trim();
  const clientEmail = String(process.env.GA_SERVICE_ACCOUNT_EMAIL || '').trim();
  const privateKeyRaw = String(process.env.GA_SERVICE_ACCOUNT_PRIVATE_KEY || '');
  const privateKey = privateKeyRaw.replace(/\\n/g, '\n').trim();

  if (!propertyId || !clientEmail || !privateKey) {
    return res.status(503).json({
      error: 'GA analytics backend is not configured',
      missing: {
        GA4_PROPERTY_ID: !propertyId,
        GA_SERVICE_ACCOUNT_EMAIL: !clientEmail,
        GA_SERVICE_ACCOUNT_PRIVATE_KEY: !privateKey,
      },
    });
  }

  try {
    const accessToken = await getAccessToken({ clientEmail, privateKey });

    const [
      summaryReport,
      trafficReport,
      countryReport,
      landingPagesReport,
      deviceReport,
      pagesReport,
      realtimeReport
    ] = await Promise.all([
      googlePost({
        path: `/properties/${propertyId}:runReport`,
        accessToken,
        body: {
          dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
          metrics: [{ name: 'activeUsers' }, { name: 'eventCount' }, { name: 'newUsers' }],
          limit: 1,
        },
      }),
      googlePost({
        path: `/properties/${propertyId}:runReport`,
        accessToken,
        body: {
          dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'sessionDefaultChannelGroup' }],
          metrics: [{ name: 'sessions' }],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
          limit: 5,
        },
      }),
      googlePost({
        path: `/properties/${propertyId}:runReport`,
        accessToken,
        body: {
          dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'country' }],
          metrics: [{ name: 'activeUsers' }],
          orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
          limit: 5,
        },
      }),
      googlePost({
        path: `/properties/${propertyId}:runReport`,
        accessToken,
        body: {
          dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'landingPage' }],
          metrics: [{ name: 'sessions' }],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
          limit: 5,
        },
      }),
      googlePost({
        path: `/properties/${propertyId}:runReport`,
        accessToken,
        body: {
          dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'deviceCategory' }],
          metrics: [{ name: 'activeUsers' }],
          orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
          limit: 5,
        },
      }),
      googlePost({
        path: `/properties/${propertyId}:runReport`,
        accessToken,
        body: {
          dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'pagePath' }],
          metrics: [{ name: 'screenPageViews' }],
          orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
          limit: 5,
        },
      }),
      googlePost({
        path: `/properties/${propertyId}:runRealtimeReport`,
        accessToken,
        body: {
          metrics: [{ name: 'activeUsers' }],
          minuteRanges: [{ startMinutesAgo: 29, endMinutesAgo: 0 }],
          limit: 1,
        },
      }).catch(() => null),
    ]);

    const trafficSources = mapDimensionMetricRows(trafficReport).map((row) => ({
      source: row.dimension,
      sessions: row.metric,
    }));

    const usersByCountry = mapDimensionMetricRows(countryReport).map((row) => ({
      country: row.dimension,
      users: row.metric,
    }));

    const landingPages = mapDimensionMetricRows(landingPagesReport).map((row) => ({
      page: row.dimension,
      sessions: row.metric,
    }));

    const devices = mapDimensionMetricRows(deviceReport).map((row) => ({
      category: row.dimension,
      users: row.metric,
    }));

    const topPages = mapDimensionMetricRows(pagesReport).map((row) => ({
      page: row.dimension,
      views: row.metric,
    }));

    const payload = {
      activeUsersRealtime: realtimeReport ? metricValue(realtimeReport, 0, 0) : null,
      activeUsers7d: metricValue(summaryReport, 0, 0),
      events7d: metricValue(summaryReport, 0, 1),
      newUsers7d: metricValue(summaryReport, 0, 2),
      trafficSources,
      usersByCountry,
      landingPages,
      devices,
      topPages,
      updatedAt: new Date().toISOString(),
    };

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(payload);
  } catch (error) {
    console.error('GA overview API error:', error);
    return res.status(500).json({
      error: 'Failed to fetch analytics overview',
      message: error?.message || 'Unknown error',
    });
  }
}
