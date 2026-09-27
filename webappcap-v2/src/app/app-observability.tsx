'use client';

import {useEffect} from 'react';
import {useReportWebVitals} from 'next/web-vitals';

type TelemetryPayload={
  kind:'client_error'|'unhandled_rejection'|'web_vital';
  name:string;
  message?:string;
  digest?:string;
  value?:number;
  rating?:string;
  path:string;
};

const endpoint='/api/telemetry';

function send(payload:TelemetryPayload){
  try{
    const body=JSON.stringify(payload);
    if(navigator.sendBeacon){
      const sent=navigator.sendBeacon(endpoint,new Blob([body],{type:'application/json'}));
      if(sent)return;
    }
    void fetch(endpoint,{
      method:'POST',
      headers:{'content-type':'application/json'},
      body,
      keepalive:true,
      credentials:'same-origin'
    }).catch(()=>{});
  }catch{}
}

const clean=(value:unknown,max=500)=>String(value||'').replace(/[\u0000-\u001f\u007f]/g,' ').slice(0,max);

export default function AppObservability(){
  useReportWebVitals(metric=>{
    // Keep runtime logging useful instead of flooding Vercel with healthy samples.
    if(metric.rating!=='poor')return;
    send({
      kind:'web_vital',
      name:clean(metric.name,80),
      value:Number(metric.value.toFixed(3)),
      rating:metric.rating,
      path:`${location.pathname}${location.search}`.slice(0,500)
    });
  });

  useEffect(()=>{
    const onError=(event:ErrorEvent)=>{
      send({
        kind:'client_error',
        name:clean(event.error?.name||'Error',80),
        message:clean(event.message||event.error?.message),
        path:`${location.pathname}${location.search}`.slice(0,500)
      });
    };
    const onRejection=(event:PromiseRejectionEvent)=>{
      const reason=event.reason;
      send({
        kind:'unhandled_rejection',
        name:clean(reason instanceof Error?reason.name:'PromiseRejection',80),
        message:clean(reason instanceof Error?reason.message:reason),
        path:`${location.pathname}${location.search}`.slice(0,500)
      });
    };
    window.addEventListener('error',onError);
    window.addEventListener('unhandledrejection',onRejection);
    return()=>{
      window.removeEventListener('error',onError);
      window.removeEventListener('unhandledrejection',onRejection);
    };
  },[]);

  return null;
}
