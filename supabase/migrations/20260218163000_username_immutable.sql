-- Enforce immutable public username once it has been set.
-- Safe to run multiple times.

create or replace function public.prevent_username_change()
returns trigger
language plpgsql
as $$
begin
  if old.username is distinct from new.username then
    raise exception 'Username is immutable once set';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_profiles_username_immutable on public.profiles;
create trigger trg_profiles_username_immutable
before update on public.profiles
for each row execute procedure public.prevent_username_change();
