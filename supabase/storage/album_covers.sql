insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'album-covers',
  'album-covers',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

drop policy if exists "album_covers_select_authenticated" on storage.objects;
drop policy if exists "album_covers_insert_authenticated" on storage.objects;
drop policy if exists "album_covers_update_authenticated" on storage.objects;
drop policy if exists "album_covers_delete_authenticated" on storage.objects;

create policy "album_covers_select_authenticated"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'album-covers');

create policy "album_covers_insert_authenticated"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'album-covers');

create policy "album_covers_update_authenticated"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'album-covers')
  with check (bucket_id = 'album-covers');

create policy "album_covers_delete_authenticated"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'album-covers');
