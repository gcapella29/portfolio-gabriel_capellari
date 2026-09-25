'use client';

import {useEffect} from 'react';

export default function AppError({error,reset}:{error:Error&{digest?:string};reset:()=>void}){
  useEffect(()=>{
    const payload=JSON.stringify({
      kind:'client_error',
      name:error.name||'AppError',
      message:error.message,
      digest:error.digest,
      path:`${location.pathname}${location.search}`
    });
    try{
      if(!navigator.sendBeacon('/api/telemetry',new Blob([payload],{type:'application/json'}))){
        void fetch('/api/telemetry',{method:'POST',headers:{'content-type':'application/json'},body:payload,keepalive:true});
      }
    }catch{}
  },[error]);

  return (
    <main className="error-shell">
      <section className="error-card">
        <span>WebAppCap</span>
        <h1>Algo saiu do esperado.</h1>
        <p>A aplicação encontrou uma falha temporária. Tente novamente sem perder o contexto atual.</p>
        <button type="button" onClick={reset}>Tentar novamente</button>
      </section>
    </main>
  );
}
