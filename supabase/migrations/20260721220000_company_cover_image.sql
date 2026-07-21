-- Cover photo for the public profile hero — same spot/shape as the default
-- stock image, just replaceable per company (LinkedIn-style banner).

alter table public.companies add column cover_image_url text;

grant select (cover_image_url) on public.companies to anon, authenticated;

-- Uploads go through a server action using the service-role client (after an
-- is_company_operator check in app code), so only a public-read policy is
-- needed here — no direct client-side writes to this bucket.
insert into storage.buckets (id, name, public)
values ('company-covers', 'company-covers', true)
on conflict (id) do nothing;

drop policy if exists "company_covers_public_read" on storage.objects;
create policy "company_covers_public_read"
on storage.objects for select
using (bucket_id = 'company-covers');
