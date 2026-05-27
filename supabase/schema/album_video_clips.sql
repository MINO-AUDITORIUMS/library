create table if not exists public.album_video_clips (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums (id) on delete cascade,
  position smallint not null,
  title text not null,
  created_at timestamptz not null default now(),
  constraint album_video_clips_position_positive check (position > 0),
  constraint album_video_clips_title_not_empty check (char_length(trim(title)) > 0),
  constraint album_video_clips_album_position_unique unique (album_id, position)
);

create index if not exists album_video_clips_album_id_idx on public.album_video_clips (album_id);

alter table public.album_video_clips enable row level security;

drop policy if exists "album_video_clips_select_authenticated" on public.album_video_clips;
drop policy if exists "album_video_clips_insert_authenticated" on public.album_video_clips;
drop policy if exists "album_video_clips_update_authenticated" on public.album_video_clips;
drop policy if exists "album_video_clips_delete_authenticated" on public.album_video_clips;

create policy "album_video_clips_select_authenticated"
  on public.album_video_clips
  for select
  to authenticated
  using (true);

create policy "album_video_clips_insert_authenticated"
  on public.album_video_clips
  for insert
  to authenticated
  with check (true);

create policy "album_video_clips_update_authenticated"
  on public.album_video_clips
  for update
  to authenticated
  using (true)
  with check (true);

create policy "album_video_clips_delete_authenticated"
  on public.album_video_clips
  for delete
  to authenticated
  using (true);
