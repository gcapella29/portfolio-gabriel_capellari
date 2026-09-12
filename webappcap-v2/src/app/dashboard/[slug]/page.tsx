import Link from 'next/link';
import {redirect} from 'next/navigation';
import {resolveProjectAccess} from '@/core/session';
import {can} from '@/core/permissions';
import {publicationStatus,readProjectState} from '@/core/publishing';
import {segments} from '@/core/segments';
import {createSupabaseServerClient} from '@/lib/supabase/server';
import styles from './dashboard.module.css';

export default async function DashboardPage({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{published?:string}>}){
 const {slug}=await params,{published}=await searchParams,{project,role}=await resolveProjectAccess(slug);
 if(project.onboardingStep!=='completed'&&role!=='owner')redirect(`/setup/${encodeURIComponent(project.slug)}/${project.onboardingStep}`);
 const sb=await createSupabaseServerClient(),leadAccess=can(role,'viewLeads');
 const [state,pub,totalResult,newResult]=await Promise.all([readProjectState(project.id),publicationStatus(project.id),leadAccess?sb.from('site_leads').select('id',{count:'exact',head:true}).eq('project_id',project.id):Promise.resolve({count:0,error:null}),leadAccess?sb.from('site_leads').select('id',{count:'exact',head:true}).eq('project_id',project.id).eq('status','new'):Promise.resolve({count:0,error:null})]);
 if(totalResult.error)throw totalResult.error;if(newResult.error)throw newResult.error;
 const segment=segments[project.segment],base=`/dashboard/${encodeURIComponent(project.slug)}`,pending=pub.hasPendingChanges,live=project.isPublished&&!pending;
 const statusLabel=pending?'Alterações pendentes':project.isPublished?'Publicado':'Rascunho',dotClass=pending?styles.statusDotPending:live?styles.statusDotLive:styles.statusDotDraft;
 const tools=[['≡','Conteúdo','Textos e contatos',`${base}/content`,'editContent'],['▧','Fotos','Imagens e galeria',`${base}/media`,'manageMedia'],['◐','Aparência','Cores e composição',`${base}/appearance`,'editAppearance'],['◎','Leads',`${newResult.count||0} novos · ${totalResult.count||0} total`,`${base}/leads`,'viewLeads'],['↗','Analytics','Desempenho comercial',`${base}/analytics`,'viewLeads'],['⌁','Configurações','Domínio e projeto',`${base}/settings`,'manageDomain']] as const;
 return <>
  <section className={styles.hero}><div><span className={styles.eyebrow}>{segment.name}</span><h1>{project.name}</h1><p>{pending?'Revise as alterações no Preview e publique quando estiver pronto.':project.isPublished?'Seu site está sincronizado e online.':'Finalize o projeto e publique o primeiro rascunho.'}</p></div><div className={styles.status}><i className={dotClass}/>{statusLabel}</div></section>
  {published?<div className={styles.notice} role="status">Site publicado com sucesso.</div>:null}
  <section className={styles.summary} aria-label="Resumo do projeto"><article><span>Site</span><strong>{project.isPublished?'Online':'Rascunho'}</strong></article><article><span>Domínio</span><strong>{state?.custom_domain&&state.domain_status==='active'?state.custom_domain:state?.native_subdomain?`${state.native_subdomain}.webappcap.com.br`:'Não configurado'}</strong></article>{leadAccess?<article><span>Leads novos</span><strong>{newResult.count||0}</strong></article>:null}<article><span>Última publicação</span><strong>{pub.publishedAt?new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short'}).format(new Date(pub.publishedAt)):'Ainda não publicado'}</strong></article></section>
  <section><div className={styles.sectionHead}><h2>Gerenciar site</h2></div><div className={styles.tools}>{tools.filter(([, , , ,cap])=>can(role,cap)).map(([icon,name,desc,href])=><Link className={styles.tool} href={href} key={name}><span className={styles.toolIcon}>{icon}</span><span><strong>{name}</strong><small>{desc}</small></span><b>→</b></Link>)}</div></section>
 </>;
}
