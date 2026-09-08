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
    },{threshold:.12,rootMargin:'0px 0px -8% 0px'});
    nodes.forEach(node=>observer.observe(node));

    const hero=root.querySelector<HTMLElement>('[class*="heroMedia"]');
    const heroCopy=root.querySelector<HTMLElement>('[class*="heroCopy"]');
    const evidence=root.querySelector<HTMLElement>('[class*="evidenceMedia"] img');
    const featureImages=Array.from(root.querySelectorAll<HTMLElement>('[class*="featureMedia"] img'));
    const trainerImage=root.querySelector<HTMLElement>('[class*="trainerMedia"] img');
    const tape=root.querySelector<HTMLElement>('[class*="tapeTrack"]');
    let frame=0;

    const render=()=>{
      frame=0;
      const y=window.scrollY;
      const vh=window.innerHeight;
      if(hero){const p=Math.min(1,y/Math.max(vh,1));hero.style.transform=`translate3d(0,${p*7}%,0) scale(${1.035+p*.035})`;}
      if(heroCopy){const p=Math.min(1,y/Math.max(vh*.9,1));heroCopy.style.transform=`translate3d(0,${p*42}px,0)`;heroCopy.style.opacity=String(1-p*.42);}
      const parallax=(el:HTMLElement|null,factor:number)=>{if(!el)return;const r=el.getBoundingClientRect();if(r.bottom<0||r.top>vh)return;const center=r.top+r.height/2-vh/2;el.style.transform=`translate3d(0,${center*factor}px,0) scale(1.055)`;};
      parallax(evidence,.035);
      featureImages.forEach((el,i)=>parallax(el,i%2?.025:.04));
      parallax(trainerImage,.03);
      if(tape)tape.style.setProperty('--scroll-shift',`${Math.min(y*.025,90)}px`);
    };
    const onScroll=()=>{if(!frame)frame=requestAnimationFrame(render);};
    render();
    window.addEventListener('scroll',onScroll,{passive:true});

    const magnetic=Array.from(root.querySelectorAll<HTMLElement>('a'));
    const cleanups: Array<()=>void>=[];
    magnetic.forEach(el=>{
      const move=(event:PointerEvent)=>{if(event.pointerType==='touch')return;const r=el.getBoundingClientRect();const x=(event.clientX-r.left-r.width/2)*.08;const y=(event.clientY-r.top-r.height/2)*.12;el.style.transform=`translate3d(${x}px,${y}px,0)`;};
      const leave=()=>{el.style.transform='';};
      el.addEventListener('pointermove',move);el.addEventListener('pointerleave',leave);
      cleanups.push(()=>{el.removeEventListener('pointermove',move);el.removeEventListener('pointerleave',leave);});
    });

    return()=>{observer.disconnect();window.removeEventListener('scroll',onScroll);if(frame)cancelAnimationFrame(frame);cleanups.forEach(fn=>fn());};
  },[]);

  return null;
}
