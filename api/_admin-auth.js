/* global process */
import { createClient } from '@supabase/supabase-js';

export async function requireAdmin(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  const token = typeof req.headers.authorization === 'string'
    ? req.headers.authorization.match(/^Bearer ([^\s]+)$/i)?.[1] : null;
  if (!token) { res.status(401).json({ error: 'Logg inn som administrator.' }); return null; }
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) { res.status(503).json({ error: 'Administrator-API er ikke konfigurert.' }); return null; }
  const client = createClient('https://ovbqtaxwwxflvxdjkeih.supabase.co', key, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  try {
    const { data, error } = await client.auth.getUser(token);
    const user = data?.user;
    if (error || !user?.id || !user.email || !user.email_confirmed_at || user.is_anonymous) {
      res.status(401).json({ error: 'Innloggingen kunne ikke bekreftes.' }); return null;
    }
    const { data: admins, error: lookupError } = await client.from('admin_users').select('email');
    if (lookupError) { res.status(503).json({ error: 'Administratortilgang kunne ikke kontrolleres.' }); return null; }
    if (!Array.isArray(admins) || !admins.some(row => String(row.email || '').trim().toLowerCase() === user.email.trim().toLowerCase())) {
      res.status(403).json({ error: 'Du har ikke administratortilgang.' }); return null;
    }
    return { client, user };
  } catch {
    res.status(503).json({ error: 'Administratortilgang kunne ikke kontrolleres.' }); return null;
  }
}
