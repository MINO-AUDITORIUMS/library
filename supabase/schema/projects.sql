create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  title text not null,
  album_id uuid not null references public.albums (id) on delete restrict,
  project_type_id uuid not null references public.project_types (id) on delete restrict,
  project_status_id uuid not null references public.project_statuses (id) on delete restrict,
  primary_location_id uuid references public.locations (id) on delete set null,
  event_date date,
  event_end_date date,
  comment text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  constraint projects_code_not_empty check (char_length(trim(code)) > 0),
  constraint projects_title_not_empty check (char_length(trim(title)) > 0),
  constraint projects_comment_length check (char_length(comment) <= 4000),
  constraint projects_event_dates_order check (
    event_end_date is null
    or event_date is null
    or event_end_date >= event_date
  )
);

create unique index if not exists projects_code_unique_idx
  on public.projects (lower(code));

create index if not exists projects_album_id_idx on public.projects (album_id);
create index if not exists projects_type_id_idx on public.projects (project_type_id);
create index if not exists projects_status_id_idx on public.projects (project_status_id);
create index if not exists projects_location_id_idx
  on public.projects (primary_location_id);
create index if not exists projects_event_date_idx
  on public.projects (event_date desc nulls last);

drop trigger if exists projects_set_updated_at on public.projects;

create trigger projects_set_updated_at
  before update on public.projects
  for each row
  execute function public.set_updated_at();

alter table public.projects enable row level security;

drop policy if exists "projects_select_authenticated" on public.projects;
drop policy if exists "projects_insert_authenticated" on public.projects;
drop policy if exists "projects_update_authenticated" on public.projects;
drop policy if exists "projects_delete_authenticated" on public.projects;

create policy "projects_select_authenticated"
  on public.projects
  for select
  to authenticated
  using (true);

create policy "projects_insert_authenticated"
  on public.projects
  for insert
  to authenticated
  with check (true);

create policy "projects_update_authenticated"
  on public.projects
  for update
  to authenticated
  using (true)
  with check (true);

create policy "projects_delete_authenticated"
  on public.projects
  for delete
  to authenticated
  using (true);
