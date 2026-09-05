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
      form.reset(); setStatus('success');
    }catch{setStatus('error')}
  }

  if(status==='success')return <div className={styles.success} role="status"><span>✓</span><small>Solicitação recebida</small><h3>Seu próximo passo já começou.</h3><p>Os dados foram enviados. O contato será feito pelo WhatsApp informado.</p></div>;

  return <form className={styles.form} onSubmit={submit}>
    <div className={styles.formHead}><span>Ficha / 001</span><h3>Solicitação de acompanhamento</h3><p>Três informações para iniciar a conversa.</p></div>
    {status==='error'&&<div className={styles.alert} role="alert">Não foi possível enviar agora. Tente novamente ou use o WhatsApp.</div>}
    <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{position:'absolute',left:'-9999px',width:'1px',height:'1px',opacity:0}}/>
    <label><b>01</b><span>Nome *</span><input name="name" required maxLength={120} autoComplete="name" placeholder="Seu nome"/></label>
    <label><b>02</b><span>WhatsApp *</span><input name="phone" required maxLength={40} inputMode="tel" autoComplete="tel" placeholder="(16) 99999-9999"/></label>
    <label><b>03</b><span>Objetivo principal *</span><textarea name="message" required maxLength={1000} rows={4} placeholder="O que você quer alcançar com o acompanhamento?"/></label>
    <button type="submit" disabled={status==='sending'}>{status==='sending'?'Enviando ficha...':'Solicitar contato →'}</button>
    <p className={styles.privacy}>Dados utilizados somente para contato sobre o acompanhamento.</p>
  </form>;
}
