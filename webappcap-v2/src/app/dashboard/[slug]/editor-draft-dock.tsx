'use client';

import {useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import styles from './editor-draft-dock.module.css';

export function EditorDraftStatus({text,dirty=false,pending=false}:{text:string;dirty?:boolean;pending?:boolean}){
 return <div className={styles.status} aria-live="polite"><i data-dirty={dirty} data-pending={pending}/><span>{text}</span></div>;
}

export default function EditorDraftDock({children,sidebarOffset=false}:{children:React.ReactNode;sidebarOffset?:boolean}){
 const [mounted,setMounted]=useState(false),[sidebarTarget,setSidebarTarget]=useState<HTMLElement|null>(null);

 useEffect(()=>{
  setMounted(true);
  const sync=()=>{
   const target=document.getElementById('editor-draft-sidebar-slot');
   setSidebarTarget(window.matchMedia('(min-width: 861px)').matches&&target instanceof HTMLElement?target:null);
  };
  sync();
  window.addEventListener('resize',sync);
  return()=>window.removeEventListener('resize',sync);
 },[]);

 if(!mounted||typeof document==='undefined')return null;

 const dock=<div className={styles.dock} data-embedded={sidebarTarget?'true':'false'} data-sidebar-offset={sidebarOffset?'true':'false'}>{children}</div>;
 return createPortal(dock,sidebarTarget||document.body);
}
