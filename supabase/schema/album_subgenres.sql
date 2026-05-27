create table if not exists public.album_subgenres (
  album_id uuid not null references public.albums (id) on delete cascade,
  subgenre_id uuid not null references public.subgenres (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (album_id, subgenre_id)
);

create index if not exists album_subgenres_subgenre_id_idx on public.album_subgenres (subgenre_id);

alter table public.album_subgenres enable row level security;

drop policy if exists "album_subgenres_select_authenticated" on public.album_subgenres;
drop policy if exists "album_subgenres_insert_authenticated" on public.album_subgenres;
drop policy if exists "album_subgenres_delete_authenticated" on public.album_subgenres;

create policy "album_subgenres_select_authenticated"
  on public.album_subgenres
  for select
  to authenticated
  using (true);

create policy "album_subgenres_insert_authenticated"
  on public.album_subgenres
  for insert
  to authenticated
  with check (true);

create policy "album_subgenres_delete_authenticated"
  on public.album_subgenres
  for delete
  to authenticated
  using (true);
