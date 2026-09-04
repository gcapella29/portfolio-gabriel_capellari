'use client';

import { useState, type FormEvent } from 'react';
import styles from './performance.module.css';

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

  return <form className={styles.ptLeadForm} onSubmit={submit}>
    <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{position:'absolute',left:'-9999px',width:'1px',height:'1px',opacity:0}}/>
    <label><span>Nome</span><input name="name" required maxLength={120} autoComplete="name" placeholder="Seu nome"/></label>
    <label><span>WhatsApp</span><input name="phone" required maxLength={40} inputMode="tel" autoComplete="tel" placeholder="(16) 99999-9999"/></label>
    <label className={styles.ptLeadMessage}><span>Objetivo</span><textarea name="message" required maxLength={1000} rows={4} placeholder="Conte brevemente o que você busca no acompanhamento."/></label>
    <button type="submit" disabled={status==='sending'}>{status==='sending'?'Enviando...':'Quero começar →'}</button>
    <div className={styles.ptLeadFeedback} aria-live="polite">{status==='success'&&'Recebido! Entraremos em contato pelo WhatsApp.'}{status==='error'&&'Não foi possível enviar agora. Tente novamente ou fale pelo WhatsApp.'}</div>
  </form>;
}
