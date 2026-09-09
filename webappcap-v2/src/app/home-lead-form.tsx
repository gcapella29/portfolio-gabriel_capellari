'use client';

import { useState, type FormEvent } from 'react';
import styles from './home.module.css';

type SubmitState='idle'|'sending'|'success'|'error';

export function HomeLeadForm(){
  const [state,setState]=useState<SubmitState>('idle');

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(state==='sending')return;
    setState('sending');
    const form=event.currentTarget;
    const values=new FormData(form);
    const siteType=String(values.get('siteType')||'').trim();
    const email=String(values.get('email')||'').trim();
    const details=String(values.get('details')||'').trim();
    const payload=new FormData();
    payload.set('projectSlug','gabriel-capellari');
    payload.set('name',String(values.get('name')||''));
    payload.set('phone',String(values.get('phone')||''));
    payload.set('website',String(values.get('website')||''));
    payload.set('message',`[Contato pela raiz do WebAppCap]\nTipo de site: ${siteType}\nE-mail: ${email||'não informado'}\nProjeto: ${details}`);
    try{
      const response=await fetch('/api/leads',{method:'POST',body:payload});
      if(!response.ok)throw new Error('submit_failed');
      form.reset();
      setState('success');
    }catch{
      setState('error');
    }
  }

  if(state==='success')return <div className={styles.formSuccess} role="status">
    <span>✓</span>
    <small>Mensagem recebida</small>
    <h3>Sua ideia já deu o primeiro passo.</h3>
    <p>Vou analisar o que você enviou e retornar pelo WhatsApp informado.</p>
  </div>;

  return <form className={styles.leadForm} onSubmit={submit} aria-labelledby="home-lead-title">
    <div className={styles.formHead}>
      <span>BRIEFING / 001</span>
      <h3 id="home-lead-title">Conte um pouco sobre sua ideia.</h3>
      <p>Leva menos de dois minutos. Sem compromisso.</p>
    </div>
    {state==='error'&&<div className={styles.formAlert} role="alert">Não foi possível enviar agora. Tente novamente ou fale pelo WhatsApp.</div>}
    <input className={styles.honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"/>
    <div className={styles.formRow}>
      <label><span>Nome *</span><input name="name" required minLength={2} maxLength={120} autoComplete="name" placeholder="Como podemos chamar você?"/></label>
      <label><span>WhatsApp *</span><input name="phone" required maxLength={40} inputMode="tel" autoComplete="tel" placeholder="(16) 99999-9999"/></label>
    </div>
    <div className={styles.formRow}>
      <label><span>E-mail</span><input name="email" type="email" maxLength={160} autoComplete="email" placeholder="voce@email.com"/></label>
      <label><span>Tipo de site *</span><select name="siteType" required defaultValue=""><option value="" disabled>Selecione uma opção</option><option>Portfólio profissional</option><option>Negócio local</option><option>Personal trainer</option><option>Professor ou escola</option><option>Outro projeto</option></select></label>
    </div>
    <label><span>O que você quer colocar no ar? *</span><textarea name="details" required minLength={10} maxLength={700} rows={5} placeholder="Conte sobre seu trabalho, seu objetivo e o que gostaria de mostrar no site."/></label>
    <label className={styles.formConsent}><input name="consent" type="checkbox" required/><span>Autorizo o uso destes dados somente para retorno sobre este projeto.</span></label>
    <button type="submit" disabled={state==='sending'}>{state==='sending'?'Enviando briefing…':'Quero tirar minha ideia do papel →'}</button>
    <p className={styles.formPrivacy}>Seus dados não serão compartilhados.</p>
  </form>;
}
