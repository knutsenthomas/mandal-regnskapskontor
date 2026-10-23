# Browser storage review — 2026-10-23

Scope: mandal-regnskapskontor client source and configured public website.

| Storage/service | Purpose and duration |
| --- | --- |
| hkp-app-privacy-v1 | Consent categories, version and time are remembered for 180 days. Reject or withdraw using the cookie settings link. |
| Google Analytics / Vercel Analytics og Speed Insights | Optional visitor analytics starts only after approval. Google may use _ga and _ga_* (configured for up to 180 days). Vercel measures aggregated usage. Withdrawal stops future measurement and removes accessible analytics cookies on our domain. |
| Supabase-innlogging | Administrator sign-in uses Supabase local session storage (typically sb-…-auth-token). This supports authentication/access, not visitor analytics. Signing out and deleting an account are separate actions. |
| Sideinnhold og årshjul | Public content, site settings and calendar data are cached in page memory. They are not automatically written to localStorage during ordinary browsing. |
| Kontaktskjema og teknisk drift | Information is processed when you submit the contact form. Supabase and hosting/CDN services may receive technical details to deliver the service. Necessary sessionStorage error markers prevent reload loops. |

Verification must cover initial rejection, selective approval, withdrawal, cross-tab updates, unavailable storage, service-worker cleanup, and existing login/cart functions. Provider retention and agreements are not certified by this source review. No real payment or message submission is part of the review.
