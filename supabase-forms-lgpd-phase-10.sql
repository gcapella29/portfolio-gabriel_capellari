-- WebAppCap Phase 10 — Configurable forms, LGPD and lead governance

alter table public.site_leads add column if not exists consent_at timestamptz;
alter table public.site_leads add column if not exists consent_text text;

create table if not exists public.lead_form_settings (
  project_id uuid primary key references public.projects(id) on delete cascade,
  enabled boolean not null default true,
  title text not null default 'Envie uma mensagem',
  intro text not null default 'Preencha seus dados e retornaremos o contato.',
  show_email boolean not null default true,
  show_phone boolean not null default true,
  show_message boolean not null default true,
  require_email boolean not null default false,
  require_phone boolean not null default false,
  require_consent boolean not null default true,
  consent_text text not null default 'Concordo com o uso dos meus dados para retorno deste contato.',
  privacy_url text,
  submit_label text not null default 'Enviar mensagem',
  success_message text not null default 'Mensagem enviada com sucesso.',
  updated_at timestamptz not null default now(),
  constraint lead_form_title_len check (char_length(title) between 1 and 120),
  constraint lead_form_intro_len check (char_length(intro) <= 500),
  constraint lead_form_consent_len check (char_length(consent_text) <= 1000),
  constraint lead_form_privacy_len check (privacy_url is null or char_length(privacy_url) <= 500),
  constraint lead_form_submit_len check (char_length(submit_label) between 1 and 80),
  constraint lead_form_success_len check (char_length(success_message) between 1 and 240)
);

alter table public.lead_form_settings enable row level security;

drop policy if exists "lead form managers can read" on public.lead_form_settings;
create policy "lead form managers can read" on public.lead_form_settings
for select to authenticated
using (exists (
  select 1 from public.project_members pm
  where pm.project_id=lead_form_settings.project_id
    and pm.user_id=auth.uid()
    and lower(pm.role) in ('owner','admin')
));

drop policy if exists "lead form managers can write" on public.lead_form_settings;
create policy "lead form managers can write" on public.lead_form_settings
for all to authenticated
using (exists (
  select 1 from public.project_members pm
  where pm.project_id=lead_form_settings.project_id
    and pm.user_id=auth.uid()
    and lower(pm.role) in ('owner','admin')
))
with check (exists (
  select 1 from public.project_members pm
  where pm.project_id=lead_form_settings.project_id
    and pm.user_id=auth.uid()
    and lower(pm.role) in ('owner','admin')
));

revoke all on public.lead_form_settings from anon, authenticated;
grant select,insert,update,delete on public.lead_form_settings to authenticated;

-- Owner/Admin may delete leads when requested by the data subject or for CRM hygiene.
drop policy if exists "lead managers can delete" on public.site_leads;
create policy "lead managers can delete" on public.site_leads
for delete to authenticated
using (exists (
  select 1 from public.project_members pm
  where pm.project_id=site_leads.project_id
    and pm.user_id=auth.uid()
    and lower(pm.role) in ('owner','admin')
));
grant delete on public.site_leads to authenticated;

create or replace function public.webappcap_lead_form_settings(p_project_id uuid)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare v jsonb;
begin
  if not exists(select 1 from public.projects p where p.id=p_project_id and p.is_published=true) then
    return null;
  end if;
  select to_jsonb(s) - 'project_id' - 'updated_at' into v
  from public.lead_form_settings s where s.project_id=p_project_id;
  return coalesce(v,jsonb_build_object(
    'enabled',true,'title','Envie uma mensagem','intro','Preencha seus dados e retornaremos o contato.',
    'show_email',true,'show_phone',true,'show_message',true,'require_email',false,'require_phone',false,
    'require_consent',true,'consent_text','Concordo com o uso dos meus dados para retorno deste contato.',
    'privacy_url',null,'submit_label','Enviar mensagem','success_message','Mensagem enviada com sucesso.'
  ));
end;
$$;
revoke all on function public.webappcap_lead_form_settings(uuid) from public;
grant execute on function public.webappcap_lead_form_settings(uuid) to anon,authenticated;

-- Replace Phase 9 submit RPC with the governed Phase 10 signature.
drop function if exists public.webappcap_submit_lead(uuid,text,text,text,text,text,text,text);
create or replace function public.webappcap_submit_lead(
  p_project_id uuid,
  p_name text,
  p_email text default null,
  p_phone text default null,
  p_message text default null,
  p_source text default 'site_form',
  p_path text default null,
  p_session_id text default null,
  p_consent boolean default false,
  p_consent_text text default null,
  p_honeypot text default null
) returns bigint
language plpgsql
security definer
set search_path=public
as $$
declare
  v_id bigint;
  v_name text:=left(trim(coalesce(p_name,'')),120);
  v_email text:=left(nullif(lower(trim(coalesce(p_email,''))),''),180);
  v_phone text:=left(nullif(trim(coalesce(p_phone,'')),''),60);
  v_message text:=left(nullif(trim(coalesce(p_message,'')),''),3000);
  v_session text:=left(nullif(trim(coalesce(p_session_id,'')),''),100);
  v_settings public.lead_form_settings%rowtype;
  v_require_consent boolean:=true;
  v_consent_text text:='Concordo com o uso dos meus dados para retorno deste contato.';
begin
  if coalesce(trim(p_honeypot),'')<>'' then
    raise exception 'Envio inválido.' using errcode='22023';
  end if;
  if not exists(select 1 from public.projects p where p.id=p_project_id and p.is_published=true) then
    raise exception 'Projeto indisponível para captação de leads.' using errcode='22023';
  end if;
  select * into v_settings from public.lead_form_settings where project_id=p_project_id;
  if found then
    if not v_settings.enabled then raise exception 'Formulário indisponível.' using errcode='22023'; end if;
    v_require_consent:=v_settings.require_consent;
    v_consent_text:=v_settings.consent_text;
    if v_settings.require_email and v_email is null then raise exception 'Informe seu e-mail.' using errcode='22023'; end if;
    if v_settings.require_phone and v_phone is null then raise exception 'Informe seu telefone.' using errcode='22023'; end if;
  end if;
  if char_length(v_name)<2 then raise exception 'Informe seu nome.' using errcode='22023'; end if;
  if v_email is null and v_phone is null then raise exception 'Informe e-mail ou telefone.' using errcode='22023'; end if;
  if v_email is not null and v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'E-mail inválido.' using errcode='22023'; end if;
  if v_require_consent and not coalesce(p_consent,false) then raise exception 'É necessário aceitar o consentimento para enviar.' using errcode='22023'; end if;
  if v_session is not null and exists(
    select 1 from public.site_leads where project_id=p_project_id and session_id=v_session
      and created_at>now()-interval '60 seconds'
      and coalesce(email,'')=coalesce(v_email,'') and coalesce(phone,'')=coalesce(v_phone,'')
  ) then raise exception 'Aguarde um momento antes de enviar novamente.' using errcode='22023'; end if;
  insert into public.site_leads(project_id,name,email,phone,message,source,path,session_id,consent_at,consent_text)
  values(p_project_id,v_name,v_email,v_phone,v_message,left(coalesce(nullif(trim(p_source),''),'site_form'),80),left(nullif(trim(coalesce(p_path,'')),''),500),v_session,
    case when coalesce(p_consent,false) then now() else null end,
    case when coalesce(p_consent,false) then left(coalesce(nullif(trim(p_consent_text),''),v_consent_text),1000) else null end)
  returning id into v_id;
  return v_id;
end;
$$;
revoke all on function public.webappcap_submit_lead(uuid,text,text,text,text,text,text,text,boolean,text,text) from public;
grant execute on function public.webappcap_submit_lead(uuid,text,text,text,text,text,text,text,boolean,text,text) to anon,authenticated;
