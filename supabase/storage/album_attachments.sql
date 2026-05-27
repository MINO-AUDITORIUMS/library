insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'album-attachments',
  'album-attachments',
  false,
  52428800,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
)
on conflict (id) do nothing;

drop policy if exists "album_attachments_select_authenticated" on storage.objects;
drop policy if exists "album_attachments_insert_authenticated" on storage.objects;
drop policy if exists "album_attachments_delete_authenticated" on storage.objects;

create policy "album_attachments_select_authenticated"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'album-attachments');

create policy "album_attachments_insert_authenticated"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'album-attachments');

create policy "album_attachments_delete_authenticated"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'album-attachments');
