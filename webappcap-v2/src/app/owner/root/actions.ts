'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requirePlatformOwner } from '@/core/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const fields = [
  'hero_eyebrow','hero_title','hero_emphasis','hero_description',
  'marquee_items','process_title','process_description','process_steps','assurances','control_title','control_emphasis','control_description',
  'projects_title','projects_description','project_name','project_description','portfolio_url',
  'services_title','services_description','services','commitments','trust_title','trust_description','faq',
  'contact_kicker','contact_title','contact_emphasis','contact_description','whatsapp','email','footer_tagline',
] as const;

const contentFrom = (formData: FormData) => Object.fromEntries(
  fields.map(key => [key, String(formData.get(key) || '').trim()]),
);

export async function saveRootDraftAction(formData: FormData) {
  await requirePlatformOwner();
  const sb = await createSupabaseServerClient();
  const result = await sb.from('platform_root_content').upsert({
    id: true,
    draft: contentFrom(formData),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' });
  if (result.error) throw result.error;
  revalidatePath('/owner/root');
  revalidatePath('/owner/root/preview');
  redirect('/owner/root?saved=1');
}

export async function publishRootAction() {
  await requirePlatformOwner();
  const sb = await createSupabaseServerClient();
  const current = await sb.from('platform_root_content').select('draft').eq('id', true).maybeSingle();
  if (current.error || !current.data) throw current.error || new Error('Salve um rascunho antes de publicar.');
  const now = new Date().toISOString();
  const result = await sb.from('platform_root_content').update({
    published: current.data.draft || {},
    published_at: now,
    updated_at: now,
  }).eq('id', true);
  if (result.error) throw result.error;
  revalidatePath('/');
  revalidatePath('/owner/root');
  redirect('/owner/root?published=1');
}

export async function logoutRootAction() {
  const sb = await createSupabaseServerClient();
  await sb.auth.signOut();
  redirect('/login');
}
