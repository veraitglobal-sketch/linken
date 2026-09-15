-- After a partner confirms shared ownership of an unclaimed joint firm,
-- their admins may operate it — same path as the creating parent.

create or replace function public.is_company_operator(p_company_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_company_owner(p_company_id)
    or public.is_company_member(p_company_id, 'admin')
    or exists (
      select 1
      from public.companies c
      where c.id = p_company_id
        and c.claimed = false
        and c.created_by_company_id is not null
        and public.is_company_member(c.created_by_company_id, 'admin')
    )
    or exists (
      select 1
      from public.company_co_owners o
      join public.companies child on child.id = o.child_company_id
      where o.child_company_id = p_company_id
        and o.status = 'confirmed'
        and child.claimed = false
        and public.is_company_member(o.co_parent_company_id, 'admin')
    );
$$;

comment on function public.is_company_operator(uuid) is
  'Owner, same-company admin, creator-firm admin of an unclaimed branch, or confirmed co-parent admin of an unclaimed joint firm.';
