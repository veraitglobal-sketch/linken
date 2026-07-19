-- Client assessments: structured strengths + private feedback (not a review site)

create table public.client_assessments (
  id uuid primary key default gen_random_uuid(),
  reference_id uuid references public.service_references (id) on delete cascade,
  confirmation_request_id uuid references public.case_study_client_confirmation_requests (id) on delete cascade,
  provider_company_id uuid not null references public.companies (id) on delete cascade,
  assessor_company_id uuid not null references public.companies (id) on delete cascade,
  strengths text[] not null default '{}',
  would_work_again boolean,
  private_feedback text not null default '',
  created_at timestamptz not null default now(),
  constraint assessment_one_source check (
    (reference_id is not null)::int
    + (confirmation_request_id is not null)::int = 1
  ),
  constraint assessment_unique_ref unique (reference_id),
  constraint assessment_unique_conf unique (confirmation_request_id),
  constraint assessment_strengths_catalog check (
    strengths <@ array[
      'reliability',
      'communication',
      'quality',
      'deadlines',
      'value',
      'flexibility',
      'expertise',
      'proactivity'
    ]::text[]
  )
);

create index client_assessments_provider_idx
  on public.client_assessments (provider_company_id, created_at desc);

alter table public.client_assessments enable row level security;

-- Public row read allowed; private_feedback never granted as a column
create policy "client_assessments_public_select"
on public.client_assessments for select
to anon, authenticated
using (true);

-- No INSERT/UPDATE/DELETE policies — writes only via security definer RPCs

revoke all on table public.client_assessments from public;
revoke all on table public.client_assessments from anon, authenticated;

grant select (
  id,
  reference_id,
  confirmation_request_id,
  provider_company_id,
  assessor_company_id,
  strengths,
  would_work_again,
  created_at
) on table public.client_assessments to anon, authenticated;

-- Keep confirm_token after reference confirm so the post-confirm page can load
-- (status='confirmed' already blocks a second confirm).
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

-- Submit assessment (one-shot; caller must own the confirming client company)
create or replace function public.submit_client_assessment(
  p_source_type text,
  p_source_id uuid,
  p_strengths text[],
  p_would_work_again boolean,
  p_private_feedback text
)
returns public.client_assessments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_strengths text[] := coalesce(p_strengths, '{}');
  v_feedback text := coalesce(trim(p_private_feedback), '');
  v_provider uuid;
  v_assessor uuid;
  v_ref uuid;
  v_conf uuid;
  v_row public.client_assessments;
  v_allowed text[] := array[
    'reliability',
    'communication',
    'quality',
    'deadlines',
    'value',
    'flexibility',
    'expertise',
    'proactivity'
  ];
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not (v_strengths <@ v_allowed) then
    raise exception 'Invalid strengths';
  end if;

  if p_source_type = 'reference' then
    select
      r.id,
      r.provider_company_id,
      r.client_company_id
    into v_ref, v_provider, v_assessor
    from public.service_references r
    where r.id = p_source_id
      and r.status = 'confirmed';

    if v_ref is null then
      raise exception 'Reference not found or not confirmed';
    end if;

    if v_assessor is null or not public.is_company_owner(v_assessor) then
      raise exception 'Not the confirming client';
    end if;

    if exists (
      select 1 from public.client_assessments a where a.reference_id = v_ref
    ) then
      raise exception 'Assessment already submitted';
    end if;

    insert into public.client_assessments (
      reference_id,
      provider_company_id,
      assessor_company_id,
      strengths,
      would_work_again,
      private_feedback
    )
    values (
      v_ref,
      v_provider,
      v_assessor,
      v_strengths,
      p_would_work_again,
      v_feedback
    )
    returning * into v_row;

  elsif p_source_type = 'confirmation' then
    select
      c.id,
      c.requested_by_company_id,
      c.confirmed_by_company_id
    into v_conf, v_provider, v_assessor
    from public.case_study_client_confirmation_requests c
    where c.id = p_source_id
      and c.status = 'confirmed';

    if v_conf is null then
      raise exception 'Confirmation not found or not confirmed';
    end if;

    if v_assessor is null or not public.is_company_owner(v_assessor) then
      raise exception 'Not the confirming client';
    end if;

    if exists (
      select 1
      from public.client_assessments a
      where a.confirmation_request_id = v_conf
    ) then
      raise exception 'Assessment already submitted';
    end if;

    insert into public.client_assessments (
      confirmation_request_id,
      provider_company_id,
      assessor_company_id,
      strengths,
      would_work_again,
      private_feedback
    )
    values (
      v_conf,
      v_provider,
      v_assessor,
      v_strengths,
      p_would_work_again,
      v_feedback
    )
    returning * into v_row;
  else
    raise exception 'Invalid source type';
  end if;

  return v_row;
end;
$$;

revoke all on function public.submit_client_assessment(text, uuid, text[], boolean, text) from public;
grant execute on function public.submit_client_assessment(text, uuid, text[], boolean, text) to authenticated;

-- Private feedback for provider owner only. Anonymity is real, not cosmetic:
-- no assessment id (it would join to the public row's assessor_company_id)
-- and the date is truncated to month (an exact timestamp correlates with the
-- publicly visible created_at and would identify the assessor).
create or replace function public.get_private_feedback(p_company_id uuid)
returns table (
  private_feedback text,
  feedback_month date
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_company_owner(p_company_id) then
    raise exception 'Not company owner';
  end if;

  return query
  select
    a.private_feedback,
    date_trunc('month', a.created_at)::date
  from public.client_assessments a
  where a.provider_company_id = p_company_id
    and a.private_feedback <> ''
  order by date_trunc('month', a.created_at) desc, a.private_feedback;
end;
$$;

revoke all on function public.get_private_feedback(uuid) from public;
grant execute on function public.get_private_feedback(uuid) to authenticated;
