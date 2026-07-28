create table if not exists public.location_types (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  label text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  constraint location_types_code_not_empty check (char_length(trim(code)) > 0),
  constraint location_types_label_not_empty check (char_length(trim(label)) > 0)
);

create unique index if not exists location_types_code_unique_idx
  on public.location_types (code);

create unique index if not exists location_types_label_unique_idx
  on public.location_types (lower(label));

create index if not exists location_types_active_sort_idx
  on public.location_types (is_active, sort_order, lower(label));

drop trigger if exists location_types_set_updated_at on public.location_types;

create trigger location_types_set_updated_at
  before update on public.location_types
  for each row
  execute function public.set_updated_at();

alter table public.location_types enable row level security;

drop policy if exists "location_types_select_authenticated" on public.location_types;
drop policy if exists "location_types_insert_authenticated" on public.location_types;
drop policy if exists "location_types_update_authenticated" on public.location_types;
drop policy if exists "location_types_delete_authenticated" on public.location_types;

create policy "location_types_select_authenticated"
  on public.location_types
  for select
  to authenticated
  using (true);

create policy "location_types_insert_authenticated"
  on public.location_types
  for insert
  to authenticated
  with check (true);

create policy "location_types_update_authenticated"
  on public.location_types
  for update
  to authenticated
  using (true)
  with check (true);

create policy "location_types_delete_authenticated"
  on public.location_types
  for delete
  to authenticated
  using (true);
