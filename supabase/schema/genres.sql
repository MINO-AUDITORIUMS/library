create table if not exists public.genres (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  constraint genres_name_not_empty check (char_length(trim(name)) > 0),
  constraint genres_slug_not_empty check (char_length(trim(slug)) > 0)
);

create unique index if not exists genres_name_unique_idx on public.genres (lower(name));
create unique index if not exists genres_slug_unique_idx on public.genres (slug);

alter table public.genres enable row level security;

drop policy if exists "genres_select_authenticated" on public.genres;
drop policy if exists "genres_insert_authenticated" on public.genres;
drop policy if exists "genres_update_authenticated" on public.genres;

create policy "genres_select_authenticated"
  on public.genres
  for select
  to authenticated
  using (true);

create policy "genres_insert_authenticated"
  on public.genres
  for insert
  to authenticated
  with check (true);

create policy "genres_update_authenticated"
  on public.genres
  for update
  to authenticated
  using (true)
  with check (true);
