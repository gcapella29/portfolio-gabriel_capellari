'use client';

import { useEffect } from 'react';

export function HomeMotion(){
  useEffect(()=>{
    const root=document.querySelector<HTMLElement>('[data-home-root]');
    if(!root)return;

    const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealItems=Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
    root.dataset.motionReady='true';

    if(reducedMotion){
      revealItems.forEach(item=>{item.dataset.visible='true'});
      root.style.setProperty('--home-scroll-progress','1');
      return;
    }

    revealItems.forEach(item=>{
      const delay=Number(item.dataset.revealDelay||0);
      item.style.setProperty('--reveal-delay',`${delay}ms`);
    });

    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting)return;
        (entry.target as HTMLElement).dataset.visible='true';
        observer.unobserve(entry.target);
      });
    },{rootMargin:'0px 0px -9% 0px',threshold:.12});

    revealItems.forEach(item=>observer.observe(item));

    let frame=0;
    function updateProgress(){
      frame=0;
      const available=document.documentElement.scrollHeight-window.innerHeight;
      const progress=available>0?Math.min(1,Math.max(0,window.scrollY/available)):0;
      root?.style.setProperty('--home-scroll-progress',String(progress));
    }
    function requestProgress(){
      if(frame)return;
      frame=window.requestAnimationFrame(updateProgress);
    }
    updateProgress();
    window.addEventListener('scroll',requestProgress,{passive:true});
    window.addEventListener('resize',requestProgress,{passive:true});

    return ()=>{
      observer.disconnect();
      window.removeEventListener('scroll',requestProgress);
      window.removeEventListener('resize',requestProgress);
      if(frame)window.cancelAnimationFrame(frame);
    };
  },[]);

  return null;
}
