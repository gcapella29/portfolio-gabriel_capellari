'use client';

import { useState, type FormEvent } from 'react';
import styles from './lead-form.module.css';

type Status='idle'|'sending'|'success'|'error';

export function PersonalTrainerLeadForm({projectId}:{projectId:string}){
  const [status,setStatus]=useState<Status>('idle');

  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(status==='sending')return;
    setStatus('sending');
    const form=event.currentTarget;
    const data=new FormData(form);
    data.set('projectId',projectId);
    try{
      const response=await fetch('/api/leads',{method:'POST',body:data});
      if(!response.ok)throw new Error('Falha ao enviar');
      form.reset();
      setStatus('success');
    }catch{
      setStatus('error');
    }
  }

  return <form className={styles.form} onSubmit={submit}>
    <div className={styles.formHead}>
      <div><span>Contato direto</span><h3>Fale comigo agora</h3><p>Preencha os dados e receba meu retorno em breve.</p></div>
      <div className={styles.quick}><b>↯</b><div><strong>Resposta rápida</strong><small>Retorno pelo WhatsApp</small></div></div>
    </div>
    {status==='error'&&<div className={`${styles.alert} ${styles.alertError}`} role="alert"><b>!</b><div><strong>Não foi possível enviar agora.</strong><span>Tente novamente ou fale diretamente pelo WhatsApp.</span></div></div>}
    {status==='success'&&<div className={`${styles.alert} ${styles.alertSuccess}`} role="status"><b>✓</b><div><strong>Mensagem recebida.</strong><span>Entraremos em contato pelo WhatsApp.</span></div></div>}
    <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{position:'absolute',left:'-9999px',width:'1px',height:'1px',opacity:0}}/>
    <label><span>Nome *</span><input name="name" required maxLength={120} autoComplete="name" placeholder="Seu nome"/></label>
    <label><span>WhatsApp *</span><input name="phone" required maxLength={40} inputMode="tel" autoComplete="tel" placeholder="(16) 99999-9999"/></label>
    <label className={styles.message}><span>Objetivo *</span><textarea name="message" required maxLength={1000} rows={5} placeholder="Conte brevemente o que você busca no acompanhamento."/></label>
    <button type="submit" disabled={status==='sending'}>{status==='sending'?'Enviando...':'Quero começar agora →'}</button>
    <p className={styles.privacy}>Seus dados serão usados apenas para entrar em contato sobre o acompanhamento.</p>
  </form>;
}
