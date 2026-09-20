'use server';

import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {resolveProjectAccess} from '@/core/session';
import {can} from '@/core/permissions';
import {readV2Content,saveV2Section} from '@/core/onboarding-data';
import {sectionsForSegment} from '@/core/content-schema';

const text=(form:FormData,key:string)=>String(form.get(key)||'').trim();
const provided=(form:FormData,key:string)=>form.has(key);
const cleanProduct=(value:unknown)=>{const item=value&&typeof value==='object'?value as Record<string,unknown>:{};return Object.fromEntries(['image','title','price','description','image_position','image_fit'].filter(key=>key in item).map(key=>[key,String(item[key]??'')]))};

export async function saveSalesContentAction(formData:FormData){
 const slug=text(formData,'slug'),access=await resolveProjectAccess(slug);
 if(access.project.segment!=='food-business')throw new Error('Este editor é exclusivo de Comércio.');
 if(!can(access.role,'editContent'))throw new Error('Sem permissão para editar conteúdo.');
 const current=await readV2Content(access.project.id);
 const identity={...current.identity};
 if(provided(formData,'name'))identity.name=text(formData,'name')||access.project.name;
 if(provided(formData,'tagline'))identity.tagline=text(formData,'tagline');
 await saveV2Section(access.project.id,'identity',identity);

 const content={...current.content};
 for(const key of ['catalog_label','menu_title','menu_intro','sales_whatsapp_message'] as const)if(provided(formData,key))content[key]=text(formData,key).slice(0,key==='sales_whatsapp_message'?2000:10000);
 const menu=sectionsForSegment('food-business').find(def=>def.key==='menu_items');
 if(menu&&provided(formData,'section:menu_items')){
  const raw=text(formData,'section:menu_items');
  try{const parsed=JSON.parse(raw);content.menu_items=Array.isArray(parsed)?parsed.slice(0,menu.max||80).filter(item=>item&&typeof item==='object').map(cleanProduct):[]}catch{content.menu_items=[]}
 }
 await saveV2Section(access.project.id,'content',content);

 const contact={...current.contact};
 if(provided(formData,'whatsapp'))contact.whatsapp=text(formData,'whatsapp');
 await saveV2Section(access.project.id,'contact',contact);
 revalidatePath(`/dashboard/${encodeURIComponent(slug)}/editor`);
 revalidatePath(`/dashboard/${encodeURIComponent(slug)}/editor/sales`);
 revalidatePath(`/dashboard/${encodeURIComponent(slug)}/content`);
 revalidatePath(`/preview/${encodeURIComponent(slug)}`);
 redirect(`/dashboard/${encodeURIComponent(slug)}/editor/sales?savedContent=1`);
}
