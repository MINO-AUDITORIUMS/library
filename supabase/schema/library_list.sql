create or replace function public.escape_ilike_pattern(input text)
returns text
language sql
immutable
as $$
  select replace(replace(replace(coalesce(input, ''), '\', '\\'), '%', '\%'), '_', '\_');
$$;

create or replace function public.list_library_albums_page(
  p_query text default null,
  p_genre text default null,
  p_subgenre text default null,
  p_tag text default null,
  p_country text default null,
  p_country_code text default null,
  p_year_from int default null,
  p_year_to int default null,
  p_min_mino_rating int default null,
  p_page int default 1,
  p_page_size int default 12
)
returns json
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_offset int;
  v_total bigint;
  v_ids uuid[];
  v_pattern text;
begin
  v_offset := greatest((greatest(p_page, 1) - 1) * greatest(p_page_size, 1), 0);

  if p_query is not null and btrim(p_query) <> '' then
    v_pattern := '%' || public.escape_ilike_pattern(btrim(p_query)) || '%';
  end if;

  with filtered as (
    select distinct a.id, a.created_at
    from public.albums a
    left join public.countries c on c.code = a.origin_country_code
    where
      (
        v_pattern is null
        or a.title ilike v_pattern escape '\'
        or a.artist ilike v_pattern escape '\'
        or coalesce(a.label, '') ilike v_pattern escape '\'
        or coalesce(c.name, '') ilike v_pattern escape '\'
        or exists (
          select 1
          from public.album_genres ag
          join public.genres g on g.id = ag.genre_id
          where ag.album_id = a.id and g.name ilike v_pattern escape '\'
        )
        or exists (
          select 1
          from public.album_subgenres asg
          join public.subgenres sg on sg.id = asg.subgenre_id
          where asg.album_id = a.id and sg.name ilike v_pattern escape '\'
        )
        or exists (
          select 1
          from public.album_tags at
          join public.tags t on t.id = at.tag_id
          where at.album_id = a.id and t.name ilike v_pattern escape '\'
        )
      )
      and (
        p_genre is null
        or exists (
          select 1
          from public.album_genres ag
          join public.genres g on g.id = ag.genre_id
          where ag.album_id = a.id and g.name = p_genre
        )
      )
      and (
        p_subgenre is null
        or exists (
          select 1
          from public.album_subgenres asg
          join public.subgenres sg on sg.id = asg.subgenre_id
          where asg.album_id = a.id and sg.name = p_subgenre
        )
      )
      and (
        p_tag is null
        or exists (
          select 1
          from public.album_tags at
          join public.tags t on t.id = at.tag_id
          where at.album_id = a.id and t.name = p_tag
        )
      )
      and (
        p_country is null
        or (c.name is not null and c.name = p_country)
        or (
          p_country_code is not null
          and a.origin_country_code = p_country_code
        )
      )
      and (
        p_year_from is null
        or (a.release_year is not null and a.release_year >= p_year_from)
      )
      and (
        p_year_to is null
        or (a.release_year is not null and a.release_year <= p_year_to)
      )
      and (
        p_min_mino_rating is null
        or exists (
          select 1
          from public.album_user_ratings aur
          where aur.album_id = a.id
          group by aur.album_id
          having avg(aur.rating) >= p_min_mino_rating
        )
      )
  ),
  counted as (
    select count(*)::bigint as total from filtered
  ),
  paged as (
    select f.id, f.created_at
    from filtered f
    order by f.created_at desc
    offset v_offset
    limit greatest(p_page_size, 1)
  )
  select
    (select total from counted),
    coalesce(
      (select array_agg(p.id order by p.created_at desc) from paged p),
      array[]::uuid[]
    )
  into v_total, v_ids;

  return json_build_object('total', coalesce(v_total, 0), 'ids', v_ids);
end;
$$;

grant execute on function public.escape_ilike_pattern(text) to authenticated;
grant execute on function public.list_library_albums_page(
  text,
  text,
  text,
  text,
  text,
  text,
  int,
  int,
  int,
  int,
  int
) to authenticated;
