'use server';
import {normalizeImagePosition} from '@/core/image-placement';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {resolveProjectAccess} from '@/core/session';
import {can} from '@/core/permissions';
import {readV2Content,saveV2Section,publicMediaUrl} from '@/core/onboarding-data';
import {trainerCopy,trainerLists,trainerStates,trainerRows,type TrainerListKey,trainerImage} from '@/core/trainer-content';
const text=(form:FormData,key:string)=>String(form.get(key)||'').trim();
function image(form:FormData,field:string,slot:string,current:unknown,projectId:string){
 if(text(form,`removeMedia:${slot}`)==='yes')return '';
 const raw=text(form,`uploadedMedia:${field}`);let uploaded:Record<string,unknown>|null=null;
 if(raw&&raw!=='null'){
  try{uploaded=JSON.parse(raw)}catch{throw new Error('Imagem inválida. Nada foi salvo.')}
  const path=String(uploaded?.path||'');
  if(!path.startsWith(`${projectId}/`)||String(uploaded?.url||'')!==publicMediaUrl(path))throw new Error('Imagem incompatível com o projeto. Nada foi salvo.');
 }
 const url=uploaded?trainerImage(uploaded):trainerImage(current);if(!url)return '';
 const position=text(form,`mediaPosition:${slot}`),fit=text(form,`mediaFit:${slot}`),zoom=Number(text(form,`mediaZoom:${slot}`));
 return {...(uploaded||{}),url,position:normalizeImagePosition(position),fit:['cover','contain','fill'].includes(fit)?fit:'cover',zoom:Math.max(50,Math.min(200,zoom||100))};
}
export async function saveTrainerAction(form:FormData){
 const slug=text(form,'slug'),access=await resolveProjectAccess(slug);
 if(access.project.segment!=='personal-trainer'||!can(access.role,'editContent'))throw new Error('Sem permissão para editar este Personal Trainer.');
 const current=await readV2Content(access.project.id),content={...current.content},media={...current.media};
 for(const key of Object.keys(trainerCopy)){if(!form.has(key))throw new Error('Formulário incompleto. Nada foi salvo.');content[key]=text(form,key).slice(0,10000)}
 const agenda=text(form,'trainer_agenda');if(!['aberta','fechada'].includes(agenda))throw new Error('Estado da agenda inválido. Nada foi salvo.');
 content.trainer_agenda=agenda;content.trainer_cref=text(form,'trainer_cref').slice(0,120);content.trainer_goals=text(form,'trainer_goals').slice(0,3000);
 for(const state of Object.keys(trainerStates))for(const key of Object.keys(trainerStates.aberta)){const field=`trainer_main_${state}_${key}`;content[field]=text(form,field).slice(0,10000)}
 for(const key of Object.keys(trainerLists) as TrainerListKey[]){
  let parsed:unknown;try{parsed=JSON.parse(text(form,`section:${key}`))}catch{throw new Error('Lista inválida. Nada foi salvo.')}
  if(!Array.isArray(parsed)||parsed.length>30||parsed.some(row=>!row||typeof row!=='object'||Array.isArray(row)))throw new Error('Lista inválida ou acima de 30 itens. Nada foi salvo.');
  const rows=trainerRows(parsed,key);
  content[key]=rows.map((row,index)=>{
   if(key!=='trainer_results')return row;
   const next:Record<string,unknown>={...row};
   for(const field of ['before','after']){
    const currentRows=Array.isArray(current.content[key])?current.content[key] as Record<string,unknown>[]:[];
    if(!can(access.role,'manageMedia')){
     if(row[field]!==trainerImage(currentRows[index]?.[field]))throw new Error('Sem permissão para editar imagens.');
     next[field]=currentRows[index]?.[field]||'';
    }else next[field]=image(form,`${key}:${index}:${field}`,`${key}-${index}-${field}`,row[field],access.project.id);
   }
   for(const field of ['before','after'])for(const property of ['position','fit','zoom'])delete next[`${field}_${property}`];
   return next;
  });
 }
 if(can(access.role,'manageMedia'))media.hero=image(form,'hero','hero',current.media.hero,access.project.id);
 const name=text(form,'name').slice(0,120);if(!name)throw new Error('Informe o nome profissional. Nada foi salvo.');
 const identity={...current.identity,name,browser_title:text(form,'browser_title').slice(0,80)},contact={...current.contact,whatsapp:text(form,'whatsapp').replace(/\D/g,'').slice(0,15)};
 // Validate the entire payload before writing; publication keeps the existing atomic RPC.
 await saveV2Section(access.project.id,'identity',identity);await saveV2Section(access.project.id,'content',content);await saveV2Section(access.project.id,'contact',contact);await saveV2Section(access.project.id,'media',media);
 const base=`/dashboard/${encodeURIComponent(slug)}`;revalidatePath(`${base}/editor/trainer`);revalidatePath(`/preview/${encodeURIComponent(slug)}`);redirect(`${base}/editor/trainer?saved=1`);
}
