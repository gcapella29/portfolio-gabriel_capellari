'use client';

import { useEffect } from 'react';

export function PersonalTrainerPremiumMotion(){
  useEffect(()=>{
    const root=document.querySelector<HTMLElement>('[data-pt-premium-root]');
    const nodes=Array.from(document.querySelectorAll<HTMLElement>('[data-pt-reveal]'));
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if(reduced){nodes.forEach(node=>node.dataset.visible='true');return;}

    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          (entry.target as HTMLElement).dataset.visible='true';
          observer.unobserve(entry.target);
        }
      });
    },{threshold:.12,rootMargin:'0px 0px -7% 0px'});
    nodes.forEach(node=>observer.observe(node));

    const onPointer=(event:PointerEvent)=>{
      if(!root)return;
      root.style.setProperty('--pt-mx',`${event.clientX}px`);
      root.style.setProperty('--pt-my',`${event.clientY}px`);
    };
    window.addEventListener('pointermove',onPointer,{passive:true});
    return()=>{observer.disconnect();window.removeEventListener('pointermove',onPointer)};
  },[]);

  return null;
}
