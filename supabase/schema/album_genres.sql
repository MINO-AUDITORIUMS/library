create table if not exists public.album_genres (
  album_id uuid not null references public.albums (id) on delete cascade,
  genre_id uuid not null references public.genres (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (album_id, genre_id)
);

create index if not exists album_genres_genre_id_idx on public.album_genres (genre_id);

alter table public.album_genres enable row level security;

drop policy if exists "album_genres_select_authenticated" on public.album_genres;
drop policy if exists "album_genres_insert_authenticated" on public.album_genres;
drop policy if exists "album_genres_delete_authenticated" on public.album_genres;

create policy "album_genres_select_authenticated"
  on public.album_genres
  for select
  to authenticated
  using (true);

create policy "album_genres_insert_authenticated"
  on public.album_genres
  for insert
  to authenticated
  with check (true);

create policy "album_genres_delete_authenticated"
  on public.album_genres
  for delete
  to authenticated
  using (true);
