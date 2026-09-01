import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function readProjectState(projectId:string){
  const sb=await createSupabaseServerClient();
  const q=await sb.from('project_v2_state').select('template_key,lifecycle,onboarding_step,native_subdomain,custom_domain,domain_status,updated_at').eq('project_id',projectId).maybeSingle();
  if(q.error)throw q.error;
  return q.data;
}

export function publicProjectUrl(state:{native_subdomain?:string|null;custom_domain?:string|null;domain_status?:string|null}|null,slug:string){
  if(state?.custom_domain&&state.domain_status==='active')return `https://${state.custom_domain}`;
  if(state?.native_subdomain)return `https://${state.native_subdomain}.webappcap.com.br`;
  return `/site/${encodeURIComponent(slug)}`;
}

export async function publishV2Project(projectId:string){
  const sb=await createSupabaseServerClient();
  const state=await sb.from('project_v2_state').select('template_key').eq('project_id',projectId).maybeSingle();
  if(state.error)throw state.error;
  if(!state.data?.template_key)throw new Error('Escolha um modelo antes de publicar.');
  const now=new Date().toISOString();
  const a=await sb.from('project_v2_state').update({lifecycle:'published',onboarding_step:'completed',onboarding_completed_at:now,updated_at:now}).eq('project_id',projectId);
  if(a.error)throw a.error;
  const b=await sb.from('projects').update({is_published:true}).eq('id',projectId);
  if(b.error)throw b.error;
}
