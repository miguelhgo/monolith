-- Expose a stable pool rank (without sequence gaps) for the authenticated user.

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

revoke all on function public.get_pool_rank(uuid) from public;
grant execute on function public.get_pool_rank(uuid) to authenticated;
