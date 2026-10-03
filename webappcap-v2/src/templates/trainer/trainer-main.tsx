'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {trainerData,trainerImage,trainerImageStyle} from '@/core/trainer-content';
import type {TemplateRenderProps} from '../types';
import {TrainerContext} from './context';
import {Nav,Hero} from './Header';
import Agenda from './Agenda';
import Cases from './Cases';
import {Method,Plans,Faq,Final,Footer,Dock} from './Sections';

export function PersonalTrainerMainTemplate({project,data}:TemplateRenderProps){
 const host=useRef<HTMLDivElement>(null),documentRoot=useRef<HTMLDivElement>(null);
 const [mount,setMount]=useState<HTMLDivElement|null>(null);
 useEffect(()=>{
  if(!host.current)return;
  const shadow=host.current.shadowRoot||host.current.attachShadow({mode:'open'});
  const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href='/templates/personal-trainer/styles.css';
  const refinements=document.createElement('link');refinements.rel='stylesheet';refinements.href='/templates/personal-trainer/refinements.css';
  const bridge=document.createElement('style');bridge.textContent=`:host{display:block}.trainer-document{--bg:#ebe8e1;--card:#f7f5f0;--ink:#141414;--muted:#5d5a54;--acc:#ff5a1f;--ok:#17924d;--line:rgba(20,20,20,.14);--max:1160px;--head:"Barlow Condensed","Arial Narrow",Impact,sans-serif;--body:"Barlow",system-ui,-apple-system,"Segoe UI",sans-serif;margin:0;background:var(--bg);color:var(--ink);font-family:var(--body);line-height:1.5;-webkit-font-smoothing:antialiased}.trainer-document section,.trainer-document header{scroll-margin-top:72px}@media(max-width:700px){.trainer-document{padding-bottom:76px}}@media(prefers-reduced-motion:reduce){.trainer-document *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}`;
  const target=document.createElement('div');shadow.append(sheet,bridge,refinements,target);setMount(target);
  let font=document.querySelector<HTMLLinkElement>('link[data-personal-trainer-font]');
  if(!font){font=document.createElement('link');font.rel='stylesheet';font.href='/fonts/personal-trainer.60ee1d8f57c1.css';font.dataset.personalTrainerFont='';document.head.appendChild(font)}
  font.dataset.users=String(Number(font.dataset.users||0)+1);
  return()=>{sheet.remove();bridge.remove();refinements.remove();target.remove();font.dataset.users=String(Number(font.dataset.users||1)-1);if(font.dataset.users==='0')font.remove()};
 },[]);
 const model=useMemo(()=>{
  const content=trainerData(data.content),number=String(data.contact.whatsapp||'').replace(/\D/g,'');
  return {...content,name:String(data.identity.name||project.name),cref:String(data.content.trainer_cref||''),portrait:trainerImage(data.media.hero),portraitStyle:trainerImageStyle(data.media.hero),wa:(message:string)=>/^\d{10,15}$/.test(number)?`https://wa.me/${number}?text=${encodeURIComponent(message)}`:undefined};
 },[data.content,data.identity.name,data.contact.whatsapp,data.media.hero,project.name]);
 useEffect(()=>{
  const root=documentRoot.current;if(!root||!mount)return;
  if(!('IntersectionObserver'in window)){root.querySelectorAll('[data-reveal]').forEach(el=>el.classList.add('in'));return}
  const observer=new IntersectionObserver((list,obs)=>list.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in');obs.unobserve(entry.target)}}),{threshold:0,rootMargin:'0px 0px -5% 0px'});
  root.querySelectorAll('[data-reveal]').forEach(el=>observer.observe(el));return()=>observer.disconnect();
 },[mount,model.lists]);
 useEffect(()=>{
  const root=documentRoot.current;if(!root||!mount)return;
  const dock=root.querySelector<HTMLElement>('.dock'),nav=root.querySelector<HTMLElement>('.nav');
  const measure=()=>{if(dock)root.style.setProperty('--dock-height',`${Math.ceil(dock.getBoundingClientRect().height)}px`);if(nav)root.style.setProperty('--nav-height',`${Math.ceil(nav.getBoundingClientRect().height)}px`)};
  measure();
  if(typeof ResizeObserver!=='undefined'){const observer=new ResizeObserver(measure);if(dock)observer.observe(dock);if(nav)observer.observe(nav);return()=>observer.disconnect()}
  window.addEventListener('resize',measure);return()=>window.removeEventListener('resize',measure);
 },[mount]);
 const t=model.states[model.agenda];
 return <div ref={host}>{mount?createPortal(<TrainerContext.Provider value={model}><div ref={documentRoot} className="trainer-document js" data-agenda={model.agenda}><Nav t={t}/><Hero t={t}/><Agenda t={t} agenda={model.agenda}/><Method/><Cases/><Plans t={t}/><Faq/><Final t={t}/><Footer/><Dock t={t}/></div></TrainerContext.Provider>,mount):null}</div>;
}
