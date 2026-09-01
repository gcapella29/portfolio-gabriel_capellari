import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import PasswordForm from './password-form';

export default async function InvitePage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;const sb=await createSupabaseServerClient();const {data}=await sb.auth.getUser();if(!data.user)redirect(`/login?next=${encodeURIComponent(`/invite/${slug}`)}`);
  return <main className="shell"><section className="auth-card"><span className="eyebrow">BEM-VINDO AO WEBAPPCAP</span><h1>Crie sua senha.</h1><p>Depois disso você entra direto na configuração guiada do seu site. Nada de painel vazio ou projeto para selecionar.</p><PasswordForm slug={slug}/></section></main>
}
