'use server';

import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {can} from '@/core/permissions';
import {publicMediaUrl,readV2Content,saveV2Section} from '@/core/onboarding-data';
import {resolveProjectAccess} from '@/core/session';

type DirectImage={path:string;url:string};
const text=(form:FormData,key:string)=>String(form.get(key)||'').trim();
const provided=(form:FormData,key:string)=>form.has(key);
const checked=(form:FormData,key:string)=>form.getAll(key).some(value=>String(value)==='true');
const directImage=(form:FormData,key:string,projectId:string):DirectImage|null=>{const raw=text(form,key);if(!raw||raw==='null')return null;try{const value=JSON.parse(raw) as Partial<DirectImage>,path=String(value.path||''),url=String(value.url||'');return path.startsWith(`${projectId}/`)&&url===publicMediaUrl(path)?{path,url}:null}catch{return null}};
const mediaUrl=(value:unknown)=>value&&typeof value==='object'&&'url' in value?String((value as {url?:unknown}).url||''):typeof value==='string'?value:'';

export async function saveCompleteContentAction(formData:FormData){
 const slug=text(formData,'slug'),access=await resolveProjectAccess(slug);
 if(access.project.segment!=='food-business')throw new Error('Este editor é exclusivo de Comércio.');
 if(!can(access.role,'editContent'))throw new Error('Sem permissão para editar conteúdo.');
 const current=await readV2Content(access.project.id);

 const identity={...current.identity};
 for(const key of ['tagline'] as const)if(provided(formData,key))identity[key]=text(formData,key);
 await saveV2Section(access.project.id,'identity',identity);

 const content={...current.content};
 for(const key of ['hero_kicker','menu_intro','order_intro','social_intro','about_main','creator_name','creator_bio','creator_instagram','creator_instagram_label'] as const)if(provided(formData,key))content[key]=text(formData,key);
 for(const [field,key] of [['visibility:catalog','show_catalog'],['visibility:cart','show_cart'],['visibility:instagram','show_instagram'],['visibility:about','show_about']] as const)if(provided(formData,field))content[key]=checked(formData,field);
 if(provided(formData,'section:menu_items')){try{const parsed=JSON.parse(text(formData,'section:menu_items'));content.menu_items=Array.isArray(parsed)?parsed.slice(0,80).filter(item=>item&&typeof item==='object'):[]}catch{content.menu_items=[]}}
 await saveV2Section(access.project.id,'content',content);

 const contact={...current.contact};
 for(const key of ['whatsapp','instagram'] as const)if(provided(formData,key))contact[key]=text(formData,key);
 await saveV2Section(access.project.id,'contact',contact);

 if(can(access.role,'manageMedia')){
  const media={...current.media};let changed=false;
  for(const slot of ['hero','creator'] as const){
   if(text(formData,`removeMedia:${slot}`)==='yes'){delete media[slot];changed=true;continue}
   const rawPosition=text(formData,`mediaPosition:${slot}`),position=/^(?:100(?:\.0)?|\d{1,2}(?:\.\d+)?)%\s+(?:100(?:\.0)?|\d{1,2}(?:\.\d+)?)%$/.test(rawPosition)||['top','center','bottom','left','right'].includes(rawPosition)?rawPosition:'center';
   const fit=['cover','contain','fill'].includes(text(formData,`mediaFit:${slot}`))?text(formData,`mediaFit:${slot}`):'cover';
   const uploaded=directImage(formData,`uploadedMedia:${slot}`,access.project.id),existing=mediaUrl(media[slot]);
   if(uploaded){media[slot]={...uploaded,position,fit};changed=true}else if(existing&&provided(formData,`mediaPosition:${slot}`)){media[slot]={...(typeof media[slot]==='object'&&media[slot]?media[slot] as Record<string,unknown>:{url:existing}),position,fit};changed=true}
  }
  if(changed)await saveV2Section(access.project.id,'media',media);
 }

 revalidatePath(`/dashboard/${encodeURIComponent(slug)}/editor`);revalidatePath(`/preview/${encodeURIComponent(slug)}`);
 redirect(`/dashboard/${encodeURIComponent(slug)}/editor?savedContent=1#blocks`);
}
