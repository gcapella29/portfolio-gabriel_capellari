-- Adds a catalog allowance without changing any existing content or other limits.
do $$
declare updated_rows integer;
begin
  update public.project_commercial as commercial
  set limits = coalesce(commercial.limits, '{}'::jsonb) || jsonb_build_object('menu_items', 200)
  from public.projects as project
  where commercial.project_id = project.id
    and project.slug = 'vet-se';

  get diagnostics updated_rows = row_count;
  if updated_rows <> 1 then
    raise exception 'Expected one project_commercial row for vet-se, found %', updated_rows;
  end if;
end $$;
