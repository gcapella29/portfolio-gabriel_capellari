alter table public.project_members
  add column if not exists invited_by uuid references auth.users(id) on delete set null;

create index if not exists project_members_invited_by_idx
  on public.project_members(project_id, invited_by);

create or replace function public.webappcap_record_member_inviter(p_project_id uuid, p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_allowed boolean;
begin
  select exists(
    select 1 from public.projects p
    where p.id=p_project_id and p.owner_id=v_user
  ) or exists(
    select 1 from public.project_members pm
    where pm.project_id=p_project_id and pm.user_id=v_user and lower(pm.role)='admin'
  ) into v_allowed;

  if v_user is null or not coalesce(v_allowed,false) then
    raise exception 'Sem permissão para registrar convites';
  end if;

  update public.project_members
     set invited_by=v_user
   where project_id=p_project_id
     and lower(email)=lower(trim(p_email))
     and invited_by is null
     and user_id<>v_user;
end;
$$;

revoke all on function public.webappcap_record_member_inviter(uuid,text) from public, anon;
grant execute on function public.webappcap_record_member_inviter(uuid,text) to authenticated;
