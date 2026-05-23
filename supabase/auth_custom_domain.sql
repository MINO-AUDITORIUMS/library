create or replace function public.check_user_domain()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  allowed_domain text := 'mino.co';
begin
  if new.email not like '%@' || allowed_domain then
    raise exception 'Accès refusé : Seules les adresses @% sont autorisées à s''inscrire.', allowed_domain;
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
