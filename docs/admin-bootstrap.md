# Platform admin bootstrap

Dual gate to `/admin`:

1. Email in `PLATFORM_ADMIN_EMAILS` (env, fail-closed)
2. Row in `public.platform_staff`

Bootstrap the first owner (SQL, once):

```sql
insert into public.platform_staff (user_id, role, created_by)
values ('<auth.users.id for your login>', 'owner', null);
```

Find your user id in Supabase Auth → Users, or:

```sql
select id, email from auth.users where email = 'you@hansala.com';
```

Further staff rows are inserted by an existing owner (no invite UI yet).

Credits / Radar / plan: `/admin/companies/[id]` (see `docs/admin-credits.md`).
