alter table public.albums drop constraint if exists albums_format_allowed;

alter table public.albums drop column if exists format;
