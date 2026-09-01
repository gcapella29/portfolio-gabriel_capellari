import { createSupabaseServerClient } from '@/lib/supabase/server';
import { normalizeRole } from './permissions';
import type { ProjectContext, ProjectRole, SegmentKey, OnboardingStep, ProjectLifecycle } from './domain';

export type ResolvedProject = { project: ProjectContext; role: ProjectRole };

const segmentFromValue = (value: unknown): SegmentKey => {
  const v = String(value || '').toLowerCase();
  if (['personal-trainer','personal_trainer','fitness'].includes(v)) return 'personal-trainer';
  if (['food-business','food_business','local_business','local'].includes(v)) return 'food-business';
  if (['school','educator','language_teacher'].includes(v)) return 'school';
  return 'portfolio';
};

export async function projectForUser(slug: string, userId: string): Promise<ResolvedProject | null> {
  const sb = await createSupabaseServerClient();
  const p = await sb.from('projects').select('id,slug,name,site_type,is_published,owner_id,archived_at').eq('slug', slug).maybeSingle();
  if (p.error || !p.data || p.data.archived_at) return null;

  let role: ProjectRole | null = p.data.owner_id === userId ? 'owner' : null;
  if (!role) {
    const membership = await sb.from('project_members').select('role').eq('project_id', p.data.id).eq('user_id', userId).maybeSingle();
    if (membership.error) return null;
    role = normalizeRole(membership.data?.role);
  }
  if (!role) return null;

  const state = await sb.from('project_v2_state').select('segment,template_key,lifecycle,onboarding_step').eq('project_id', p.data.id).maybeSingle();
  const segment = segmentFromValue(state.data?.segment || p.data.site_type);
  const onboardingStep = (state.data?.onboarding_step || (segment === 'portfolio' ? 'completed' : 'template')) as OnboardingStep;
  const lifecycle = (state.data?.lifecycle || (p.data.is_published ? 'published' : 'draft')) as ProjectLifecycle;

  return {
    role,
    project: {
      id: p.data.id,
      slug: p.data.slug,
      name: p.data.name,
      segment,
      templateKey: state.data?.template_key || (segment === 'portfolio' ? 'portfolio-legacy-1' : null),
      lifecycle,
      onboardingStep,
      isPublished: p.data.is_published === true
    }
  };
}

export async function projectsForUser(userId: string) {
  const sb = await createSupabaseServerClient();
  const memberships = await sb.from('project_members').select('project_id,role').eq('user_id', userId);
  if (memberships.error) throw memberships.error;
  const ids = memberships.data?.map(item => item.project_id) || [];
  const owned = await sb.from('projects').select('id,slug,name,site_type,is_published,owner_id,archived_at').eq('owner_id', userId);
  if (owned.error) throw owned.error;
  const memberProjects = ids.length ? await sb.from('projects').select('id,slug,name,site_type,is_published,owner_id,archived_at').in('id', ids) : {data:[],error:null};
  if (memberProjects.error) throw memberProjects.error;
  const all = [...(owned.data || []), ...(memberProjects.data || [])].filter((p, i, arr) => !p.archived_at && arr.findIndex(x => x.id === p.id) === i);
  return all;
}
