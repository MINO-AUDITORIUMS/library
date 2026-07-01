insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'artist-images',
  'artist-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

drop policy if exists "artist_images_select_authenticated" on storage.objects;
drop policy if exists "artist_images_insert_authenticated" on storage.objects;
drop policy if exists "artist_images_update_authenticated" on storage.objects;
drop policy if exists "artist_images_delete_authenticated" on storage.objects;

create policy "artist_images_select_authenticated"
  on storage.objects
  for select
  to authenticated
  using (bucket_id = 'artist-images');

create policy "artist_images_insert_authenticated"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'artist-images');

create policy "artist_images_update_authenticated"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'artist-images')
  with check (bucket_id = 'artist-images');

create policy "artist_images_delete_authenticated"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'artist-images');
