import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { OnboardingStep, ProjectContext } from './domain';
import { getTemplate } from './segments';

export type V2Content = {identity:Record<string,unknown>;content:Record<string,unknown>;media:Record<string,unknown>;appearance:Record<string,unknown>;contact:Record<string,unknown>};
const emptyContent=():V2Content=>({identity:{},content:{},media:{},appearance:{},contact:{}});

export async function readV2Content(projectId:string):Promise<V2Content>{const sb=await createSupabaseServerClient();const q=await sb.from('project_v2_content').select('identity,content,media,appearance,contact').eq('project_id',projectId).maybeSingle();if(q.error&&q.error.code!=='PGRST116')throw q.error;return q.data?{identity:q.data.identity||{},content:q.data.content||{},media:q.data.media||{},appearance:q.data.appearance||{},contact:q.data.contact||{}}:emptyContent()}
export async function ensureV2Content(projectId:string){const sb=await createSupabaseServerClient();const q=await sb.from('project_v2_content').upsert({project_id:projectId},{onConflict:'project_id'});if(q.error)throw q.error}
export async function saveV2Section(projectId:string,section:keyof V2Content,value:Record<string,unknown>){const sb=await createSupabaseServerClient();await ensureV2Content(projectId);const q=await sb.from('project_v2_content').update({[section]:value,updated_at:new Date().toISOString()}).eq('project_id',projectId);if(q.error)throw q.error}
export async function updateOnboardingState(projectId:string,step:OnboardingStep,patch:Record<string,unknown>={}){const sb=await createSupabaseServerClient();const q=await sb.from('project_v2_state').update({onboarding_step:step,lifecycle:step==='completed'?'ready-to-publish':'onboarding',updated_at:new Date().toISOString(),...patch}).eq('project_id',projectId);if(q.error)throw q.error}
export function validateTemplateForProject(project:ProjectContext,templateKey:string){const template=getTemplate(project.segment,templateKey);if(!template||template.status==='planned')return null;return template}
export function publicMediaUrl(path:string){const base=process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/,'');return base?`${base}/storage/v1/object/public/webappcap-v2-sites/${path}`:path}

const imageTypes:Record<string,string>={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif'};
function hasImageSignature(bytes:Buffer,type:string){if(type==='image/jpeg')return bytes.length>3&&bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff;if(type==='image/png')return bytes.length>8&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));if(type==='image/gif')return bytes.subarray(0,6).toString('ascii')==='GIF87a'||bytes.subarray(0,6).toString('ascii')==='GIF89a';if(type==='image/webp')return bytes.subarray(0,4).toString('ascii')==='RIFF'&&bytes.subarray(8,12).toString('ascii')==='WEBP';return false}
export async function uploadProjectImage(projectId:string,file:File,slot:string){
  if(!file||file.size===0)return null;
  const ext=imageTypes[file.type];if(!ext)throw new Error('Formato não permitido. Use JPG, PNG, WebP ou GIF.');
  if(file.size>10*1024*1024)throw new Error('A imagem deve ter no máximo 10 MB.');
  const safeSlot=slot.replace(/[^a-z0-9-]/gi,'-').toLowerCase().slice(0,50)||'image';
  const bytes=Buffer.from(await file.arrayBuffer());if(!hasImageSignature(bytes,file.type))throw new Error('O arquivo enviado não corresponde a uma imagem válida.');
  const path=`${projectId}/${safeSlot}-${crypto.randomUUID()}.${ext}`;
  const sb=await createSupabaseServerClient();const result=await sb.storage.from('webappcap-v2-sites').upload(path,bytes,{contentType:file.type,upsert:false,cacheControl:'31536000'});if(result.error)throw result.error;
  return {path,url:publicMediaUrl(path)};
}
