create table if not exists public.lyrics_languages (
  code text primary key,
  name text not null,
  created_at timestamptz not null default now(),
  constraint lyrics_languages_code_format check (code ~ '^[a-z]{2,3}(-[a-z]{2})?$')
);

create unique index if not exists lyrics_languages_name_unique_idx
  on public.lyrics_languages (lower(name));

alter table public.lyrics_languages enable row level security;

drop policy if exists "lyrics_languages_select_authenticated" on public.lyrics_languages;
drop policy if exists "lyrics_languages_insert_authenticated" on public.lyrics_languages;

create policy "lyrics_languages_select_authenticated"
  on public.lyrics_languages
  for select
  to authenticated
  using (true);

create policy "lyrics_languages_insert_authenticated"
  on public.lyrics_languages
  for insert
  to authenticated
  with check (true);
