import Link from 'next/link';
import { redirect } from 'next/navigation';
import { logout } from '@/app/login/actions';
import { projectsForUser } from '@/core/projects';
import { segments } from '@/core/segments';
import { requireUser } from '@/core/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {commerceOrdersForProject} from '@/core/commerce-orders';
import OwnerProjectsClient,{type OwnerProjectView} from './owner-projects-client';
import styles from '../owner.module.css';

const fmtDate=(value:string|null)=>value?new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(value)):'—';
const needsAttention=(project:OwnerProjectView)=>project.domainStatus==='error'||(!project.published&&project.onboardingStep==='completed');

export default async function OwnerProjectsPage({searchParams}:{searchParams:Promise<{deleted?:string}>}){
 const query=await searchParams,user=await requireUser();
 const projects=(await projectsForUser(user.id)).filter(project=>project.owner_id===user.id);
 if(!projects.length)redirect('/unauthorized');
 const ids=projects.map(project=>project.id),sb=await createSupabaseServerClient();
 const [stateResult,leadResult]=await Promise.all([
  ids.length?sb.from('project_v2_state').select('project_id,segment,template_key,lifecycle,onboarding_step,native_subdomain,custom_domain,domain_status,updated_at').in('project_id',ids):Promise.resolve({data:[],error:null}),
  ids.length?sb.from('site_leads').select('id,project_id,name,status,message,created_at').in('project_id',ids).order('created_at',{ascending:false}).limit(500):Promise.resolve({data:[],error:null})
 ]);
 if(stateResult.error)throw stateResult.error;if(leadResult.error)throw leadResult.error;
 const states=stateResult.data||[],allLeads=leadResult.data||[],leads=allLeads.filter(lead=>!String(lead.message||'').startsWith('WEBAPPCAP_ORDER_V1|')),stateByProject=new Map(states.map(state=>[state.project_id,state])),projectById=new Map(projects.map(project=>[project.id,project]));
 const commerceProjects=projects.filter(project=>(stateByProject.get(project.id)?.segment||project.site_type)==='food-business'),orderEntries=await Promise.all(commerceProjects.map(async project=>[project.id,(await commerceOrdersForProject(project.id,{limit:1000})).length] as const)),ordersByProject=new Map(orderEntries);
 const projectViews:OwnerProjectView[]=projects.map(project=>{const state=stateByProject.get(project.id),projectLeads=leads.filter(lead=>lead.project_id===project.id);return{id:project.id,slug:project.slug,name:project.name,siteType:state?.segment||project.site_type||'portfolio',published:project.is_published===true,lifecycle:state?.lifecycle||(project.is_published?'published':'draft'),onboardingStep:state?.onboarding_step||'completed',templateKey:state?.template_key||null,domainStatus:state?.domain_status||'unconfigured',nativeSubdomain:state?.native_subdomain||null,customDomain:state?.custom_domain||null,updatedAt:state?.updated_at||null,leadsTotal:projectLeads.length,leadsNew:projectLeads.filter(lead=>lead.status==='new').length,ordersTotal:ordersByProject.get(project.id)||0}});
 const published=projectViews.filter(project=>project.published).length,configuring=projectViews.length-published,newLeads=leads.filter(lead=>lead.status==='new').length,attention=projectViews.filter(needsAttention).length,totalProjects=projectViews.length+1;
 const canCreateProjects=Object.values(segments).some(segment=>segment.key!=='portfolio'&&segment.templates.some(template=>template.status==='ready')),leadProject=projectViews.find(project=>project.leadsNew>0);
 const recentActivity=[...leads.slice(0,8).map(lead=>({key:`lead-${lead.id}`,date:lead.created_at as string|null,label:'Novo lead',title:lead.name||'Contato recebido',project:projectById.get(lead.project_id),href:projectById.get(lead.project_id)?`/dashboard/${encodeURIComponent(projectById.get(lead.project_id)!.slug)}/leads`:'#'})),...projectViews.filter(project=>project.updatedAt).map(project=>({key:`project-${project.id}`,date:project.updatedAt,label:project.published?'Publicado':'Atualizado',title:project.name,project:projectById.get(project.id),href:`/dashboard/${encodeURIComponent(project.slug)}/content`}))].sort((a,b)=>new Date(b.date||0).getTime()-new Date(a.date||0).getTime()).slice(0,5);

 return <main className={styles.page}><div className={styles.workspace}>
  <header className={styles.topbar}><Link className={styles.brand} href="/owner/projects"><span className={styles.brandMark}>W</span><span className={styles.brandText}><strong>WebAppCap</strong><small>Owner</small></span></Link><nav className={styles.topActions} aria-label="Ações da conta"><Link className={styles.buttonGhost} href="/entry">Área do cliente</Link><form action={logout}><button type="submit" className={styles.buttonGhost}>Sair</button></form>{canCreateProjects?<Link className={styles.button} href="/owner/projects/new">Novo projeto <span>＋</span></Link>:null}</nav></header>
  <section className={styles.ownerHeading}><div><span className={styles.eyebrow}>PAINEL DO OWNER</span><h1>Projetos</h1></div><span className={styles.projectCount}>{totalProjects} projetos</span></section>
  {query.deleted?<div className={styles.ownerNotice} role="status"><strong>Projeto excluído.</strong> {query.deleted} foi removido.</div>:null}
  <section className={styles.stats} aria-label="Resumo da operação"><article className={styles.stat}><span>Publicados</span><strong>{published+1}</strong><small>de {totalProjects}</small></article><article className={styles.stat}><span>Em configuração</span><strong>{configuring}</strong><small>projetos</small></article><article className={styles.stat}><span>Leads novos</span><strong>{newLeads}</strong><small>aguardando</small></article><article className={`${styles.stat} ${attention?styles.statWarning:''}`}><span>Pendências</span><strong>{attention}</strong><small>ação necessária</small></article></section>
  <div className={styles.operationGrid}>
   <section className={styles.section}><div className={styles.sectionHead}><h2>Todos os projetos</h2>{canCreateProjects?<Link className={styles.inlineAction} href="/owner/projects/new">Adicionar projeto →</Link>:null}</div>
    <article className={styles.projectCard} style={{marginBottom:10}}>
     <div className={styles.cardTop}><span className={styles.status}><i className={styles.dot}/>Projeto raiz</span><div className={styles.cardBadges}><span className={styles.leadBadge}>Plataforma</span></div></div>
     <div className={styles.projectCardBody}><div><h3>WebAppCap</h3><span className={styles.slug}>www.webappcap.com.br</span></div><div className={styles.projectMeta}><span>Institucional</span><span>Raiz oficial</span></div></div>
     <div className={styles.projectNumbers}><div><strong>Online</strong><span>Status</span></div><div><strong>CMS</strong><span>Conteúdo</span></div><div><strong>Owner</strong><span>Acesso</span></div></div>
     <div className={styles.cardActions}><Link href="/owner/root" className={styles.cardPrimary}>Gerenciar <span>→</span></Link><Link href="/owner/root/preview" target="_blank" className={styles.cardAction}>Preview</Link><a href="https://www.webappcap.com.br" target="_blank" rel="noopener noreferrer" className={styles.cardAction}>Site ↗</a></div>
    </article>
    {projects.length===0?<div className={styles.empty}>Nenhum projeto de cliente ativo.</div>:<OwnerProjectsClient projects={projectViews}/>}</section>
   <aside className={styles.ownerAside}>
    <section className={styles.sidePanel}><div className={styles.sidePanelHead}><span className={styles.miniEyebrow}>AGORA</span><h2>Prioridades</h2></div><div className={styles.priorityList}>{attention===0&&newLeads===0?<div className={styles.priorityClear}><span>✓</span><strong>Tudo em ordem</strong></div>:null}{attention>0?<div className={styles.priorityItem}><span className={styles.priorityWarn}>!</span><div><strong>{attention} {attention===1?'pendência':'pendências'}</strong><small>Domínio ou publicação</small></div></div>:null}{newLeads>0&&leadProject?<Link className={styles.priorityItem} href={`/dashboard/${encodeURIComponent(leadProject.slug)}/leads`}><span className={styles.priorityLead}>↗</span><div><strong>{newLeads} {newLeads===1?'lead novo':'leads novos'}</strong><small>Abrir atendimento</small></div></Link>:null}</div></section>
    <section className={styles.sidePanel}><div className={styles.sidePanelHead}><span className={styles.miniEyebrow}>RECENTE</span><h2>Atividade</h2></div><div className={styles.activityList}>{recentActivity.length===0?<div className={styles.sideEmpty}>Sem movimentações.</div>:recentActivity.map(item=><Link href={item.href} className={styles.activityItem} key={item.key}><i className={item.label==='Novo lead'?styles.activityLead:styles.activityProject}/><div><strong>{item.title}</strong><span>{item.label}{item.project?` · ${item.project.name}`:''}</span><small>{fmtDate(item.date)}</small></div><b>›</b></Link>)}</div></section>
   </aside>
  </div>
 </div></main>;
}
