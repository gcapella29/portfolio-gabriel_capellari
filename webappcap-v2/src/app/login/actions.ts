'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { safeInternalPath } from '@/core/safe-redirect';

export async function login(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const next = safeInternalPath(formData.get('next'));
  const sb = await createSupabaseServerClient();
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=invalid${next ? `&next=${encodeURIComponent(next)}` : ''}`);
  redirect(next);
}

export async function logout() {
  const sb = await createSupabaseServerClient();
  await sb.auth.signOut();
  redirect('/login');
}
