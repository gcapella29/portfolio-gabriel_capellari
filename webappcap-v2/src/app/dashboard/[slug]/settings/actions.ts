'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { can } from '@/core/permissions';
import { saveProjectDomains, verifyProjectCustomDomain } from '@/core/project-domains';
import { resolveProjectAccess } from '@/core/session';

const text = (form: FormData, key: string) => String(form.get(key) || '').trim();
const settingsPath = (slug: string) => `/dashboard/${encodeURIComponent(slug)}/settings`;

export async function saveSettingsAction(formData: FormData) {
  const slug = text(formData, 'slug');
  const access = await resolveProjectAccess(slug);
  if (!can(access.role, 'manageDomain')) throw new Error('Sem permissão para editar o domínio.');

  const result = await saveProjectDomains({
    projectId: access.project.id,
    nativeSubdomain: text(formData, 'nativeSubdomain'),
    customDomain: text(formData, 'customDomain')
  });

  revalidatePath(settingsPath(slug));
  redirect(`${settingsPath(slug)}?saved=1&vercel=${result.vercel}`);
}

export async function validateDomainAction(formData: FormData) {
  const slug = text(formData, 'slug');
  const access = await resolveProjectAccess(slug);
  if (!can(access.role, 'manageDomain')) throw new Error('Sem permissão para validar domínio.');

  const result = await verifyProjectCustomDomain(access.project.id);
  revalidatePath(settingsPath(slug));
  redirect(`${settingsPath(slug)}?domain=${result.status}`);
}
