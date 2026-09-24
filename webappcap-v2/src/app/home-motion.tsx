'use client';

import { useEffect } from 'react';

export function HomeMotion(){
  useEffect(()=>{
    const root=document.querySelector<HTMLElement>('[data-home-root]');
    if(!root)return;

    const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealItems=Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
    root.dataset.motionReady='true';

    // This experimental branch was explicitly requested as a motion-heavy
    // experience. Even if the browser reports reduced motion, we keep the
    // coordinated storytelling running and expose the state on the root so
    // CSS can opt the signature animations back in.
    if(reducedMotion){
      root.dataset.motionForce='true';
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

    // Shared narrative phase: IDEA -> DESIGN -> PREVIEW -> LIVE.
    // One small timer drives several sections so the homepage feels
    // coordinated rather than full of unrelated animations.
    const phaseItems=Array.from(root.querySelectorAll<HTMLElement>('[data-motion-phase-item]'));
    const processItems=Array.from(root.querySelectorAll<HTMLElement>('[data-motion-process]'));
    const demoItems=Array.from(root.querySelectorAll<HTMLElement>('[data-motion-demo]'));
    const demoPhase=['edit','edit','preview','publish'];
    let phase=0;

    function paintPhase(){
      if(!root)return;
      root.dataset.motionPhase=String(phase);
      phaseItems.forEach((item,index)=>{item.dataset.motionActive=String(index===phase)});
      processItems.forEach((item,index)=>{item.dataset.motionActive=String(index===phase)});
      demoItems.forEach(item=>{item.dataset.motionActive=String(item.dataset.motionDemo===demoPhase[phase])});
    }

    paintPhase();
    const phaseTimer=window.setInterval(()=>{
      phase=(phase+1)%4;
      paintPhase();
    },2200);

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
      window.clearInterval(phaseTimer);
      if(frame)window.cancelAnimationFrame(frame);
    };
  },[]);

  return null;
}
