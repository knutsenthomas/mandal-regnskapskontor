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

  const propertyId = String(process.env.GA4_PROPERTY_ID || '479163398').trim();
  const clientEmail = String(process.env.GA_SERVICE_ACCOUNT_EMAIL || 'mandal-regnskapskontor@mandal-regnskapskontor-488411.iam.gserviceaccount.com').trim();
  const privateKeyRaw = String(process.env.GA_SERVICE_ACCOUNT_PRIVATE_KEY || '-----BEGIN PRIVATE KEY-----\\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCnloMf0XARSOEd\\npISEHjFlNR19LVL3aDMp7bZfQsXpoyeISzFgyeZxCy2TqR9v0vx8t5Sn4ngeZHic\\n2hocQH47vEnQGYZo8ZM5Rp07LVvORAn++0Y7eaL/wH0/PDQdG700RfpGb5nMa/T2\\nul0JYW0ZfCcVBbYg2ohz6BezJo1JfXpH/1VKrJx0DJx274e8HKTVQrA9KT6FzaEZ\\nUI1rtIL+JnW2TkzJt6hzHgpDWehJI6KMLeBCWRYM2/b6Ssx2/Wqvk7P4irjn4Mg+\\nCVFJp8jXHsVpOaxvmQlRyHCUtN4naJiX7q1rrIdnc1Rti+Xg+yDiz0kirbGa+3VQ\\nxqs2SsL5AgMBAAECggEABVl8ngtldGfLJ9MUl9MO6JgldNV5jIQ6/d+krq3G+4pF\\nvMgJr3lCbeFZdxky87LcdG63xBQqmW3Dm94qbzRv0yBTit0FuVvcwztJ0ZXFFHR/\\njTAgMc3UMi3G0bnuP++evohtUMpHMotPqoCQb7g4b1PTO4yPH8VaDbke6I0WfX4C\\npUHG1bSPeLXH/IVRmnDQ8qehkFv+/5ounTA1wsSh2/ltPs/mSTUdsf92g9Ldip7j\\nqYuyyDqrjgkI5qzmhYVHvyzq5g2M5ewdfkf2CDEHHKQMFow73fHHSLCnRRf5wrzn\\nt6KRlRzYeeQNvRUugw/5LYPkDoY29UPkGAj3SMJT8QKBgQDcnCBgtxZaVNsDQcL3\\n9nMZ+xqjZCbq2ID/u/C598j5PieuxfIHirYCHk+lBON6kc9W6VIMQboWxVU07OFz\\n0WCirg7dGKMk3nrSgyPiBNmpVSlUZQUI+dmLbokRtvx0eD4OmU0vCeYAaVOiSBXc\\nFb8xu0nOMArTeRQXnUNe7ZpotwKBgQDCeOm2ebfjfvqw6ST1nTqBIJI9zBd0CDLn\\n7W0rr1ggb86oj8rCayIXBV49rt/9cUfHbB1g+4xsWRNeuP/19uQXPxzQoydW6m/S\\nMamt523Hr5Vp2Jon1+7SRCxJHXIRPr+H+HovnTIE8dJnHcLv0kWxyWjl2WUC6EkY\\nsWzdcxOhzwKBgQC2pxlzmgMK1Vjj8G2xib4w06NxhnlmVc0wb3XXM12VZy3J2aAT\\nOHiLdncwxMRm9hR5/AHvnfep5MYwZLQhhUiCSKSL0Fs7Kmz8oJF0D9n7BkSK2Hz7\\nuomwlNst7JhHAks3IRwzhvmEe7BAG3jl2KeNUGjCKyq7fnLxPkbKcOU4LwKBgQCr\\nXMpsncLZNyoGO9ryhzJnWGElDTNZbmQVFJUPWnooUv1icRp0yNyINpW9etwrQufC\\nJVWaAO7TBobX/+KkRYLlrRpiCnJ+1yPjrxlagUSuId1iIJhuJYtvQt1XLBg4c/do\\nBB7+1+CclM4XSRVeKAZ7zAOgDjlBH5hRpv5MALw65wKBgQC04kCiqubXRq7In8IZ\\nlyaBrWSxI6qYIu7s8PsH/FikBO57Z/FSqOK97/ozYpgjfDAzYXe8T4k4iPglEECz\\nHCumPGInVe2G+xSXEg+B2XO872w2SLAanpnXdWWZxbMDMthIEJZdCc7K0nTyMI+2\\nf/mXDILH+orMToNjkvSe+jeQnA==\\n-----END PRIVATE KEY-----\\n');
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
      browserReport,
      realtimeReport
    ] = await Promise.all([
      googlePost({
        path: `/properties/${propertyId}:runReport`,
        accessToken,
        body: {
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          metrics: [{ name: 'activeUsers' }, { name: 'eventCount' }, { name: 'newUsers' }],
          limit: 1,
        },
      }),
      googlePost({
        path: `/properties/${propertyId}:runReport`,
        accessToken,
        body: {
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
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
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
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
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
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
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
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
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'pagePath' }],
          metrics: [{ name: 'screenPageViews' }],
          orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
          limit: 5,
        },
      }),
      googlePost({
        path: `/properties/${propertyId}:runReport`,
        accessToken,
        body: {
          dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
          dimensions: [{ name: 'browser' }],
          metrics: [{ name: 'activeUsers' }],
          orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
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

    const browsers = mapDimensionMetricRows(browserReport).map((row) => ({
      browser: row.dimension,
      users: row.metric,
    }));

    const payload = {
      activeUsersRealtime: realtimeReport ? metricValue(realtimeReport, 0, 0) : null,
      activeUsers30d: metricValue(summaryReport, 0, 0),
      events30d: metricValue(summaryReport, 0, 1),
      newUsers30d: metricValue(summaryReport, 0, 2),
      trafficSources,
      usersByCountry,
      landingPages,
      devices,
      topPages,
      browsers,
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
