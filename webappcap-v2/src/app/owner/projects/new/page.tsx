import Link from 'next/link';
import { requireUser } from '@/core/session';
import { segments } from '@/core/segments';
import { createClientProject } from './actions';
import styles from '../../owner.module.css';

export default async function NewProjectPage(){
  await requireUser();
  const available=Object.values(segments).filter(segment=>segment.key!=='portfolio');

  return <main className={styles.page}>
    <div className={styles.workspace}>
      <Link href="/owner/projects" className={styles.back}>← Central operacional</Link>
      <section className={styles.formCard}>
        <span className={styles.eyebrow}>NOVO CLIENTE</span>
        <h1>Crie o projeto. O cliente configura o site.</h1>
        <p>Você define o negócio e quem será o administrador. Modelo, conteúdo, identidade e domínio entram no onboarding guiado do cliente.</p>

        <form action={createClientProject} className={styles.form}>
          <label className={styles.field}>
            <span>Nome do projeto / cliente</span>
            <input name="name" placeholder="Padaria São José" required />
          </label>

          <label className={styles.field}>
            <span>Identificador</span>
            <input name="slug" placeholder="padaria-sao-jose (opcional)" />
            <small>Usado no endereço nativo do projeto.</small>
          </label>

          <fieldset style={{border:0,padding:0,margin:0}}>
            <legend className={styles.legend}>Segmento</legend>
            <div className={styles.choices}>{available.map((segment,index)=><label className={styles.choice} key={segment.key}>
              <input type="radio" name="segment" value={segment.key} defaultChecked={index===0}/>
              <strong>{segment.name}</strong>
              <span>{segment.description}</span>
            </label>)}</div>
          </fieldset>

          <label className={styles.field}>
            <span>Administrador do cliente</span>
            <input name="adminEmail" type="email" placeholder="cliente@email.com" required />
            <small>O convite será enviado para criação de senha e configuração guiada.</small>
          </label>

          <div className={styles.actions}>
            <Link href="/owner/projects" className={styles.buttonGhost}>Cancelar</Link>
            <button className={`${styles.button} ${styles.submit}`}>Criar projeto e enviar convite</button>
          </div>
        </form>
      </section>
    </div>
  </main>;
}
