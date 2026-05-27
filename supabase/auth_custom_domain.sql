create or replace function public.check_user_domain()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  allowed_domains text[] := array['mino.co', 'imagine-nation.co', 'pm.me'];
  domain text;
begin
  if new.email is null then
    raise exception 'Accès refusé : Email manquant.';
  end if;

  domain := lower(split_part(new.email, '@', 2));

  if domain is null or domain = '' or not (domain = any (allowed_domains)) then
    raise exception 'Accès refusé : Domaine non autorisé (%).', domain;
  end if;

  return new;
end;
$$;

drop trigger if exists check_user_domain_trigger on auth.users;

create trigger check_user_domain_trigger
  before insert on auth.users
  for each row
  execute function public.check_user_domain();

revoke execute on function public.check_user_domain() from public;
revoke execute on function public.check_user_domain() from anon;
revoke execute on function public.check_user_domain() from authenticated;
