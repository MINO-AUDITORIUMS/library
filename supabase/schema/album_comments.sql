create table if not exists public.album_comments (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint album_comments_body_not_empty check (char_length(trim(body)) > 0)
);

create index if not exists album_comments_album_id_created_at_idx
  on public.album_comments (album_id, created_at desc);

create index if not exists album_comments_author_id_idx on public.album_comments (author_id);

drop trigger if exists album_comments_set_updated_at on public.album_comments;

create trigger album_comments_set_updated_at
  before update on public.album_comments
  for each row
  execute function public.set_updated_at();

alter table public.album_comments enable row level security;

drop policy if exists "album_comments_select_authenticated" on public.album_comments;
drop policy if exists "album_comments_insert_authenticated" on public.album_comments;
drop policy if exists "album_comments_update_own" on public.album_comments;
drop policy if exists "album_comments_delete_own" on public.album_comments;

create policy "album_comments_select_authenticated"
  on public.album_comments
  for select
  to authenticated
  using (true);

create policy "album_comments_insert_authenticated"
  on public.album_comments
  for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy "album_comments_update_own"
  on public.album_comments
  for update
  to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "album_comments_delete_own"
  on public.album_comments
  for delete
  to authenticated
  using (auth.uid() = author_id);
