import type {Metadata} from 'next';
import {cache} from 'react';
import { resolveProjectAccess } from '@/core/session';
import { readV2Content } from '@/core/onboarding-data';
import { renderTemplate } from '@/templates/registry';
import {getTemplate} from '@/core/segments';

export const dynamic='force-dynamic';
export const revalidate=0;

const readDraft=cache(async(slug:string)=>{
  const {project}=await resolveProjectAccess(slug);
  const data=await readV2Content(project.id);
  return {project,data};
});

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;
  const {project,data}=await readDraft(slug);
  const custom=String(data.identity.browser_title||'').trim();
  const name=String(project.segment==='personal-trainer'?data.identity.name||project.name:project.name||data.identity.name||'Projeto').trim();
  const role=String(project.segment==='food-business'||project.segment==='commerce'?data.identity.tagline||'Catálogo e pedidos':project.segment==='personal-trainer'?'Personal Trainer':data.content.hero_text||'Portfólio profissional').split('·')[0].trim();
  return {title:{absolute:custom||`${name} — ${role}`},robots:{index:false,follow:false}};
}

export default async function PreviewPage({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{template?:string}>}){
  const {slug}=await params,query=await searchParams;
  const {project,data}=await readDraft(slug);
  const requested=String(query.template||'').trim(),candidate=requested?getTemplate(project.segment,requested):null;
  const draftTemplateKey=candidate?.status==='ready'?requested:String(data.appearance.preview_template_key||'').trim()||project.templateKey;
  return renderTemplate({project:{id:project.id,slug:project.slug,name:project.name,segment:project.segment,templateKey:draftTemplateKey},data,preview:true});
}
