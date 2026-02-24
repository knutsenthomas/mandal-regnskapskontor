import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { navn, epost, telefon, bedriftsnavn, melding } = req.body;

    if (!navn || !epost || !melding) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const NOTIFICATION_EMAIL = 'knutsenthomas@gmail.com';

    // 1. Initialize Supabase with Service Role Key to bypass RLS if needed
    // (Though contact_messages table usually allows public insert)
    const supabaseUrl = 'https://ovbqtaxwwxflvxdjkeih.supabase.co';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    try {
        // 2. Save to Database
        const { error: dbError } = await supabase
            .from('contact_messages')
            .insert([
                {
                    navn,
                    epost,
                    telefon: telefon || '',
                    bedriftsnavn: bedriftsnavn || '',
                    melding,
                    read: false
                }
            ]);

        if (dbError) throw dbError;

        // 3. Send Email via Resend (DISABLED: Notification is now handled by Supabase Edge Functions to avoid duplicates)
        /*
        if (RESEND_API_KEY) {
            const emailRes = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: 'Mandal Regnskapskontor <onboarding@resend.dev>',
                    to: [NOTIFICATION_EMAIL],
                    subject: `Ny melding fra ${navn}`,
                    html: `
                        <!DOCTYPE html>
                        ... (template code) ...
                    `
                })
            });

            if (!emailRes.ok) {
                const errorData = await emailRes.json();
                console.warn('Resend Error:', errorData);
            }
        }
        */

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('Contact API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
