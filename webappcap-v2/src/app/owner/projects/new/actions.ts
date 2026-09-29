'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireUser } from '@/core/session';
import { projectsForUser } from '@/core/projects';
import { segments } from '@/core/segments';
import { initialTemplateForSegment, projectDefaultsForTemplate } from '@/core/template-defaults';
import type { SegmentKey } from '@/core/domain';

const slugify=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80);
const siteType=(segment:SegmentKey)=>({'portfolio':'portfolio','personal-trainer':'personal_trainer','food-business':'local_business','commerce':'local_business','school':'language_teacher'}[segment]);
const creationError=(phase:string,slug:string,error:{message?:string;code?:string;details?:string}|null)=>{
  console.error('createClientProject failed',{phase,slug,code:error?.code,message:error?.message,details:error?.details});
  const params=new URLSearchParams({error:phase,slug,detail:String(error?.message||'Falha inesperada').slice(0,240)});
  redirect(`/owner/projects/new?${params.toString()}`);
};

async function requestOrigin(){const h=await headers(),host=h.get('x-forwarded-host')||h.get('host');if(!host)throw new Error('Não foi possível determinar o endereço da aplicação.');const proto=h.get('x-forwarded-proto')||'https';return `${proto}://${host}`}

export async function createClientProject(formData:FormData){
  const user=await requireUser();
  if(!(await projectsForUser(user.id)).some(project=>project.owner_id===user.id))throw new Error('Apenas o owner pode criar projetos.');
  const name=String(formData.get('name')||'').trim(),segment=String(formData.get('segment')||'') as SegmentKey,adminEmail=String(formData.get('adminEmail')||'').trim().toLowerCase();
  const segmentDefinition=segments[segment];
  if(!name)throw new Error('Informe o nome do projeto.');if(!segmentDefinition||segment==='portfolio'||!segmentDefinition.templates.some(template=>template.status==='ready'))throw new Error('Escolha um segmento disponível para novos clientes.');if(!/^\S+@\S+\.\S+$/.test(adminEmail))throw new Error('Informe um e-mail válido para o administrador.');
  const slug=slugify(String(formData.get('slug')||name));if(!slug)throw new Error('Não foi possível gerar o identificador do projeto.');
  const sb=await createSupabaseServerClient();const exists=await sb.from('projects').select('id').eq('slug',slug).maybeSingle();if(exists.error)creationError('lookup',slug,exists.error);if(exists.data)creationError('duplicate',slug,{message:'Esse identificador já está em uso. Confira se o projeto foi criado na tentativa anterior.'});
  const created=await sb.functions.invoke('create-project',{body:{slug,name,site_type:siteType(segment),subdomain:null,snapshot:{},template_key:'v2-pending',template_version:1}});
  if(created.error){
    const response=created.error.context instanceof Response?created.error.context:null;
    let detail='';
    if(response){try{const body=await response.clone().json() as Record<string,unknown>;detail=String(body.error||body.message||'').slice(0,300)}catch{/* A função pode retornar texto simples. */}}
    console.error('create-project failed',{slug,segment,status:response?.status,message:created.error.message,detail});
    redirect(`/owner/projects/new?error=create&status=${response?.status||0}&detail=${encodeURIComponent(detail)}`);
  }
  const project=created.data?.project||{id:created.data?.project_id,slug,name};if(!project.id)creationError('response',slug,{message:'A função create-project não retornou o identificador do projeto.'});
  const templateKey=initialTemplateForSegment(segment);
  if(templateKey&&!segmentDefinition.templates.some(template=>template.key===templateKey&&template.status==='ready'))throw new Error('O modelo inicial do segmento não está disponível.');
  const state=await sb.from('project_v2_state').upsert({project_id:project.id,segment,template_key:templateKey,lifecycle:'invited',onboarding_step:'account',domain_status:'unconfigured'},{onConflict:'project_id'});if(state.error)creationError('state',slug,state.error);
  const defaults=projectDefaultsForTemplate(templateKey,name);
  const content=await sb.from('project_v2_content').upsert({project_id:project.id,...defaults},{onConflict:'project_id'});if(content.error)creationError('content',slug,content.error);
  const origin=await requestOrigin();const invite=await sb.functions.invoke('manage-project-member',{body:{project_id:project.id,action:'invite',email:adminEmail,role:'admin',redirect_to:`${origin}/auth/callback?next=${encodeURIComponent(`/invite/${slug}`)}`}});if(invite.error)creationError('invite',slug,invite.error);
  redirect(`/owner/projects?created=${encodeURIComponent(slug)}`);
}
