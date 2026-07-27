-- Confirmer can open a testimonial form after case/reference confirmation.

create or replace function public.ensure_testimonial_after_confirm(
  p_token uuid,
  p_source text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
  v_source_id uuid;
  v_author_company_id uuid;
  v_existing uuid;
  v_new uuid;
begin
  if p_source not in ('case_study', 'reference') then
    raise exception 'Invalid source';
  end if;

  if p_source = 'case_study' then
    select
      r.requested_by_company_id,
      r.case_study_id,
      r.confirmed_by_company_id
    into v_company_id, v_source_id, v_author_company_id
    from public.case_study_client_confirmation_requests r
    where r.token = p_token
      and r.status = 'confirmed';
  else
    select
      r.provider_company_id,
      r.id,
      r.client_company_id
    into v_company_id, v_source_id, v_author_company_id
    from public.service_references r
    where r.confirm_token = p_token
      and r.status = 'confirmed';
  end if;

  if v_company_id is null or v_source_id is null then
    raise exception 'Confirmation not found';
  end if;

  if v_author_company_id is null
    or not public.is_company_owner(v_author_company_id) then
    raise exception 'Not authorized';
  end if;

  select submit_token into v_existing
  from public.testimonials
  where company_id = v_company_id
    and source = p_source
    and source_id = v_source_id
    and status in ('pending', 'published')
  limit 1;

  if v_existing is not null then
    return v_existing;
  end if;

  insert into public.testimonials (
    company_id, author_company_id, source, source_id, status
  )
  values (
    v_company_id, v_author_company_id, p_source, v_source_id, 'pending'
  )
  returning submit_token into v_new;

  return v_new;
end;
$$;

revoke all on function public.ensure_testimonial_after_confirm(uuid, text) from public;
grant execute on function public.ensure_testimonial_after_confirm(uuid, text) to authenticated;
