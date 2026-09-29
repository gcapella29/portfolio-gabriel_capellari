-- Hardens public lead submission.
-- Consent must be explicit and anonymous/authenticated clients can no longer
-- call the RPC directly. Only the trusted server route may execute it.

drop function if exists public.submit_v2_public_lead(uuid,text,text,text);

create or replace function public.submit_v2_public_lead(
  p_project_id uuid,
  p_name text,
  p_phone text,
  p_message text,
  p_consent boolean
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id bigint;
begin
  if p_project_id is null
     or nullif(btrim(p_name), '') is null
     or nullif(btrim(p_phone), '') is null
     or nullif(btrim(p_message), '') is null
     or p_consent is distinct from true then
    raise exception 'invalid lead payload';
  end if;

  if not exists (
    select 1
    from public.projects p
    join public.project_v2_state s on s.project_id = p.id
    where p.id = p_project_id
      and p.is_published = true
      and p.archived_at is null
      and s.lifecycle = 'published'
      and s.template_key is not null
  ) then
    raise exception 'project is not published';
  end if;

  insert into public.site_leads (
    project_id,name,phone,message,source,status,consent_at,consent_text,created_at
  ) values (
    p_project_id,
    left(btrim(p_name), 120),
    left(btrim(p_phone), 40),
    left(btrim(p_message), 1000),
    'site-v2',
    'new',
    now(),
    'Autorizo o uso destes dados somente para retorno sobre este projeto.',
    now()
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.submit_v2_public_lead(uuid,text,text,text,boolean) from public;
revoke all on function public.submit_v2_public_lead(uuid,text,text,text,boolean) from anon;
revoke all on function public.submit_v2_public_lead(uuid,text,text,text,boolean) from authenticated;
grant execute on function public.submit_v2_public_lead(uuid,text,text,text,boolean) to service_role;
