create table if not exists public.project_types (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  label text not null,
  family text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_types_code_not_empty check (char_length(trim(code)) > 0),
  constraint project_types_label_not_empty check (char_length(trim(label)) > 0),
  constraint project_types_family_not_empty check (char_length(trim(family)) > 0)
);

create unique index if not exists project_types_code_unique_idx
  on public.project_types (code);

create unique index if not exists project_types_label_unique_idx
  on public.project_types (lower(label));

create index if not exists project_types_active_sort_idx
  on public.project_types (is_active, sort_order, lower(label));

drop trigger if exists project_types_set_updated_at on public.project_types;

create trigger project_types_set_updated_at
  before update on public.project_types
  for each row
  execute function public.set_updated_at();

alter table public.project_types enable row level security;

drop policy if exists "project_types_select_authenticated" on public.project_types;
drop policy if exists "project_types_insert_authenticated" on public.project_types;
drop policy if exists "project_types_update_authenticated" on public.project_types;
drop policy if exists "project_types_delete_authenticated" on public.project_types;

create policy "project_types_select_authenticated"
  on public.project_types
  for select
  to authenticated
  using (true);

create policy "project_types_insert_authenticated"
  on public.project_types
  for insert
  to authenticated
  with check (true);

create policy "project_types_update_authenticated"
  on public.project_types
  for update
  to authenticated
  using (true)
  with check (true);

create policy "project_types_delete_authenticated"
  on public.project_types
  for delete
  to authenticated
  using (true);
