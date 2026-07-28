insert into public.countries (code, name) values
  ('FR', 'France'),
  ('US', 'États-Unis'),
  ('GB', 'Royaume-Uni'),
  ('DE', 'Allemagne'),
  ('JP', 'Japon'),
  ('CA', 'Canada'),
  ('BE', 'Belgique'),
  ('CH', 'Suisse'),
  ('XW', 'Monde'),
  ('XE', 'Europe')
on conflict (code) do nothing;

insert into public.lyrics_languages (code, name) values
  ('fr', 'Français'),
  ('en', 'Anglais'),
  ('es', 'Espagnol'),
  ('de', 'Allemand'),
  ('it', 'Italien'),
  ('pt', 'Portugais'),
  ('ja', 'Japonais'),
  ('zxx', 'Instrumental')
on conflict (code) do nothing;

insert into public.location_types (code, label, sort_order) values
  ('mino-venue', 'Salle MINO', 10),
  ('cinema', 'Cinéma', 20),
  ('outdoor', 'Plein air', 30),
  ('other', 'Autre', 40)
on conflict (code) do nothing;
