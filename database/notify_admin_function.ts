import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
    const { record } = await req.json()

    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
            from: 'Mandal Regnskap <onboarding@resend.dev>',
            to: ['knutsenthomas@gmail.com'],
            subject: `Ny melding fra ${record.navn}`,
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
                .logo-img { width: 80px; height: auto; display: block; margin: 0 auto; }
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
                        <img src="https://ovbqtaxwwxflvxdjkeih.supabase.co/storage/v1/object/public/public-assets/logo.png" alt="Mandal Regnskapskontor" class="logo-img" style="width: 80px;">
                        <h1>Ny melding fra nettsiden</h1>
                    </div>
                    <div class="content">
                        <p style="text-align: center; color: #627d98;">Du har mottatt en ny henvendelse via kontaktskjemaet.</p>
                        
                        <div class="info-box">
                            <div class="info-row"><div class="label">Navn</div><div class="value">${record.navn}</div></div>
                            <div class="info-row"><div class="label">E-post</div><div class="value">${record.epost}</div></div>
                            <div class="info-row"><div class="label">Telefon</div><div class="value">${record.telefon || 'Ikke oppgitt'}</div></div>
                            ${record.bedriftsnavn ? `<div class="info-row"><div class="label">Bedrift</div><div class="value">${record.bedriftsnavn}</div></div>` : ''}
                        </div>

                        <div class="label" style="margin-bottom: 8px;">Melding</div>
                        <div class="message-box">${record.melding}</div>

                        <div style="text-align: center;">
                            <a href="https://mandal-regnskapskontor.vercel.app/admin/dashboard?tab=messages" class="button">Gå til Innboks</a>
                        </div>
                    </div>
                    <div class="footer">Dette er en automatisert melding fra Mandal Regnskapskontor.</div>
                </div>
            </div>
        </body>
        </html>
      `,
        }),
    })

    const data = await res.json()
    return new Response(JSON.stringify(data), { status: 200 })
})
