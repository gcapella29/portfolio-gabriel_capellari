-- WebAppCap v2 publication snapshot. Drafts remain in project_v2_content.
create table if not exists public.project_v2_public_content (
  project_id uuid primary key references public.projects(id) on delete cascade,
  identity jsonb not null default '{}'::jsonb,
  content jsonb not null default '{}'::jsonb,
  media jsonb not null default '{}'::jsonb,
  appearance jsonb not null default '{}'::jsonb,
  contact jsonb not null default '{}'::jsonb,
  published_at timestamptz not null default now()
);

alter table public.project_v2_public_content enable row level security;

create policy "v2 published content public read" on public.project_v2_public_content for select using (
  exists(select 1 from public.projects p where p.id=project_id and p.is_published=true and p.archived_at is null)
  or exists(select 1 from public.projects p where p.id=project_id and p.owner_id=auth.uid())
  or exists(select 1 from public.project_members m where m.project_id=project_id and m.user_id=auth.uid())
);

create policy "v2 published content owner admin write" on public.project_v2_public_content for all using (
  exists(select 1 from public.projects p where p.id=project_id and p.owner_id=auth.uid())
  or exists(select 1 from public.project_members m where m.project_id=project_id and m.user_id=auth.uid() and lower(m.role)='admin')
) with check (
  exists(select 1 from public.projects p where p.id=project_id and p.owner_id=auth.uid())
  or exists(select 1 from public.project_members m where m.project_id=project_id and m.user_id=auth.uid() and lower(m.role)='admin')
);
