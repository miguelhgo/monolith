-- ============================================================
-- Semana 2: Cleanup RPC + Comment rate limiting
-- ============================================================

-- ---------- 1. cleanup_expired_content ----------
-- Deletes votes, comments, and posts from days before the given date.
-- daily_choices rows are preserved for historical record.
create or replace function public.cleanup_expired_content(p_before_day date)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_votes_deleted   bigint;
  v_comments_deleted bigint;
  v_posts_deleted   bigint;
begin
  -- 1. Delete votes for expired posts
  delete from public.votes
  where (target_type = 'post' and target_id in (
    select id from public.monolith_posts where day < p_before_day
  ))
  or (target_type = 'comment' and target_id in (
    select id from public.comments where day < p_before_day
  ));
  get diagnostics v_votes_deleted = row_count;

  -- 2. Delete comments from expired days
  delete from public.comments where day < p_before_day;
  get diagnostics v_comments_deleted = row_count;

  -- 3. Delete posts from expired days
  delete from public.monolith_posts where day < p_before_day;
  get diagnostics v_posts_deleted = row_count;

  return jsonb_build_object(
    'votes_deleted', v_votes_deleted,
    'comments_deleted', v_comments_deleted,
    'posts_deleted', v_posts_deleted
  );
end;
$$;

-- Only callable via service role (no public/anon/authenticated access)
revoke all on function public.cleanup_expired_content(date) from public;
revoke all on function public.cleanup_expired_content(date) from anon;
revoke all on function public.cleanup_expired_content(date) from authenticated;


-- ---------- 2. Rate limit on submit_comment (max 20/user/day) ----------
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
  v_user_id     uuid;
  v_depth       integer := 0;
  v_cursor      bigint;
  v_parent_day  date;
  v_comment_id  bigint;
  v_comment_count integer;
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

  -- Rate limit: max 20 comments per user per day
  select count(*) into v_comment_count
  from public.comments
  where user_id = v_user_id
    and day = p_day;

  if v_comment_count >= 20 then
    raise exception 'You have reached the maximum of 20 comments per day';
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
