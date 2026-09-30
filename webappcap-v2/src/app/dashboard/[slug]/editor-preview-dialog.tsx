'use client';

import {useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import styles from './editor-preview-dialog.module.css';

export default function EditorPreviewDialog({
 open,
 previewUrl,
 onClose,
 stale=false,
 title='Preview do rascunho'
}:{
 open:boolean;
 previewUrl:string;
 onClose:()=>void;
 stale?:boolean;
 title?:string;
}){
 const [mode,setMode]=useState<'desktop'|'mobile'>('desktop');
 const [tick,setTick]=useState(()=>Date.now());

 useEffect(()=>{
  if(!open)return;
  setTick(Date.now());
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose()};
  window.addEventListener('keydown',escape);
  return()=>window.removeEventListener('keydown',escape);
 },[open,onClose]);

 if(!open||typeof document==='undefined')return null;
 const join=previewUrl.includes('?')?'&':'?';
 const src=`${previewUrl}${join}draft=${tick}`;

 return createPortal(<div className={styles.overlay} role="dialog" aria-modal="true" aria-label={title}>
  <button type="button" className={styles.backdrop} aria-label="Fechar preview" onClick={onClose}/>
  <section className={styles.panel}>
   <header className={styles.toolbar}>
    <div><strong>{title}</strong><small>{stale?'Há alterações não salvas — o preview mostra o último rascunho salvo.':'Visualizando o rascunho salvo.'}</small></div>
    <div className={styles.actions}>
     <div className={styles.device} role="group" aria-label="Largura do preview">
      <button type="button" aria-pressed={mode==='desktop'} onClick={()=>setMode('desktop')}>Desktop</button>
      <button type="button" aria-pressed={mode==='mobile'} onClick={()=>setMode('mobile')}>Mobile</button>
     </div>
     <button type="button" onClick={()=>setTick(Date.now())}>Atualizar</button>
     <a href={src} target="_blank" rel="noopener noreferrer">Nova guia ↗</a>
     <button type="button" onClick={onClose}>Fechar</button>
    </div>
   </header>
   <div className={styles.stage} data-mode={mode}><iframe key={tick} src={src} title={title}/></div>
  </section>
 </div>,document.body);
}
