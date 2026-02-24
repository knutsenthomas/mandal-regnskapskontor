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
    const NOTIFICATION_EMAIL = 'jan@mandalregnskapskontor.no';

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

        // 3. Send Email via Resend
        if (RESEND_API_KEY) {
            const emailRes = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: 'Mandal Regnskapskontor <system@mandalregnskapskontor.no>',
                    to: [NOTIFICATION_EMAIL],
                    subject: `Ny melding fra ${navn}`,
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="utf-8">
                            <style>
                                .wrapper { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f9; padding: 40px 0; }
                                .main { background-color: #ffffff; width: 100%; max-width: 600px; margin: 0 auto; border-radius: 12px; border: 1px solid #e1e8ed; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
                                .header { background-color: #ffffff; padding: 30px; text-align: center; border-bottom: 2px solid #f0f4f8; }
                                .content { padding: 40px; color: #102a43; }
                                .footer { padding: 20px; text-align: center; color: #627d98; font-size: 11px; }
                                .logo-img { width: 140px; height: auto; display: block; margin: 0 auto; }
                                h1 { color: #1B4965; font-size: 22px; margin: 20px 0 0 0; font-weight: bold; text-align: center; }
                                .info-box { background-color: #f8fafc; border-radius: 8px; padding: 25px; margin: 25px 0; border: 1px solid #e2e8f0; }
                                .info-row { margin-bottom: 15px; border-bottom: 1px solid #edf2f7; padding-bottom: 10px; }
                                .label { font-size: 11px; color: #627d98; text-transform: uppercase; font-weight: bold; letter-spacing: 0.5px; }
                                .value { font-size: 15px; color: #102a43; margin-top: 3px; font-weight: 500; }
                                .message-box { background-color: #ffffff; border: 1px solid #e1e8ed; border-radius: 6px; padding: 20px; font-size: 15px; line-height: 24px; color: #334e68; white-space: pre-wrap; }
                                .button { background-color: #1B4965; color: #ffffff !important; padding: 16px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 14px; margin-top: 20px; }
                            </style>
                        </head>
                        <body>
                            <div class="wrapper">
                                <div class="main">
                                    <div class="header">
                                        <img src="https://ovbqtaxwwxflvxdjkeih.supabase.co/storage/v1/object/public/public-assets/logo.png" alt="Mandal Regnskapskontor" class="logo-img">
                                        <h1>Ny melding fra nettsiden</h1>
                                    </div>
                                    <div class="content">
                                        <p style="text-align: center; color: #627d98;">Du har mottatt en ny henvendelse via kontaktskjemaet.</p>
                                        
                                        <div class="info-box">
                                            <div class="info-row"><div class="label">Navn</div><div class="value">${navn}</div></div>
                                            <div class="info-row"><div class="label">E-post</div><div class="value">${epost}</div></div>
                                            <div class="info-row"><div class="label">Telefon</div><div class="value">${telefon || 'Ikke oppgitt'}</div></div>
                                            ${bedriftsnavn ? `<div class="info-row"><div class="label">Bedrift</div><div class="value">${bedriftsnavn}</div></div>` : ''}
                                        </div>

                                        <div class="label" style="margin-bottom: 8px;">Melding</div>
                                        <div class="message-box">${melding}</div>

                                        <div style="text-align: center;">
                                            <a href="https://mandal-regnskapskontor.vercel.app/admin/dashboard?tab=messages" class="button">Gå til Innboks</a>
                                        </div>
                                    </div>
                                    <div class="footer">Dette er en automatisert melding fra Mandal Regnskapskontor.</div>
                                </div>
                            </div>
                        </body>
                        </html>
                    `
                })
            });

            if (!emailRes.ok) {
                const errorData = await emailRes.json();
                console.warn('Resend Error:', errorData);
            }
        }

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('Contact API Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
