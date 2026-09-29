'use server';
import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {resolveProjectAccess} from '@/core/session';
import {can} from '@/core/permissions';
import {publicMediaUrl,readV2Content,saveV2Section} from '@/core/onboarding-data';
import {menuItemLimitForProject,validatedMenuItems} from '@/core/menu-item-limit';
const text=(f:FormData,k:string)=>String(f.get(k)||'').trim();
export async function saveBakeryContentAction(formData:FormData){
 const slug=text(formData,'slug'),access=await resolveProjectAccess(slug);
 if(access.project.segment!=='commerce'||!can(access.role,'editContent'))throw new Error('Sem permissão para editar este projeto.');
 const current=await readV2Content(access.project.id),content={...current.content};
 for(const key of ['bakery_eyebrow','bakery_hero_title','bakery_hero_subtitle','bakery_highlights_eyebrow','bakery_highlights_title','bakery_highlights_intro','bakery_menu_title','bakery_menu_intro','bakery_order_title'])if(formData.has(key))content[key]=text(formData,key).slice(0,3000);
 if(formData.has('section:bakery_highlights')){
  let parsed:unknown;try{parsed=JSON.parse(text(formData,'section:bakery_highlights'))}catch{throw new Error('Os destaques são inválidos. Nada foi salvo.')}
  if(!Array.isArray(parsed)||parsed.length>12||parsed.some(row=>!row||typeof row!=='object'||Array.isArray(row)))throw new Error('Os destaques são inválidos. Nada foi salvo.');
  content.bakery_highlights=(parsed as Record<string,unknown>[]).map(row=>Object.fromEntries(['tag','title','description','image'].map(k=>[k,String(row[k]??'').slice(0,k==='image'?1500:3000)])));
 }
 if(formData.has('section:menu_items')){
  let parsed:unknown;try{parsed=JSON.parse(text(formData,'section:menu_items'))}catch{throw new Error('O cardápio é inválido. Nada foi salvo.')}
  content.menu_items=validatedMenuItems(parsed,await menuItemLimitForProject(access.project.id),Array.isArray(current.content.menu_items)?current.content.menu_items.length:0).map(row=>Object.fromEntries(['image','title','category','price','promo_quantity','promo_total','description','image_position','image_fit','image_zoom'].filter(k=>k in row).map(k=>[k,String(row[k]??'').slice(0,3000)])));
 }
 const identity={...current.identity};if(formData.has('name'))identity.name=text(formData,'name').slice(0,120);
 const contact={...current.contact};for(const key of ['whatsapp','phone','instagram'])if(formData.has(key))contact[key]=text(formData,key).slice(0,300);
 const appearance={...current.appearance};if(can(access.role,'editAppearance')&&formData.has('bakery_accent')){const accent=text(formData,'bakery_accent');if(!/^#[\da-f]{6}$/i.test(accent))throw new Error('Informe a cor no formato #9c4f2f.');appearance.bakery_accent=accent}
 let media={...current.media};
 if(can(access.role,'manageMedia')){
  const slot='bakery_hero',remove=text(formData,`removeMedia:${slot}`)==='yes';
  if(remove)delete media[slot];else{
   const raw=text(formData,`uploadedMedia:${slot}`);let uploaded:{path?:string;url?:string}|null=null;
   try{uploaded=JSON.parse(raw)}catch{/* Sem nova imagem. */}
   const url=uploaded?.path?.startsWith(`${access.project.id}/`)&&uploaded.url===publicMediaUrl(uploaded.path)?uploaded.url:null;
   const rawPosition=text(formData,`mediaPosition:${slot}`),position=/^(?:100(?:\.0)?|\d{1,2}(?:\.\d+)?)%\s+(?:100(?:\.0)?|\d{1,2}(?:\.\d+)?)%$/.test(rawPosition)||['top','center','bottom','left','right'].includes(rawPosition)?rawPosition:'center';
   const fit=['cover','contain','fill'].includes(text(formData,`mediaFit:${slot}`))?text(formData,`mediaFit:${slot}`):'cover',zoom=String(Math.max(50,Math.min(200,Number(text(formData,`mediaZoom:${slot}`))||100)));
   if(url)media[slot]={path:uploaded!.path,url,position,fit,zoom};
   else if(media[slot]&&formData.has(`mediaPosition:${slot}`))media[slot]={...(typeof media[slot]==='object'?media[slot] as Record<string,unknown>:{url:String(media[slot])}),position,fit,zoom};
  }
 }
 await saveV2Section(access.project.id,'identity',identity);
 await saveV2Section(access.project.id,'content',content);
 await saveV2Section(access.project.id,'contact',contact);
 if(can(access.role,'editAppearance'))await saveV2Section(access.project.id,'appearance',appearance);
 if(can(access.role,'manageMedia'))await saveV2Section(access.project.id,'media',media);
 revalidatePath(`/preview/${encodeURIComponent(slug)}`);revalidatePath(`/dashboard/${encodeURIComponent(slug)}/editor/bakery`);
 redirect(`/dashboard/${encodeURIComponent(slug)}/editor/bakery?savedContent=1#blocks`);
}
