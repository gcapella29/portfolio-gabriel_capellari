'use client';

import {useEffect} from 'react';

export default function TenantError({
  error,
  reset
}:{
  error:Error&{digest?:string};
  reset:()=>void;
}){
  useEffect(()=>{
    // Keep the public page usable and make the failure visible in deployment logs.
    const payload=JSON.stringify({
      kind:'client_error',
      name:error.name||'TenantError',
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
    <main style={{
      minHeight:'100dvh',
      display:'grid',
      placeItems:'center',
      padding:'24px',
      background:'#f7f8fa',
      color:'#111820',
      fontFamily:'Arial, sans-serif'
    }}>
      <section style={{
        width:'min(100%, 440px)',
        padding:'28px',
        border:'1px solid #dde3ea',
        borderRadius:'22px',
        background:'#fff',
        boxShadow:'0 18px 50px rgba(20,31,43,.08)',
        textAlign:'center'
      }}>
        <strong style={{display:'block',fontSize:'12px',letterSpacing:'.08em',textTransform:'uppercase',color:'#718096'}}>
          WebAppCap
        </strong>
        <h1 style={{margin:'10px 0 8px',fontSize:'28px',lineHeight:1.05}}>Não conseguimos carregar a página.</h1>
        <p style={{margin:'0 0 18px',color:'#5f6874',fontSize:'14px',lineHeight:1.55}}>
          Pode ser uma falha temporária de conexão. Tente novamente.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            minHeight:'46px',
            padding:'0 20px',
            border:0,
            borderRadius:'999px',
            background:'#111820',
            color:'#fff',
            fontWeight:800,
            cursor:'pointer'
          }}
        >
          Recarregar
        </button>
      </section>
    </main>
  );
}
