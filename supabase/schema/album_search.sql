create or replace function public.build_album_search_vector(
  p_title text,
  p_artist text,
  p_personal_notes text,
  p_label text,
  p_record_company text,
  p_producers text[],
  p_comment_text text
)
returns tsvector
language sql
immutable
as $$
  select
    setweight(to_tsvector('french', coalesce(p_title, '')), 'A')
    || setweight(to_tsvector('french', coalesce(p_artist, '')), 'A')
    || setweight(to_tsvector('french', coalesce(p_personal_notes, '')), 'C')
    || setweight(to_tsvector('french', coalesce(p_label, '')), 'C')
    || setweight(to_tsvector('french', coalesce(p_record_company, '')), 'C')
    || setweight(to_tsvector('french', coalesce(array_to_string(p_producers, ' '), '')), 'C')
    || setweight(to_tsvector('french', coalesce(p_comment_text, '')), 'C');
$$;

create or replace function public.sync_album_search_vector(p_album_id uuid)
returns void
language plpgsql
as $$
declare
  album_row public.albums%rowtype;
  comment_text text;
begin
  select *
  into album_row
  from public.albums
  where id = p_album_id;

  if not found then
    return;
  end if;

  select string_agg(body, ' ')
  into comment_text
  from public.album_comments
  where album_id = p_album_id;

  update public.albums
  set search_vector = public.build_album_search_vector(
    album_row.title,
    album_row.artist,
    album_row.personal_notes,
    album_row.label,
    album_row.record_company,
    album_row.producers,
    comment_text
  )
  where id = p_album_id;
end;
$$;

create or replace function public.albums_refresh_search_vector()
returns trigger
language plpgsql
as $$
declare
  comment_text text;
begin
  select string_agg(body, ' ')
  into comment_text
  from public.album_comments
  where album_id = new.id;

  new.search_vector := public.build_album_search_vector(
    new.title,
    new.artist,
    new.personal_notes,
    new.label,
    new.record_company,
    new.producers,
    comment_text
  );
  return new;
end;
$$;

drop trigger if exists albums_refresh_search_vector on public.albums;

create trigger albums_refresh_search_vector
  before insert or update of title, artist, personal_notes, label, record_company, producers
  on public.albums
  for each row
  execute function public.albums_refresh_search_vector();

create or replace function public.refresh_album_search_from_comment()
returns trigger
language plpgsql
as $$
begin
  perform public.sync_album_search_vector(coalesce(new.album_id, old.album_id));
  return coalesce(new, old);
end;
$$;

drop trigger if exists album_comments_refresh_album_search on public.album_comments;

create trigger album_comments_refresh_album_search
  after insert or update or delete on public.album_comments
  for each row
  execute function public.refresh_album_search_from_comment();
