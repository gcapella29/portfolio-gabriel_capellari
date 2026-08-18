-- WebAppCap · Phase 4 · Atomic publishing pipeline
-- Run once in Supabase SQL Editor before enabling the Phase 4 publish action.

create or replace function public.publish_project_atomic(p_project_id uuid)
returns table (
  published_at timestamptz,
  section_count integer
)
language plpgsql
security definer
set search_path = public
as $$
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

  -- Lock the draft so the snapshot cannot change halfway through publication.
  select pd.snapshot
    into v_draft
  from public.project_drafts pd
  where pd.project_id = p_project_id
  for update;

  if v_draft is null then
    raise exception 'Draft not found';
  end if;

  -- Save exactly what is public before replacing it.
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

  -- Replace instead of only upserting so removed sections can never remain public.
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
$$;

revoke all on function public.publish_project_atomic(uuid) from public;
grant execute on function public.publish_project_atomic(uuid) to authenticated;

comment on function public.publish_project_atomic(uuid) is
'Publishes one project atomically from project_drafts to site_content, saving the previous public snapshot in project_versions.';
