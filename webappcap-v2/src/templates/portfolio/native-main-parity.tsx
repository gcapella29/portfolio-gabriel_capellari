'use client';

import { useEffect, useRef } from 'react';
import type { TemplateRenderProps } from '../types';
import { NativePortfolioTemplate } from './native';
import { SiteAnalytics } from '../site-analytics';
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

    return()=>{site.classList.remove(parity.mainParity)};
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
    {!props.preview?<SiteAnalytics projectId={props.project.id}/>:null}
    <div ref={glowRef} className={parity.pointerGlow} aria-hidden="true"/>
  </div>;
}
