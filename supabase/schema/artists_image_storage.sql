alter table public.artists
  add column if not exists image_storage_path text;
