-- ============================================================
-- Semana 1: Comments + Votes tables, RPCs, triggers
-- ============================================================

-- ---------- Comments table ----------
create table if not exists public.comments (
  id          bigserial    primary key,
  day         date         not null,
  user_id     uuid         not null references auth.users(id) on delete cascade,
  parent_id   bigint       null references public.comments(id) on delete cascade,
  body        text         not null check (char_length(btrim(body)) between 1 and 2000),
  votes_up    integer      not null default 0,
  votes_down  integer      not null default 0,
  created_at  timestamptz  not null default now()
);

create index if not exists idx_comments_day_created on public.comments (day, created_at);
create index if not exists idx_comments_parent_id   on public.comments (parent_id);

alter table public.comments enable row level security;

-- Anyone can read comments
drop policy if exists "comments_select_all" on public.comments;
create policy "comments_select_all"
  on public.comments for select
  to anon, authenticated
  using (true);

-- Authenticated can insert their own
drop policy if exists "comments_insert_own" on public.comments;
create policy "comments_insert_own"
  on public.comments for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Only author can delete their own
drop policy if exists "comments_delete_own" on public.comments;
create policy "comments_delete_own"
  on public.comments for delete
  to authenticated
  using (auth.uid() = user_id);

grant select on table public.comments to anon, authenticated;
grant insert, delete on table public.comments to authenticated;
grant usage, select on sequence public.comments_id_seq to authenticated;

-- ---------- Votes table ----------
create table if not exists public.votes (
  user_id      uuid       not null references auth.users(id) on delete cascade,
  target_type  text       not null check (target_type in ('post', 'comment')),
  target_id    bigint     not null,
  value        smallint   not null check (value in (1, -1)),
  created_at   timestamptz not null default now(),
  primary key (user_id, target_type, target_id)
);

alter table public.votes enable row level security;

-- Anyone can read votes
drop policy if exists "votes_select_all" on public.votes;
create policy "votes_select_all"
  on public.votes for select
  to anon, authenticated
  using (true);

-- Authenticated can insert their own
drop policy if exists "votes_insert_own" on public.votes;
create policy "votes_insert_own"
  on public.votes for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Authenticated can update their own
drop policy if exists "votes_update_own" on public.votes;
create policy "votes_update_own"
  on public.votes for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Authenticated can delete their own
drop policy if exists "votes_delete_own" on public.votes;
create policy "votes_delete_own"
  on public.votes for delete
  to authenticated
  using (auth.uid() = user_id);

grant select on table public.votes to anon, authenticated;
grant insert, update, delete on table public.votes to authenticated;

-- ---------- Vote count columns on monolith_posts ----------
alter table public.monolith_posts
  add column if not exists votes_up   integer not null default 0,
  add column if not exists votes_down integer not null default 0;


-- ============================================================
-- RPCs
-- ============================================================

-- ---------- 1. submit_comment ----------
create or replace function public.submit_comment(
  p_day       date,
  p_body      text,
  p_parent_id bigint default null
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id   uuid;
  v_depth     integer := 0;
  v_cursor    bigint;
  v_parent_day date;
  v_comment_id bigint;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  -- Validate body
  if char_length(btrim(coalesce(p_body, ''))) < 1 then
    raise exception 'Comment body cannot be empty';
  end if;
  if char_length(btrim(coalesce(p_body, ''))) > 2000 then
    raise exception 'Comment body cannot exceed 2000 characters';
  end if;

  -- Validate parent if provided
  if p_parent_id is not null then
    select day into v_parent_day
    from public.comments
    where id = p_parent_id;

    if v_parent_day is null then
      raise exception 'Parent comment not found';
    end if;

    if v_parent_day <> p_day then
      raise exception 'Parent comment belongs to a different day';
    end if;

    -- Check depth (max 3 levels: 0, 1, 2 — parent_id chain)
    v_cursor := p_parent_id;
    loop
      select parent_id into v_cursor
      from public.comments
      where id = v_cursor;

      exit when v_cursor is null;
      v_depth := v_depth + 1;

      if v_depth >= 3 then
        raise exception 'Maximum comment depth reached';
      end if;
    end loop;
  end if;

  insert into public.comments (day, user_id, parent_id, body)
  values (p_day, v_user_id, p_parent_id, btrim(p_body))
  returning id into v_comment_id;

  return v_comment_id;
end;
$$;

revoke all on function public.submit_comment(date, text, bigint) from public;
grant execute on function public.submit_comment(date, text, bigint) to authenticated;


-- ---------- 2. get_comments_for_day ----------
create or replace function public.get_comments_for_day(p_day date)
returns table (
  id         bigint,
  day        date,
  user_id    uuid,
  parent_id  bigint,
  body       text,
  votes_up   integer,
  votes_down integer,
  created_at timestamptz,
  username   text
)
language sql
security definer
set search_path = public
as $$
  select
    c.id,
    c.day,
    c.user_id,
    c.parent_id,
    c.body,
    c.votes_up,
    c.votes_down,
    c.created_at,
    coalesce(p.username::text, 'anonymous')
  from public.comments c
  left join public.profiles p on p.user_id = c.user_id
  where c.day = p_day
  order by c.created_at asc;
$$;

revoke all on function public.get_comments_for_day(date) from public;
grant execute on function public.get_comments_for_day(date) to anon, authenticated;


-- ---------- 3. cast_vote ----------
create or replace function public.cast_vote(
  p_target_type text,
  p_target_id   bigint,
  p_value       smallint
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id    uuid;
  v_existing   smallint;
  v_action     text;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_target_type not in ('post', 'comment') then
    raise exception 'Invalid target_type';
  end if;

  if p_value not in (1, -1) then
    raise exception 'Value must be 1 or -1';
  end if;

  -- Check existing vote
  select value into v_existing
  from public.votes
  where user_id = v_user_id
    and target_type = p_target_type
    and target_id = p_target_id;

  if v_existing is not null and v_existing = p_value then
    -- Same vote: toggle off (remove)
    delete from public.votes
    where user_id = v_user_id
      and target_type = p_target_type
      and target_id = p_target_id;

    -- Update counts on target
    if p_target_type = 'post' then
      if p_value = 1 then
        update public.monolith_posts set votes_up = greatest(votes_up - 1, 0) where id = p_target_id;
      else
        update public.monolith_posts set votes_down = greatest(votes_down - 1, 0) where id = p_target_id;
      end if;
    else
      if p_value = 1 then
        update public.comments set votes_up = greatest(votes_up - 1, 0) where id = p_target_id;
      else
        update public.comments set votes_down = greatest(votes_down - 1, 0) where id = p_target_id;
      end if;
    end if;

    v_action := 'removed';

  elsif v_existing is not null and v_existing <> p_value then
    -- Different vote: switch
    update public.votes
    set value = p_value, created_at = now()
    where user_id = v_user_id
      and target_type = p_target_type
      and target_id = p_target_id;

    -- Update counts: remove old, add new
    if p_target_type = 'post' then
      if p_value = 1 then
        update public.monolith_posts
        set votes_up = votes_up + 1, votes_down = greatest(votes_down - 1, 0)
        where id = p_target_id;
      else
        update public.monolith_posts
        set votes_down = votes_down + 1, votes_up = greatest(votes_up - 1, 0)
        where id = p_target_id;
      end if;
    else
      if p_value = 1 then
        update public.comments
        set votes_up = votes_up + 1, votes_down = greatest(votes_down - 1, 0)
        where id = p_target_id;
      else
        update public.comments
        set votes_down = votes_down + 1, votes_up = greatest(votes_up - 1, 0)
        where id = p_target_id;
      end if;
    end if;

    v_action := 'switched';

  else
    -- No existing vote: insert new
    insert into public.votes (user_id, target_type, target_id, value)
    values (v_user_id, p_target_type, p_target_id, p_value);

    if p_target_type = 'post' then
      if p_value = 1 then
        update public.monolith_posts set votes_up = votes_up + 1 where id = p_target_id;
      else
        update public.monolith_posts set votes_down = votes_down + 1 where id = p_target_id;
      end if;
    else
      if p_value = 1 then
        update public.comments set votes_up = votes_up + 1 where id = p_target_id;
      else
        update public.comments set votes_down = votes_down + 1 where id = p_target_id;
      end if;
    end if;

    v_action := 'voted';
  end if;

  return v_action;
end;
$$;

revoke all on function public.cast_vote(text, bigint, smallint) from public;
grant execute on function public.cast_vote(text, bigint, smallint) to authenticated;


-- ---------- 4. get_user_votes_for_day ----------
create or replace function public.get_user_votes_for_day(p_day date)
returns table (
  target_type text,
  target_id   bigint,
  value       smallint
)
language sql
security definer
set search_path = public
as $$
  select v.target_type, v.target_id, v.value
  from public.votes v
  where v.user_id = auth.uid()
    and (
      -- Post votes: match by post day
      (v.target_type = 'post' and v.target_id in (
        select mp.id from public.monolith_posts mp where mp.day = p_day
      ))
      or
      -- Comment votes: match by comment day
      (v.target_type = 'comment' and v.target_id in (
        select c.id from public.comments c where c.day = p_day
      ))
    );
$$;

revoke all on function public.get_user_votes_for_day(date) from public;
grant execute on function public.get_user_votes_for_day(date) to authenticated;


-- ---------- 5. delete_comment ----------
create or replace function public.delete_comment(p_comment_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_owner   uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select user_id into v_owner
  from public.comments
  where id = p_comment_id;

  if v_owner is null then
    raise exception 'Comment not found';
  end if;

  if v_owner <> v_user_id then
    raise exception 'You can only delete your own comments';
  end if;

  -- Delete cascades to replies via FK on delete cascade
  delete from public.comments where id = p_comment_id;
end;
$$;

revoke all on function public.delete_comment(bigint) from public;
grant execute on function public.delete_comment(bigint) to authenticated;
