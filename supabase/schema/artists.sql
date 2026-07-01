create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  bio text,
  image_url text,
  image_storage_path text,
  country text,
  external_ids jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint artists_name_not_empty check (char_length(trim(name)) > 0),
  constraint artists_slug_not_empty check (char_length(trim(slug)) > 0),
  constraint artists_slug_unique unique (slug)
);

create index if not exists artists_name_idx on public.artists (lower(name));
create index if not exists artists_external_ids_gin_idx on public.artists using gin (external_ids);

create unique index if not exists artists_discogs_id_unique_idx
  on public.artists ((external_ids ->> 'discogs'))
  where (external_ids ? 'discogs');

create unique index if not exists artists_musicbrainz_id_unique_idx
  on public.artists ((external_ids ->> 'musicbrainz'))
  where (external_ids ? 'musicbrainz');

drop trigger if exists artists_set_updated_at on public.artists;

create trigger artists_set_updated_at
  before update on public.artists
  for each row
  execute function public.set_updated_at();

alter table public.artists enable row level security;

drop policy if exists "artists_select_authenticated" on public.artists;
drop policy if exists "artists_insert_authenticated" on public.artists;
drop policy if exists "artists_update_authenticated" on public.artists;

create policy "artists_select_authenticated"
  on public.artists
  for select
  to authenticated
  using (true);

create policy "artists_insert_authenticated"
  on public.artists
  for insert
  to authenticated
  with check (true);

create policy "artists_update_authenticated"
  on public.artists
  for update
  to authenticated
  using (true)
  with check (true);
