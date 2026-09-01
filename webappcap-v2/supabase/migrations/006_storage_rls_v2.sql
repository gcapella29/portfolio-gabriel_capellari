-- WebAppCap v2 media RLS hardening.
-- Uses a SECURITY DEFINER helper so storage policies do not depend on nested RLS
-- behavior of projects/project_members while still authorizing only project owners
-- and admin/editor members.

create or replace function public.can_manage_v2_project_media(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    exists(
      select 1
      from public.projects p
      where p.id = target_project_id
        and p.owner_id = auth.uid()
        and p.archived_at is null
    )
    or exists(
      select 1
      from public.project_members m
      join public.projects p on p.id = m.project_id
      where m.project_id = target_project_id
        and m.user_id = auth.uid()
        and lower(m.role) in ('admin','editor')
        and p.archived_at is null
    );
$$;

revoke all on function public.can_manage_v2_project_media(uuid) from public;
grant execute on function public.can_manage_v2_project_media(uuid) to authenticated;

drop policy if exists "v2 project media upload" on storage.objects;
drop policy if exists "v2 project media update" on storage.objects;
drop policy if exists "v2 project media delete" on storage.objects;

create policy "v2 project media upload"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'webappcap-v2-sites'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and public.can_manage_v2_project_media(((storage.foldername(name))[1])::uuid)
);

create policy "v2 project media update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'webappcap-v2-sites'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and public.can_manage_v2_project_media(((storage.foldername(name))[1])::uuid)
)
with check (
  bucket_id = 'webappcap-v2-sites'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and public.can_manage_v2_project_media(((storage.foldername(name))[1])::uuid)
);

create policy "v2 project media delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'webappcap-v2-sites'
  and (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  and public.can_manage_v2_project_media(((storage.foldername(name))[1])::uuid)
);
