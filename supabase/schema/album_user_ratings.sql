create table if not exists public.album_user_ratings (
  album_id uuid not null references public.albums (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating smallint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (album_id, user_id),
  constraint album_user_ratings_rating_range check (rating >= 1 and rating <= 5)
);

create index if not exists album_user_ratings_user_id_idx
  on public.album_user_ratings (user_id);

create index if not exists album_user_ratings_album_id_idx
  on public.album_user_ratings (album_id);

drop trigger if exists album_user_ratings_set_updated_at on public.album_user_ratings;

create trigger album_user_ratings_set_updated_at
  before update on public.album_user_ratings
  for each row
  execute function public.set_updated_at();

alter table public.album_user_ratings enable row level security;

drop policy if exists "album_user_ratings_select_authenticated" on public.album_user_ratings;
drop policy if exists "album_user_ratings_insert_own" on public.album_user_ratings;
drop policy if exists "album_user_ratings_update_own" on public.album_user_ratings;
drop policy if exists "album_user_ratings_delete_own" on public.album_user_ratings;

create policy "album_user_ratings_select_authenticated"
  on public.album_user_ratings
  for select
  to authenticated
  using (true);

create policy "album_user_ratings_insert_own"
  on public.album_user_ratings
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "album_user_ratings_update_own"
  on public.album_user_ratings
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "album_user_ratings_delete_own"
  on public.album_user_ratings
  for delete
  to authenticated
  using (auth.uid() = user_id);

insert into public.album_user_ratings (album_id, user_id, rating)
select
  a.id,
  coalesce(a.updated_by, a.created_by),
  a.rating
from public.albums a
where
  a.rating is not null
  and coalesce(a.updated_by, a.created_by) is not null
on conflict (album_id, user_id) do nothing;
