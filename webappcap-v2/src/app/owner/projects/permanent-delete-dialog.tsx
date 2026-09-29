'use client';
import {useActionState,useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import {permanentlyDeleteArchivedProjectAction,type DeleteProjectState} from './actions';
import styles from '../owner.module.css';

export default function PermanentDeleteDialog({target}:{target:{slug:string;name:string}}){
 const [mounted,setMounted]=useState(false),[open,setOpen]=useState(false);
 const [state,action,pending]=useActionState(permanentlyDeleteArchivedProjectAction,{error:null} as DeleteProjectState);
 useEffect(()=>setMounted(true),[]);
 useEffect(()=>{if(!open)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'&&!pending)setOpen(false)};window.addEventListener('keydown',escape);return()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',escape)}},[open,pending]);
 const dialog=open?<div className={styles.dialogBackdrop} role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget&&!pending)setOpen(false)}}><section className={styles.deleteDialog} role="dialog" aria-modal="true" aria-labelledby={`permanent-${target.slug}`}><span className={styles.dangerEyebrow}>EXCLUSÃO PERMANENTE</span><h2 id={`permanent-${target.slug}`}>Excluir {target.name} definitivamente?</h2><p>O projeto arquivado, seus dados e imagens serão apagados. O identificador {target.slug} ficará disponível novamente. Esta ação não pode ser desfeita.</p><form action={action} className={styles.deleteForm}><input type="hidden" name="slug" value={target.slug}/><label className={styles.field}><span>Digite {target.slug} para confirmar</span><input name="confirmation" required autoComplete="off" disabled={pending}/></label><label className={styles.field}><span>Senha do owner</span><input name="password" type="password" autoComplete="current-password" required disabled={pending}/></label>{state.error?<div className={styles.deleteError} role="alert">{state.error}</div>:null}<div className={styles.deleteActions}><button type="button" className={styles.buttonGhost} onClick={()=>setOpen(false)} disabled={pending}>Cancelar</button><button type="submit" className={styles.confirmDelete} disabled={pending}>{pending?'Excluindo…':'Excluir permanentemente'}</button></div></form></section></div>:null;
 return <><button type="button" className={styles.cardDanger} onClick={()=>setOpen(true)}>Excluir permanentemente</button>{mounted&&dialog?createPortal(dialog,document.body):null}</>;
}
