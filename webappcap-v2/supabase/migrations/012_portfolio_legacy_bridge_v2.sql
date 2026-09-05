-- Registers the existing Gabriel portfolio as a publishable v2 project without
-- changing or deleting any legacy content. The compatibility renderer keeps
-- reading the legacy snapshot until the native portfolio content model is ready.
do $$
declare
  gabriel_project_id uuid;
begin
  select id into gabriel_project_id
  from public.projects
  where slug = 'gabriel-capellari'
  limit 1;

  if gabriel_project_id is null then
    raise notice 'Project gabriel-capellari not found; migration skipped safely.';
    return;
  end if;

  insert into public.project_v2_state (
    project_id,
    segment,
    template_key,
    lifecycle,
    onboarding_step,
    onboarding_completed_at,
    domain_status
  ) values (
    gabriel_project_id,
    'portfolio',
    'portfolio-legacy-1',
    'published',
    'completed',
    now(),
    'unconfigured'
  )
  on conflict (project_id) do update set
    segment = excluded.segment,
    template_key = excluded.template_key,
    lifecycle = 'published',
    onboarding_step = 'completed',
    onboarding_completed_at = coalesce(
      public.project_v2_state.onboarding_completed_at,
      excluded.onboarding_completed_at
    ),
    updated_at = now();

  insert into public.project_v2_content (project_id)
  values (gabriel_project_id)
  on conflict (project_id) do nothing;

  insert into public.project_v2_public_content (project_id)
  values (gabriel_project_id)
  on conflict (project_id) do nothing;
end $$;
