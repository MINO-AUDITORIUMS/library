create table if not exists public.album_tags (
  album_id uuid not null references public.albums (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  primary key (album_id, tag_id)
);

create index if not exists album_tags_tag_id_idx on public.album_tags (tag_id);
create index if not exists album_tags_album_id_idx on public.album_tags (album_id);

alter table public.album_tags enable row level security;

drop policy if exists "album_tags_select_authenticated" on public.album_tags;
drop policy if exists "album_tags_insert_authenticated" on public.album_tags;
drop policy if exists "album_tags_delete_authenticated" on public.album_tags;

create policy "album_tags_select_authenticated"
  on public.album_tags
  for select
  to authenticated
  using (true);

create policy "album_tags_insert_authenticated"
  on public.album_tags
  for insert
  to authenticated
  with check (true);

create policy "album_tags_delete_authenticated"
  on public.album_tags
  for delete
  to authenticated
  using (true);
