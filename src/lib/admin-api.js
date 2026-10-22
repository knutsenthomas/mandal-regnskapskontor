import { supabase } from './customSupabaseClient';

export async function adminHeaders() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data?.session?.access_token) throw new Error('Logg inn på nytt som administrator.');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session.access_token}` };
}
