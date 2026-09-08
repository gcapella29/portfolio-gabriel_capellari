import type { TemplateRenderProps } from '../../types';

export type TrainerRow={title:string;text:string};
export type TrainerMedia={url?:string;path?:string};

export const text=(o:Record<string,unknown>,key:string)=>String(o[key]??'').trim();
export const media=(o:Record<string,unknown>,key:string):string=>{const value=o[key];return value&&typeof value==='object'&&'url' in value?String((value as TrainerMedia).url||''):''};
export const rows=(value:string):TrainerRow[]=>value.split(/\r?\n/).map(item=>item.trim()).filter(Boolean).map(item=>{const [title,...rest]=item.split('|');return{title:title.trim(),text:rest.join('|').trim()}});
export const lines=(value:string)=>value.split(/\r?\n/).map(item=>item.trim()).filter(Boolean);
export const whatsappUrl=(value:string)=>`https://wa.me/${value.replace(/\D/g,'')}`;
export const instagramUrl=(value:string)=>value?(value.startsWith('http')?value:`https://instagram.com/${value.replace(/^@/,'')}`):'';

export function trainerContent({project,data}:TemplateRenderProps){
 const name=text(data.identity,'name')||project.name;
 const specialty=text(data.content,'trainer_specialty')||'Personal Trainer';
 const description=text(data.identity,'description');
 const gallery=Array.isArray(data.media.gallery)?data.media.gallery as TrainerMedia[]:[];
 const whatsapp=text(data.contact,'whatsapp')||text(data.contact,'phone');
 return {
  name,location:text(data.identity,'location'),description,specialty,cref:text(data.content,'trainer_cref'),
  heroTitle:text(data.content,'hero_title')||text(data.identity,'tagline')||'Treino feito para a sua vida.',
  heroText:text(data.content,'hero_text')||description,
  about:text(data.content,'about')||description,
  offer:text(data.content,'primary_offer'),proof:text(data.content,'proof'),
  services:rows(text(data.content,'trainer_services')),method:rows(text(data.content,'trainer_method')),
  credentials:lines(text(data.content,'trainer_credentials')),
  resultsTitle:text(data.content,'trainer_results_title')||'Consistência que aparece.',
  scheduleTitle:text(data.content,'trainer_schedule_title')||'Vamos começar?',
  scheduleText:text(data.content,'trainer_schedule_text')||'Conte seu objetivo e vamos entender o melhor caminho.',
  hero:media(data.media,'hero'),gallery,whatsapp,whatsappHref:whatsapp?whatsappUrl(whatsapp):'',
  instagram:text(data.contact,'instagram'),instagramHref:instagramUrl(text(data.contact,'instagram')),
  accent:text(data.appearance,'accent')||'#d9ff43'
 };
}
