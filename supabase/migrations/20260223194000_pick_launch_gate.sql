-- Enforce launch date gate for daily picks.
-- Launch day can be overridden with:
--   alter database postgres set app.settings.launch_date = 'YYYY-MM-DD';
-- If not set, default launch day is 2026-03-31.

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
