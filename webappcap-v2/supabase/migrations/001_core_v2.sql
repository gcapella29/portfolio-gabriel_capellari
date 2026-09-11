-- WebAppCap v2 additive core. Does not modify legacy portfolio content.
create table if not exists public.project_v2_state (
  project_id uuid primary key references public.projects(id) on delete cascade,
  segment text not null check (segment in ('portfolio','personal-trainer','food-business','school')),
  template_key text,
  lifecycle text not null default 'draft' check (lifecycle in ('draft','invited','onboarding','ready-to-publish','published','archived')),
  onboarding_step text not null default 'template' check (onboarding_step in ('account','template','identity','content','media','appearance','contact','domain','review','completed')),
  onboarding_completed_at timestamptz,
  native_subdomain text,
  custom_domain text,
  domain_status text not null default 'unconfigured' check (domain_status in ('unconfigured','native','pending','active','error')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists project_v2_state_native_subdomain_unique on public.project_v2_state(lower(native_subdomain)) where native_subdomain is not null;
create unique index if not exists project_v2_state_custom_domain_unique on public.project_v2_state(lower(custom_domain)) where custom_domain is not null;

alter table public.project_v2_state enable row level security;

create policy "v2 state visible to project members" on public.project_v2_state for select using (
  exists(select 1 from public.projects p where p.id=project_id and p.owner_id=auth.uid())
  or exists(select 1 from public.project_members m where m.project_id=project_id and m.user_id=auth.uid())
);

create policy "v2 state editable by owner or admin" on public.project_v2_state for all using (
  exists(select 1 from public.projects p where p.id=project_id and p.owner_id=auth.uid())
  or exists(select 1 from public.project_members m where m.project_id=project_id and m.user_id=auth.uid() and lower(m.role)='admin')
) with check (
  exists(select 1 from public.projects p where p.id=project_id and p.owner_id=auth.uid())
  or exists(select 1 from public.project_members m where m.project_id=project_id and m.user_id=auth.uid() and lower(m.role)='admin')
);

-- Existing portfolio can be registered without changing its public renderer.
insert into public.project_v2_state(project_id,segment,template_key,lifecycle,onboarding_step,onboarding_completed_at,domain_status)
select p.id,'portfolio','portfolio-legacy-1',case when p.is_published then 'published' else 'draft' end,'completed',now(),
       case when lower(coalesce(p.domain_status,''))='active' then 'active' else 'unconfigured' end
from public.projects p
where p.slug='gabriel-capellari'
on conflict(project_id) do nothing;
