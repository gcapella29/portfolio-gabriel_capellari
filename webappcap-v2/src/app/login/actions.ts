'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function login(formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const next = String(formData.get('next') || '/entry');
  const sb = await createSupabaseServerClient();
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) redirect(`/login?error=invalid${next ? `&next=${encodeURIComponent(next)}` : ''}`);
  redirect(next.startsWith('/') ? next : '/entry');
}

export async function logout() {
  const sb = await createSupabaseServerClient();
  await sb.auth.signOut();
  redirect('/login');
}
