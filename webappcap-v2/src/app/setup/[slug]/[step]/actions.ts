'use server';
import { redirect } from 'next/navigation';
import { resolveProjectAccess } from '@/core/session';
import { can } from '@/core/permissions';
import { nextOnboardingStep,onboardingPath,orderedOnboardingSteps } from '@/core/onboarding';
import { readV2Content,saveV2Section,updateOnboardingState,uploadProjectImage,validateTemplateForProject } from '@/core/onboarding-data';
import { saveProjectAppearance,saveProjectContact,saveProjectContent,saveProjectIdentity } from '@/core/project-content';
import { sectionsForSegment } from '@/core/content-schema';
import { saveProjectDomains } from '@/core/project-domains';
import { publishV2Project } from '@/core/publishing';
import type { OnboardingStep } from '@/core/domain';
const text=(form:FormData,key:string)=>String(form.get(key)||'').trim();
function repeatables(form:FormData,segment:Parameters<typeof sectionsForSegment>[0]){const result:Record<string,unknown>={};for(const definition of sectionsForSegment(segment)){const raw=text(form,`section:${definition.key}`);if(!raw)continue;try{const parsed=JSON.parse(raw);if(Array.isArray(parsed))result[definition.key]=parsed.slice(0,definition.max||50).filter(item=>item&&typeof item==='object')}catch{throw new Error(`Conteúdo inválido em ${definition.label}.`)}}return result}
export async function saveSetupStep(formData:FormData){
 const slug=text(formData,'slug'),step=text(formData,'step') as OnboardingStep;const access=await resolveProjectAccess(slug);if(!can(access.role,'editContent')&&step!=='account'&&step!=='template'&&step!=='domain')throw new Error('Sem permissão para editar esta etapa.');
 let statePatch:Record<string,unknown>={};
 if(step==='account'){}
 else if(step==='template'){if(!can(access.role,'chooseTemplate'))throw new Error('Sem permissão para escolher o modelo.');const template=validateTemplateForProject(access.project,text(formData,'templateKey'));if(!template)throw new Error('Esse modelo ainda não está disponível.');statePatch={template_key:template.key}}
 else if(step==='identity')await saveProjectIdentity(access.project.id,{name:text(formData,'name')||access.project.name,tagline:text(formData,'tagline'),description:text(formData,'description'),location:text(formData,'location')});
 else if(step==='content')await saveProjectContent(access.project.id,{hero_title:text(formData,'hero_title'),hero_text:text(formData,'hero_text'),primary_offer:text(formData,'primary_offer'),proof:text(formData,'proof'),about:text(formData,'about'),extra_notes:text(formData,'extra_notes'),...repeatables(formData,access.project.segment)});
 else if(step==='media'){if(!can(access.role,'manageMedia'))throw new Error('Sem permissão para enviar imagens.');const existing=await readV2Content(access.project.id),logo=formData.get('logo'),hero=formData.get('heroImage'),media={...existing.media};if(logo instanceof File&&logo.size)media.logo=await uploadProjectImage(access.project.id,logo,'logo');if(hero instanceof File&&hero.size)media.hero=await uploadProjectImage(access.project.id,hero,'hero');const previous=Array.isArray(media.gallery)?media.gallery:[],gallery=[...previous];for(const [index,item] of formData.getAll('gallery').entries())if(item instanceof File&&item.size){const uploaded=await uploadProjectImage(access.project.id,item,`gallery-${index+1}`);if(uploaded)gallery.push(uploaded)}if(gallery.length)media.gallery=gallery.slice(0,12);await saveV2Section(access.project.id,'media',media)}
 else if(step==='appearance'){if(!can(access.role,'editAppearance'))throw new Error('Sem permissão para aparência.');await saveProjectAppearance(access.project.id,{accent:text(formData,'accent')||'#d9ff43',scale:text(formData,'scale')||'normal',alignment:text(formData,'alignment')||'left',density:text(formData,'density')||'normal'})}
 else if(step==='contact')await saveProjectContact(access.project.id,{email:text(formData,'email'),phone:text(formData,'phone'),whatsapp:text(formData,'whatsapp'),instagram:text(formData,'instagram'),address:text(formData,'address'),hours:text(formData,'hours')});
 else if(step==='domain'){if(!can(access.role,'manageDomain'))throw new Error('Sem permissão para configurar endereço.');const result=await saveProjectDomains({projectId:access.project.id,nativeSubdomain:text(formData,'nativeSubdomain')||access.project.slug,customDomain:text(formData,'customDomain')});statePatch={native_subdomain:result.native||null,custom_domain:result.custom||null,domain_status:result.domainStatus}}
 const candidate=nextOnboardingStep(step),currentIndex=orderedOnboardingSteps.indexOf(access.project.onboardingStep),candidateIndex=orderedOnboardingSteps.indexOf(candidate),target=candidateIndex>currentIndex?candidate:access.project.onboardingStep;await updateOnboardingState(access.project.id,target,statePatch);redirect(onboardingPath(target,access.project.slug));
}
export async function publishOnboardingProject(formData:FormData){const slug=text(formData,'slug'),access=await resolveProjectAccess(slug);if(!can(access.role,'publish'))throw new Error('Sem permissão para publicar.');await publishV2Project(access.project.id);redirect(`/dashboard/${encodeURIComponent(access.project.slug)}?published=1`)}
