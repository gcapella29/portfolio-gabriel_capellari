'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import styles from './home-projects.module.css';
export function HomeProjectCarousel({children,count}:{children:ReactNode;count:number}){
  const rail=useRef<HTMLDivElement>(null);
  const [index,setIndex]=useState(0);
  useEffect(()=>{
    const node=rail.current;if(!node)return;
    const measure=()=>{
      const left=node.getBoundingClientRect().left;let nearest=0,distance=Infinity;
      Array.from(node.children).forEach((card,i)=>{const delta=Math.abs(card.getBoundingClientRect().left-left-4);if(delta<distance){distance=delta;nearest=i;}});
      setIndex(nearest);
    };
    let frame=0;
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(()=>{frame=0;measure()})};
    node.addEventListener('scroll',schedule,{passive:true});
    const observer=typeof ResizeObserver==='undefined'?null:new ResizeObserver(measure);observer?.observe(node);measure();
    return()=>{node.removeEventListener('scroll',schedule);observer?.disconnect();if(frame)cancelAnimationFrame(frame);};
  },[count]);
  const move=(direction:number)=>{
    const node=rail.current,card=node?.children[Math.max(0,Math.min(count-1,index+direction))] as HTMLElement|undefined;
    if(node&&card)node.scrollTo({left:node.scrollLeft+card.getBoundingClientRect().left-node.getBoundingClientRect().left-4,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  };
  return <div className={styles.carousel}>
    <div className={styles.controls} hidden={count<2}><span aria-live="polite" aria-atomic="true">{Math.min(index+1,count)} de {count} projetos</span><button type="button" aria-label="Projeto anterior" disabled={index===0} onClick={()=>move(-1)}>←</button><button type="button" aria-label="Próximo projeto" disabled={index>=count-1} onClick={()=>move(1)}>→</button></div>
    <div ref={rail} className={styles.stack} role="region" aria-label="Projetos em destaque — deslize para explorar" tabIndex={0}>{children}</div>
  </div>;
}
