'use client';

import Link from 'next/link';
import {templateName} from '@/core/segments';
import {useMemo,useState} from 'react';
import DeleteProjectDialog from './delete-project-dialog';
import PermanentDeleteDialog from './permanent-delete-dialog';
import styles from './projects.module.css';

export type OwnerProjectView={id:string;slug:string;name:string;siteType:string;published:boolean;archived:boolean;lifecycle:string;onboardingStep:string;templateKey:string|null;domainStatus:string;nativeSubdomain:string|null;customDomain:string|null;updatedAt:string|null;leadsTotal:number;leadsNew:number;ordersTotal:number};
type Filter='all'|'published'|'configuring'|'attention'|'archived';

type CardModel={
 key:string;
 kind:'root'|'project';
 name:string;
 host:string;
 siteType:string;
 published:boolean;
 archived:boolean;
 status:string;
 attention:boolean;
 badges:string[];
 facts:string[];
 manageHref:string;
 previewHref:string;
 siteHref:string|null;
 project?:OwnerProjectView;
};

const lifecycleLabel=(value:string)=>({published:'Publicado',onboarding:'Onboarding',invited:'Convite enviado','ready-to-publish':'Pronto para publicar',draft:'Rascunho',archived:'Arquivado'}[value]||value);
const segmentLabel=(value:string)=>({'personal-trainer':'Fitness','food-business':'Loja Digital',commerce:'Comércio',institutional:'Institucional',school:'Educação',portfolio:'Portfólio'}[value]||value||'Projeto');
const needsAttention=(project:OwnerProjectView)=>project.domainStatus==='error'||(!project.published&&project.onboardingStep==='completed');
const updatedLabel=(value:string|null)=>value?new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short'}).format(new Date(value)):'sem atualização';
const plural=(value:number,singular:string,pluralLabel:string)=>`${value} ${value===1?singular:pluralLabel}`;

const rootCard:CardModel={
 key:'platform-root',kind:'root',name:'WebAppCap',host:'www.webappcap.com.br',siteType:'platform',published:true,archived:false,status:'Plataforma',attention:false,
 badges:['Raiz oficial'],facts:['Institucional','Online'],manageHref:'/owner/root',previewHref:'/owner/root/preview',siteHref:'https://www.webappcap.com.br'
};

function toCard(project:OwnerProjectView):CardModel{
 const host=project.customDomain&&project.domainStatus==='active'?project.customDomain:(project.nativeSubdomain?`${project.nativeSubdomain}.webappcap.com.br`:`${project.slug}.webappcap.com.br`);
 const commerce=project.siteType==='food-business'||project.siteType==='commerce';
 const facts=project.archived?['Arquivado',project.slug]:commerce?
  [plural(project.ordersTotal,'pedido','pedidos'),templateName(project.templateKey),`Atualizado ${updatedLabel(project.updatedAt)}`]:
  [plural(project.leadsTotal,'lead','leads'),project.leadsNew>0?plural(project.leadsNew,'novo','novos'):`Atualizado ${updatedLabel(project.updatedAt)}`];
 return {
  key:project.id,kind:'project',name:project.name,host,siteType:project.siteType,published:project.published,archived:project.archived,status:project.archived?'Arquivado':lifecycleLabel(project.lifecycle),attention:!project.archived&&needsAttention(project),
  badges:[segmentLabel(project.siteType)],facts,manageHref:project.siteType==='institutional'?`/dashboard/${encodeURIComponent(project.slug)}/editor/institutional`:project.siteType==='personal-trainer'?`/dashboard/${encodeURIComponent(project.slug)}/editor/trainer`:project.siteType==='commerce'?`/dashboard/${encodeURIComponent(project.slug)}/editor/bakery`:commerce?`/dashboard/${encodeURIComponent(project.slug)}/editor`:`/dashboard/${encodeURIComponent(project.slug)}/content`,previewHref:`/preview/${encodeURIComponent(project.slug)}`,siteHref:project.published?`https://${host}`:null,project
 };
}

export default function OwnerProjectsClient({projects}:{projects:OwnerProjectView[]}){
 const [query,setQuery]=useState(''),[filter,setFilter]=useState<Filter>('all');
 const cards=useMemo(()=>[rootCard,...projects.map(toCard)],[projects]);
 const filtered=useMemo(()=>{
  const normalized=query.trim().toLocaleLowerCase('pt-BR');
  return cards.filter(card=>{
   const searchable=`${card.name} ${card.host} ${card.siteType} ${card.badges.join(' ')} ${card.facts.join(' ')}`.toLocaleLowerCase('pt-BR');
   const matchesQuery=!normalized||searchable.includes(normalized);
   const matchesFilter=filter==='archived'?card.archived:!card.archived&&(filter==='all'||(filter==='published'&&card.published)||(filter==='configuring'&&!card.published)||(filter==='attention'&&card.attention));
   return matchesQuery&&matchesFilter;
  });
 },[cards,query,filter]);

 return <>
  <div className={styles.toolbar}>
   <label className={styles.searchBox}><span aria-hidden="true">⌕</span><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar projeto ou domínio" aria-label="Buscar projetos"/></label>
   <div className={styles.filters} aria-label="Filtros de projetos">{([['all','Todos'],['published','Publicados'],['configuring','Configurando'],['attention','Pendências'],['archived','Arquivados']] as const).map(([key,label])=><button key={key} type="button" className={filter===key?styles.filterActive:styles.filter} onClick={()=>setFilter(key)}>{label}</button>)}</div>
  </div>

  {filtered.length===0?<div className={styles.empty}><strong>Nenhum projeto encontrado.</strong><span>Tente outro termo ou filtro.</span></div>:<div className={styles.grid}>{filtered.map(card=><article className={`${styles.projectCard} ${card.kind==='root'?styles.rootCard:''}`} key={card.key}>
   <div className={styles.cardMain}>
    <div className={styles.cardIdentity}>
     <div className={styles.cardStatus}><span><i className={card.published?styles.dot:styles.dotDraft}/>{card.status}</span>{card.attention?<em>Pendência</em>:null}</div>
     <h3>{card.name}</h3>
     <a href={card.siteHref||'#'} onClick={event=>{if(!card.siteHref)event.preventDefault()}} target={card.siteHref?'_blank':undefined} rel={card.siteHref?'noopener noreferrer':undefined} className={styles.host}>{card.host}{card.siteHref?<span>↗</span>:null}</a>
    </div>
    <div className={styles.cardInfo}>
     <div className={styles.badges}>{card.badges.map(badge=><span key={badge}>{badge}</span>)}</div>
     <div className={styles.facts}>{card.facts.map((fact,index)=><span key={`${fact}-${index}`}>{fact}</span>)}</div>
    </div>
   </div>
   <div className={styles.cardFooter}>
    <div className={styles.cardActions}>{card.archived?<span className={styles.secondaryAction}>Arquivado · {card.project?.slug}</span>:<><Link href={card.manageHref} className={styles.primaryAction}>Gerenciar <span>→</span></Link><Link href={card.previewHref} target="_blank" className={styles.secondaryAction}>Preview</Link>{card.siteHref?<a href={card.siteHref} target="_blank" rel="noopener noreferrer" className={styles.secondaryAction}>Site ↗</a>:null}</>}</div>
    {card.kind==='project'&&card.project&&card.project.siteType!=='portfolio'?card.archived?<PermanentDeleteDialog target={{slug:card.project.slug,name:card.project.name}}/>:<details className={styles.moreMenu}><summary aria-label={`Mais ações para ${card.name}`} title="Mais ações">•••</summary><div className={styles.moreMenuPanel}><DeleteProjectDialog target={{slug:card.project.slug,name:card.project.name}}/></div></details>:null}
   </div>
  </article>)}</div>}
 </>;
}
