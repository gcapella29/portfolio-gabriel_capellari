'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireUser } from '@/core/session';
import { segments } from '@/core/segments';
import type { SegmentKey } from '@/core/domain';

const slugify=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80);
const siteType=(segment:SegmentKey)=>({'portfolio':'portfolio','personal-trainer':'personal_trainer','food-business':'local_business','school':'school'}[segment]);

export async function createClientProject(formData:FormData){
  await requireUser();const name=String(formData.get('name')||'').trim(),segment=String(formData.get('segment')||'') as SegmentKey,adminEmail=String(formData.get('adminEmail')||'').trim().toLowerCase();
  if(!name)throw new Error('Informe o nome do projeto.');if(!segments[segment]||segment==='portfolio')throw new Error('Escolha um segmento disponível para novos clientes.');if(!/^\S+@\S+\.\S+$/.test(adminEmail))throw new Error('Informe um e-mail válido para o administrador.');
  const slug=slugify(String(formData.get('slug')||name));if(!slug)throw new Error('Não foi possível gerar o identificador do projeto.');
  const sb=await createSupabaseServerClient();const exists=await sb.from('projects').select('id').eq('slug',slug).maybeSingle();if(exists.data)throw new Error('Esse identificador já está em uso.');
  const created=await sb.functions.invoke('create-project',{body:{slug,name,site_type:siteType(segment),subdomain:null,snapshot:{},template_key:'v2-pending',template_version:1}});if(created.error)throw created.error;
  const project=created.data?.project||{id:created.data?.project_id,slug,name};if(!project.id)throw new Error('O projeto foi criado sem identificador.');
  const state=await sb.from('project_v2_state').upsert({project_id:project.id,segment,template_key:null,lifecycle:'invited',onboarding_step:'account',domain_status:'unconfigured'},{onConflict:'project_id'});if(state.error)throw state.error;
  const content=await sb.from('project_v2_content').upsert({project_id:project.id},{onConflict:'project_id'});if(content.error)throw content.error;
  const origin=process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/,'')||'';const invite=await sb.functions.invoke('manage-project-member',{body:{project_id:project.id,action:'invite',email:adminEmail,role:'admin',redirect_to:`${origin}/auth/callback?next=${encodeURIComponent(`/invite/${slug}`)}`}});if(invite.error)throw invite.error;
  redirect(`/owner/projects/${encodeURIComponent(slug)}`);
}
