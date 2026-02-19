create table if not exists seo_innstillinger (
  id serial primary key,
  side text not null unique,
  tittel text,
  beskrivelse text,
  nøkkelord text,
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