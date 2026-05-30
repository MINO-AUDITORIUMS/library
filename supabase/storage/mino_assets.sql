insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'mino-assets',
  'mino-assets',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do nothing;

drop policy if exists "mino_assets_public_read" on storage.objects;

create policy "mino_assets_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'mino-assets');
