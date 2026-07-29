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

insert into public.project_types (code, label, family, sort_order) values
  ('td', 'Theatrical Distribution', 'theatrical', 10),
  ('mpe', 'Music Private Event', 'private_event', 20),
  ('bpe', 'Brand Private Event', 'private_event', 30)
on conflict (code) do nothing;

insert into public.project_statuses (code, label, sort_order) values
  ('draft', 'Draft', 10),
  ('in_progress', 'En cours', 20),
  ('completed', 'Completed', 30),
  ('archived', 'Archived', 40)
on conflict (code) do nothing;

insert into public.budget_categories (code, label, sort_order) values
  ('venue', 'Venue', 10),
  ('creative-production', 'Creative production', 20),
  ('technical-production', 'Technical production', 30),
  ('other', 'Autre', 40)
on conflict (code) do nothing;
