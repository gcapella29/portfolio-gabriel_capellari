-- WebAppCap Phase 11 — Auditoria de segurança Supabase (SOMENTE LEITURA)
--
-- Objetivo:
--   Fotografar o estado REAL de RLS, policies, privilégios e funções antes de
--   qualquer endurecimento de segurança.
--
-- Segurança:
--   Este arquivo contém apenas SELECTs. Não cria, altera, remove, concede ou
--   revoga nada. Pode ser executado no Supabase SQL Editor sem modificar dados.
--
-- Como usar:
--   1) Abra Supabase > SQL Editor > New query.
--   2) Cole este arquivo inteiro e clique em Run.
--   3) Envie os resultados de cada bloco para análise da Fase 11.
--
-- Escopo prioritário do WebAppCap:
--   projects, project_members, project_drafts, site_content, project_versions,
--   platform_templates, project_commercial, site_analytics_events, site_leads,
--   lead_form_settings.


-- ================================================================
-- 01. TABELAS, RLS E FORCE RLS
-- ================================================================
select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as force_rls,
  pg_get_userbyid(c.relowner) as owner
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind in ('r','p')
  and c.relname in (
    'projects',
    'project_members',
    'project_drafts',
    'site_content',
    'project_versions',
    'platform_templates',
    'project_commercial',
    'site_analytics_events',
    'site_leads',
    'lead_form_settings'
  )
order by c.relname;


-- ================================================================
-- 02. POLICIES RLS COMPLETAS
-- ================================================================
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_expression,
  with_check as with_check_expression
from pg_policies
where schemaname = 'public'
  and tablename in (
    'projects',
    'project_members',
    'project_drafts',
    'site_content',
    'project_versions',
    'platform_templates',
    'project_commercial',
    'site_analytics_events',
    'site_leads',
    'lead_form_settings'
  )
order by tablename, cmd, policyname;


-- ================================================================
-- 03. PRIVILÉGIOS DE TABELA PARA anon/authenticated
-- ================================================================
select
  table_schema,
  table_name,
  grantee,
  privilege_type,
  is_grantable
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee in ('anon','authenticated')
  and table_name in (
    'projects',
    'project_members',
    'project_drafts',
    'site_content',
    'project_versions',
    'platform_templates',
    'project_commercial',
    'site_analytics_events',
    'site_leads',
    'lead_form_settings'
  )
order by table_name, grantee, privilege_type;


-- ================================================================
-- 04. PRIVILÉGIOS DE COLUNA PARA anon/authenticated
-- Mostra grants específicos por coluna, caso existam.
-- ================================================================
select
  table_schema,
  table_name,
  column_name,
  grantee,
  privilege_type,
  is_grantable
from information_schema.role_column_grants
where table_schema = 'public'
  and grantee in ('anon','authenticated')
  and table_name in (
    'projects',
    'project_members',
    'project_drafts',
    'site_content',
    'project_versions',
    'platform_templates',
    'project_commercial',
    'site_analytics_events',
    'site_leads',
    'lead_form_settings'
  )
order by table_name, column_name, grantee, privilege_type;


-- ================================================================
-- 05. FUNÇÕES/RPCs WEBAPPCAP E FLAGS DE SEGURANÇA
-- ================================================================
select
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as identity_arguments,
  pg_get_function_result(p.oid) as returns,
  l.lanname as language,
  p.prosecdef as security_definer,
  p.proleakproof as leakproof,
  p.provolatile as volatility_code,
  p.proparallel as parallel_code,
  pg_get_userbyid(p.proowner) as owner,
  p.proconfig as function_config
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
join pg_language l on l.oid = p.prolang
where n.nspname = 'public'
  and (
    p.proname like 'webappcap_%'
    or p.proname in ('publish_project_atomic')
  )
order by p.proname, pg_get_function_identity_arguments(p.oid);


-- ================================================================
-- 06. PRIVILÉGIOS EXECUTE DAS RPCs PARA anon/authenticated
-- ================================================================
select
  routine_schema,
  routine_name,
  grantee,
  privilege_type,
  is_grantable
from information_schema.role_routine_grants
where routine_schema = 'public'
  and grantee in ('anon','authenticated')
  and (
    routine_name like 'webappcap_%'
    or routine_name = 'publish_project_atomic'
  )
order by routine_name, grantee, privilege_type;


-- ================================================================
-- 07. DEFINIÇÃO DAS RPCs CRÍTICAS
-- Necessário para revisar autorização interna de SECURITY DEFINER.
-- ================================================================
select
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as identity_arguments,
  pg_get_functiondef(p.oid) as function_definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and (
    p.proname like 'webappcap_%'
    or p.proname = 'publish_project_atomic'
  )
order by p.proname, pg_get_function_identity_arguments(p.oid);


-- ================================================================
-- 08. FOREIGN KEYS ENTRE TABELAS DO NÚCLEO
-- Ajuda a validar cascatas de exclusão e isolamento por projeto.
-- ================================================================
select
  tc.table_name,
  kcu.column_name,
  ccu.table_name as foreign_table_name,
  ccu.column_name as foreign_column_name,
  rc.update_rule,
  rc.delete_rule,
  tc.constraint_name
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
 and tc.constraint_schema = kcu.constraint_schema
join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = tc.constraint_name
 and ccu.constraint_schema = tc.constraint_schema
join information_schema.referential_constraints rc
  on rc.constraint_name = tc.constraint_name
 and rc.constraint_schema = tc.constraint_schema
where tc.constraint_type = 'FOREIGN KEY'
  and tc.table_schema = 'public'
  and tc.table_name in (
    'projects',
    'project_members',
    'project_drafts',
    'site_content',
    'project_versions',
    'platform_templates',
    'project_commercial',
    'site_analytics_events',
    'site_leads',
    'lead_form_settings'
  )
order by tc.table_name, kcu.column_name;


-- ================================================================
-- 09. TRIGGERS DO NÚCLEO
-- Identifica efeitos indiretos de INSERT/UPDATE/DELETE.
-- ================================================================
select
  event_object_schema,
  event_object_table,
  trigger_name,
  action_timing,
  event_manipulation,
  action_statement
from information_schema.triggers
where event_object_schema = 'public'
  and event_object_table in (
    'projects',
    'project_members',
    'project_drafts',
    'site_content',
    'project_versions',
    'platform_templates',
    'project_commercial',
    'site_analytics_events',
    'site_leads',
    'lead_form_settings'
  )
order by event_object_table, trigger_name, event_manipulation;


-- ================================================================
-- 10. CHECK FINAL — TABELAS DO ESCOPO SEM RLS
-- O resultado ideal deste bloco tende a ser vazio para tabelas sensíveis.
-- Não conclua vulnerabilidade automaticamente: algumas tabelas podem depender
-- deliberadamente de REVOKE + SECURITY DEFINER. Este bloco é só um alerta.
-- ================================================================
select
  c.relname as table_without_rls
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind in ('r','p')
  and not c.relrowsecurity
  and c.relname in (
    'projects',
    'project_members',
    'project_drafts',
    'site_content',
    'project_versions',
    'platform_templates',
    'project_commercial',
    'site_analytics_events',
    'site_leads',
    'lead_form_settings'
  )
order by c.relname;
