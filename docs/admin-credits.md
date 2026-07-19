# Admin credit grants (pre-Stripe)

Credits are required only for **Linken Radar** marketplace requests
(`/dashboard/radar`). Direct profile inquiries remain free forever.

Enable Radar + grant credits:

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
