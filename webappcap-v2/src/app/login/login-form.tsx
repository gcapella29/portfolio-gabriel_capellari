'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

export default function LoginForm(){
  const router=useRouter(),params=useSearchParams(),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();setBusy(true);setError('');
    const form=new FormData(event.currentTarget),email=String(form.get('email')||'').trim(),password=String(form.get('password')||'');
    const sb=createSupabaseBrowserClient();const result=await sb.auth.signInWithPassword({email,password});
    if(result.error){setError('E-mail ou senha inválidos.');setBusy(false);return}
    const next=params.get('next');router.replace(next?.startsWith('/')?next:'/entry');router.refresh();
  }
  return <form className="form-stack" onSubmit={submit}><label className="field"><span>E-mail</span><input name="email" type="email" autoComplete="email" required /></label><label className="field"><span>Senha</span><input name="password" type="password" autoComplete="current-password" required /></label>{error&&<div className="form-error">{error}</div>}<button className="action primary" disabled={busy}>{busy?'Entrando…':'Entrar'}</button></form>
}
