create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  artist text not null,
  release_year smallint,
  release_date date,
  description text,
  total_duration_seconds integer,
  track_count integer,
  label text,
  record_company text,
  producers text[] not null default '{}',
  origin_country_code char(2) references public.countries (code) on delete set null,
  certification text,
  official_videos_count integer not null default 0,
  rating smallint,
  personal_notes text,
  cover_storage_path text,
  external_ids jsonb not null default '{}'::jsonb,
  search_vector tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  updated_by uuid references public.profiles (id) on delete set null,
  constraint albums_title_not_empty check (char_length(trim(title)) > 0),
  constraint albums_artist_not_empty check (char_length(trim(artist)) > 0),
  constraint albums_release_year_range check (
    release_year is null
    or (release_year >= 1900 and release_year <= 2100)
  ),
  constraint albums_total_duration_positive check (
    total_duration_seconds is null or total_duration_seconds > 0
  ),
  constraint albums_track_count_positive check (
    track_count is null or track_count > 0
  ),
  constraint albums_official_videos_count_non_negative check (
    official_videos_count >= 0
  ),
  constraint albums_rating_range check (
    rating is null or (rating >= 1 and rating <= 5)
  )
);

create index if not exists albums_release_year_idx on public.albums (release_year);
create index if not exists albums_rating_idx on public.albums (rating);
create index if not exists albums_created_at_idx on public.albums (created_at desc);
create index if not exists albums_artist_idx on public.albums (lower(artist));
create index if not exists albums_title_idx on public.albums (lower(title));
create index if not exists albums_origin_country_code_idx on public.albums (origin_country_code);
create index if not exists albums_external_ids_gin_idx on public.albums using gin (external_ids);
create index if not exists albums_search_vector_gin_idx on public.albums using gin (search_vector);
create index if not exists albums_producers_gin_idx on public.albums using gin (producers);

drop trigger if exists albums_set_updated_at on public.albums;

create trigger albums_set_updated_at
  before update on public.albums
  for each row
  execute function public.set_updated_at();

alter table public.albums enable row level security;

drop policy if exists "albums_select_authenticated" on public.albums;
drop policy if exists "albums_insert_authenticated" on public.albums;
drop policy if exists "albums_update_authenticated" on public.albums;
drop policy if exists "albums_delete_authenticated" on public.albums;

create policy "albums_select_authenticated"
  on public.albums
  for select
  to authenticated
  using (true);

create policy "albums_insert_authenticated"
  on public.albums
  for insert
  to authenticated
  with check (true);

create policy "albums_update_authenticated"
  on public.albums
  for update
  to authenticated
  using (true)
  with check (true);

create policy "albums_delete_authenticated"
  on public.albums
  for delete
  to authenticated
  using (true);
