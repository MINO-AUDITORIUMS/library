create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  constraint tags_name_not_empty check (char_length(trim(name)) > 0),
  constraint tags_slug_not_empty check (char_length(trim(slug)) > 0)
);

create unique index if not exists tags_name_unique_idx on public.tags (lower(name));
create unique index if not exists tags_slug_unique_idx on public.tags (slug);

alter table public.tags enable row level security;

drop policy if exists "tags_select_authenticated" on public.tags;
drop policy if exists "tags_insert_authenticated" on public.tags;
drop policy if exists "tags_update_authenticated" on public.tags;
drop policy if exists "tags_delete_authenticated" on public.tags;

create policy "tags_select_authenticated"
  on public.tags
  for select
  to authenticated
  using (true);

create policy "tags_insert_authenticated"
  on public.tags
  for insert
  to authenticated
  with check (true);

create policy "tags_update_authenticated"
  on public.tags
  for update
  to authenticated
  using (true)
  with check (true);

create policy "tags_delete_authenticated"
  on public.tags
  for delete
  to authenticated
  using (true);
