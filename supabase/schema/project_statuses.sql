create table if not exists public.project_statuses (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  label text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_statuses_code_not_empty check (char_length(trim(code)) > 0),
  constraint project_statuses_label_not_empty check (char_length(trim(label)) > 0)
);

create unique index if not exists project_statuses_code_unique_idx
  on public.project_statuses (code);

create unique index if not exists project_statuses_label_unique_idx
  on public.project_statuses (lower(label));

create index if not exists project_statuses_active_sort_idx
  on public.project_statuses (is_active, sort_order, lower(label));

drop trigger if exists project_statuses_set_updated_at on public.project_statuses;

create trigger project_statuses_set_updated_at
  before update on public.project_statuses
  for each row
  execute function public.set_updated_at();

alter table public.project_statuses enable row level security;

drop policy if exists "project_statuses_select_authenticated" on public.project_statuses;
drop policy if exists "project_statuses_insert_authenticated" on public.project_statuses;
drop policy if exists "project_statuses_update_authenticated" on public.project_statuses;
drop policy if exists "project_statuses_delete_authenticated" on public.project_statuses;

create policy "project_statuses_select_authenticated"
  on public.project_statuses
  for select
  to authenticated
  using (true);

create policy "project_statuses_insert_authenticated"
  on public.project_statuses
  for insert
  to authenticated
  with check (true);

create policy "project_statuses_update_authenticated"
  on public.project_statuses
  for update
  to authenticated
  using (true)
  with check (true);

create policy "project_statuses_delete_authenticated"
  on public.project_statuses
  for delete
  to authenticated
  using (true);
