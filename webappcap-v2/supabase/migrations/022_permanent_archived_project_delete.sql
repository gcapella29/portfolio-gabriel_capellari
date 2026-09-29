-- Only the owner may remove media and permanently delete an archived project.
create or replace function public.can_delete_archived_project(target_project_id uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists (
    select 1 from public.projects p
    where p.id=target_project_id and p.owner_id=auth.uid()
      and p.archived_at is not null and p.slug<>'gabriel-capellari'
  );
$$;
revoke all on function public.can_delete_archived_project(uuid) from public;
grant execute on function public.can_delete_archived_project(uuid) to authenticated;

drop policy if exists "v2 project media delete" on storage.objects;
create policy "v2 project media delete" on storage.objects for delete to authenticated using (
  bucket_id='webappcap-v2-sites'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{12}$'
  and (
    public.can_manage_v2_project_media(((storage.foldername(name))[1])::uuid)
    or public.can_delete_archived_project(((storage.foldername(name))[1])::uuid)
  )
);

create or replace function public.permanently_delete_archived_project(target_project_id uuid)
returns text language plpgsql security definer set search_path=public as $$
declare deleted_slug text;
begin
  if not public.can_delete_archived_project(target_project_id) then
    raise exception 'Only the owner may delete an archived project';
  end if;
  delete from public.projects where id=target_project_id returning slug into deleted_slug;
  if deleted_slug is null then raise exception 'Archived project not found'; end if;
  return deleted_slug;
end;
$$;
revoke all on function public.permanently_delete_archived_project(uuid) from public;
grant execute on function public.permanently_delete_archived_project(uuid) to authenticated;
