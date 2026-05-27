create table if not exists public.countries (
  code char(2) primary key,
  name text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists countries_name_unique_idx on public.countries (lower(name));

alter table public.countries enable row level security;

drop policy if exists "countries_select_authenticated" on public.countries;
drop policy if exists "countries_insert_authenticated" on public.countries;

create policy "countries_select_authenticated"
  on public.countries
  for select
  to authenticated
  using (true);

create policy "countries_insert_authenticated"
  on public.countries
  for insert
  to authenticated
  with check (true);
