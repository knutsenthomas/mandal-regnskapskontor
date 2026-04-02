# one.com deploy

Dette prosjektet er klargjort for vanlig one.com-hosting med Apache og PHP.

## Hva som er gjort

- React-appen bygges fortsatt med `vite build`.
- `public/.htaccess` håndterer både SPA-ruting og extensionless API-ruter:
  - `/api/send-contact`
  - `/api/invite-admin`
  - `/api/remove-admin`
- PHP-endepunktene ligger i `public/api/` og blir kopiert med inn i `dist/`.
- Vercel Speed Insights er fjernet fra appen.
- Lenken i `database/notify_admin_function.ts` peker til hoveddomenet i stedet for gammel Vercel-URL.

## Bygg

Kjør:

```bash
npm install
npm run build
```

Etter build skal hele innholdet i `dist/` lastes opp til `httpd.www` hos one.com.

## Privat konfigurasjon på one.com

Legg en PHP-konfigfil i `httpd.private`, for eksempel:

- Filnavn: `mandal-regnskapskontor-config.php`
- Mappe: `httpd.private`

Start med filen `deployment/one.com/private-config.example.php` og fyll inn ekte verdier.

Minimum som må være på plass:

- `SITE_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Hvis one.com-kontoen bare gir deg tilgang til webroten i File Manager, kan du også legge samme fil i `httpd.www/mandal-regnskapskontor-config.php`.
`.htaccess` i pakken blokkerer direkte tilgang til denne filen over web.

## Opplastingsstruktur

- `dist/*` -> `httpd.www/`
- `deployment/one.com/private-config.example.php` (omdøpt og med ekte secrets) -> `httpd.private/mandal-regnskapskontor-config.php`
- Alternativ fallback hvis du ikke kommer til `httpd.private`: `mandal-regnskapskontor-config.php` -> `httpd.www/`

## Viktig å teste etter opplasting

- Forsiden laster direkte på `/`
- Undersider laster direkte, f.eks. `/personvern` og `/service/...`
- Kontaktskjemaet sender inn data
- Admin innlogging fungerer
- Legg til / fjern admin-bruker fungerer

## Merknader

- `api/*.js`-filene i prosjektroten er gamle Vercel-funksjoner og brukes ikke av one.com-oppsettet.
- Google Analytics-oversikten er fjernet fra admin-dashbordet, så `ga4-overview` trengs ikke for one.com-flyttingen.
