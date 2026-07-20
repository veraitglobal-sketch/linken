-- Pulled schema snapshot from remote supabase_migrations.schema_migrations
-- version: 20260720144359
-- name: partnership_lifecycle
-- Applied on remote via MCP/direct apply (not via local db push).
-- Do not re-run against remote; history sync only.

create or replace function public.withdraw_partnership(p_partnership_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.partnerships%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Sign in required';
  end if;

  select p.* into v_row
  from public.partnerships p
  where p.id = p_partnership_id
  for update;

  if v_row.id is null then
    raise exception 'Partnership not found';
  end if;

  if v_row.status <> 'pending' then
    raise exception 'Only pending requests can be withdrawn';
  end if;

  if not public.is_company_owner(v_row.requester_id) then
    raise exception 'Only the requester can withdraw this request';
  end if;

  update public.partnerships
  set status = 'cancelled',
      responded_at = now()
  where id = v_row.id;
end;
$$;

revoke all on function public.withdraw_partnership(uuid) from public, anon;
grant execute on function public.withdraw_partnership(uuid) to authenticated;

create or replace function public.end_partnership(p_partnership_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.partnerships%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Sign in required';
  end if;

  select p.* into v_row
  from public.partnerships p
  where p.id = p_partnership_id
  for update;

  if v_row.id is null then
    raise exception 'Partnership not found';
  end if;

  if v_row.status <> 'accepted' then
    raise exception 'Only accepted partnerships can be ended';
  end if;

  if not (
    public.is_company_owner(v_row.requester_id)
    or public.is_company_owner(v_row.recipient_id)
  ) then
    raise exception 'Not allowed';
  end if;

  update public.partnerships
  set status = 'cancelled',
      responded_at = now()
  where id = v_row.id;
end;
$$;

revoke all on function public.end_partnership(uuid) from public, anon;
grant execute on function public.end_partnership(uuid) to authenticated;

create or replace function public.get_partnership_peer_notify_email(
  p_partnership_id uuid,
  p_actor_company_id uuid
)
returns table (
  peer_email text,
  peer_name text,
  actor_name text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    coalesce(
      nullif(trim(u.email), ''),
      nullif(trim(peer.invite_email), '')
    ),
    peer.name,
    actor.name
  from public.partnerships p
  join public.companies actor on actor.id = p_actor_company_id
  join public.companies peer on peer.id = case
    when p.requester_id = p_actor_company_id then p.recipient_id
    when p.recipient_id = p_actor_company_id then p.requester_id
    else null
  end
  left join auth.users u on u.id = peer.owner_id
  where p.id = p_partnership_id
    and p_actor_company_id in (p.requester_id, p.recipient_id);
$$;

revoke all on function public.get_partnership_peer_notify_email(uuid, uuid) from public;
revoke all on function public.get_partnership_peer_notify_email(uuid, uuid)
  from anon, authenticated;
grant execute on function public.get_partnership_peer_notify_email(uuid, uuid)
  to service_role;
