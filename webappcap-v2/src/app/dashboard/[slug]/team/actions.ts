'use server';
import {randomBytes} from 'crypto';
import {headers} from 'next/headers';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {resolveProjectAccess} from '@/core/session';
import {can,normalizeRole} from '@/core/permissions';
import {createSupabaseServerClient} from '@/lib/supabase/server';
import {createSupabaseAdminClient} from '@/lib/supabase/admin';
import {sendProjectAccessEmail} from '@/lib/access-email';

const base=async(slug:string)=>{const access=await resolveProjectAccess(slug);if(!can(access.role,'inviteMembers'))throw new Error('Sem permissão para gerenciar equipe.');return access};
const origin=async()=>{const h=await headers(),host=h.get('x-forwarded-host')||h.get('host');return `${h.get('x-forwarded-proto')||'https'}://${host}`};
const tempPassword=()=>`${randomBytes(10).toString('base64url')}Aa7!`;

export async function inviteMemberAction(formData:FormData){
 const slug=String(formData.get('slug')||''),access=await base(slug),email=String(formData.get('email')||'').trim().toLowerCase(),role=normalizeRole(formData.get('role'));
 if(!email||!role||role==='owner')throw new Error('Convite inválido.');
 let admin;try{admin=createSupabaseAdminClient()}catch(error){console.error('[team:invite] admin configuration missing',error);redirect(`/dashboard/${encodeURIComponent(slug)}/team?inviteError=config`)}const users=await admin.auth.admin.listUsers({page:1,perPage:1000});
 if(users.error)throw users.error;
 let user=users.data.users.find(item=>String(item.email||'').toLowerCase()===email)||null,newUser=false,password:string|undefined;
 if(!user){
  password=tempPassword();
  const created=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{webappcap_invited:true,must_change_password:true}});
  if(created.error||!created.data.user)throw created.error||new Error('Não foi possível criar o acesso.');
  user=created.data.user;newUser=true;
 }
 const previous=await admin.from('project_members').select('user_id,email,role,invited_by').eq('project_id',access.project.id).eq('user_id',user.id).maybeSingle();
 const previousFallback=previous.error?.code==='42703'?await admin.from('project_members').select('user_id,email,role').eq('project_id',access.project.id).eq('user_id',user.id).maybeSingle():null;
 const previousRow=previous.error?.code==='42703'?previousFallback?.data:previous.data;
 if(previous.error&&previous.error.code!=='42703')throw previous.error;
 if(previousFallback?.error)throw previousFallback.error;

 let membershipError=null;
 if(previousRow){
  const update={email,role,invited_by:access.user.id};
  let result=await admin.from('project_members').update(update).eq('project_id',access.project.id).eq('user_id',user.id);
  if(result.error?.code==='42703')result=await admin.from('project_members').update({email,role}).eq('project_id',access.project.id).eq('user_id',user.id);
  membershipError=result.error;
 }else{
  let result=await admin.from('project_members').insert({project_id:access.project.id,user_id:user.id,email,role,invited_by:access.user.id});
  if(result.error?.code==='42703')result=await admin.from('project_members').insert({project_id:access.project.id,user_id:user.id,email,role});
  membershipError=result.error;
 }
 if(membershipError){if(newUser)await admin.auth.admin.deleteUser(user.id);throw membershipError}

 try{
  const loginUrl=`${await origin()}/login?next=${encodeURIComponent(`/dashboard/${slug}`)}`;
  await sendProjectAccessEmail({to:email,projectName:access.project.name,loginUrl,temporaryPassword:password});
 }catch(error){
  if(previousRow){
   const restore={email:previousRow.email,role:previousRow.role,...('invited_by' in previousRow?{invited_by:previousRow.invited_by}: {})};
   let restored=await admin.from('project_members').update(restore).eq('project_id',access.project.id).eq('user_id',user.id);
   if(restored.error?.code==='42703')restored=await admin.from('project_members').update({email:previousRow.email,role:previousRow.role}).eq('project_id',access.project.id).eq('user_id',user.id);
  }else{
   await admin.from('project_members').delete().eq('project_id',access.project.id).eq('user_id',user.id);
  }
  if(newUser)await admin.auth.admin.deleteUser(user.id);
  console.error('[team:invite] delivery failed',error);
  redirect(`/dashboard/${encodeURIComponent(slug)}/team?inviteError=email`);
 }
 revalidatePath(`/dashboard/${slug}/team`);
 redirect(`/dashboard/${encodeURIComponent(slug)}/team?invited=1&new=${newUser?'1':'0'}`);
}

export async function updateMemberAction(formData:FormData){const slug=String(formData.get('slug')||''),access=await base(slug),user_id=String(formData.get('user_id')||''),role=normalizeRole(formData.get('role'));if(!user_id||!role||role==='owner')throw new Error('Alteração inválida.');const sb=await createSupabaseServerClient(),q=await sb.functions.invoke('manage-project-member',{body:{project_id:access.project.id,action:'update_role',user_id,role}});if(q.error)throw q.error;revalidatePath(`/dashboard/${slug}/team`)}

export async function removeMemberAction(formData:FormData){const slug=String(formData.get('slug')||''),access=await base(slug),user_id=String(formData.get('user_id')||'');if(!user_id||user_id===access.user.id)redirect(`/dashboard/${encodeURIComponent(slug)}/team?removeError=self`);const sb=await createSupabaseServerClient();let targetData:{user_id:string;role:string;invited_by?:string|null}|null=null;const target=await sb.from('project_members').select('user_id,role,invited_by').eq('project_id',access.project.id).eq('user_id',user_id).maybeSingle();if(target.error?.code==='42703'){if(access.role==='admin')redirect(`/dashboard/${encodeURIComponent(slug)}/team?removeError=tracking`);const fallback=await sb.from('project_members').select('user_id,role').eq('project_id',access.project.id).eq('user_id',user_id).maybeSingle();if(fallback.error)throw fallback.error;targetData=fallback.data}else{if(target.error)throw target.error;targetData=target.data}if(!targetData||targetData.role==='owner')redirect(`/dashboard/${encodeURIComponent(slug)}/team?removeError=protected`);if(access.role==='admin'&&targetData.invited_by!==access.user.id)redirect(`/dashboard/${encodeURIComponent(slug)}/team?removeError=not-yours`);const q=await sb.functions.invoke('manage-project-member',{body:{project_id:access.project.id,action:'remove',user_id}});if(q.error)throw q.error;revalidatePath(`/dashboard/${slug}/team`);redirect(`/dashboard/${encodeURIComponent(slug)}/team?removed=1`)}
