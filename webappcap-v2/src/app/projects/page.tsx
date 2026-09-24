import Link from 'next/link';
import {redirect} from 'next/navigation';
import {requireUser} from '@/core/session';
import {projectsForUser,projectForUser} from '@/core/projects';
import {destinationForUser} from '@/core/onboarding';
import styles from './projects.module.css';

export default async function ProjectsPage({searchParams}:{searchParams:Promise<{owned?:string;from?:string}>}){
 const query=await searchParams,user=await requireUser(),all=await projectsForUser(user.id),ownedOnly=query.owned==='1',from=String(query.from||'');
 const projects=all.filter(project=>project.owner_id===user.id&&(!from||project.slug!==from));
 if(!projects.length){if(from)redirect(`/dashboard/${encodeURIComponent(from)}`);redirect('/unauthorized')}
 const rows=await Promise.all(projects.map(async p=>({p,access:await projectForUser(p.slug,user.id)})));
 const available=rows.filter(r=>r.access&&(!ownedOnly||r.access.role==='owner'));
 return <main className={styles.page}>
  <div className={styles.orb} aria-hidden="true"/>
  <section className={styles.shell}>
   <header className={styles.header}>
    <Link href="/entry" className={styles.brand}><span className={styles.brandMark}>W</span><span><strong>WebAppCap</strong><small>Área do cliente</small></span></Link>
    <span className={styles.count}>{available.length} {available.length===1?'projeto':'projetos'}</span>
   </header>

   <section className={styles.hero}>
    <span className={styles.eyebrow}>{ownedOnly?'PROJETOS QUE VOCÊ POSSUI':'MEUS SITES'}</span>
    <h1>Escolha um projeto.</h1>
    <p>{ownedOnly?'A troca de projeto mostra somente sites em que sua conta é a proprietária.':'Escolha um dos projetos disponíveis para sua conta.'}</p>
   </section>

   <section className={styles.grid}>
    {available.map(({p,access},index)=><Link key={p.id} className={styles.card} style={{'--delay':`${index*55}ms`} as React.CSSProperties} href={destinationForUser(access!.project,access!.role)}>
      <div className={styles.cardTop}><span className={styles.role}>{access!.role}</span><span className={styles.arrow}>↗</span></div>
      <div>
       <h2>{p.name}</h2>
       <p>{access!.project.onboardingStep==='completed'?'Abrir área de gerenciamento':'Continuar configuração'}</p>
      </div>
      <div className={styles.cardFoot}><span>{p.slug}.webappcap.com.br</span><b>{access!.project.onboardingStep==='completed'?'Pronto':'Configuração em curso'}</b></div>
    </Link>)}
   </section>
  </section>
 </main>;
}
