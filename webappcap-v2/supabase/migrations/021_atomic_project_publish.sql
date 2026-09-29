-- Publishes a v2 project atomically.
-- The public snapshot, v2 lifecycle/template state and canonical project
-- visibility are committed together. Any failure rolls back all three writes.

create or replace function public.publish_v2_project_atomic(
  p_project_id uuid,
  p_template_key text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_now timestamptz := now();
  v_slug text;
  v_native_subdomain text;
  v_custom_domain text;
  v_segment text;
begin
  if v_uid is null then
    raise exception 'authentication required';
  end if;

  if p_project_id is null or nullif(btrim(p_template_key),'') is null then
    raise exception 'invalid publish payload';
  end if;

  select p.slug
    into v_slug
  from public.projects p
  where p.id = p_project_id
    and p.archived_at is null
    and (
      p.owner_id = v_uid
      or exists (
        select 1
        from public.project_members m
        where m.project_id = p.id
          and m.user_id = v_uid
          and lower(m.role) = 'admin'
      )
    )
  for update;

  if v_slug is null then
    raise exception 'project not found or publish permission denied';
  end if;

  select s.segment,s.native_subdomain,s.custom_domain
    into v_segment,v_native_subdomain,v_custom_domain
  from public.project_v2_state s
  where s.project_id = p_project_id
  for update;

  if v_segment is null then
    raise exception 'project state not found';
  end if;

  if not exists (
    select 1
    from public.project_v2_content c
    where c.project_id = p_project_id
    for update
  ) then
    raise exception 'project draft not found';
  end if;

  insert into public.project_v2_public_content(
    project_id,
    identity,
    content,
    media,
    appearance,
    contact,
    published_at
  )
  select
    c.project_id,
    c.identity,
    c.content,
    c.media,
    c.appearance,
    c.contact,
    v_now
  from public.project_v2_content c
  where c.project_id = p_project_id
  on conflict(project_id) do update set
    identity = excluded.identity,
    content = excluded.content,
    media = excluded.media,
    appearance = excluded.appearance,
    contact = excluded.contact,
    published_at = excluded.published_at;

  update public.project_v2_state
  set
    template_key = btrim(p_template_key),
    lifecycle = 'published',
    onboarding_step = 'completed',
    onboarding_completed_at = coalesce(onboarding_completed_at,v_now),
    updated_at = v_now
  where project_id = p_project_id;

  if not found then
    raise exception 'project state update failed';
  end if;

  update public.projects
  set is_published = true
  where id = p_project_id;

  if not found then
    raise exception 'project visibility update failed';
  end if;

  return jsonb_build_object(
    'slug',v_slug,
    'native_subdomain',v_native_subdomain,
    'custom_domain',v_custom_domain,
    'published_at',v_now
  );
end;
$$;

revoke all on function public.publish_v2_project_atomic(uuid,text) from public;
revoke all on function public.publish_v2_project_atomic(uuid,text) from anon;
grant execute on function public.publish_v2_project_atomic(uuid,text) to authenticated;
