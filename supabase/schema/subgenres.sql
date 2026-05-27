create table if not exists public.subgenres (
  id uuid primary key default gen_random_uuid(),
  genre_id uuid not null references public.genres (id) on delete restrict,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  constraint subgenres_name_not_empty check (char_length(trim(name)) > 0),
  constraint subgenres_slug_not_empty check (char_length(trim(slug)) > 0)
);

create unique index if not exists subgenres_genre_name_unique_idx
  on public.subgenres (genre_id, lower(name));

create unique index if not exists subgenres_genre_slug_unique_idx
  on public.subgenres (genre_id, slug);

create index if not exists subgenres_genre_id_idx on public.subgenres (genre_id);

alter table public.subgenres enable row level security;

drop policy if exists "subgenres_select_authenticated" on public.subgenres;
drop policy if exists "subgenres_insert_authenticated" on public.subgenres;
drop policy if exists "subgenres_update_authenticated" on public.subgenres;

create policy "subgenres_select_authenticated"
  on public.subgenres
  for select
  to authenticated
  using (true);

create policy "subgenres_insert_authenticated"
  on public.subgenres
  for insert
  to authenticated
  with check (true);

create policy "subgenres_update_authenticated"
  on public.subgenres
  for update
  to authenticated
  using (true)
  with check (true);
