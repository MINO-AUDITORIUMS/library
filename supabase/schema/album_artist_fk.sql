alter table public.albums
  add column if not exists artist_id uuid references public.artists (id) on delete set null;

create index if not exists albums_artist_id_idx on public.albums (artist_id);
