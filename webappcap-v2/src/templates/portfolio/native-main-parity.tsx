'use client';

import { useEffect, useRef } from 'react';
import type { TemplateRenderProps } from '../types';
import { NativePortfolioTemplate } from './native';
import parity from './portfolio-parity.module.css';

/**
 * Definitive WebAppCap portfolio renderer.
 * Visual and interaction source of truth remains main/index.html until cutover.
 * CMS/data are native; presentation intentionally mirrors the current production site.
 */
export function NativeMainParityPortfolioTemplate(props:TemplateRenderProps){
  const wrapperRef=useRef<HTMLDivElement>(null);
  const glowRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const wrapper=wrapperRef.current;
    const site=wrapper?.firstElementChild as HTMLElement|null;
    if(!site)return;
    site.classList.add(parity.mainParity);

    const targets=[...site.querySelectorAll<HTMLElement>('[data-reveal]')];
    targets.forEach(target=>delete target.dataset.visible);

    let observer:IntersectionObserver|null=null;
    const timer=window.setTimeout(()=>{
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
      site.classList.remove(parity.mainParity);
    };
  },[]);

  useEffect(()=>{
    const glow=glowRef.current;
    if(!glow||!window.matchMedia('(hover:hover) and (pointer:fine)').matches)return;
    let frame=0,x=0,y=0;
    const move=(event:PointerEvent)=>{
      x=event.clientX;y=event.clientY;
      if(!frame)frame=window.requestAnimationFrame(()=>{
        frame=0;
        glow.style.left=`${x}px`;
        glow.style.top=`${y}px`;
      });
    };
    window.addEventListener('pointermove',move,{passive:true});
    return()=>{
      window.removeEventListener('pointermove',move);
      if(frame)window.cancelAnimationFrame(frame);
    };
  },[]);

  return <div ref={wrapperRef}>
    <NativePortfolioTemplate {...props}/>
    <div ref={glowRef} className={parity.pointerGlow} aria-hidden="true"/>
  </div>;
}
