'use client';
import Link from 'next/link';
import {useMemo,useState} from 'react';
import DeleteProjectDialog from './delete-project-dialog';
import styles from '../owner.module.css';

export type OwnerProjectView={id:string;slug:string;name:string;siteType:string;published:boolean;lifecycle:string;onboardingStep:string;templateKey:string|null;domainStatus:string;nativeSubdomain:string|null;customDomain:string|null;updatedAt:string|null;leadsTotal:number;leadsNew:number};
const lifecycleLabel=(value:string)=>({published:'Publicado',onboarding:'Onboarding',invited:'Convite enviado','ready-to-publish':'Pronto para publicar',draft:'Rascunho',archived:'Arquivado'}[value]||value);
const segmentLabel=(value:string)=>({'personal-trainer':'Fitness','food-business':'Comércio',school:'Educação',portfolio:'Portfólio'}[value]||value||'Projeto');
const needsAttention=(project:OwnerProjectView)=>project.domainStatus==='error'||(!project.published&&project.onboardingStep==='completed');
const updatedLabel=(value:string|null)=>value?new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short'}).format(new Date(value)):'—';

export default function OwnerProjectsClient({projects}:{projects:OwnerProjectView[]}){
 const [query,setQuery]=useState(''),[filter,setFilter]=useState<'all'|'published'|'configuring'|'attention'>('all');
 const filtered=useMemo(()=>projects.filter(project=>`${project.name} ${project.slug} ${project.siteType} ${project.nativeSubdomain||''} ${project.customDomain||''}`.toLowerCase().includes(query.trim().toLowerCase())&&(filter==='all'||(filter==='published'&&project.published)||(filter==='configuring'&&!project.published)||(filter==='attention'&&needsAttention(project)))),[projects,query,filter]);
 return <><div className={styles.toolbar}><label className={styles.searchBox}><span aria-hidden="true">⌕</span><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar projeto ou domínio" aria-label="Buscar projetos"/></label><div className={styles.filters} aria-label="Filtros de projetos">{([['all','Todos'],['published','Publicados'],['configuring','Configurando'],['attention','Pendências']] as const).map(([key,label])=><button key={key} type="button" className={filter===key?styles.filterActive:styles.filter} onClick={()=>setFilter(key)}>{label}</button>)}</div></div>
 {filtered.length===0?<div className={styles.empty}>Nenhum projeto encontrado.</div>:<div className={styles.grid}>{filtered.map(project=>{const host=project.customDomain&&project.domainStatus==='active'?project.customDomain:(project.nativeSubdomain?`${project.nativeSubdomain}.webappcap.com.br`:`${project.slug}.webappcap.com.br`),attention=needsAttention(project),base=`/dashboard/${encodeURIComponent(project.slug)}`;return <article className={styles.projectCard} key={project.id}>
  <div className={styles.cardTop}><span className={styles.status}><i className={project.published?styles.dot:styles.dotDraft}/>{lifecycleLabel(project.lifecycle)}</span><div className={styles.cardBadges}>{project.leadsNew>0?<span className={styles.leadBadge}>{project.leadsNew} novo{project.leadsNew===1?'':'s'}</span>:null}{attention?<span className={styles.attentionBadge}>Pendência</span>:null}</div></div>
  <div className={styles.projectCardBody}><div><h3>{project.name}</h3><span className={styles.slug}>{host}</span></div><div className={styles.projectMeta}><span>{segmentLabel(project.siteType)}</span><span>Atualizado {updatedLabel(project.updatedAt)}</span></div></div>
  <div className={styles.projectNumbers}><div><strong>{project.leadsTotal}</strong><span>Leads</span></div><div><strong>{project.leadsNew}</strong><span>Novos</span></div><div><strong>{project.onboardingStep==='completed'?'100%':'Em curso'}</strong><span>Configuração</span></div></div>
  <div className={styles.cardActions}><Link href={`/owner/projects/${encodeURIComponent(project.slug)}`} className={styles.cardPrimary}>Gerenciar <span>→</span></Link><Link href={`${base}/content`} className={styles.cardAction}>Conteúdo</Link><Link href={`/preview/${encodeURIComponent(project.slug)}`} className={styles.cardAction}>Preview</Link>{project.published?<a href={`https://${host}`} target="_blank" rel="noopener noreferrer" className={styles.cardAction}>Site ↗</a>:null}{project.siteType!=='portfolio'?<DeleteProjectDialog target={{slug:project.slug,name:project.name}}/>:null}</div>
 </article>})}</div>}</>;
}
