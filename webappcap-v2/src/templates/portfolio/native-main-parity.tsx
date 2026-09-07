'use client';

import { useEffect, useRef } from 'react';
import type { TemplateRenderProps } from '../types';
import { NativePortfolioTemplate } from './native';
import motion from './legacy-motion.module.css';
import compat from './main-motion-compat.module.css';

/** Native React/CMS renderer with the interaction grammar of main/index.html. */
export function NativeMainParityPortfolioTemplate(props:TemplateRenderProps){
  const wrapperRef=useRef<HTMLDivElement>(null);
  const glowRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const wrapper=wrapperRef.current;
    const site=wrapper?.firstElementChild as HTMLElement|null;
    if(!site)return;
    site.classList.add(motion.parity,compat.forceMotion);

    /* Source of truth: main/index.html. Do not gate reveals behind
       prefers-reduced-motion here: main only disables smooth scrolling. */
    const targets=[...site.querySelectorAll<HTMLElement>('[data-reveal]')];
    targets.forEach(target=>delete target.dataset.visible);

    let observer:IntersectionObserver|null=null;
    let timer=window.setTimeout(()=>{
      if(!('IntersectionObserver' in window)){
        targets.forEach(target=>target.dataset.visible='true');
        return;
      }
      observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
        if(entry.isIntersecting){
          (entry.target as HTMLElement).dataset.visible='true';
          observer?.unobserve(entry.target);
        }
      }),{threshold:.14,rootMargin:'0px 0px -60px 0px'});
      targets.forEach(target=>observer?.observe(target));
    },50);

    return()=>{
      window.clearTimeout(timer);
      observer?.disconnect();
      site.classList.remove(motion.parity,compat.forceMotion);
    };
  },[]);

  useEffect(()=>{
    const glow=glowRef.current;
    if(!glow||!window.matchMedia('(hover:hover) and (pointer:fine)').matches)return;
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
