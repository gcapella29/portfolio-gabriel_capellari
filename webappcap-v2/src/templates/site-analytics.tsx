'use client';

import { useEffect } from 'react';

const sessionKey='webappcap-analytics-session';
const eventFor=(anchor:HTMLAnchorElement)=>{
  const href=anchor.href.toLowerCase();
  if(href.includes('wa.me')||href.includes('whatsapp'))return'whatsapp_click';
  if(href.includes('instagram.com'))return'instagram_click';
  if(href.includes('linkedin.com'))return'linkedin_click';
  if(href.startsWith('mailto:'))return'email_click';
  if(href.includes('.pdf')||anchor.hasAttribute('download'))return'cv_click';
  if(anchor.hash==='#contato')return'contact_click';
  try{return new URL(anchor.href).host!==window.location.host?'external_click':null}catch{return null}
};

export function SiteAnalytics({projectId}:{projectId:string}){
  useEffect(()=>{
    let sessionId=crypto.randomUUID();
    try{const stored=sessionStorage.getItem(sessionKey);if(stored)sessionId=stored;else sessionStorage.setItem(sessionKey,sessionId)}catch{/* Analytics still works when storage is blocked. */}
    const send=(eventType:string,eventLabel?:string)=>{
      let referrerHost='';try{referrerHost=document.referrer?new URL(document.referrer).host:''}catch{}
      const payload=JSON.stringify({projectId,eventType,eventLabel,path:`${location.pathname}${location.search}`,referrerHost,sessionId});
      fetch('/api/analytics',{method:'POST',headers:{'Content-Type':'application/json'},body:payload,keepalive:true}).catch(()=>{});
    };
    send('page_view',document.title);
    const click=(event:MouseEvent)=>{const anchor=event.composedPath().find((node):node is HTMLAnchorElement=>node instanceof HTMLAnchorElement) || (event.target instanceof Element?event.target.closest('a'):null);if(!anchor)return;const type=eventFor(anchor);if(type)send(type,anchor.textContent?.trim().slice(0,160))};
    document.addEventListener('click',click,{capture:true});
    return()=>document.removeEventListener('click',click,{capture:true});
  },[projectId]);
  return null;
}
