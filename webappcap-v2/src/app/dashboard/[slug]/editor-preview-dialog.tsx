'use client';

import {useEffect,useRef,useState} from 'react';
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
 const panelRef=useRef<HTMLElement>(null),closeRef=useRef<HTMLButtonElement>(null),onCloseRef=useRef(onClose);
 useEffect(()=>{onCloseRef.current=onClose},[onClose]);
 const [mode,setMode]=useState<'desktop'|'mobile'>('desktop');
 const [tick,setTick]=useState(()=>Date.now());

 useEffect(()=>{
  if(!open)return;
  setTick(Date.now());
  const previousFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
  const previousOverflow=document.body.style.overflow;
  const overlay=panelRef.current?.parentElement;
  const background=Array.from(document.body.children).filter((element):element is HTMLElement=>element instanceof HTMLElement&&element!==overlay).map(element=>({element,inert:element.inert}));
  background.forEach(({element})=>{element.inert=true});
  document.body.style.overflow='hidden';
  closeRef.current?.focus();
  const keyboard=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){event.preventDefault();onCloseRef.current();return}
   if(event.key!=='Tab')return;
   const controls=Array.from(panelRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],iframe')||[]);
   const first=controls[0],last=controls.at(-1);
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
  };
  document.addEventListener('keydown',keyboard);
  return()=>{document.removeEventListener('keydown',keyboard);document.body.style.overflow=previousOverflow;background.forEach(({element,inert})=>{element.inert=inert});if(previousFocus?.isConnected)previousFocus.focus()};
 },[open]);

 if(!open||typeof document==='undefined')return null;
 const join=previewUrl.includes('?')?'&':'?';
 const src=`${previewUrl}${join}draft=${tick}`;

 return createPortal(<div className={styles.overlay} role="dialog" aria-modal="true" aria-label={title}>
  <button type="button" className={styles.backdrop} aria-label="Fechar preview" onClick={onClose}/>
  <section ref={panelRef} className={styles.panel}>
   <header className={styles.toolbar}>
    <div><strong>{title}</strong><small>{stale?'Há alterações não salvas — o preview mostra o último rascunho salvo.':'Visualizando o rascunho salvo.'}</small></div>
    <div className={styles.actions}>
     <div className={styles.device} role="group" aria-label="Largura do preview">
      <button type="button" aria-pressed={mode==='desktop'} onClick={()=>setMode('desktop')}>Desktop</button>
      <button type="button" aria-pressed={mode==='mobile'} onClick={()=>setMode('mobile')}>Mobile</button>
     </div>
     <button type="button" onClick={()=>setTick(Date.now())}>Atualizar</button>
     <a href={src} target="_blank" rel="noopener noreferrer">Nova guia ↗</a>
     <button ref={closeRef} type="button" onClick={onClose}>Fechar</button>
    </div>
   </header>
   <div className={styles.stage} data-mode={mode}><iframe key={tick} src={src} title={title}/></div>
  </section>
 </div>,document.body);
}
