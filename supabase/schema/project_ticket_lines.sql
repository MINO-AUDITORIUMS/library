create table if not exists public.project_ticket_lines (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  location_id uuid not null references public.locations (id) on delete restrict,
  capacity_per_screening integer not null default 0,
  screenings integer not null default 1,
  invitations integer not null default 0,
  tickets_sold integer not null default 0,
  ticket_price_ttc numeric(12, 2) not null default 0,
  vat_rate numeric(5, 2) not null default 5.5,
  is_free boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_ticket_lines_capacity_non_negative check (capacity_per_screening >= 0),
  constraint project_ticket_lines_screenings_positive check (screenings > 0),
  constraint project_ticket_lines_invitations_non_negative check (invitations >= 0),
  constraint project_ticket_lines_tickets_sold_non_negative check (tickets_sold >= 0),
  constraint project_ticket_lines_price_non_negative check (ticket_price_ttc >= 0),
  constraint project_ticket_lines_vat_non_negative check (vat_rate >= 0)
);

create index if not exists project_ticket_lines_project_id_idx
  on public.project_ticket_lines (project_id);

create index if not exists project_ticket_lines_location_id_idx
  on public.project_ticket_lines (location_id);

drop trigger if exists project_ticket_lines_set_updated_at on public.project_ticket_lines;

create trigger project_ticket_lines_set_updated_at
  before update on public.project_ticket_lines
  for each row
  execute function public.set_updated_at();

alter table public.project_ticket_lines enable row level security;

drop policy if exists "project_ticket_lines_select_authenticated" on public.project_ticket_lines;
drop policy if exists "project_ticket_lines_insert_authenticated" on public.project_ticket_lines;
drop policy if exists "project_ticket_lines_update_authenticated" on public.project_ticket_lines;
drop policy if exists "project_ticket_lines_delete_authenticated" on public.project_ticket_lines;

create policy "project_ticket_lines_select_authenticated"
  on public.project_ticket_lines
  for select
  to authenticated
  using (true);

create policy "project_ticket_lines_insert_authenticated"
  on public.project_ticket_lines
  for insert
  to authenticated
  with check (true);

create policy "project_ticket_lines_update_authenticated"
  on public.project_ticket_lines
  for update
  to authenticated
  using (true)
  with check (true);

create policy "project_ticket_lines_delete_authenticated"
  on public.project_ticket_lines
  for delete
  to authenticated
  using (true);
