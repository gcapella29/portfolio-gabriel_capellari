'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { resolveProjectAccess } from '@/core/session';
import { can } from '@/core/permissions';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const text=(f:FormData,k:string)=>String(f.get(k)||'').trim();
export async function updateLeadAction(formData:FormData){const slug=text(formData,'slug'),access=await resolveProjectAccess(slug);if(!can(access.role,'viewLeads'))throw new Error('Sem permissão para gerenciar leads.');const id=Number(text(formData,'id')),status=text(formData,'status'),notes=text(formData,'notes');if(!id)throw new Error('Lead inválido.');const sb=await createSupabaseServerClient();const q=await sb.from('site_leads').update({status,notes,updated_at:new Date().toISOString()}).eq('id',id).eq('project_id',access.project.id);if(q.error)throw q.error;revalidatePath(`/dashboard/${encodeURIComponent(slug)}/leads`);redirect(`/dashboard/${encodeURIComponent(slug)}/leads?saved=1`)}
export async function deleteLeadAction(formData:FormData){const slug=text(formData,'slug'),access=await resolveProjectAccess(slug);if(!can(access.role,'viewLeads'))throw new Error('Sem permissão para gerenciar leads.');const id=Number(text(formData,'id'));if(!id)throw new Error('Lead inválido.');const sb=await createSupabaseServerClient();const q=await sb.from('site_leads').delete().eq('id',id).eq('project_id',access.project.id);if(q.error)throw q.error;revalidatePath(`/dashboard/${encodeURIComponent(slug)}/leads`);redirect(`/dashboard/${encodeURIComponent(slug)}/leads?deleted=1`)}
