-- Rich case study presentation: cover hero, gallery, process narrative.

alter table public.case_studies
  add column if not exists cover_image_url text,
  add column if not exists gallery_urls text[] not null default '{}',
  add column if not exists process text not null default '';

grant select (cover_image_url, gallery_urls, process) on public.case_studies to anon, authenticated;

insert into storage.buckets (id, name, public)
values ('case-study-media', 'case-study-media', true)
on conflict (id) do nothing;

drop policy if exists "case_study_media_public_read" on storage.objects;
create policy "case_study_media_public_read"
on storage.objects for select
using (bucket_id = 'case-study-media');
