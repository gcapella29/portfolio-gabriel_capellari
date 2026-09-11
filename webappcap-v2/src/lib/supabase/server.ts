import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

type CookieOptions = Parameters<Awaited<ReturnType<typeof cookies>>['set']>[2];
type CookieToSet = {
  name: string;
  value: string;
  options?: CookieOptions;
};

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase environment is not configured.');

  return createServerClient(url, key, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(items: CookieToSet[]) {
        try { items.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); }
        catch { /* Server Components cannot always mutate cookies. */ }
      }
    }
  });
}
