create table if not exists public.album_tracks (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums (id) on delete cascade,
  position smallint not null,
  title text not null,
  duration_seconds integer,
  writers text[] not null default '{}',
  producers text[] not null default '{}',
  created_at timestamptz not null default now(),
  constraint album_tracks_position_positive check (position > 0),
  constraint album_tracks_title_not_empty check (char_length(trim(title)) > 0),
  constraint album_tracks_duration_positive check (
    duration_seconds is null or duration_seconds > 0
  ),
  constraint album_tracks_album_position_unique unique (album_id, position)
);

create index if not exists album_tracks_album_id_idx on public.album_tracks (album_id);

alter table public.album_tracks enable row level security;

drop policy if exists "album_tracks_select_authenticated" on public.album_tracks;
drop policy if exists "album_tracks_insert_authenticated" on public.album_tracks;
drop policy if exists "album_tracks_update_authenticated" on public.album_tracks;
drop policy if exists "album_tracks_delete_authenticated" on public.album_tracks;

create policy "album_tracks_select_authenticated"
  on public.album_tracks
  for select
  to authenticated
  using (true);

create policy "album_tracks_insert_authenticated"
  on public.album_tracks
  for insert
  to authenticated
  with check (true);

create policy "album_tracks_update_authenticated"
  on public.album_tracks
  for update
  to authenticated
  using (true)
  with check (true);

create policy "album_tracks_delete_authenticated"
  on public.album_tracks
  for delete
  to authenticated
  using (true);
