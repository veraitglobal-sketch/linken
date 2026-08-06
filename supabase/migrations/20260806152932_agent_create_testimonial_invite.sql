-- Agent API: create pending testimonial invite without auth.uid() owner check.
-- Service role only — company scope is enforced by the Agent key in the app layer.

create or replace function public.agent_create_testimonial_invite(
  p_company_id uuid,
  p_source text default 'standalone',
  p_source_id uuid default null,
  p_author_email text default null,
  p_author_company_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_token uuid;
begin
  if not exists (
    select 1
    from public.companies c
    where c.id = p_company_id
      and c.claimed = true
  ) then
    raise exception 'Company not found';
  end if;

  if p_source not in ('partnership', 'reference', 'case_study', 'standalone') then
    raise exception 'Invalid source';
  end if;

  if p_source = 'standalone' and p_source_id is not null then
    raise exception 'Standalone testimonials cannot have a source_id';
  end if;

  if p_author_company_id is not null and not exists (
    select 1 from public.companies where id = p_author_company_id
  ) then
    raise exception 'Author company not found';
  end if;

  perform public.validate_testimonial_source_attachment(
    p_company_id,
    p_source,
    p_source_id
  );

  insert into public.testimonials (
    company_id, author_company_id, source, source_id, author_email, status
  )
  values (
    p_company_id,
    p_author_company_id,
    p_source,
    p_source_id,
    nullif(trim(p_author_email), ''),
    'pending'
  )
  returning submit_token into v_token;

  return v_token;
end;
$$;

revoke all on function public.agent_create_testimonial_invite(uuid, text, uuid, text, uuid)
  from public;
grant execute on function public.agent_create_testimonial_invite(uuid, text, uuid, text, uuid)
  to service_role;
