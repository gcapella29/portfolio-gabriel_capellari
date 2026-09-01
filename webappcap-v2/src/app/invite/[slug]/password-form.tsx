'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export default function PasswordForm({slug}:{slug:string}){
  const router=useRouter(),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();setError('');setBusy(true);const form=new FormData(event.currentTarget),password=String(form.get('password')||''),confirm=String(form.get('confirm')||'');
    if(password.length<8){setError('Use pelo menos 8 caracteres.');setBusy(false);return}if(password!==confirm){setError('As senhas não coincidem.');setBusy(false);return}
    const sb=createSupabaseBrowserClient();const result=await sb.auth.updateUser({password});if(result.error){setError(result.error.message);setBusy(false);return}
    router.replace(`/setup/${encodeURIComponent(slug)}/account`);router.refresh();
  }
  return <form className="form-stack" onSubmit={submit}><label className="field"><span>Nova senha</span><input name="password" type="password" minLength={8} autoComplete="new-password" required /></label><label className="field"><span>Confirmar senha</span><input name="confirm" type="password" minLength={8} autoComplete="new-password" required /></label>{error&&<div className="form-error">{error}</div>}<button className="action primary" disabled={busy}>{busy?'Salvando…':'Criar senha e configurar meu site'}</button></form>
}
