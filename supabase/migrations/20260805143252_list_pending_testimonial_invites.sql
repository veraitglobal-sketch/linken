-- Owner-only pending testimonial invites (token + email not in public grants).

create or replace function public.list_pending_testimonial_invites(p_company_id uuid)
returns table (
  id uuid,
  source text,
  author_email text,
  author_company_id uuid,
  author_company_name text,
  created_at timestamptz,
  submit_token uuid
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.is_company_owner(p_company_id) then
    raise exception 'Not company owner';
  end if;

  return query
  select
    t.id,
    t.source,
    t.author_email,
    t.author_company_id,
    c.name,
    t.created_at,
    t.submit_token
  from public.testimonials t
  left join public.companies c on c.id = t.author_company_id
  where t.company_id = p_company_id
    and t.status = 'pending'
  order by t.created_at desc
  limit 50;
end;
$$;

revoke all on function public.list_pending_testimonial_invites(uuid) from public;
grant execute on function public.list_pending_testimonial_invites(uuid) to authenticated;
