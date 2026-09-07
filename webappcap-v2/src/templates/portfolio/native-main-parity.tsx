'use client';

import { useEffect, useRef } from 'react';
import type { TemplateRenderProps } from '../types';
import { NativePortfolioTemplate } from './native';
import motion from './legacy-motion.module.css';

/** Native React/CMS renderer with the interaction grammar of main/index.html. */
export function NativeMainParityPortfolioTemplate(props:TemplateRenderProps){
  const wrapperRef=useRef<HTMLDivElement>(null);
  const glowRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const wrapper=wrapperRef.current;
    const site=wrapper?.firstElementChild as HTMLElement|null;
    if(site)site.classList.add(motion.parity);
    return()=>site?.classList.remove(motion.parity);
  },[]);

  useEffect(()=>{
    const glow=glowRef.current;
    if(!glow||window.matchMedia('(prefers-reduced-motion: reduce)').matches||!window.matchMedia('(hover:hover) and (pointer:fine)').matches)return;
    let frame=0,x=0,y=0;
    const move=(event:PointerEvent)=>{
      x=event.clientX;y=event.clientY;
      if(!frame)frame=window.requestAnimationFrame(()=>{frame=0;glow.style.left=`${x}px`;glow.style.top=`${y}px`});
    };
    window.addEventListener('pointermove',move,{passive:true});
    return()=>{window.removeEventListener('pointermove',move);if(frame)window.cancelAnimationFrame(frame)};
  },[]);

  return <div ref={wrapperRef}>
    <NativePortfolioTemplate {...props}/>
    <div ref={glowRef} className={motion.pointerGlow} aria-hidden="true"/>
  </div>;
}
