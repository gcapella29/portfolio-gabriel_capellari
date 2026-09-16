import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { classifyHost } from '@/core/host-routing';
import { projectForUser } from '@/core/projects';
import { onboardingPath } from '@/core/onboarding';
import { entryDestination } from '@/core/session';

export default async function EntryPage() {
  const sb = await createSupabaseServerClient();
  const { data } = await sb.auth.getUser();
  if (!data.user) redirect('/login');

  const requestHeaders = await headers();
  const host = classifyHost(requestHeaders.get('x-forwarded-host') || requestHeaders.get('host') || '');

  // A native project subdomain is already an explicit project context. Respect it even
  // for the platform owner instead of sending the user to the global owner project list.
  if (host.kind === 'native') {
    const access = await projectForUser(host.subdomain, data.user.id);
    if (!access) redirect('/unauthorized');
    if (access.project.onboardingStep !== 'completed') {
      redirect(onboardingPath(access.project.onboardingStep, access.project.slug));
    }
    redirect(`/dashboard/${encodeURIComponent(access.project.slug)}`);
  }

  redirect(await entryDestination(data.user.id));
}
