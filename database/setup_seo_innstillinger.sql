create table if not exists seo_innstillinger (
  id serial primary key,
  side text not null unique,
  tittel text,
  beskrivelse text,
  nokkelord text, -- Endret fra nøkkelord for å matche React-koden og unngå tegnsett-problemer
  robots text,
  canonical text,
  open_graph_tittel text,
  open_graph_beskrivelse text,
  open_graph_bilde text,
  open_graph_type text,
  twitter_tittel text,
  twitter_beskrivelse text,
  twitter_bilde text,
  strukturert_data text
);

-- Aktiver Row Level Security (RLS)
alter table seo_innstillinger enable row level security;

-- Tillat alle å lese SEO-innstillinger (nødvendig for at nettsiden skal kunne vise meta-tags)
create policy "Public Read SEO" on seo_innstillinger 
  for select using (true);

-- Tillat innloggede administratorer å administrere (opprette, oppdatere, slette) SEO-innstillinger
create policy "Auth All SEO" on seo_innstillinger 
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');