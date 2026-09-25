'use client';

import {useEffect,type RefObject} from 'react';

type CommerceMotionVariant='complete'|'sales';

type MotionConfig={
  desktopMin:number;
  cycleGroups:string[];
  cycleMs:number;
  heroSelector:string;
  parallaxVar:string;
  parallaxDistance:number;
  copyShiftVar?:string;
  copyShiftDistance?:number;
};

const COMPLETE_CONFIG:MotionConfig={
  desktopMin:851,
  cycleGroups:['product','story','instagram'],
  cycleMs:2300,
  heroSelector:'#inicio',
  parallaxVar:'--commerce-mobile-parallax',
  parallaxDistance:14,
  copyShiftVar:'--commerce-mobile-copy-shift',
  copyShiftDistance:-3.5
};

const SALES_CONFIG:MotionConfig={
  desktopMin:561,
  cycleGroups:['product'],
  cycleMs:2100,
  heroSelector:'main section',
  parallaxVar:'--sales-mobile-parallax',
  parallaxDistance:12
};

const configFor=(variant:CommerceMotionVariant)=>
  variant==='complete'?COMPLETE_CONFIG:SALES_CONFIG;

export function useCommerceMotion<T extends HTMLElement>(
  rootRef:RefObject<T|null>,
  variant:CommerceMotionVariant
){
  const config=configFor(variant);

  useEffect(()=>{
    const root=rootRef.current;
    if(!root)return;

    const reveal=Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
    root.dataset.motionReady='true';

    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      reveal.forEach(section=>section.dataset.visible='true');
      return;
    }

    let observer:IntersectionObserver|undefined;
    let frameOne=0;
    let frameTwo=0;

    frameOne=requestAnimationFrame(()=>{
      root.getBoundingClientRect();
      frameTwo=requestAnimationFrame(()=>{
        observer=new IntersectionObserver(entries=>{
          entries.forEach(entry=>{
            if(!entry.isIntersecting)return;
            (entry.target as HTMLElement).dataset.visible='true';
            observer?.unobserve(entry.target);
          });
        },{threshold:.12,rootMargin:'0px 0px -10%'});
        reveal.forEach(section=>observer?.observe(section));
      });
    });

    return()=>{
      cancelAnimationFrame(frameOne);
      cancelAnimationFrame(frameTwo);
      observer?.disconnect();
    };
  },[rootRef]);

  useEffect(()=>{
    const root=rootRef.current;
    if(
      !root||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches||
      window.matchMedia(`(max-width: ${config.desktopMin-1}px)`).matches
    )return;

    const indices=new Map<string,number>();
    const paint=(group:string)=>{
      const items=Array.from(root.querySelectorAll<HTMLElement>(`[data-live-cycle="${group}"]`));
      if(!items.length)return;
      const previous=indices.get(group)??-1;
      if(previous>=0&&items[previous])items[previous].dataset.liveActive='false';
      const next=(previous+1)%items.length;
      items[next].dataset.liveActive='true';
      indices.set(group,next);
    };

    config.cycleGroups.forEach(paint);
    const timer=window.setInterval(()=>{
      if(!document.hidden)config.cycleGroups.forEach(paint);
    },config.cycleMs);

    return()=>window.clearInterval(timer);
  },[rootRef,config.desktopMin,config.cycleGroups,config.cycleMs]);

  useEffect(()=>{
    const root=rootRef.current;
    if(
      !root||
      window.matchMedia(`(min-width: ${config.desktopMin}px)`).matches||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )return;

    const spotlight=Array.from(root.querySelectorAll<HTMLElement>('[data-mobile-spotlight]'));
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        (entry.target as HTMLElement).dataset.mobileActive=entry.isIntersecting?'true':'false';
      });
    },{rootMargin:'-34% 0px -34% 0px',threshold:0});

    spotlight.forEach(item=>observer.observe(item));

    let frame=0;
    const paint=()=>{
      frame=0;
      const hero=root.querySelector<HTMLElement>(config.heroSelector);
      if(!hero)return;
      const rect=hero.getBoundingClientRect();
      if(rect.bottom<0||rect.top>window.innerHeight)return;

      const progress=Math.max(-1,Math.min(1,-rect.top/Math.max(rect.height,1)));
      root.style.setProperty(config.parallaxVar,`${progress*config.parallaxDistance}px`);
      if(config.copyShiftVar){
        root.style.setProperty(
          config.copyShiftVar,
          `${progress*(config.copyShiftDistance??0)}px`
        );
      }
    };
    const request=()=>{
      if(!frame)frame=requestAnimationFrame(paint);
    };

    paint();
    window.addEventListener('scroll',request,{passive:true});
    return()=>{
      observer.disconnect();
      window.removeEventListener('scroll',request);
      if(frame)cancelAnimationFrame(frame);
    };
  },[
    rootRef,
    config.copyShiftDistance,
    config.copyShiftVar,
    config.desktopMin,
    config.heroSelector,
    config.parallaxDistance,
    config.parallaxVar
  ]);
}
