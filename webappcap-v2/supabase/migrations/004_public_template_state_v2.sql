-- Published v2 sites need public read access to their template selection only through project visibility.
create policy "v2 published state public read" on public.project_v2_state for select using (
  exists(
    select 1 from public.projects p
    where p.id=project_id
      and p.is_published=true
      and p.archived_at is null
      and lifecycle='published'
  )
);
