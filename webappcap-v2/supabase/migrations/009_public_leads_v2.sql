create or replace function public.submit_v2_public_lead(
  p_project_id uuid,
  p_name text,
  p_phone text,
  p_message text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_project_id is null
     or nullif(btrim(p_name), '') is null
     or nullif(btrim(p_phone), '') is null
     or nullif(btrim(p_message), '') is null then
    raise exception 'invalid lead payload';
  end if;

  if not exists (
    select 1
    from public.project_v2_state s
    where s.project_id = p_project_id
      and s.lifecycle = 'published'
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
    created_at
  ) values (
    p_project_id,
    left(btrim(p_name), 120),
    left(btrim(p_phone), 40),
    left(btrim(p_message), 1000),
    'site-v2',
    'new',
    now()
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.submit_v2_public_lead(uuid,text,text,text) from public;
grant execute on function public.submit_v2_public_lead(uuid,text,text,text) to anon, authenticated;
