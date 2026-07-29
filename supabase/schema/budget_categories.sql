create table if not exists public.budget_categories (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  label text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  constraint budget_categories_code_not_empty check (char_length(trim(code)) > 0),
  constraint budget_categories_label_not_empty check (char_length(trim(label)) > 0)
);

create unique index if not exists budget_categories_code_unique_idx
  on public.budget_categories (code);

create unique index if not exists budget_categories_label_unique_idx
  on public.budget_categories (lower(label));

create index if not exists budget_categories_active_sort_idx
  on public.budget_categories (is_active, sort_order, lower(label));

drop trigger if exists budget_categories_set_updated_at on public.budget_categories;

create trigger budget_categories_set_updated_at
  before update on public.budget_categories
  for each row
  execute function public.set_updated_at();

alter table public.budget_categories enable row level security;

drop policy if exists "budget_categories_select_authenticated" on public.budget_categories;
drop policy if exists "budget_categories_insert_authenticated" on public.budget_categories;
drop policy if exists "budget_categories_update_authenticated" on public.budget_categories;
drop policy if exists "budget_categories_delete_authenticated" on public.budget_categories;

create policy "budget_categories_select_authenticated"
  on public.budget_categories
  for select
  to authenticated
  using (true);

create policy "budget_categories_insert_authenticated"
  on public.budget_categories
  for insert
  to authenticated
  with check (true);

create policy "budget_categories_update_authenticated"
  on public.budget_categories
  for update
  to authenticated
  using (true)
  with check (true);

create policy "budget_categories_delete_authenticated"
  on public.budget_categories
  for delete
  to authenticated
  using (true);
