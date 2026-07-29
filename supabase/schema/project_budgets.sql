create table if not exists public.project_budgets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  constraint project_budgets_project_unique unique (project_id)
);

create index if not exists project_budgets_project_id_idx
  on public.project_budgets (project_id);

drop trigger if exists project_budgets_set_updated_at on public.project_budgets;

create trigger project_budgets_set_updated_at
  before update on public.project_budgets
  for each row
  execute function public.set_updated_at();

alter table public.project_budgets enable row level security;

drop policy if exists "project_budgets_select_authenticated" on public.project_budgets;
drop policy if exists "project_budgets_insert_authenticated" on public.project_budgets;
drop policy if exists "project_budgets_update_authenticated" on public.project_budgets;
drop policy if exists "project_budgets_delete_authenticated" on public.project_budgets;

create policy "project_budgets_select_authenticated"
  on public.project_budgets
  for select
  to authenticated
  using (true);

create policy "project_budgets_insert_authenticated"
  on public.project_budgets
  for insert
  to authenticated
  with check (true);

create policy "project_budgets_update_authenticated"
  on public.project_budgets
  for update
  to authenticated
  using (true)
  with check (true);

create policy "project_budgets_delete_authenticated"
  on public.project_budgets
  for delete
  to authenticated
  using (true);
