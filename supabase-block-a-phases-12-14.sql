-- WebAppCap — Bloco A (Fases 12, 13 e 14)
-- Domínios/publicação, templates independentes e base de experiência por perfil.

begin;

-- ---------------------------------------------------------------------------
-- Fase 12 — domínios e publicação real
-- ---------------------------------------------------------------------------

-- Garante unicidade global dos hostnames ignorando maiúsculas/minúsculas.
create unique index if not exists projects_subdomain_unique_ci
  on public.projects (lower(subdomain))
  where subdomain is not null and btrim(subdomain) <> '';

create unique index if not exists projects_custom_domain_unique_ci
  on public.projects (lower(custom_domain))
  where custom_domain is not null and btrim(custom_domain) <> '';

create or replace function public.webappcap_configure_domain(
  p_project_id uuid,
  p_subdomain text default null,
  p_custom_domain text default null
)
returns public.projects
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_role text;
  v_subdomain text;
  v_custom_domain text;
  v_project public.projects;
begin
  if v_user is null then
    raise exception 'Authentication required';
  end if;

  select pm.role into v_role
  from public.project_members pm
  where pm.project_id = p_project_id
    and pm.user_id = v_user;

  if coalesce(v_role, '') not in ('owner','admin') then
    raise exception 'Only owner or admin can configure domains';
  end if;

  v_subdomain := nullif(lower(btrim(coalesce(p_subdomain,''))), '');
  v_custom_domain := nullif(lower(btrim(coalesce(p_custom_domain,''))), '');

  if v_subdomain is not null then
    if v_subdomain !~ '^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$' then
      raise exception 'Invalid subdomain';
    end if;
    if v_subdomain = any(array['www','admin','api','app','mail','smtp','ftp','webmail','support','status','cdn','assets']) then
      raise exception 'Reserved subdomain';
    end if;
  end if;

  if v_custom_domain is not null then
    v_custom_domain := regexp_replace(v_custom_domain, '^https?://', '', 'i');
    v_custom_domain := regexp_replace(v_custom_domain, '/.*$', '');
    v_custom_domain := regexp_replace(v_custom_domain, '\.$', '');
    if v_custom_domain !~ '^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$' then
      raise exception 'Invalid custom domain';
    end if;
    if v_custom_domain like '%.vercel.app' or v_custom_domain like '%.webappcap.com.br' then
      raise exception 'Use the subdomain field for WebAppCap addresses';
    end if;
  end if;

  update public.projects
  set subdomain = v_subdomain,
      custom_domain = v_custom_domain,
      domain_status = case when v_subdomain is null and v_custom_domain is null then 'unconfigured' else 'pending' end,
      updated_at = now()
  where id = p_project_id
  returning * into v_project;

  if v_project.id is null then
    raise exception 'Project not found';
  end if;

  return v_project;
exception
  when unique_violation then
    raise exception 'This domain or subdomain is already in use';
end;
$$;

create or replace function public.webappcap_activate_domain(p_project_id uuid)
returns public.projects
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_role text;
  v_project public.projects;
begin
  if v_user is null then
    raise exception 'Authentication required';
  end if;

  select pm.role into v_role
  from public.project_members pm
  where pm.project_id = p_project_id
    and pm.user_id = v_user;

  if coalesce(v_role, '') not in ('owner','admin') then
    raise exception 'Only owner or admin can activate domains';
  end if;

  update public.projects
  set domain_status = 'active', updated_at = now()
  where id = p_project_id
    and (nullif(btrim(subdomain),'') is not null or nullif(btrim(custom_domain),'') is not null)
  returning * into v_project;

  if v_project.id is null then
    raise exception 'Configure a domain before activating it';
  end if;

  return v_project;
end;
$$;

revoke all on function public.webappcap_configure_domain(uuid,text,text) from public, anon;
grant execute on function public.webappcap_configure_domain(uuid,text,text) to authenticated;
revoke all on function public.webappcap_activate_domain(uuid) from public, anon;
grant execute on function public.webappcap_activate_domain(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Fase 13 — template atribuído por projeto, independente da biblioteca global
-- ---------------------------------------------------------------------------

create table if not exists public.project_template_assignments (
  project_id uuid primary key references public.projects(id) on delete cascade,
  template_key text not null,
  template_version integer not null default 1 check (template_version > 0),
  template_snapshot jsonb not null default '{}'::jsonb,
  applied_by uuid references auth.users(id) on delete set null,
  applied_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.project_template_assignments enable row level security;

revoke all on table public.project_template_assignments from anon;
revoke all on table public.project_template_assignments from authenticated;
grant select, insert, update, delete on table public.project_template_assignments to authenticated;

drop policy if exists "Members can read project template assignment" on public.project_template_assignments;
create policy "Members can read project template assignment"
on public.project_template_assignments
for select to authenticated
using (public.vitrine_is_project_member(project_id));

drop policy if exists "Managers can write project template assignment" on public.project_template_assignments;
create policy "Managers can write project template assignment"
on public.project_template_assignments
for all to authenticated
using (public.vitrine_has_project_role(project_id, array['owner','admin']))
with check (public.vitrine_has_project_role(project_id, array['owner','admin']));

-- Registra as atribuições já existentes sem alterar conteúdo dos projetos.
insert into public.project_template_assignments(project_id, template_key, template_version, template_snapshot, applied_by)
select
  d.project_id,
  coalesce(nullif(d.snapshot #>> '{template,content,key}',''), nullif(d.snapshot #>> '{layout,content,template_key}',''), 'editorial'),
  greatest(coalesce(nullif(d.snapshot #>> '{template,content,version}','')::integer, 1), 1),
  coalesce(d.snapshot -> 'template', '{}'::jsonb),
  d.updated_by
from public.project_drafts d
where d.snapshot is not null
on conflict (project_id) do nothing;

commit;

-- Pós-check opcional
select p.slug, a.template_key, a.template_version, a.applied_at
from public.project_template_assignments a
join public.projects p on p.id = a.project_id
order by p.slug;
