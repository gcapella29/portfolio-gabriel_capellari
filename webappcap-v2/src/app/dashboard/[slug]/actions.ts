'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { resolveProjectAccess } from '@/core/session';
import { can } from '@/core/permissions';
import { publicMediaUrl,readV2Content,saveV2Section,uploadProjectImage,uploadProjectVideo } from '@/core/onboarding-data';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { publishV2Project } from '@/core/publishing';
import { validateCustomDomain } from '@/core/domain-validation';
import { getTemplate } from '@/core/segments';
import { sectionsForSegment } from '@/core/content-schema';
import {commerceHeroPatch} from '@/core/commerce-hero-controls';
import {menuItemLimitForProject,validatedMenuItems} from '@/core/menu-item-limit';
import { attachCustomDomain,detachCustomDomain,isVercelDomainAutomationConfigured,verifyCustomDomain } from '@/core/vercel-domains';

const text=(form:FormData,key:string)=>String(form.get(key)||'').trim();
const slugFrom=(form:FormData)=>text(form,'slug');
const path=(slug:string,area='')=>`/dashboard/${encodeURIComponent(slug)}${area?`/${area}`:''}`;
const normalizeDomain=(v:string)=>v.toLowerCase().replace(/^https?:\/\//,'').replace(/\/.*$/,'').replace(/\.$/,'');
const repeatables=(formData:FormData,segment:Parameters<typeof sectionsForSegment>[0],menuLimit:number,existingMenuCount:number)=>Object.fromEntries(sectionsForSegment(segment).map(def=>{const raw=text(formData,`section:${def.key}`);if(!raw)return[def.key,[]];let parsed:unknown;try{parsed=JSON.parse(raw)}catch{throw new Error(`Conteúdo inválido em ${def.label}. Nada foi salvo.`)}return[def.key,def.key==='menu_items'?validatedMenuItems(parsed,menuLimit,existingMenuCount):Array.isArray(parsed)?parsed.slice(0,def.max||50).filter(x=>x&&typeof x==='object'):[]]}));
const commerceTextKeys=['catalog_label','nav_home','nav_news','nav_highlights','nav_menu','nav_order','hero_kicker','hero_whatsapp','hero_instagram','hero_discover','news_title','news_intro','news_link','highlights_title','highlights_intro','highlights_link','menu_title','menu_intro','menu_selected_label','menu_add','menu_whatsapp_cta','order_title','order_intro','receipt_title','receipt_empty','receipt_total','receipt_send','receipt_choose','receipt_notice','social_title','social_intro','social_follow','about_title','about_main','creator_name','creator_bio','creator_instagram','creator_instagram_label','footer_back'] as const;
type DirectImage={path:string;url:string};
const directImage=(form:FormData,key:string,projectId:string):DirectImage|null=>{const raw=text(form,key);if(!raw||raw==='null')return null;try{const value=JSON.parse(raw) as Partial<DirectImage>;const imagePath=String(value.path||''),url=String(value.url||'');if(!imagePath.startsWith(`${projectId}/`)||url!==publicMediaUrl(imagePath))return null;return{path:imagePath,url}}catch{return null}};
const directImages=(form:FormData,key:string,projectId:string):DirectImage[]=>{const raw=text(form,key);if(!raw)return[];try{const values=JSON.parse(raw);return Array.isArray(values)?values.map(value=>{const imagePath=String(value?.path||''),url=String(value?.url||'');return imagePath.startsWith(`${projectId}/`)&&url===publicMediaUrl(imagePath)?{path:imagePath,url}:null}).filter((value):value is DirectImage=>Boolean(value)):[]}catch{return[]}};
const imagePosition=(form:FormData,slot:string)=>{const value=text(form,`mediaPosition:${slot}`);return ['top','center','bottom'].includes(value)?value:'center'};
const positioned=(value:unknown,position:string)=>value&&typeof value==='object'?{...(value as Record<string,unknown>),position}:typeof value==='string'&&value?{url:value,position}:null;

export async function saveContentAction(formData:FormData){
 const slug=slugFrom(formData),access=await resolveProjectAccess(slug);if(!can(access.role,'editContent'))throw new Error('Sem permissão para editar conteúdo.');
 const current=await readV2Content(access.project.id),portfolio=access.project.segment==='portfolio';
 const menuLimit=access.project.segment==='food-business'?await menuItemLimitForProject(access.project.id):0;
 const structured=repeatables(formData,access.project.segment,menuLimit,Array.isArray(current.content.menu_items)?current.content.menu_items.length:0) as Record<string,Record<string,unknown>[]>;
 const uploadFields=Array.from(formData.entries()).filter(([,value])=>value instanceof File&&value.size) as [string,File][];
 const imageSlots=['hero','logo','creator'] as const;
 const hasDirectImages=['uploadedMedia:hero','uploadedMedia:logo','uploadedMedia:creator','uploadedGallery'].some(key=>{const value=text(formData,key);return value&&value!=='null'&&value!=='[]'}),hasMediaControls=imageSlots.some(slot=>formData.has(`mediaPosition:${slot}`)||formData.has(`removeMedia:${slot}`));
 if((uploadFields.length||hasDirectImages||hasMediaControls)&&!can(access.role,'manageMedia'))throw new Error('Sem permissão para editar as fotos.');
 for(const definition of sectionsForSegment(access.project.segment))for(const [index,item] of (structured[definition.key]||[]).entries()){
  const file=formData.get(`section-image:${definition.key}:${index}`);
  if(file instanceof File&&file.size){const uploaded=await uploadProjectImage(access.project.id,file,`${definition.key}-${index+1}`);if(uploaded)item.image=uploaded.url}
 }
 const identity=portfolio?{...current.identity,name:text(formData,'name')||access.project.name,description:text(formData,'description'),description_en:text(formData,'description_en'),location:text(formData,'location')}:{...current.identity,name:text(formData,'name')||access.project.name,tagline:text(formData,'tagline'),description:text(formData,'description'),location:text(formData,'location')};
 await saveV2Section(access.project.id,'identity',identity);
 const content=portfolio?{...current.content,...structured,hero_title:text(formData,'hero_title'),hero_title_en:text(formData,'hero_title_en'),hero_text:text(formData,'hero_text'),hero_text_en:text(formData,'hero_text_en'),primary_offer:text(formData,'primary_offer'),primary_offer_en:text(formData,'primary_offer_en'),proof:text(formData,'proof'),proof_en:text(formData,'proof_en'),about:text(formData,'about'),about_en:text(formData,'about_en'),footer_text_pt:text(formData,'footer_text_pt'),footer_text_en:text(formData,'footer_text_en')}:{...current.content,...structured,hero_title:text(formData,'hero_title'),hero_text:text(formData,'hero_text'),primary_offer:text(formData,'primary_offer'),proof:text(formData,'proof'),about:text(formData,'about'),extra_notes:text(formData,'extra_notes'),cta_primary:text(formData,'cta_primary'),cta_secondary:text(formData,'cta_secondary'),system_title:text(formData,'system_title'),system_kicker:text(formData,'system_kicker'),system_intro:text(formData,'system_intro'),results_intro:text(formData,'results_intro'),method_title:text(formData,'method_title'),method_intro:text(formData,'method_intro'),final_kicker:text(formData,'final_kicker'),final_title:text(formData,'final_title')};
 if(access.project.segment==='personal-trainer')Object.assign(content,{trainer_specialty:text(formData,'trainer_specialty'),trainer_cref:text(formData,'trainer_cref'),trainer_services:text(formData,'trainer_services'),trainer_results_title:text(formData,'trainer_results_title'),trainer_schedule_title:text(formData,'trainer_schedule_title'),trainer_schedule_text:text(formData,'trainer_schedule_text'),trainer_method:text(formData,'trainer_method'),trainer_intro:text(formData,'trainer_intro'),trainer_credentials:text(formData,'trainer_credentials')});
 if(access.project.segment==='food-business')Object.assign(content,Object.fromEntries(commerceTextKeys.map(key=>[key,text(formData,key)])));
 await saveV2Section(access.project.id,'content',content);
 const media={...current.media};let mediaChanged=false;
 for(const slot of ['logo','hero','creator'] as const){
  if(text(formData,`removeMedia:${slot}`)==='yes'){delete media[slot];mediaChanged=true;continue}
  const position=imagePosition(formData,slot),uploaded=directImage(formData,`uploadedMedia:${slot}`,access.project.id),existing=positioned(media[slot],position);
  if(uploaded){media[slot]={...uploaded,position};mediaChanged=true}else if(existing&&text(formData,`mediaPosition:${slot}`)){media[slot]=existing;mediaChanged=true}
 }
 for(const [field,slot] of [['logo','logo'],['heroImage','hero'],['creatorImage','creator']] as const){const file=formData.get(field);if(file instanceof File&&file.size){const uploaded=await uploadProjectImage(access.project.id,file,slot);media[slot]=uploaded?{...uploaded,position:imagePosition(formData,slot)}:uploaded;mediaChanged=true}}
 const directGallery=directImages(formData,'uploadedGallery',access.project.id);
 if(directGallery.length){const old=Array.isArray(media.gallery)?media.gallery:[];media.gallery=[...old,...directGallery].slice(-12);mediaChanged=true}
 const galleryFiles=formData.getAll('socialGallery').filter(value=>value instanceof File&&value.size) as File[];
 if(galleryFiles.length){const old=Array.isArray(media.gallery)?media.gallery:[],uploaded=[];for(const [index,file] of galleryFiles.slice(0,12).entries())uploaded.push(await uploadProjectImage(access.project.id,file,`social-${index+1}`));media.gallery=[...old,...uploaded].slice(-12);mediaChanged=true}
 if(mediaChanged)await saveV2Section(access.project.id,'media',media);
 const contact=portfolio?{...current.contact,email:text(formData,'email'),email_alt:text(formData,'email_alt'),whatsapp:text(formData,'whatsapp'),whatsapp_label:text(formData,'whatsapp_label'),instagram:text(formData,'instagram'),linkedin:text(formData,'linkedin'),cv:text(formData,'cv'),reel:text(formData,'reel')}:{...current.contact,email:text(formData,'email'),phone:text(formData,'phone'),whatsapp:text(formData,'whatsapp'),instagram:text(formData,'instagram'),address:text(formData,'address'),hours:text(formData,'hours')};
 await saveV2Section(access.project.id,'contact',contact);
 const embedded=text(formData,'returnTo')==='editor';
 revalidatePath(path(slug,'content'));revalidatePath(path(slug,'media'));revalidatePath(path(slug,'editor'));revalidatePath(`/preview/${encodeURIComponent(slug)}`);
 redirect(embedded?`${path(slug,'editor')}?savedContent=1#content`:`${path(slug,'content')}?saved=1`)
}
export async function saveAppearanceAction(formData:FormData){const slug=slugFrom(formData),access=await resolveProjectAccess(slug);if(!can(access.role,'editAppearance'))throw new Error('Sem permissão para editar aparência.');const current=await readV2Content(access.project.id),selected=String(current.appearance.preview_template_key||access.project.templateKey||''),completeCommerce=access.project.segment==='food-business'&&!selected.includes('sales');await saveV2Section(access.project.id,'appearance',{...current.appearance,accent:text(formData,'accent')||'#d9ff43',scale:text(formData,'scale')||'normal',alignment:text(formData,'alignment')||'left',density:text(formData,'density')||'normal',support_size:text(formData,'support_size')||'14',support_bold:formData.has('support_bold')?'true':'false',support_italic:formData.has('support_italic')?'true':'false',button_size:text(formData,'button_size')||'12',button_bold:formData.has('button_bold')?'true':'false',button_italic:formData.has('button_italic')?'true':'false',...(completeCommerce?commerceHeroPatch(formData):{})});revalidatePath(path(slug,'appearance'));revalidatePath(`/preview/${encodeURIComponent(slug)}`);redirect(`${path(slug,'appearance')}?saved=1`)}
export async function saveTemplateAction(formData:FormData){const slug=slugFrom(formData),access=await resolveProjectAccess(slug);if(!can(access.role,'editAppearance'))throw new Error('Sem permissão para trocar o modelo.');const templateKey=text(formData,'templateKey'),template=getTemplate(access.project.segment,templateKey);if(!template)throw new Error('Esse modelo não é compatível com o projeto.');if(template.status!=='ready')throw new Error('Esse modelo ainda não está disponível.');const current=await readV2Content(access.project.id);await saveV2Section(access.project.id,'appearance',{...current.appearance,preview_template_key:templateKey});revalidatePath(path(slug,'appearance'));revalidatePath(`/preview/${encodeURIComponent(slug)}`);revalidatePath(path(slug));redirect(`${path(slug,'appearance')}?template=${encodeURIComponent(templateKey)}`)}
export async function uploadMediaAction(formData:FormData){
 const slug=slugFrom(formData),access=await resolveProjectAccess(slug);if(!can(access.role,'manageMedia'))throw new Error('Sem permissão para editar mídia.');const current=await readV2Content(access.project.id),media={...current.media};
 const imageSlots=[['logo','logo'],['profileImage','profile'],['heroImage','hero'],['aboutImage','about'],['creatorImage','creator'],['contactImage','contact'],['performanceEvidence','performance_evidence'],['performanceService1','performance_service_1'],['performanceService2','performance_service_2'],['performanceService3','performance_service_3'],['performanceService4','performance_service_4'],['performanceTrainer','performance_trainer']] as const;
 for(const [field,slot] of imageSlots){const file=formData.get(field);if(file instanceof File&&file.size)media[slot]=await uploadProjectImage(access.project.id,file,slot)}
 const heroVideo=formData.get('heroVideo');if(heroVideo instanceof File&&heroVideo.size)media.hero_video=await uploadProjectVideo(access.project.id,heroVideo,'hero-video');
 const files=formData.getAll('gallery').filter(v=>v instanceof File&&v.size) as File[];if(files.length){const old=Array.isArray(media.gallery)?media.gallery:[],uploaded=[];for(const [i,file] of files.slice(0,12).entries())uploaded.push(await uploadProjectImage(access.project.id,file,`gallery-${i+1}`));media.gallery=[...old,...uploaded].slice(-12)}
 await saveV2Section(access.project.id,'media',media);revalidatePath(path(slug,'media'));revalidatePath(`/preview/${encodeURIComponent(slug)}`);redirect(`${path(slug,'media')}?saved=1`)}

export async function saveSettingsAction(formData:FormData){
  const slug=slugFrom(formData),access=await resolveProjectAccess(slug);if(!can(access.role,'manageDomain'))throw new Error('Sem permissão para editar o domínio.');
  const native=text(formData,'nativeSubdomain').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,63),custom=normalizeDomain(text(formData,'customDomain'));
  const sb=await createSupabaseServerClient();
  if(native){const dupe=await sb.from('project_v2_state').select('project_id').eq('native_subdomain',native).neq('project_id',access.project.id).maybeSingle();if(dupe.data)throw new Error('Esse subdomínio já está em uso.')}
  if(custom){const dupe=await sb.from('project_v2_state').select('project_id').eq('custom_domain',custom).neq('project_id',access.project.id).maybeSingle();if(dupe.data)throw new Error('Esse domínio próprio já está vinculado a outro projeto.')}
  const previous=await sb.from('project_v2_state').select('custom_domain').eq('project_id',access.project.id).maybeSingle();if(previous.error)throw previous.error;
  const old=previous.data?.custom_domain||'';
  let domainStatus=custom?'pending':native?'native':'unconfigured'; let vercel='manual';
  if(isVercelDomainAutomationConfigured()){
    try{
      if(old&&old!==custom)await detachCustomDomain(old);
      if(custom&&old!==custom){const attached=await attachCustomDomain(custom);domainStatus=attached.verified?'active':'pending'}
      vercel='ok';
    }catch(error){console.error('Vercel domain sync failed',error);domainStatus=custom?'error':domainStatus;vercel='error'}
  }
  const now=new Date().toISOString();
  const state=await sb.from('project_v2_state').update({native_subdomain:native||null,custom_domain:custom||null,domain_status:domainStatus,updated_at:now}).eq('project_id',access.project.id);if(state.error)throw state.error;
  const legacy=await sb.from('projects').update({subdomain:native||null,custom_domain:custom||null,domain_status:domainStatus==='native'?'active':domainStatus}).eq('id',access.project.id);if(legacy.error)throw legacy.error;
  revalidatePath(path(slug,'settings'));redirect(`${path(slug,'settings')}?saved=1&vercel=${vercel}`)
}

export async function validateDomainAction(formData:FormData){
  const slug=slugFrom(formData),access=await resolveProjectAccess(slug);if(!can(access.role,'manageDomain'))throw new Error('Sem permissão para validar domínio.');
  const sb=await createSupabaseServerClient(),state=await sb.from('project_v2_state').select('custom_domain').eq('project_id',access.project.id).maybeSingle();if(state.error)throw state.error;if(!state.data?.custom_domain)redirect(`${path(slug,'settings')}?domain=missing`);
  const custom=state.data.custom_domain; let ok=false;
  if(isVercelDomainAutomationConfigured()){
    try{const verified=await verifyCustomDomain(custom);ok=verified.verified}catch(error){console.error('Vercel domain verify failed',error)}
  }
  if(!ok){const dns=await validateCustomDomain(custom);ok=dns.ok}
  if(ok){const now=new Date().toISOString();const a=await sb.from('project_v2_state').update({domain_status:'active',updated_at:now}).eq('project_id',access.project.id);if(a.error)throw a.error;const b=await sb.from('projects').update({domain_status:'active'}).eq('id',access.project.id);if(b.error)throw b.error;revalidatePath(path(slug,'settings'));redirect(`${path(slug,'settings')}?domain=active`)}
  redirect(`${path(slug,'settings')}?domain=pending`)
}

export async function publishDashboardAction(formData:FormData){const slug=slugFrom(formData),access=await resolveProjectAccess(slug);if(!can(access.role,'publish'))throw new Error('Sem permissão para publicar.');let issue='';try{await publishV2Project(access.project.id)}catch(error){console.error('[publishDashboardAction] Falha ao publicar projeto',{projectId:access.project.id,error});const message=error instanceof Error?error.message:'';issue=['O segmento do projeto não está configurado.','O rascunho do projeto ainda não existe.','Escolha um modelo antes de publicar.','O modelo selecionado não é compatível com este projeto.','O modelo selecionado ainda não está disponível para publicação.','Conclua a configuração inicial antes de publicar.','Informe o nome do projeto antes de publicar.','Informe o título principal do site antes de publicar.','Informe a frase principal do comércio antes de publicar.'].includes(message)?message:'Não foi possível publicar agora. Tente novamente.'}if(issue)redirect(`${path(slug)}?publishError=${encodeURIComponent(issue)}`);revalidatePath(path(slug));revalidatePath(path(slug,'appearance'));revalidatePath(`/preview/${encodeURIComponent(slug)}`);revalidatePath(`/site/${encodeURIComponent(slug)}`);redirect(`${path(slug)}?published=1`)}
export async function logoutDashboardAction(){const sb=await createSupabaseServerClient();await sb.auth.signOut();redirect('/login')}
