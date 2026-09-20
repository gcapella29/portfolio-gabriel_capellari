import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { projectsForUser, projectForUser } from './projects';
import { destinationForUser } from './onboarding';
import type { ProjectRole } from './domain';

export async function requireUser() {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb.auth.getUser();
  if (error || !data.user) redirect('/login');
  return data.user;
}

export async function resolveProjectAccess(slug: string) {
  const user = await requireUser();
  const access = await projectForUser(slug, user.id);
  if (!access) redirect('/unauthorized');
  return { user, ...access };
}

export async function requirePlatformOwner() {
  const user = await requireUser();
  const sb = await createSupabaseServerClient();
  const result = await sb
    .from('projects')
    .select('id')
    .eq('slug', 'gabriel-capellari')
    .eq('owner_id', user.id)
    .is('archived_at', null)
    .maybeSingle();
  if (result.error || !result.data) redirect('/unauthorized');
  return user;
}

export async function entryDestination(userId: string) {
  const list = await projectsForUser(userId);
  if (!list.length) return '/empty';

  const owned = list.filter(p => p.owner_id === userId);
  if (owned.length) return '/owner/projects';
  const access = await projectForUser(list[0].slug, userId);
  if (!access) return '/unauthorized';
  return destinationForUser(access.project, access.role as ProjectRole);
}
