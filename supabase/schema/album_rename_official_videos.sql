do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'albums'
      and column_name = 'official_clips_count'
  ) then
    alter table public.albums
      rename column official_clips_count to official_videos_count;
  end if;
end $$;

alter table public.albums
  add column if not exists official_videos_count integer not null default 0;

alter table public.albums
  drop constraint if exists albums_official_clips_count_non_negative;

alter table public.albums
  drop constraint if exists albums_official_videos_count_non_negative;

alter table public.albums
  add constraint albums_official_videos_count_non_negative check (
    official_videos_count >= 0
  );
