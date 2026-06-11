alter table public.album_tracks
  add column if not exists musicbrainz_recording_id text;

alter table public.album_tracks
  add column if not exists youtube_video_id text;

alter table public.album_tracks
  add column if not exists video_source text;

alter table public.album_tracks
  add column if not exists video_confirmed boolean not null default false;

alter table public.album_tracks
  drop constraint if exists album_tracks_video_source_check;

alter table public.album_tracks
  add constraint album_tracks_video_source_check check (
    video_source is null
    or video_source in ('discogs', 'musicbrainz', 'wikidata', 'manual', 'suggested')
  );

create index if not exists album_tracks_youtube_video_id_idx
  on public.album_tracks (youtube_video_id)
  where youtube_video_id is not null;
