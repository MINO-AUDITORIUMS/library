create table if not exists public.album_lyrics_languages (
  album_id uuid not null references public.albums (id) on delete cascade,
  language_code text not null references public.lyrics_languages (code) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (album_id, language_code)
);

create index if not exists album_lyrics_languages_language_code_idx
  on public.album_lyrics_languages (language_code);

alter table public.album_lyrics_languages enable row level security;

drop policy if exists "album_lyrics_languages_select_authenticated" on public.album_lyrics_languages;
drop policy if exists "album_lyrics_languages_insert_authenticated" on public.album_lyrics_languages;
drop policy if exists "album_lyrics_languages_delete_authenticated" on public.album_lyrics_languages;

create policy "album_lyrics_languages_select_authenticated"
  on public.album_lyrics_languages
  for select
  to authenticated
  using (true);

create policy "album_lyrics_languages_insert_authenticated"
  on public.album_lyrics_languages
  for insert
  to authenticated
  with check (true);

create policy "album_lyrics_languages_delete_authenticated"
  on public.album_lyrics_languages
  for delete
  to authenticated
  using (true);
