'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { resolveProjectAccess } from '@/core/session';
import { can } from '@/core/permissions';
import { readV2Content, saveV2Section, uploadProjectImage } from '@/core/onboarding-data';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { publishV2Project } from '@/core/publishing';

const text=(form:FormData,key:string)=>String(form.get(key)||'').trim();
const slugFrom=(form:FormData)=>text(form,'slug');
const path=(slug:string,area='')=>`/dashboard/${encodeURIComponent(slug)}${area?`/${area}`:''}`;

export async function saveContentAction(formData:FormData){
  const slug=slugFrom(formData),access=await resolveProjectAccess(slug);if(!can(access.role,'editContent'))throw new Error('Sem permissão para editar conteúdo.');const current=await readV2Content(access.project.id);
  await saveV2Section(access.project.id,'identity',{...current.identity,name:text(formData,'name')||access.project.name,tagline:text(formData,'tagline'),description:text(formData,'description'),location:text(formData,'location')});
  await saveV2Section(access.project.id,'content',{...current.content,hero_title:text(formData,'hero_title'),hero_text:text(formData,'hero_text'),primary_offer:text(formData,'primary_offer'),proof:text(formData,'proof'),about:text(formData,'about'),extra_notes:text(formData,'extra_notes')});
  await saveV2Section(access.project.id,'contact',{...current.contact,email:text(formData,'email'),phone:text(formData,'phone'),whatsapp:text(formData,'whatsapp'),instagram:text(formData,'instagram'),address:text(formData,'address'),hours:text(formData,'hours')});
  revalidatePath(path(slug,'content'));revalidatePath(`/preview/${encodeURIComponent(slug)}`);redirect(`${path(slug,'content')}?saved=1`);
}

export async function saveAppearanceAction(formData:FormData){
  const slug=slugFrom(formData),access=await resolveProjectAccess(slug);if(!can(access.role,'editAppearance'))throw new Error('Sem permissão para editar aparência.');const current=await readV2Content(access.project.id);
  await saveV2Section(access.project.id,'appearance',{...current.appearance,accent:text(formData,'accent')||'#d9ff43',heading_font:text(formData,'heading_font')||'Montserrat',body_font:text(formData,'body_font')||'DM Sans',scale:text(formData,'scale')||'normal',alignment:text(formData,'alignment')||'left',density:text(formData,'density')||'normal'});
  revalidatePath(path(slug,'appearance'));revalidatePath(`/preview/${encodeURIComponent(slug)}`);redirect(`${path(slug,'appearance')}?saved=1`);
}

export async function uploadMediaAction(formData:FormData){
  const slug=slugFrom(formData),access=await resolveProjectAccess(slug);if(!can(access.role,'manageMedia'))throw new Error('Sem permissão para editar fotos.');const current=await readV2Content(access.project.id),media={...current.media};
  const logo=formData.get('logo'),hero=formData.get('heroImage');if(logo instanceof File&&logo.size)media.logo=await uploadProjectImage(access.project.id,logo,'logo');if(hero instanceof File&&hero.size)media.hero=await uploadProjectImage(access.project.id,hero,'hero');
  const files=formData.getAll('gallery').filter(v=>v instanceof File&&v.size) as File[];if(files.length){const old=Array.isArray(media.gallery)?media.gallery:[];const uploaded=[];for(const [i,file] of files.slice(0,12).entries())uploaded.push(await uploadProjectImage(access.project.id,file,`gallery-${i+1}`));media.gallery=[...old,...uploaded].slice(-12)}
  await saveV2Section(access.project.id,'media',media);revalidatePath(path(slug,'media'));revalidatePath(`/preview/${encodeURIComponent(slug)}`);redirect(`${path(slug,'media')}?saved=1`);
}

export async function saveSettingsAction(formData:FormData){
  const slug=slugFrom(formData),access=await resolveProjectAccess(slug);if(!can(access.role,'manageDomain'))throw new Error('Sem permissão para editar configurações.');const native=text(formData,'nativeSubdomain').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,63);const custom=text(formData,'customDomain').toLowerCase().replace(/^https?:\/\//,'').replace(/\/.*$/,'').replace(/\.$/,'');const sb=await createSupabaseServerClient();
  if(native){const dupe=await sb.from('project_v2_state').select('project_id').eq('native_subdomain',native).neq('project_id',access.project.id).maybeSingle();if(dupe.data)throw new Error('Esse subdomínio já está em uso.');}
  const state=await sb.from('project_v2_state').update({native_subdomain:native||null,custom_domain:custom||null,domain_status:custom?'pending':native?'native':'unconfigured',updated_at:new Date().toISOString()}).eq('project_id',access.project.id);if(state.error)throw state.error;
  const legacy=await sb.from('projects').update({subdomain:native||null,custom_domain:custom||null,domain_status:custom?'pending':native?'active':'unconfigured'}).eq('id',access.project.id);if(legacy.error)throw legacy.error;
  revalidatePath(path(slug,'settings'));redirect(`${path(slug,'settings')}?saved=1`);
}

export async function publishDashboardAction(formData:FormData){const slug=slugFrom(formData),access=await resolveProjectAccess(slug);if(!can(access.role,'publish'))throw new Error('Sem permissão para publicar.');await publishV2Project(access.project.id);revalidatePath(path(slug));redirect(`${path(slug)}?published=1`)}
