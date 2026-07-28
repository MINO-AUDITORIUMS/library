create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location_type_id uuid not null references public.location_types (id) on delete restrict,
  address text not null default '',
  city text not null default '',
  longitude double precision not null,
  latitude double precision not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  constraint locations_name_not_empty check (char_length(trim(name)) > 0),
  constraint locations_longitude_range check (longitude >= -180 and longitude <= 180),
  constraint locations_latitude_range check (latitude >= -90 and latitude <= 90)
);

create index if not exists locations_name_idx on public.locations (lower(name));
create index if not exists locations_city_idx on public.locations (lower(city));
create index if not exists locations_location_type_id_idx
  on public.locations (location_type_id);

drop trigger if exists locations_set_updated_at on public.locations;

create trigger locations_set_updated_at
  before update on public.locations
  for each row
  execute function public.set_updated_at();

alter table public.locations enable row level security;

drop policy if exists "locations_select_authenticated" on public.locations;
drop policy if exists "locations_insert_authenticated" on public.locations;
drop policy if exists "locations_update_authenticated" on public.locations;
drop policy if exists "locations_delete_authenticated" on public.locations;

create policy "locations_select_authenticated"
  on public.locations
  for select
  to authenticated
  using (true);

create policy "locations_insert_authenticated"
  on public.locations
  for insert
  to authenticated
  with check (true);

create policy "locations_update_authenticated"
  on public.locations
  for update
  to authenticated
  using (true)
  with check (true);

create policy "locations_delete_authenticated"
  on public.locations
  for delete
  to authenticated
  using (true);
