'use client';

import { useRef, useState } from 'react';
import type { TemplateRenderProps } from '../types';
import styles from './legacy.module.css';

export function LegacyPortfolioTemplate({project,data,preview=false}:TemplateRenderProps){
  const [loaded,setLoaded]=useState(false);
  const frameRef=useRef<HTMLIFrameElement>(null);
  const query=new URLSearchParams({project:project.slug,embed:'v2'});
  if(preview)query.set('preview','draft');

  return <main className={styles.shell} aria-busy={!loaded}>
    {!loaded&&<div className={styles.loader} role="status"><span/><strong>Carregando portfólio</strong></div>}
    {preview&&<div className={styles.preview}>Preview do rascunho · ponte de compatibilidade</div>}
    <iframe
      ref={frameRef}
      className={`${styles.frame} ${loaded?styles.ready:''}`}
      src={`/legacy-portfolio/index.html?${query.toString()}`}
      title={`Portfólio de ${project.name}`}
      onLoad={()=>{setLoaded(true);frameRef.current?.contentWindow?.postMessage({type:'webappcap:v2-public-content',data},window.location.origin)}}
    />
  </main>;
}
