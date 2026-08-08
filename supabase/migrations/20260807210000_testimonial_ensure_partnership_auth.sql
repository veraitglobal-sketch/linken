-- Partnership branch of ensure_testimonial_after_confirm must not accept
-- bare public partnership IDs from anonymous callers. Case study / reference
-- keep anon execute (secret confirm tokens). Partnership requires an owner
-- of either side (auth.uid via is_company_owner).

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
  v_author_email text;
  v_existing uuid;
  v_new uuid;
begin
  if p_source not in ('case_study', 'reference', 'partnership') then
    raise exception 'Invalid source';
  end if;

  if p_source = 'case_study' then
    select
      r.requested_by_company_id,
      r.case_study_id,
      r.confirmed_by_company_id,
      nullif(trim(r.email), '')
    into v_company_id, v_source_id, v_author_company_id, v_author_email
    from public.case_study_client_confirmation_requests r
    where r.token = p_token
      and r.status = 'confirmed';
  elsif p_source = 'reference' then
    select
      r.provider_company_id,
      r.id,
      r.client_company_id,
      nullif(trim(r.invite_email), '')
    into v_company_id, v_source_id, v_author_company_id, v_author_email
    from public.service_references r
    where r.confirm_token = p_token
      and r.status = 'confirmed';
  else
    select
      p.requester_id,
      p.id,
      p.recipient_id,
      nullif(trim(c.invite_email), '')
    into v_company_id, v_source_id, v_author_company_id, v_author_email
    from public.partnerships p
    join public.companies c on c.id = p.recipient_id
    where p.id = p_token
      and p.status = 'accepted';
  end if;

  if v_company_id is null or v_source_id is null then
    raise exception 'Confirmation not found';
  end if;

  -- Partnership IDs are public on profiles — only company owners may ensure.
  if p_source = 'partnership' then
    if auth.uid() is null
       or (
         not public.is_company_owner(v_company_id)
         and (
           v_author_company_id is null
           or not public.is_company_owner(v_author_company_id)
         )
       )
    then
      raise exception 'Not allowed';
    end if;
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

  if not public.testimonial_ensure_rate_ok(p_token, p_source) then
    raise exception 'Too many requests for this link';
  end if;

  insert into public.testimonials (
    company_id, author_company_id, source, source_id, author_email, status
  )
  values (
    v_company_id, v_author_company_id, p_source, v_source_id, v_author_email, 'pending'
  )
  returning submit_token into v_new;

  return v_new;
end;
$$;

revoke all on function public.ensure_testimonial_after_confirm(uuid, text) from public;
grant execute on function public.ensure_testimonial_after_confirm(uuid, text) to anon, authenticated;
