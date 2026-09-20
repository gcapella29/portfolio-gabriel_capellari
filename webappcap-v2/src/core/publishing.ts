import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getTemplate } from './segments';
import type { SegmentKey } from './domain';
import { normalizeV2Content, publicationFlags, selectedTemplateKey } from './content-snapshot';

export async function readProjectState(projectId:string){const sb=await createSupabaseServerClient();const q=await sb.from('project_v2_state').select('template_key,lifecycle,onboarding_step,native_subdomain,custom_domain,domain_status,updated_at').eq('project_id',projectId).maybeSingle();if(q.error)throw q.error;return q.data}
export function publicProjectUrl(state:{native_subdomain?:string|null;custom_domain?:string|null;domain_status?:string|null}|null,slug:string){if(state?.custom_domain&&state.domain_status==='active')return `https://${state.custom_domain}`;const native=state?.native_subdomain||slug;return `https://${native}.webappcap.com.br`}
export async function publicationStatus(projectId:string){const sb=await createSupabaseServerClient();const draft=await sb.from('project_v2_content').select('updated_at').eq('project_id',projectId).maybeSingle();if(draft.error)throw draft.error;const live=await sb.from('project_v2_public_content').select('published_at').eq('project_id',projectId).maybeSingle();if(live.error&&live.error.code!=='PGRST116')throw live.error;return publicationFlags(draft.data?.updated_at,live.data?.published_at)}

export async function publishV2Project(projectId:string){
  const sb=await createSupabaseServerClient();
  const [state,draft]=await Promise.all([
    sb.from('project_v2_state').select('segment,template_key,onboarding_step,native_subdomain').eq('project_id',projectId).maybeSingle(),
    sb.from('project_v2_content').select('identity,content,media,appearance,contact').eq('project_id',projectId).maybeSingle()
  ]);
  if(state.error)throw state.error;if(draft.error)throw draft.error;
  if(!state.data?.segment)throw new Error('O segmento do projeto não está configurado.');
  if(!draft.data)throw new Error('O rascunho do projeto ainda não existe.');
  const data=normalizeV2Content(draft.data);
  const selectedTemplate=selectedTemplateKey(data.appearance,state.data.template_key);
  if(!selectedTemplate)throw new Error('Escolha um modelo antes de publicar.');
  const template=getTemplate(state.data.segment as SegmentKey,selectedTemplate);
  if(!template)throw new Error('O modelo selecionado não é compatível com este projeto.');
  if(template.status!=='ready')throw new Error('O modelo selecionado ainda não está disponível para publicação.');
  if(!String(data.identity.name||'').trim())throw new Error('Informe o nome do projeto antes de publicar.');
  if(state.data.segment==='food-business'){
    const tagline=selectedTemplate==='commerce-sales-1'?String(data.content.sales_tagline||data.identity.tagline||'').trim():String(data.identity.tagline||'').trim();
    if(!tagline)throw new Error('Informe a frase principal do comércio antes de publicar.');
  }else if(!String(data.content.hero_title||'').trim())throw new Error('Informe o título principal do site antes de publicar.');
  const now=new Date().toISOString(),snapshot=await sb.from('project_v2_public_content').upsert({project_id:projectId,...data,published_at:now},{onConflict:'project_id'});if(snapshot.error)throw snapshot.error;
  const a=await sb.from('project_v2_state').update({template_key:selectedTemplate,lifecycle:'published',onboarding_step:'completed',onboarding_completed_at:now,updated_at:now}).eq('project_id',projectId);if(a.error)throw a.error;
  const b=await sb.from('projects').update({is_published:true}).eq('id',projectId);if(b.error)throw b.error;
}
