-- Confirmation depth (L1 engagement / L2 scope / L3 outcome) + disclosure.
-- Set only by the client via confirm RPCs — same sacred rule as status.

alter table public.service_references
  add column if not exists confirmation_level smallint
    check (confirmation_level is null or confirmation_level between 1 and 3),
  add column if not exists disclosure text
    check (disclosure is null or disclosure in ('named', 'undisclosed'));

alter table public.case_study_client_confirmation_requests
  add column if not exists confirmation_level smallint
    check (confirmation_level is null or confirmation_level between 1 and 3),
  add column if not exists disclosure text
    check (disclosure is null or disclosure in ('named', 'undisclosed'));

revoke select on public.service_references from anon, authenticated;
grant select (
  id, provider_company_id, client_company_id, client_name, service,
  started_year, ongoing, ended_year, status, created_at, confirmed_at,
  confirmation_level, disclosure
) on public.service_references to anon, authenticated;

revoke select on public.case_study_client_confirmation_requests from anon, authenticated;
grant select (
  id, case_study_id, requested_by_company_id, status,
  confirmed_by_company_id, created_at, confirmed_at,
  confirmation_level, disclosure
) on public.case_study_client_confirmation_requests to anon, authenticated;

-- Strip level/disclosure on direct writes; RPCs set app.allow_confirm_meta=1.
create or replace function public.lock_confirmation_meta()
returns trigger
language plpgsql
as $$
begin
  if current_setting('app.allow_confirm_meta', true) is distinct from '1' then
    if tg_op = 'INSERT' then
      new.confirmation_level := null;
      new.disclosure := null;
    else
      new.confirmation_level := old.confirmation_level;
      new.disclosure := old.disclosure;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists service_references_lock_confirm_meta on public.service_references;
create trigger service_references_lock_confirm_meta
  before insert or update on public.service_references
  for each row execute function public.lock_confirmation_meta();

drop trigger if exists client_confirm_lock_confirm_meta
  on public.case_study_client_confirmation_requests;
create trigger client_confirm_lock_confirm_meta
  before insert or update on public.case_study_client_confirmation_requests
  for each row execute function public.lock_confirmation_meta();

drop function if exists public.confirm_service_reference(uuid, text, uuid);

create function public.confirm_service_reference(
  p_token uuid,
  p_decision text,
  p_company_id uuid,
  p_level integer default 1,
  p_disclosure text default 'named'
)
returns public.service_references
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.service_references;
  v_level integer := coalesce(p_level, 1);
  v_disclosure text := coalesce(nullif(trim(p_disclosure), ''), 'named');
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

  if p_decision = 'confirmed' then
    if v_level not in (1, 2, 3) then
      raise exception 'Invalid confirmation level';
    end if;
    if v_disclosure not in ('named', 'undisclosed') then
      raise exception 'Invalid disclosure';
    end if;
  end if;

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

  perform set_config('app.allow_confirm_meta', '1', true);

  update public.service_references r
  set
    status = p_decision,
    confirmed_at = case when p_decision = 'confirmed' then now() else null end,
    client_company_id = case
      when p_decision = 'confirmed' then p_company_id
      else r.client_company_id
    end,
    confirmation_level = case
      when p_decision = 'confirmed' then v_level
      else null
    end,
    disclosure = case
      when p_decision = 'confirmed' then v_disclosure
      else null
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

revoke all on function public.confirm_service_reference(uuid, text, uuid, integer, text) from public;
grant execute on function public.confirm_service_reference(uuid, text, uuid, integer, text) to authenticated;

drop function if exists public.respond_client_confirmation(uuid, text, uuid);

create function public.respond_client_confirmation(
  p_token uuid,
  p_response text,
  p_company_id uuid,
  p_level integer default 1,
  p_disclosure text default 'named'
)
returns public.case_study_client_confirmation_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.case_study_client_confirmation_requests;
  v_level integer := coalesce(p_level, 1);
  v_disclosure text := coalesce(nullif(trim(p_disclosure), ''), 'named');
begin
  if p_response not in ('confirmed', 'declined') then
    raise exception 'Invalid response';
  end if;

  if not public.is_company_owner(p_company_id) then
    raise exception 'Not company owner';
  end if;

  if p_response = 'confirmed' then
    if v_level not in (1, 2, 3) then
      raise exception 'Invalid confirmation level';
    end if;
    if v_disclosure not in ('named', 'undisclosed') then
      raise exception 'Invalid disclosure';
    end if;
  end if;

  perform set_config('app.allow_confirm_meta', '1', true);

  update public.case_study_client_confirmation_requests r
  set
    status = p_response,
    confirmed_by_company_id = case
      when p_response = 'confirmed' then p_company_id
      else null
    end,
    confirmed_at = case when p_response = 'confirmed' then now() else null end,
    confirmation_level = case
      when p_response = 'confirmed' then v_level
      else null
    end,
    disclosure = case
      when p_response = 'confirmed' then v_disclosure
      else null
    end
  where r.token = p_token
    and r.status = 'pending'
    and r.requested_by_company_id <> p_company_id
  returning * into row;

  if row.id is null then
    raise exception 'Request not found or already resolved';
  end if;

  return row;
end;
$$;

revoke all on function public.respond_client_confirmation(uuid, text, uuid, integer, text) from public;
grant execute on function public.respond_client_confirmation(uuid, text, uuid, integer, text) to authenticated;
