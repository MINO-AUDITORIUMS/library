create table if not exists public.album_attachments (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums (id) on delete cascade,
  file_name text not null,
  storage_bucket text not null default 'album-attachments',
  storage_path text not null,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint album_attachments_file_name_not_empty check (
    char_length(trim(file_name)) > 0
  ),
  constraint album_attachments_storage_path_not_empty check (
    char_length(trim(storage_path)) > 0
  ),
  constraint album_attachments_size_bytes_positive check (
    size_bytes is null or size_bytes > 0
  ),
  constraint album_attachments_storage_path_unique unique (storage_bucket, storage_path)
);

create index if not exists album_attachments_album_id_idx on public.album_attachments (album_id);

alter table public.album_attachments enable row level security;

drop policy if exists "album_attachments_select_authenticated" on public.album_attachments;
drop policy if exists "album_attachments_insert_authenticated" on public.album_attachments;
drop policy if exists "album_attachments_delete_authenticated" on public.album_attachments;

create policy "album_attachments_select_authenticated"
  on public.album_attachments
  for select
  to authenticated
  using (true);

create policy "album_attachments_insert_authenticated"
  on public.album_attachments
  for insert
  to authenticated
  with check (true);

create policy "album_attachments_delete_authenticated"
  on public.album_attachments
  for delete
  to authenticated
  using (true);
