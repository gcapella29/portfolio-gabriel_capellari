-- WebAppCap v2 onboarding data. Additive: legacy content remains untouched.
create table if not exists public.project_v2_content (
  project_id uuid primary key references public.projects(id) on delete cascade,
  identity jsonb not null default '{}'::jsonb,
  content jsonb not null default '{}'::jsonb,
  media jsonb not null default '{}'::jsonb,
  appearance jsonb not null default '{}'::jsonb,
  contact jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.project_v2_content enable row level security;

create policy "v2 content visible to project members" on public.project_v2_content for select using (
  exists(select 1 from public.projects p where p.id=project_id and p.owner_id=auth.uid())
  or exists(select 1 from public.project_members m where m.project_id=project_id and m.user_id=auth.uid())
);

create policy "v2 content editable by owner admin editor" on public.project_v2_content for all using (
  exists(select 1 from public.projects p where p.id=project_id and p.owner_id=auth.uid())
  or exists(select 1 from public.project_members m where m.project_id=project_id and m.user_id=auth.uid() and lower(m.role) in ('admin','editor'))
) with check (
  exists(select 1 from public.projects p where p.id=project_id and p.owner_id=auth.uid())
  or exists(select 1 from public.project_members m where m.project_id=project_id and m.user_id=auth.uid() and lower(m.role) in ('admin','editor'))
);

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('webappcap-v2-sites','webappcap-v2-sites',true,10485760,array['image/jpeg','image/png','image/webp','image/gif','image/svg+xml'])
on conflict(id) do nothing;

create policy "v2 project media read" on storage.objects for select using (bucket_id='webappcap-v2-sites');
create policy "v2 project media upload" on storage.objects for insert to authenticated with check (
  bucket_id='webappcap-v2-sites' and exists(
    select 1 from public.projects p
    where p.id::text=(storage.foldername(name))[1]
      and (p.owner_id=auth.uid() or exists(select 1 from public.project_members m where m.project_id=p.id and m.user_id=auth.uid() and lower(m.role) in ('admin','editor')))
  )
);
create policy "v2 project media update" on storage.objects for update to authenticated using (
  bucket_id='webappcap-v2-sites' and exists(
    select 1 from public.projects p
    where p.id::text=(storage.foldername(name))[1]
      and (p.owner_id=auth.uid() or exists(select 1 from public.project_members m where m.project_id=p.id and m.user_id=auth.uid() and lower(m.role) in ('admin','editor')))
  )
);
create policy "v2 project media delete" on storage.objects for delete to authenticated using (
  bucket_id='webappcap-v2-sites' and exists(
    select 1 from public.projects p
    where p.id::text=(storage.foldername(name))[1]
      and (p.owner_id=auth.uid() or exists(select 1 from public.project_members m where m.project_id=p.id and m.user_id=auth.uid() and lower(m.role) in ('admin','editor')))
  )
);
