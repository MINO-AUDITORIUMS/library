create table if not exists public.project_budget_lines (
  id uuid primary key default gen_random_uuid(),
  budget_id uuid not null references public.project_budgets (id) on delete cascade,
  category_id uuid not null references public.budget_categories (id) on delete restrict,
  budgeted_amount numeric(12, 2) not null default 0,
  engaged_amount numeric(12, 2) not null default 0,
  sort_order integer not null default 0,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_budget_lines_budgeted_non_negative check (budgeted_amount >= 0),
  constraint project_budget_lines_engaged_non_negative check (engaged_amount >= 0),
  constraint project_budget_lines_notes_length check (char_length(notes) <= 2000),
  constraint project_budget_lines_budget_category_unique unique (budget_id, category_id)
);

create index if not exists project_budget_lines_budget_id_idx
  on public.project_budget_lines (budget_id);

create index if not exists project_budget_lines_category_id_idx
  on public.project_budget_lines (category_id);

drop trigger if exists project_budget_lines_set_updated_at on public.project_budget_lines;

create trigger project_budget_lines_set_updated_at
  before update on public.project_budget_lines
  for each row
  execute function public.set_updated_at();

alter table public.project_budget_lines enable row level security;

drop policy if exists "project_budget_lines_select_authenticated" on public.project_budget_lines;
drop policy if exists "project_budget_lines_insert_authenticated" on public.project_budget_lines;
drop policy if exists "project_budget_lines_update_authenticated" on public.project_budget_lines;
drop policy if exists "project_budget_lines_delete_authenticated" on public.project_budget_lines;

create policy "project_budget_lines_select_authenticated"
  on public.project_budget_lines
  for select
  to authenticated
  using (true);

create policy "project_budget_lines_insert_authenticated"
  on public.project_budget_lines
  for insert
  to authenticated
  with check (true);

create policy "project_budget_lines_update_authenticated"
  on public.project_budget_lines
  for update
  to authenticated
  using (true)
  with check (true);

create policy "project_budget_lines_delete_authenticated"
  on public.project_budget_lines
  for delete
  to authenticated
  using (true);
