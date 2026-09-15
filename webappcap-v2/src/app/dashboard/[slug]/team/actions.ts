'use server';
import {headers} from 'next/headers';
import {revalidatePath} from 'next/cache';
import {resolveProjectAccess} from '@/core/session';
import {can,normalizeRole} from '@/core/permissions';
import {createSupabaseServerClient} from '@/lib/supabase/server';

const base=async(slug:string)=>{const access=await resolveProjectAccess(slug);if(!can(access.role,'inviteMembers'))throw new Error('Sem permissão para gerenciar equipe.');return access};
const origin=async()=>{const h=await headers(),host=h.get('x-forwarded-host')||h.get('host');return `${h.get('x-forwarded-proto')||'https'}://${host}`};
export async function inviteMemberAction(formData:FormData){const slug=String(formData.get('slug')||''),access=await base(slug),email=String(formData.get('email')||'').trim().toLowerCase(),role=normalizeRole(formData.get('role'));if(!email||!role||role==='owner')throw new Error('Convite inválido.');const sb=await createSupabaseServerClient(),redirect_to=`${await origin()}/auth/callback?next=${encodeURIComponent(`/dashboard/${slug}`)}`;const q=await sb.functions.invoke('manage-project-member',{body:{project_id:access.project.id,action:'invite',email,role,redirect_to}});if(q.error)throw q.error;revalidatePath(`/dashboard/${slug}/team`)}
export async function updateMemberAction(formData:FormData){const slug=String(formData.get('slug')||''),access=await base(slug),user_id=String(formData.get('user_id')||''),role=normalizeRole(formData.get('role'));if(!user_id||!role||role==='owner')throw new Error('Alteração inválida.');const sb=await createSupabaseServerClient(),q=await sb.functions.invoke('manage-project-member',{body:{project_id:access.project.id,action:'update_role',user_id,role}});if(q.error)throw q.error;revalidatePath(`/dashboard/${slug}/team`)}
