create table if not exists public.location_rooms (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations (id) on delete cascade,
  name text not null,
  capacity integer,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint location_rooms_name_not_empty check (char_length(trim(name)) > 0),
  constraint location_rooms_capacity_positive check (
    capacity is null or capacity > 0
  )
);

create index if not exists location_rooms_location_id_idx
  on public.location_rooms (location_id);

create index if not exists location_rooms_location_sort_idx
  on public.location_rooms (location_id, sort_order);

drop trigger if exists location_rooms_set_updated_at on public.location_rooms;

create trigger location_rooms_set_updated_at
  before update on public.location_rooms
  for each row
  execute function public.set_updated_at();

alter table public.location_rooms enable row level security;

drop policy if exists "location_rooms_select_authenticated" on public.location_rooms;
drop policy if exists "location_rooms_insert_authenticated" on public.location_rooms;
drop policy if exists "location_rooms_update_authenticated" on public.location_rooms;
drop policy if exists "location_rooms_delete_authenticated" on public.location_rooms;

create policy "location_rooms_select_authenticated"
  on public.location_rooms
  for select
  to authenticated
  using (true);

create policy "location_rooms_insert_authenticated"
  on public.location_rooms
  for insert
  to authenticated
  with check (true);

create policy "location_rooms_update_authenticated"
  on public.location_rooms
  for update
  to authenticated
  using (true)
  with check (true);

create policy "location_rooms_delete_authenticated"
  on public.location_rooms
  for delete
  to authenticated
  using (true);
