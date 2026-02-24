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
            to: ['thomas@tk-design.no'], // Denne e-posten får varslene
            subject: `Ny melding fra ${record.navn}`,
            html: `
        <h2>Ny henvendelse fra kontaktskjema</h2>
        <p><strong>Navn:</strong> ${record.navn}</p>
        <p><strong>E-post:</strong> ${record.epost}</p>
        <p><strong>Telefon:</strong> ${record.telefon}</p>
        <p><strong>Bedrift:</strong> ${record.bedriftsnavn || 'Ikke oppgitt'}</p>
        <p><strong>Melding:</strong></p>
        <p>${record.melding}</p>
        <hr />
        <p><a href="https://mandal-regnskapskontor.vercel.app/admin/dashboard?tab=messages">Se meldingen i dashbordet</a></p>
      `,
        }),
    })

    const data = await res.json()
    return new Response(JSON.stringify(data), { status: 200 })
})
