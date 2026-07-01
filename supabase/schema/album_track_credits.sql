alter table public.album_tracks
  add column if not exists writers text[] not null default '{}';

alter table public.album_tracks
  add column if not exists producers text[] not null default '{}';

alter table public.album_tracks
  add column if not exists featuring text[] not null default '{}';

alter table public.album_tracks
  add column if not exists spotify_track_id text;
