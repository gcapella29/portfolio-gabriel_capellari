-- WebAppCap Phase 11 — Hardening de segurança Supabase
--
-- Objetivos desta migração:
--   1) remover privilégios de tabela desnecessários (TRUNCATE/TRIGGER/REFERENCES);
--   2) reduzir exposição direta de funções internas de trigger;
--   3) impedir execução anônima da publicação atômica;
--   4) restringir histórico para owner/admin/editor (viewer não acessa histórico);
--   5) restringir leitura da equipe: owner/admin veem a equipe; editor/viewer veem apenas a própria associação;
--   6) versionar a definição auditada de publish_project_atomic.
--
-- Observação: esta migração NÃO altera dados existentes.

begin;

-- ================================================================
-- 01. Privilégios de tabela: retirar capacidades que o frontend não usa
-- ================================================================
revoke truncate, trigger, references on table public.projects from anon, authenticated;
revoke truncate, trigger, references on table public.project_members from anon, authenticated;
revoke truncate, trigger, references on table public.project_drafts from anon, authenticated;
revoke truncate, trigger, references on table public.project_versions from anon, authenticated;
revoke truncate, trigger, references on table public.site_content from anon, authenticated;
revoke truncate, trigger, references on table public.project_commercial from anon, authenticated;
revoke truncate, trigger, references on table public.platform_templates from anon, authenticated;
revoke truncate, trigger, references on table public.site_leads from anon, authenticated;
revoke truncate, trigger, references on table public.lead_form_settings from anon, authenticated;
revoke truncate, trigger, references on table public.site_analytics_events from anon, authenticated;

-- ================================================================
-- 02. Funções internas de trigger: não precisam de EXECUTE pelo cliente web
-- ================================================================
revoke execute on function public.vitrine_add_project_owner_member() from public, anon, authenticated;
revoke execute on function public.vitrine_protect_domain_fields() from public, anon, authenticated;
revoke execute on function public.vitrine_protect_project_owner() from public, anon, authenticated;
revoke execute on function public.webappcap_enforce_draft_plan() from public, anon, authenticated;
revoke execute on function public.webappcap_enforce_member_plan() from public, anon, authenticated;
revoke execute on function public.webappcap_enforce_project_plan() from public, anon, authenticated;

-- ================================================================
-- 03. Publicação atômica: manter somente usuários autenticados
-- A função também valida owner/admin/editor internamente.
-- ================================================================
create or replace function public.publish_project_atomic(p_project_id uuid)
returns table(published_at timestamp with time zone, section_count integer)
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_user uuid := auth.uid();
  v_role text;
  v_draft jsonb;
  v_previous jsonb;
  v_now timestamptz := now();
  v_count integer := 0;
begin
  if v_user is null then
    raise exception 'Authentication required';
  end if;

  select pm.role
    into v_role
  from public.project_members pm
  where pm.project_id = p_project_id
    and pm.user_id = v_user
  limit 1;

  if v_role is null or v_role not in ('owner','admin','editor') then
    raise exception 'You do not have permission to publish this project';
  end if;

  select pd.snapshot
    into v_draft
  from public.project_drafts pd
  where pd.project_id = p_project_id
  for update;

  if v_draft is null then
    raise exception 'Draft not found';
  end if;

  select coalesce(
    jsonb_object_agg(
      sc.section_key,
      jsonb_build_object(
        'content', coalesce(sc.content, '{}'::jsonb),
        'is_visible', sc.is_visible,
        'sort_order', sc.sort_order
      )
    ),
    '{}'::jsonb
  )
    into v_previous
  from public.site_content sc
  where sc.project_id = p_project_id;

  insert into public.project_versions(project_id, snapshot, created_by, label)
  values (p_project_id, v_previous, v_user, 'Antes da publicação');

  delete from public.site_content
  where project_id = p_project_id;

  insert into public.site_content(
    project_id,
    section_key,
    content,
    is_visible,
    sort_order,
    updated_at
  )
  select
    p_project_id,
    entry.key,
    coalesce(entry.value -> 'content', '{}'::jsonb),
    coalesce((entry.value ->> 'is_visible')::boolean, true),
    coalesce((entry.value ->> 'sort_order')::integer, 0),
    v_now
  from jsonb_each(v_draft) as entry(key, value);

  get diagnostics v_count = row_count;

  update public.projects
  set is_published = true,
      updated_at = v_now
  where id = p_project_id;

  update public.project_drafts
  set last_published_at = v_now,
      updated_at = v_now,
      updated_by = v_user
  where project_id = p_project_id;

  return query select v_now, v_count;
end;
$function$;

revoke all on function public.publish_project_atomic(uuid) from public;
revoke execute on function public.publish_project_atomic(uuid) from anon;
grant execute on function public.publish_project_atomic(uuid) to authenticated;

-- ================================================================
-- 04. Histórico: Viewer não acessa versões administrativas
-- ================================================================
drop policy if exists "Members can read project versions" on public.project_versions;
create policy "Editors and managers can read project versions"
on public.project_versions
for select
to authenticated
using (
  public.vitrine_has_project_role(project_id, array['owner','admin','editor'])
);

-- ================================================================
-- 05. Equipe: owner/admin veem equipe; editor/viewer veem apenas a si mesmos
-- ================================================================
drop policy if exists "Members can read project team" on public.project_members;
create policy "Members can read allowed project team rows"
on public.project_members
for select
to authenticated
using (
  user_id = auth.uid()
  or public.vitrine_has_project_role(project_id, array['owner','admin'])
);

-- ================================================================
-- 06. Analytics administrativa: execução anônima é desnecessária
-- ================================================================
do $do$
declare
  r record;
begin
  for r in
    select p.oid,
           n.nspname,
           p.proname,
           pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'webappcap_project_analytics'
  loop
    execute format('revoke execute on function %I.%I(%s) from anon', r.nspname, r.proname, r.args);
  end loop;
end;
$do$;

commit;

-- ================================================================
-- 07. Verificação pós-migração (somente leitura)
-- ================================================================
select
  routine_schema,
  routine_name,
  grantee,
  privilege_type
from information_schema.role_routine_grants
where routine_schema = 'public'
  and grantee in ('PUBLIC','anon','authenticated')
  and routine_name in (
    'publish_project_atomic',
    'vitrine_add_project_owner_member',
    'vitrine_protect_domain_fields',
    'vitrine_protect_project_owner',
    'webappcap_enforce_draft_plan',
    'webappcap_enforce_member_plan',
    'webappcap_enforce_project_plan',
    'webappcap_project_analytics'
  )
order by routine_name, grantee;
