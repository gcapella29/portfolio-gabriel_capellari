import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { SegmentKey } from './domain';
import type { V2Content } from './onboarding-data';
import { classifyHost } from './host-routing';

const segmentFromValue=(value:unknown):SegmentKey=>{const v=String(value||'').toLowerCase();if(['personal-trainer','personal_trainer','fitness'].includes(v))return'personal-trainer';if(['food-business','food_business','local_business','local'].includes(v))return'food-business';if(['school','educator','language_teacher'].includes(v))return'school';return'portfolio'};

async function hydratePublicProject(project:{id:string;slug:string;name:string;site_type?:string|null}){
  const sb=await createSupabaseServerClient();
  const state=await sb.from('project_v2_state').select('segment,template_key,lifecycle,native_subdomain,custom_domain,domain_status').eq('project_id',project.id).maybeSingle();
  if(state.error||!state.data||state.data.lifecycle!=='published'||!state.data.template_key)return null;
  const content=await sb.from('project_v2_public_content').select('identity,content,media,appearance,contact').eq('project_id',project.id).maybeSingle();
  if(content.error||!content.data)return null;
  const data:V2Content={identity:content.data.identity||{},content:content.data.content||{},media:content.data.media||{},appearance:content.data.appearance||{},contact:content.data.contact||{}};
  return {project:{id:project.id,slug:project.slug,name:project.name,segment:segmentFromValue(state.data.segment||project.site_type),templateKey:state.data.template_key},data,state:state.data};
}

export async function readPublicSiteBySlug(slug:string){
  const sb=await createSupabaseServerClient();
  const p=await sb.from('projects').select('id,slug,name,site_type').eq('slug',slug).eq('is_published',true).is('archived_at',null).maybeSingle();
  if(p.error||!p.data)return null;
  return hydratePublicProject(p.data);
}

export async function readPublicSiteByHost(rawHost:string){
  const route=classifyHost(rawHost);if(route.kind==='platform')return null;
  const sb=await createSupabaseServerClient();
  const resolved=await sb.rpc('resolve_v2_public_site',{requested_host:route.host});
  if(resolved.error||!resolved.data||typeof resolved.data!=='object')return null;
  const row=resolved.data as Record<string,unknown>;
  const id=String(row.id||''),slug=String(row.slug||''),name=String(row.name||'');
  const templateKey=String(row.template_key||'');
  if(!id||!slug||!name||!templateKey)return null;
  const data:V2Content={
    identity:(row.identity&&typeof row.identity==='object'?row.identity:{}) as Record<string,unknown>,
    content:(row.content&&typeof row.content==='object'?row.content:{}) as Record<string,unknown>,
    media:(row.media&&typeof row.media==='object'?row.media:{}) as Record<string,unknown>,
    appearance:(row.appearance&&typeof row.appearance==='object'?row.appearance:{}) as Record<string,unknown>,
    contact:(row.contact&&typeof row.contact==='object'?row.contact:{}) as Record<string,unknown>
  };
  return {
    project:{id,slug,name,segment:segmentFromValue(row.segment||row.site_type),templateKey},
    data,
    state:{
      segment:row.segment,
      template_key:row.template_key,
      lifecycle:row.lifecycle,
      native_subdomain:row.native_subdomain,
      custom_domain:row.custom_domain,
      domain_status:row.domain_status
    }
  };
}
