'use client';
import {useEffect,type RefObject} from 'react';

// For dialogs rendered in the document. Shadow DOM templates manage their own focus.
export function useDialogFocus(ref:RefObject<HTMLElement|null>,open:boolean){
 useEffect(()=>{
  const dialog=ref.current;if(!open||!dialog)return;
  const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;
  const controls=()=>Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([type="hidden"]):not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')).filter(node=>!node.closest('[hidden],[inert]'));
  const focusFirst=()=>{(controls()[0]||dialog).focus()};
  focusFirst();
  const keyboard=(event:KeyboardEvent)=>{
   if(event.key!=='Tab')return;
   const nodes=controls(),first=nodes[0],last=nodes.at(-1);
   if(!first){event.preventDefault();dialog.focus();return}
   if(event.shiftKey&&(document.activeElement===first||!dialog.contains(document.activeElement))){event.preventDefault();last?.focus()}
   else if(!event.shiftKey&&(document.activeElement===last||!dialog.contains(document.activeElement))){event.preventDefault();first.focus()}
  };
  const keepFocus=(event:FocusEvent)=>{if(event.target instanceof Node&&!dialog.contains(event.target))focusFirst()};
  document.addEventListener('keydown',keyboard);
  document.addEventListener('focusin',keepFocus);
  return()=>{document.removeEventListener('keydown',keyboard);document.removeEventListener('focusin',keepFocus);if(previous?.isConnected)previous.focus()};
 },[ref,open]);
}
