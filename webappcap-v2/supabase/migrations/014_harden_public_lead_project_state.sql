-- Final migration-closeout hardening for anonymous lead submission.
-- A lead is accepted only when both the canonical project row and the v2 state
-- agree that the project is active and published.

create or replace function public.submit_v2_public_lead(
  p_project_id uuid,
  p_name text,
  p_phone text,
  p_message text
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
     or nullif(btrim(p_message), '') is null then
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
    project_id,
    name,
    phone,
    message,
    source,
    status,
    consent_at,
    consent_text,
    created_at
  ) values (
    p_project_id,
    left(btrim(p_name), 120),
    left(btrim(p_phone), 40),
    left(btrim(p_message), 1000),
    'site-v2',
    'new',
    now(),
    'Autorizo o uso dos dados informados para contato sobre o acompanhamento solicitado.',
    now()
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.submit_v2_public_lead(uuid,text,text,text) from public;
grant execute on function public.submit_v2_public_lead(uuid,text,text,text) to anon, authenticated;
