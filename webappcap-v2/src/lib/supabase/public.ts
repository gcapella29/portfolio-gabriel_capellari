import {createClient} from '@supabase/supabase-js';

export function createSupabasePublicClient(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(!url||!key)throw new Error('Supabase environment is not configured.');

  // Public rendering must not depend on request cookies/session state.
  // This makes the resolver safe to use inside Next.js data caches.
  return createClient(url,key,{
    auth:{
      persistSession:false,
      autoRefreshToken:false,
      detectSessionInUrl:false
    }
  });
}
