'use client';

import {useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import styles from './editor-draft-dock.module.css';

export function EditorDraftStatus({text,dirty=false,pending=false}:{text:string;dirty?:boolean;pending?:boolean}){
 return <div className={styles.status} aria-live="polite"><i data-dirty={dirty} data-pending={pending}/><span>{text}</span></div>;
}

export default function EditorDraftDock({children,sidebarOffset=false}:{children:React.ReactNode;sidebarOffset?:boolean}){
 const [mounted,setMounted]=useState(false);
 useEffect(()=>setMounted(true),[]);
 if(!mounted||typeof document==='undefined')return null;
 return createPortal(<div className={styles.dock} data-sidebar-offset={sidebarOffset?'true':'false'}>{children}</div>,document.body);
}
