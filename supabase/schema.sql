-- Legacy schema snapshot kept for reference.
-- Canonical change history lives in supabase/migrations/*.sql.

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

create index if not exists idx_pool_entries_created_at on public.pool_entries (created_at);
create index if not exists idx_pool_entries_position on public.pool_entries (position);

create table if not exists public.selection_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  times_chosen integer not null default 0 check (times_chosen >= 0),
  last_chosen_at timestamptz,
  eligible_from timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

drop trigger if exists trg_selection_state_updated_at on public.selection_state;
create trigger trg_selection_state_updated_at
before update on public.selection_state
for each row execute procedure public.set_updated_at();

create table if not exists public.daily_choices (
  day date primary key,
  user_id uuid not null references auth.users(id) on delete restrict,
  cooldown_days integer not null default 90 check (cooldown_days between 1 and 3650),
  created_at timestamptz not null default timezone('utc'::text, now()),
  unique (day, user_id)
);

create index if not exists idx_daily_choices_user_id on public.daily_choices (user_id);

create table if not exists public.monolith_posts (
  id bigserial primary key,
  day date not null unique,
  author_user_id uuid not null references auth.users(id) on delete restrict,
  title text not null check (char_length(btrim(title)) between 16 and 140),
  body text not null check (char_length(btrim(body)) between 280 and 12000),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  constraint monolith_posts_daily_author_fk
    foreign key (day, author_user_id)
    references public.daily_choices (day, user_id)
    on delete cascade
);

create index if not exists idx_monolith_posts_author_user_id on public.monolith_posts (author_user_id);

drop trigger if exists trg_monolith_posts_updated_at on public.monolith_posts;
create trigger trg_monolith_posts_updated_at
before update on public.monolith_posts
for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.pool_entries enable row level security;
alter table public.selection_state enable row level security;
alter table public.daily_choices enable row level security;
alter table public.monolith_posts enable row level security;

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

drop policy if exists "daily_choices_select_all" on public.daily_choices;
create policy "daily_choices_select_all"
on public.daily_choices
for select
to anon, authenticated
using (true);

drop policy if exists "monolith_posts_select_all" on public.monolith_posts;
create policy "monolith_posts_select_all"
on public.monolith_posts
for select
to anon, authenticated
using (true);

grant select, insert, update on table public.profiles to authenticated;
grant select, insert on table public.pool_entries to authenticated;
grant select on table public.daily_choices to anon, authenticated;
grant select on table public.monolith_posts to anon, authenticated;
grant usage, select on sequence public.pool_position_seq to authenticated;

create or replace function public.get_waiting_count()
returns bigint
language sql
security definer
set search_path = public
as $$
  select count(*)::bigint
  from public.pool_entries;
$$;

create or replace function public.get_pool_rank(p_user_id uuid default auth.uid())
returns bigint
language sql
security definer
set search_path = public
as $$
  with target as (
    select pe.position
    from public.pool_entries pe
    where pe.user_id = p_user_id
  )
  select case
    when exists (select 1 from target) then (
      select count(*)::bigint
      from public.pool_entries pe
      where pe.position <= (select position from target)
    )
    else null
  end;
$$;

create or replace function public.pick_daily_chosen(
  p_day date default current_date,
  p_cooldown_days integer default 90
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_launch_day date := coalesce(
    nullif(current_setting('app.settings.launch_date', true), '')::date,
    date '2026-03-31'
  );
begin
  if p_cooldown_days < 1 or p_cooldown_days > 3650 then
    raise exception 'cooldown_days must be between 1 and 3650';
  end if;

  if p_day < v_launch_day then
    raise exception 'Daily pick is locked before launch date %', v_launch_day;
  end if;

  perform pg_advisory_xact_lock(94712, (p_day - date '2000-01-01')::integer);

  select dc.user_id
  into v_user_id
  from public.daily_choices dc
  where dc.day = p_day;

  if v_user_id is not null then
    return v_user_id;
  end if;

  select pe.user_id
  into v_user_id
  from public.pool_entries pe
  join public.profiles p on p.user_id = pe.user_id
  left join public.selection_state ss on ss.user_id = pe.user_id
  where coalesce(ss.eligible_from, '-infinity'::timestamptz) <= timezone('utc'::text, now())
  order by random()
  limit 1;

  if v_user_id is null then
    select pe.user_id
    into v_user_id
    from public.pool_entries pe
    join public.profiles p on p.user_id = pe.user_id
    order by random()
    limit 1;
  end if;

  if v_user_id is null then
    raise exception 'No candidates available in pool_entries';
  end if;

  insert into public.daily_choices (day, user_id, cooldown_days)
  values (p_day, v_user_id, p_cooldown_days)
  on conflict (day) do nothing;

  select dc.user_id
  into v_user_id
  from public.daily_choices dc
  where dc.day = p_day;

  insert into public.selection_state (
    user_id,
    times_chosen,
    last_chosen_at,
    eligible_from
  )
  values (
    v_user_id,
    1,
    timezone('utc'::text, now()),
    timezone('utc'::text, now()) + make_interval(days => p_cooldown_days)
  )
  on conflict (user_id) do update
  set times_chosen = public.selection_state.times_chosen + 1,
      last_chosen_at = timezone('utc'::text, now()),
      eligible_from = timezone('utc'::text, now()) + make_interval(days => p_cooldown_days),
      updated_at = timezone('utc'::text, now());

  return v_user_id;
end;
$$;

create or replace function public.submit_monolith_post(
  p_day date default current_date,
  p_title text default '',
  p_body text default ''
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_post_id bigint;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if char_length(btrim(coalesce(p_title, ''))) < 16 then
    raise exception 'Title must be at least 16 characters';
  end if;

  if char_length(btrim(coalesce(p_body, ''))) < 280 then
    raise exception 'Body must be at least 280 characters';
  end if;

  insert into public.monolith_posts (day, author_user_id, title, body)
  values (p_day, v_user_id, btrim(p_title), btrim(p_body))
  on conflict (day) do update
  set title = excluded.title,
      body = excluded.body,
      updated_at = timezone('utc'::text, now())
  where public.monolith_posts.author_user_id = v_user_id
  returning id into v_post_id;

  if v_post_id is null then
    raise exception 'This day is assigned to another chosen author';
  end if;

  return v_post_id;
exception
  when foreign_key_violation then
    raise exception 'You are not the chosen author for this day';
end;
$$;

create or replace function public.get_chosen_for_day(p_day date default current_date)
returns table (
  day date,
  user_id uuid,
  username text
)
language sql
security definer
set search_path = public
as $$
  select dc.day, dc.user_id, p.username::text
  from public.daily_choices dc
  join public.profiles p on p.user_id = dc.user_id
  where dc.day = p_day
  limit 1;
$$;

revoke all on function public.get_waiting_count() from public;
grant execute on function public.get_waiting_count() to anon, authenticated;

revoke all on function public.get_pool_rank(uuid) from public;
grant execute on function public.get_pool_rank(uuid) to authenticated;

revoke all on function public.submit_monolith_post(date, text, text) from public;
grant execute on function public.submit_monolith_post(date, text, text) to authenticated;

revoke all on function public.get_chosen_for_day(date) from public;
grant execute on function public.get_chosen_for_day(date) to anon, authenticated;

revoke all on function public.pick_daily_chosen(date, integer) from public;
grant execute on function public.pick_daily_chosen(date, integer) to service_role;
