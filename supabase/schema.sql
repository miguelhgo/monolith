create extension if not exists citext;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username citext not null unique check (username::text ~ '^[a-z0-9_]{3,20}$'),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

create sequence if not exists public.pool_position_seq
  as bigint
  start with 1
  increment by 1
  cache 1;

create table if not exists public.pool_entries (
  user_id uuid primary key references auth.users(id) on delete cascade,
  position bigint not null unique default nextval('public.pool_position_seq'),
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.profiles enable row level security;
alter table public.pool_entries enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "pool_entries_select_own" on public.pool_entries;
create policy "pool_entries_select_own"
on public.pool_entries
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "pool_entries_insert_own" on public.pool_entries;
create policy "pool_entries_insert_own"
on public.pool_entries
for insert
to authenticated
with check (auth.uid() = user_id);

grant select, insert, update on table public.profiles to authenticated;
grant select, insert on table public.pool_entries to authenticated;
grant usage, select on sequence public.pool_position_seq to authenticated;

create or replace function public.get_waiting_count()
returns bigint
language sql
security definer
set search_path = public
as $$
  select count(*)::bigint from public.pool_entries;
$$;

revoke all on function public.get_waiting_count() from public;
grant execute on function public.get_waiting_count() to anon, authenticated;
