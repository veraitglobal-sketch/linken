# Admin credit grants (pre-Stripe)

**Deprecated path.** Use the panel at `/admin/companies/[id]` (Credits & plan
card) instead — it goes through `runAdminAction`, requires a reason, and
writes an audit row automatically. The SQL below is kept for reference /
break-glass only; prefer it never to be needed.

Credits are required only for **Linken Radar** marketplace requests
(`/dashboard/radar`). Direct profile inquiries remain free forever.

Enable Radar + grant credits (deprecated — use the admin panel):

```sql
update public.companies
set radar = true
where id = '<company_uuid>';

select public.admin_grant_credits(
  '<company_uuid>',  -- companies.id
  15,                -- positive integer
  'admin'            -- 'admin' | 'monthly_grant' | 'purchase'
);
```

Returns the new balance. Writes `company_credits` + `credit_ledger`.

Refund path (manual / future cron for unseen after 7 days):

```sql
select public.refund_response('<request_response_uuid>');
```

Full product notes: `docs/radar.md`.
