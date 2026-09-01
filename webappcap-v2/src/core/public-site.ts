import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { SegmentKey } from './domain';
import type { V2Content } from './onboarding-data';

const segmentFromValue=(value:unknown):SegmentKey=>{const v=String(value||'').toLowerCase();if(['personal-trainer','personal_trainer','fitness'].includes(v))return'personal-trainer';if(['food-business','food_business','local_business','local'].includes(v))return'food-business';if(['school','educator','language_teacher'].includes(v))return'school';return'portfolio'};

export async function readPublicSiteBySlug(slug:string){
  const sb=await createSupabaseServerClient();
  const p=await sb.from('projects').select('id,slug,name,site_type,is_published,archived_at').eq('slug',slug).eq('is_published',true).is('archived_at',null).maybeSingle();
  if(p.error||!p.data)return null;
  const state=await sb.from('project_v2_state').select('segment,template_key,lifecycle').eq('project_id',p.data.id).maybeSingle();
  if(state.error||!state.data||state.data.lifecycle!=='published')return null;
  const content=await sb.from('project_v2_public_content').select('identity,content,media,appearance,contact').eq('project_id',p.data.id).maybeSingle();
  if(content.error||!content.data)return null;
  const data:V2Content={identity:content.data.identity||{},content:content.data.content||{},media:content.data.media||{},appearance:content.data.appearance||{},contact:content.data.contact||{}};
  return {project:{id:p.data.id,slug:p.data.slug,name:p.data.name,segment:segmentFromValue(state.data.segment||p.data.site_type),templateKey:state.data.template_key||null},data};
}
