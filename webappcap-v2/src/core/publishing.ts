import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getTemplate } from './segments';
import type { SegmentKey } from './domain';

export async function readProjectState(projectId:string){const sb=await createSupabaseServerClient();const q=await sb.from('project_v2_state').select('template_key,lifecycle,onboarding_step,native_subdomain,custom_domain,domain_status,updated_at').eq('project_id',projectId).maybeSingle();if(q.error)throw q.error;return q.data}
export function publicProjectUrl(state:{native_subdomain?:string|null;custom_domain?:string|null;domain_status?:string|null}|null,slug:string){if(state?.custom_domain&&state.domain_status==='active')return `https://${state.custom_domain}`;if(state?.native_subdomain)return `https://${state.native_subdomain}.webappcap.com.br`;return `/site/${encodeURIComponent(slug)}`}
export async function publicationStatus(projectId:string){const sb=await createSupabaseServerClient();const draft=await sb.from('project_v2_content').select('updated_at').eq('project_id',projectId).maybeSingle();if(draft.error)throw draft.error;const live=await sb.from('project_v2_public_content').select('published_at').eq('project_id',projectId).maybeSingle();if(live.error&&live.error.code!=='PGRST116')throw live.error;const draftAt=draft.data?.updated_at?new Date(draft.data.updated_at).getTime():0,liveAt=live.data?.published_at?new Date(live.data.published_at).getTime():0;return {hasPublished:liveAt>0,hasPendingChanges:draftAt>liveAt,draftUpdatedAt:draft.data?.updated_at||null,publishedAt:live.data?.published_at||null}}

export async function publishV2Project(projectId:string){
  const sb=await createSupabaseServerClient();
  const [state,draft]=await Promise.all([
    sb.from('project_v2_state').select('segment,template_key,onboarding_step,native_subdomain').eq('project_id',projectId).maybeSingle(),
    sb.from('project_v2_content').select('identity,content,media,appearance,contact').eq('project_id',projectId).maybeSingle()
  ]);
  if(state.error)throw state.error;if(draft.error)throw draft.error;
  if(!state.data?.segment)throw new Error('O segmento do projeto não está configurado.');
  if(!draft.data)throw new Error('O rascunho do projeto ainda não existe.');
  const appearance=(draft.data.appearance||{}) as Record<string,unknown>;
  const selectedTemplateKey=String(appearance.preview_template_key||state.data.template_key||'').trim();
  if(!selectedTemplateKey)throw new Error('Escolha um modelo antes de publicar.');
  const template=getTemplate(state.data.segment as SegmentKey,selectedTemplateKey);
  if(!template)throw new Error('O modelo selecionado não é compatível com este projeto.');
  if(template.status!=='ready')throw new Error('O modelo selecionado ainda não está disponível para publicação.');
  if(state.data.onboarding_step!=='completed')throw new Error('Conclua a configuração inicial antes de publicar.');
  const identity=draft.data.identity||{},content=draft.data.content||{};
  if(!String((identity as Record<string,unknown>).name||'').trim())throw new Error('Informe o nome do projeto antes de publicar.');
  if(!String((content as Record<string,unknown>).hero_title||'').trim())throw new Error('Informe o título principal do site antes de publicar.');
  const now=new Date().toISOString(),snapshot=await sb.from('project_v2_public_content').upsert({project_id:projectId,identity,content,media:draft.data.media||{},appearance,contact:draft.data.contact||{},published_at:now},{onConflict:'project_id'});if(snapshot.error)throw snapshot.error;
  const a=await sb.from('project_v2_state').update({template_key:selectedTemplateKey,lifecycle:'published',onboarding_step:'completed',onboarding_completed_at:now,updated_at:now}).eq('project_id',projectId);if(a.error)throw a.error;
  const b=await sb.from('projects').update({is_published:true}).eq('id',projectId);if(b.error)throw b.error;
}
