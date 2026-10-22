import { requireAdmin } from './_admin-auth.js';

// NOTE: You MUST add SUPABASE_SERVICE_ROLE_KEY to your Vercel Environment Variables.
// This key is found in Supabase Dashboard > Settings > API > service_role (secret).

export default async function handler(req, res) {
    // 1. Basic security check
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const authorization = await requireAdmin(req, res);
    if (!authorization) return;
    const supabase = authorization.client;

    const { email, full_name, phone } = req.body || {};

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    // 2. Initialize Supabase Admin

    try {
        // 3. Invite user via Supabase Auth
        // This creates the user in Auth and sends an invitation email.
        const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
            data: {
                full_name: full_name || '',
                phone: phone || ''
            },
            // Redirect back to the set-password page
            redirectTo: 'https://mandalregnskapskontor.no/set-password'
        });

        if (inviteError) {
            // If user already exists (422), we still want to add them to the admin_users table
            // as they might just need permissions granted.
            if (inviteError.status !== 422) {
                throw inviteError;
            }
        }

        // 4. Also add to our admin_users whitelist table
        const { error: dbError } = await supabase
            .from('admin_users')
            .upsert({
                email: email.toLowerCase(),
                full_name: full_name || '',
                phone: phone || ''
            }, { onConflict: 'email' });

        if (dbError) throw dbError;

        return res.status(200).json({
            success: true,
            message: inviteData ? 'Invitasjon sendt på e-post!' : 'Brukeren var allerede registrert, men er nå lagt til i admin-listen.'
        });

    } catch (error) {
        console.error('Invite error:', error);
        return res.status(500).json({ error: error.message });
    }
}
