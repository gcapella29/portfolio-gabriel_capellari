'use server';

import { redirect } from 'next/navigation';
import { resolveProjectAccess } from '@/core/session';
import { can } from '@/core/permissions';
import { nextOnboardingStep, onboardingPath, orderedOnboardingSteps } from '@/core/onboarding';
import { readV2Content, saveV2Section, updateOnboardingState, uploadProjectImage, validateTemplateForProject } from '@/core/onboarding-data';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { publishV2Project } from '@/core/publishing';
import type { OnboardingStep } from '@/core/domain';

const text=(form:FormData,key:string)=>String(form.get(key)||'').trim();
const cleanSub=(value:string)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,63);
const cleanDomain=(value:string)=>value.toLowerCase().replace(/^https?:\/\//,'').replace(/\/.*$/,'').replace(/\.$/,'').trim();

export async function saveSetupStep(formData:FormData){
  const slug=text(formData,'slug'),step=text(formData,'step') as OnboardingStep;const access=await resolveProjectAccess(slug);if(!can(access.role,'editContent')&&step!=='account'&&step!=='template'&&step!=='domain')throw new Error('Sem permissão para editar esta etapa.');
  const existing=await readV2Content(access.project.id);let statePatch:Record<string,unknown>={};
  if(step==='account'){
  } else if(step==='template'){
    if(!can(access.role,'chooseTemplate'))throw new Error('Sem permissão para escolher o modelo.');const templateKey=text(formData,'templateKey');const template=validateTemplateForProject(access.project,templateKey);if(!template)throw new Error('Esse modelo ainda não está disponível.');statePatch={template_key:template.key};
  } else if(step==='identity'){
    await saveV2Section(access.project.id,'identity',{...existing.identity,name:text(formData,'name')||access.project.name,tagline:text(formData,'tagline'),description:text(formData,'description'),location:text(formData,'location')});
  } else if(step==='content'){
    await saveV2Section(access.project.id,'content',{...existing.content,hero_title:text(formData,'hero_title'),hero_text:text(formData,'hero_text'),primary_offer:text(formData,'primary_offer'),proof:text(formData,'proof'),about:text(formData,'about'),extra_notes:text(formData,'extra_notes')});
  } else if(step==='media'){
    if(!can(access.role,'manageMedia'))throw new Error('Sem permissão para enviar imagens.');const logo=formData.get('logo'),hero=formData.get('heroImage');const media={...existing.media};if(logo instanceof File&&logo.size){media.logo=await uploadProjectImage(access.project.id,logo,'logo')}if(hero instanceof File&&hero.size){media.hero=await uploadProjectImage(access.project.id,hero,'hero')}
    const previousGallery=Array.isArray(media.gallery)?media.gallery:[],gallery=[...previousGallery];for(const [index,item] of formData.getAll('gallery').entries()){if(item instanceof File&&item.size){const uploaded=await uploadProjectImage(access.project.id,item,`gallery-${index+1}`);if(uploaded)gallery.push(uploaded)}}if(gallery.length)media.gallery=gallery.slice(0,12);await saveV2Section(access.project.id,'media',media);
  } else if(step==='appearance'){
    if(!can(access.role,'editAppearance'))throw new Error('Sem permissão para aparência.');await saveV2Section(access.project.id,'appearance',{...existing.appearance,accent:text(formData,'accent')||'#d9ff43',heading_font:text(formData,'heading_font')||'Montserrat',body_font:text(formData,'body_font')||'DM Sans',scale:text(formData,'scale')||'normal',alignment:text(formData,'alignment')||'left',density:text(formData,'density')||'normal'});
  } else if(step==='contact'){
    await saveV2Section(access.project.id,'contact',{...existing.contact,email:text(formData,'email'),phone:text(formData,'phone'),whatsapp:text(formData,'whatsapp'),instagram:text(formData,'instagram'),address:text(formData,'address'),hours:text(formData,'hours')});
  } else if(step==='domain'){
    if(!can(access.role,'manageDomain'))throw new Error('Sem permissão para configurar endereço.');const native=cleanSub(text(formData,'nativeSubdomain')||access.project.slug),custom=cleanDomain(text(formData,'customDomain'));const sb=await createSupabaseServerClient();
    const dupe=await sb.from('project_v2_state').select('project_id').eq('native_subdomain',native).neq('project_id',access.project.id).maybeSingle();if(dupe.data)throw new Error('Esse subdomínio já está em uso.');
    statePatch={native_subdomain:native,custom_domain:custom||null,domain_status:custom?'pending':'native'};const legacy=await sb.from('projects').update({subdomain:native,custom_domain:custom||null,domain_status:custom?'pending':'active'}).eq('id',access.project.id);if(legacy.error)throw legacy.error;
  }
  const candidate=nextOnboardingStep(step),currentIndex=orderedOnboardingSteps.indexOf(access.project.onboardingStep),candidateIndex=orderedOnboardingSteps.indexOf(candidate);const target=candidateIndex>currentIndex?candidate:access.project.onboardingStep;
  await updateOnboardingState(access.project.id,target,statePatch);redirect(onboardingPath(target,access.project.slug));
}

export async function publishOnboardingProject(formData:FormData){const slug=text(formData,'slug'),access=await resolveProjectAccess(slug);if(!can(access.role,'publish'))throw new Error('Sem permissão para publicar.');await publishV2Project(access.project.id);redirect(`/dashboard/${encodeURIComponent(access.project.slug)}?published=1`)}
