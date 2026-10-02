-- Repair the malformed UUID expression in 022 for existing installations.
-- This updates authorization only; it does not delete files or projects.
drop policy if exists "v2 project media delete" on storage.objects;
create policy "v2 project media delete" on storage.objects for delete to authenticated using (
  bucket_id='webappcap-v2-sites'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and (
    public.can_manage_v2_project_media(((storage.foldername(name))[1])::uuid)
    or public.can_delete_archived_project(((storage.foldername(name))[1])::uuid)
  )
);
