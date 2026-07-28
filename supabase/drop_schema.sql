drop table if exists public.seances cascade;
drop table if exists public.location_rooms cascade;
drop table if exists public.locations cascade;
drop table if exists public.location_types cascade;
drop table if exists public.album_attachments cascade;
drop table if exists public.album_user_ratings cascade;
drop table if exists public.album_comments cascade;
drop table if exists public.album_lyrics_languages cascade;
drop table if exists public.album_subgenres cascade;
drop table if exists public.album_genres cascade;
drop table if exists public.album_tags cascade;
drop table if exists public.album_video_clips cascade;
drop table if exists public.album_tracks cascade;
drop table if exists public.albums cascade;
drop table if exists public.artists cascade;
drop table if exists public.tags cascade;
drop table if exists public.subgenres cascade;
drop table if exists public.genres cascade;
drop table if exists public.lyrics_languages cascade;
drop table if exists public.countries cascade;
drop table if exists public.profiles cascade;

drop trigger if exists on_auth_user_created on auth.users;

drop function if exists public.handle_new_user() cascade;
drop function if exists public.refresh_album_search_from_comment() cascade;
drop function if exists public.albums_refresh_search_vector() cascade;
drop function if exists public.sync_album_search_vector(uuid) cascade;
drop function if exists public.build_album_search_vector(
  text, text, text, text, text, text, text[], text
) cascade;
drop function if exists public.set_updated_at() cascade;

drop policy if exists "album_attachments_delete_authenticated" on storage.objects;
drop policy if exists "album_attachments_insert_authenticated" on storage.objects;
drop policy if exists "album_attachments_select_authenticated" on storage.objects;
