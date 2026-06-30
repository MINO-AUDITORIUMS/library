create table if not exists public.seances (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums (id) on delete cascade,
  date date not null,
  heure_debut time not null,
  duree_minutes integer not null,
  notes text not null default '',
  statut text not null default 'brouillon',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  constraint seances_statut_check check (
    statut in ('brouillon', 'confirmee', 'passee', 'annulee')
  ),
  constraint seances_duree_positive check (duree_minutes > 0),
  constraint seances_notes_length check (char_length(notes) <= 2000)
);

create index if not exists seances_date_heure_idx
  on public.seances (date, heure_debut);

create index if not exists seances_album_id_idx on public.seances (album_id);

drop trigger if exists seances_set_updated_at on public.seances;

create trigger seances_set_updated_at
  before update on public.seances
  for each row
  execute function public.set_updated_at();

alter table public.seances enable row level security;

drop policy if exists "seances_select_authenticated" on public.seances;
drop policy if exists "seances_insert_authenticated" on public.seances;
drop policy if exists "seances_update_authenticated" on public.seances;
drop policy if exists "seances_delete_authenticated" on public.seances;

create policy "seances_select_authenticated"
  on public.seances
  for select
  to authenticated
  using (true);

create policy "seances_insert_authenticated"
  on public.seances
  for insert
  to authenticated
  with check (true);

create policy "seances_update_authenticated"
  on public.seances
  for update
  to authenticated
  using (true)
  with check (true);

create policy "seances_delete_authenticated"
  on public.seances
  for delete
  to authenticated
  using (true);
