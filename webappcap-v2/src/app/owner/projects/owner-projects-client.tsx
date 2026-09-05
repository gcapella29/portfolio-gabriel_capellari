'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import styles from '../owner.module.css';

export type OwnerProjectView = {
  id:string;
  slug:string;
  name:string;
  siteType:string;
  published:boolean;
  lifecycle:string;
  onboardingStep:string;
  templateKey:string|null;
  domainStatus:string;
  nativeSubdomain:string|null;
  customDomain:string|null;
  updatedAt:string|null;
  leadsTotal:number;
  leadsNew:number;
};

const lifecycleLabel=(value:string)=>({published:'Publicado',onboarding:'Onboarding',invited:'Convite enviado','ready-to-publish':'Pronto para publicar',draft:'Rascunho',archived:'Arquivado'}[value]||value);
const segmentLabel=(value:string)=>({"personal-trainer":'Personal Trainer',"food-business":'Comércio local',school:'Educação',portfolio:'Portfólio'}[value]||value||'Projeto WebAppCap');

export default function OwnerProjectsClient({projects}:{projects:OwnerProjectView[]}){
  const [query,setQuery]=useState('');
  const [filter,setFilter]=useState<'all'|'published'|'configuring'|'attention'>('all');

  const filtered=useMemo(()=>projects.filter(project=>{
    const haystack=`${project.name} ${project.slug} ${project.siteType}`.toLowerCase();
    const matchesSearch=haystack.includes(query.trim().toLowerCase());
    const needsAttention=project.domainStatus==='error'||project.leadsNew>0||(!project.published&&project.onboardingStep==='completed');
    const matchesFilter=filter==='all'||(filter==='published'&&project.published)||(filter==='configuring'&&!project.published)||(filter==='attention'&&needsAttention);
    return matchesSearch&&matchesFilter;
  }),[projects,query,filter]);

  return <>
    <div className={styles.toolbar}>
      <label className={styles.searchBox}>
        <span aria-hidden="true">⌕</span>
        <input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar cliente, domínio ou segmento…" aria-label="Buscar projetos"/>
      </label>
      <div className={styles.filters} aria-label="Filtros de projetos">
        {([
          ['all','Todos'],['published','Publicados'],['configuring','Em configuração'],['attention','Atenção']
        ] as const).map(([key,label])=><button key={key} type="button" className={filter===key?styles.filterActive:styles.filter} onClick={()=>setFilter(key)}>{label}</button>)}
      </div>
    </div>

    {filtered.length===0?<div className={styles.empty}>Nenhum projeto encontrado com esses filtros.</div>:<div className={styles.grid}>{filtered.map(project=>{
      const host=project.customDomain||(project.nativeSubdomain?`${project.nativeSubdomain}.webappcap.com.br`:`${project.slug}.webappcap.com.br`);
      const attention=project.domainStatus==='error'||project.leadsNew>0||(!project.published&&project.onboardingStep==='completed');
      return <article className={styles.projectCard} key={project.id}>
        <div className={styles.cardTop}>
          <span className={styles.status}><i className={project.published?styles.dot:styles.dotDraft}/>{lifecycleLabel(project.lifecycle)}</span>
          {attention&&<span className={styles.attentionBadge}>Atenção</span>}
        </div>
        <div className={styles.projectCardBody}>
          <h3>{project.name}</h3>
          <div className={styles.slug}>{host}</div>
          <div className={styles.projectMeta}>
            <span>{segmentLabel(project.siteType)}</span><span>{project.templateKey||'Modelo pendente'}</span>
          </div>
        </div>
        <div className={styles.projectNumbers}>
          <div><strong>{project.leadsTotal}</strong><span>leads</span></div>
          <div><strong>{project.leadsNew}</strong><span>novos</span></div>
          <div><strong>{project.onboardingStep==='completed'?'100%':'Em curso'}</strong><span>onboarding</span></div>
        </div>
        <div className={styles.cardActions}>
          <Link href={`/owner/projects/${encodeURIComponent(project.slug)}`} className={styles.cardPrimary}>Gerenciar <span>→</span></Link>
          <Link href={`/dashboard/${encodeURIComponent(project.slug)}`} className={styles.cardAction}>Dashboard</Link>
          {project.leadsTotal>0&&<Link href={`/dashboard/${encodeURIComponent(project.slug)}/leads`} className={styles.cardAction}>Leads</Link>}
          {project.published&&<a href={`https://${host}`} target="_blank" rel="noopener noreferrer" className={styles.cardAction}>Ver site ↗</a>}
        </div>
      </article>})}</div>}
  </>;
}
