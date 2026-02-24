# Oppsett av e-postvarsling (Edge Functions)

Følg disse stegene for å få e-postvarsel hver gang noen sender en melding via kontaktskjemaet.

## 1. Opprett Edge Function i Supabase
1. Gå til **Edge Functions** i Supabase.
2. Klikk **Create New Function** og kall den `notify-admin`.
3. Klikk **Open Editor**.
4. Slett alt i `index.ts` og lim inn koden fra `database/notify_admin_function.ts`.

## 2. Legg til API-nøkkel
1. Lag en konto på [resend.com](https://resend.com) (gratis).
2. Generer en **API Key**.
3. I Supabase under **Edge Functions**, gå til **Secrets** (i venstremenyen under Manage).
4. Legg til en ny Secret:
   - Name: `RESEND_API_KEY`
   - Value: (Din nøkkel fra Resend)

## 3. Aktiver automatikken (Trigger)
Gå til **SQL Editor** i Supabase og kjør denne koden:

```sql
-- Sørg for at utvidelsen er på
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- Lag triggeren som kaller funksjonen når en melding legges til
CREATE OR REPLACE TRIGGER on_new_contact_message
  AFTER INSERT ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION supabase_functions.http_request(
    'https://ovbqtaxwwxflvxdjkeih.supabase.co/functions/v1/notify-admin',
    'POST',
    '{"Content-Type":"application/json", "Authorization":"Bearer DIN_ANON_KEY"}',
    '{}',
    '1000'
  );
```

*Merk: Bytt ut `DIN_ANON_KEY` med din faktiske **anon public key** fra Supabase (Settings -> API).*
