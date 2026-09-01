import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { entryDestination } from '@/core/session';

export default async function EntryPage() {
  const sb = await createSupabaseServerClient();
  const { data } = await sb.auth.getUser();
  if (!data.user) redirect('/login');
  redirect(await entryDestination(data.user.id));
}
