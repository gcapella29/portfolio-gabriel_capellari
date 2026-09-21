'use server';

import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {resolveProjectAccess} from '@/core/session';
import {can} from '@/core/permissions';
import {publicMediaUrl,readV2Content,saveV2Section} from '@/core/onboarding-data';
import {sectionsForSegment} from '@/core/content-schema';

const text=(form:FormData,key:string)=>String(form.get(key)||'').trim();
const provided=(form:FormData,key:string)=>form.has(key);
type DirectImage={path:string;url:string};
const cleanProduct=(value:unknown)=>{const item=value&&typeof value==='object'?value as Record<string,unknown>:{};return Object.fromEntries(['image','title','price','description','image_position','image_fit','image_zoom'].filter(key=>key in item).map(key=>[key,String(item[key]??'')]))};
const directImage=(form:FormData,key:string,projectId:string):DirectImage|null=>{const raw=text(form,key);if(!raw||raw==='null')return null;try{const value=JSON.parse(raw) as Partial<DirectImage>,path=String(value.path||''),url=String(value.url||'');return path.startsWith(`${projectId}/`)&&url===publicMediaUrl(path)?{path,url}:null}catch{return null}};
const mediaUrl=(value:unknown)=>value&&typeof value==='object'&&'url' in value?String((value as {url?:unknown}).url||''):typeof value==='string'?value:'';

export async function saveSalesContentAction(formData:FormData){
 const slug=text(formData,'slug'),access=await resolveProjectAccess(slug);
 if(access.project.segment!=='food-business')throw new Error('Este editor é exclusivo de Comércio.');
 if(!can(access.role,'editContent'))throw new Error('Sem permissão para editar conteúdo.');
 const current=await readV2Content(access.project.id);
 const content={...current.content};
 for(const key of ['sales_tagline','sales_menu_title','sales_menu_intro','sales_whatsapp_message','sales_whatsapp_direct_message'] as const)if(provided(formData,key))content[key]=text(formData,key).slice(0,key==='sales_whatsapp_message'?2000:key==='sales_whatsapp_direct_message'?1000:10000);
 const menu=sectionsForSegment('food-business').find(def=>def.key==='menu_items');
 if(menu&&provided(formData,'section:menu_items')){
  const raw=text(formData,'section:menu_items');
  try{const parsed=JSON.parse(raw);content.menu_items=Array.isArray(parsed)?parsed.slice(0,menu.max||80).filter(item=>item&&typeof item==='object').map(cleanProduct):[]}catch{content.menu_items=[]}
 }
 await saveV2Section(access.project.id,'content',content);

 const contact={...current.contact};
 if(provided(formData,'whatsapp'))contact.whatsapp=text(formData,'whatsapp');
 await saveV2Section(access.project.id,'contact',contact);

 if(can(access.role,'manageMedia')){
  const media={...current.media},slot='sales_hero';let changed=false;
  if(text(formData,`removeMedia:${slot}`)==='yes'){delete media[slot];changed=true}else{
   const rawPosition=text(formData,`mediaPosition:${slot}`),position=/^(?:100(?:\.0)?|\d{1,2}(?:\.\d+)?)%\s+(?:100(?:\.0)?|\d{1,2}(?:\.\d+)?)%$/.test(rawPosition)||['top','center','bottom','left','right'].includes(rawPosition)?rawPosition:'center';
   const fit=['cover','contain','fill'].includes(text(formData,`mediaFit:${slot}`))?text(formData,`mediaFit:${slot}`):'cover',zoom=String(Math.max(50,Math.min(200,Number(text(formData,`mediaZoom:${slot}`))||100)));
   const uploaded=directImage(formData,`uploadedMedia:${slot}`,access.project.id),existing=mediaUrl(media[slot]);
   if(uploaded){media[slot]={...uploaded,position,fit,zoom};changed=true}else if(existing&&provided(formData,`mediaPosition:${slot}`)){media[slot]={...(typeof media[slot]==='object'&&media[slot]?media[slot] as Record<string,unknown>:{url:existing}),position,fit,zoom};changed=true}
  }
  if(changed)await saveV2Section(access.project.id,'media',media);
 }
 revalidatePath(`/dashboard/${encodeURIComponent(slug)}/editor`);
 revalidatePath(`/dashboard/${encodeURIComponent(slug)}/editor/sales`);
 revalidatePath(`/dashboard/${encodeURIComponent(slug)}/content`);
 revalidatePath(`/preview/${encodeURIComponent(slug)}`);
 redirect(`/dashboard/${encodeURIComponent(slug)}/editor/sales?savedContent=1`);
}
