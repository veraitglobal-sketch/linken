-- Reference confirm token window:
--   pending  → never expires (respond always allowed while status=pending)
--   confirmed → preview only within 30 days of confirmed_at (post-confirm / assessment)

create or replace function public.get_service_reference_preview(p_token uuid)
returns table (
  id uuid,
  status text,
  service text,
  started_year text,
  ongoing boolean,
  ended_year text,
  client_name text,
  invite_email text,
  provider_id uuid,
  provider_name text,
  provider_slug text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    r.id,
    r.status,
    r.service,
    r.started_year,
    r.ongoing,
    r.ended_year,
    r.client_name,
    r.invite_email,
    p.id,
    p.name,
    p.slug
  from public.service_references r
  join public.companies p on p.id = r.provider_company_id
  where r.confirm_token = p_token
    and (
      r.status = 'pending'
      or (
        r.status = 'confirmed'
        and r.confirmed_at is not null
        and r.confirmed_at >= (now() - interval '30 days')
      )
    );
$$;

revoke all on function public.get_service_reference_preview(uuid) from public;
grant execute on function public.get_service_reference_preview(uuid) to anon, authenticated;

-- Respond: pending never expires. Reject if token already resolved / missing.
create or replace function public.confirm_service_reference(
  p_token uuid,
  p_decision text,
  p_company_id uuid
)
returns public.service_references
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.service_references;
begin
  if p_decision not in ('confirmed', 'declined') then
    raise exception 'Invalid decision';
  end if;

  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_company_owner(p_company_id) then
    raise exception 'Not company owner';
  end if;

  -- Already confirmed past the 30-day window: clear error (not "not found").
  if exists (
    select 1
    from public.service_references r
    where r.confirm_token = p_token
      and r.status = 'confirmed'
      and r.confirmed_at is not null
      and r.confirmed_at < (now() - interval '30 days')
  ) then
    raise exception 'Confirmation link expired';
  end if;

  update public.service_references r
  set
    status = p_decision,
    confirmed_at = case when p_decision = 'confirmed' then now() else null end,
    client_company_id = case
      when p_decision = 'confirmed' then p_company_id
      else r.client_company_id
    end
  where r.confirm_token = p_token
    and r.status = 'pending'
    and r.provider_company_id <> p_company_id
  returning * into row;

  if row.id is null then
    raise exception 'Request not found or already resolved';
  end if;

  return row;
end;
$$;

revoke all on function public.confirm_service_reference(uuid, text, uuid) from public;
grant execute on function public.confirm_service_reference(uuid, text, uuid) to authenticated;
