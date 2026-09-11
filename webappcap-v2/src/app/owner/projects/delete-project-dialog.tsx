'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { deleteOwnerProjectAction, initialDeleteProjectState } from './actions';
import styles from '../owner.module.css';

type ProjectTarget = { slug: string; name: string };

export default function DeleteProjectDialog({ target }: { target: ProjectTarget }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(deleteOwnerProjectAction, initialDeleteProjectState);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) passwordRef.current?.focus();
  }, [open]);

  return <>
    <button type="button" className={styles.cardDanger} onClick={() => setOpen(true)}>Excluir</button>
    {open&&<div className={styles.dialogBackdrop} role="presentation" onMouseDown={event=>{
      if (event.target===event.currentTarget&&!pending) setOpen(false);
    }}>
      <section className={styles.deleteDialog} role="dialog" aria-modal="true" aria-labelledby={`delete-${target.slug}`}>
        <span className={styles.dangerEyebrow}>ZONA DE PERIGO</span>
        <h2 id={`delete-${target.slug}`}>Excluir {target.name}?</h2>
        <p>O projeto sairá do painel e do ar imediatamente. Seus endereços serão liberados, e esta ação não poderá ser desfeita pela interface.</p>
        <form action={action} className={styles.deleteForm}>
          <input type="hidden" name="slug" value={target.slug}/>
          <label className={styles.field}>
            <span>Senha do owner</span>
            <input ref={passwordRef} name="password" type="password" autoComplete="current-password" required disabled={pending}/>
          </label>
          {state.error&&<div className={styles.deleteError} role="alert">{state.error}</div>}
          <div className={styles.deleteActions}>
            <button type="button" className={styles.buttonGhost} onClick={()=>setOpen(false)} disabled={pending}>Cancelar</button>
            <button type="submit" className={styles.confirmDelete} disabled={pending}>{pending?'Excluindo…':'Confirmar exclusão'}</button>
          </div>
        </form>
      </section>
    </div>}
  </>;
}
