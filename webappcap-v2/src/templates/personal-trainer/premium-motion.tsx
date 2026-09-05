'use client';

import { useEffect } from 'react';

export function PersonalTrainerPremiumMotion(){
  useEffect(()=>{
    const root=document.querySelector<HTMLElement>('[data-pt-premium-root]');
    if(!root)return;
    const nodes=Array.from(root.querySelectorAll<HTMLElement>('[data-pt-reveal]'));
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if(reduced){nodes.forEach(node=>node.dataset.visible='true');return;}

    root.classList.add('jsMotion');
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          (entry.target as HTMLElement).dataset.visible='true';
          observer.unobserve(entry.target);
        }
      });
    },{threshold:.1,rootMargin:'0px 0px -5% 0px'});
    nodes.forEach(node=>observer.observe(node));

    return()=>observer.disconnect();
  },[]);

  return null;
}
