import Link from 'next/link';
import {logout} from '@/app/login/actions';
import {projectsForUser} from '@/core/projects';
import {segments} from '@/core/segments';
import {requirePlatformOwner} from '@/core/session';
import {createSupabaseServerClient} from '@/lib/supabase/server';
import {commerceOrdersForProject} from '@/core/commerce-orders';
import OwnerProjectsClient,{type OwnerProjectView} from './owner-projects-client';
import styles from './projects.module.css';

const fmtDate=(value:string|null)=>value?new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(value)):'—';
const needsAttention=(project:OwnerProjectView)=>project.domainStatus==='error'||(!project.published&&project.onboardingStep==='completed');

type ActivityItem={key:string;date:string|null;label:string;title:string;projectName:string|null;href:string};

export default async function OwnerProjectsPage({searchParams}:{searchParams:Promise<{deleted?:string}>}){
 const query=await searchParams,user=await requirePlatformOwner();
 const projects=(await projectsForUser(user.id)).filter(project=>project.owner_id===user.id);
 const ids=projects.map(project=>project.id),sb=await createSupabaseServerClient();
 const [stateResult,leadResult]=await Promise.all([
  ids.length?sb.from('project_v2_state').select('project_id,segment,template_key,lifecycle,onboarding_step,native_subdomain,custom_domain,domain_status,updated_at').in('project_id',ids):Promise.resolve({data:[],error:null}),
  ids.length?sb.from('site_leads').select('id,project_id,name,status,message,created_at').in('project_id',ids).order('created_at',{ascending:false}).limit(500):Promise.resolve({data:[],error:null})
 ]);
 if(stateResult.error)throw stateResult.error;
 if(leadResult.error)throw leadResult.error;

 const states=stateResult.data||[],allLeads=leadResult.data||[];
 const leads=allLeads.filter(lead=>!String(lead.message||'').startsWith('WEBAPPCAP_ORDER_V1|'));
 const stateByProject=new Map(states.map(state=>[state.project_id,state]));
 const projectById=new Map(projects.map(project=>[project.id,project]));
 const leadsByProject=new Map<string,typeof leads>();
 for(const lead of leads){
  const bucket=leadsByProject.get(lead.project_id)||[];
  bucket.push(lead);
  leadsByProject.set(lead.project_id,bucket);
 }

 const commerceProjects=projects.filter(project=>['food-business','commerce'].includes(String(stateByProject.get(project.id)?.segment||project.site_type)));
 const orderEntries=await Promise.all(commerceProjects.map(async project=>[project.id,await commerceOrdersForProject(project.id,{limit:1000})] as const));
 const ordersByProject=new Map(orderEntries);

 const projectViews:OwnerProjectView[]=projects.map(project=>{
  const state=stateByProject.get(project.id),projectLeads=leadsByProject.get(project.id)||[];
  return {
   id:project.id,
   slug:project.slug,
   name:project.name,
   siteType:state?.segment||project.site_type||'portfolio',
   published:project.is_published===true,
   lifecycle:state?.lifecycle||(project.is_published?'published':'draft'),
   onboardingStep:state?.onboarding_step||'completed',
   templateKey:state?.template_key||null,
   domainStatus:state?.domain_status||'unconfigured',
   nativeSubdomain:state?.native_subdomain||null,
   customDomain:state?.custom_domain||null,
   updatedAt:state?.updated_at||null,
   leadsTotal:projectLeads.length,
   leadsNew:projectLeads.filter(lead=>lead.status==='new').length,
   ordersTotal:ordersByProject.get(project.id)?.length||0
  };
 });

 const published=projectViews.filter(project=>project.published).length+1;
 const configuring=projectViews.filter(project=>!project.published&&project.lifecycle!=='archived').length;
 const newLeads=projectViews.reduce((sum,project)=>sum+project.leadsNew,0);
 const attention=projectViews.filter(needsAttention).length;
 const totalProjects=projectViews.length+1;
 const canCreateProjects=Object.values(segments).some(segment=>segment.key!=='portfolio'&&segment.templates.some(template=>template.status==='ready'));
 const leadProject=projectViews.find(project=>project.leadsNew>0);

 const orderActivity:ActivityItem[]=[...ordersByProject.entries()].flatMap(([projectId,orders])=>orders.slice(0,4).map(order=>{
  const project=projectById.get(projectId);
  return {
   key:`order-${projectId}-${order.id}`,
   date:order.createdAt as string|null,
   label:'Novo pedido',
   title:`Pedido · ${new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(order.total)}`,
   projectName:project?.name||null,
   href:project?`/dashboard/${encodeURIComponent(project.slug)}/orders`:'#'
  };
 }));
 const recentActivity:ActivityItem[]=[
  ...leads.slice(0,8).map(lead=>{
   const project=projectById.get(lead.project_id);
   return {key:`lead-${lead.id}`,date:lead.created_at as string|null,label:'Novo lead',title:lead.name||'Contato recebido',projectName:project?.name||null,href:project?`/dashboard/${encodeURIComponent(project.slug)}/leads`:'#'};
  }),
  ...orderActivity,
  ...projectViews.filter(project=>project.updatedAt).map(project=>({key:`project-${project.id}`,date:project.updatedAt,label:project.published?'Publicado':'Atualizado',title:project.name,projectName:project.name,href:project.siteType==='commerce'?`/dashboard/${encodeURIComponent(project.slug)}/editor/bakery`:project.siteType==='food-business'?`/dashboard/${encodeURIComponent(project.slug)}/editor`:`/dashboard/${encodeURIComponent(project.slug)}/content`}))
 ].sort((a,b)=>new Date(b.date||0).getTime()-new Date(a.date||0).getTime()).slice(0,5);

 return <main className={styles.page}><div className={styles.workspace}>
  <header className={styles.topbar}>
   <Link className={styles.brand} href="/owner/projects"><span className={styles.brandMark}>W</span><span className={styles.brandText}><strong>WebAppCap</strong><small>Owner workspace</small></span></Link>
   <nav className={styles.topActions} aria-label="Ações da conta"><form action={logout}><button type="submit" className={styles.buttonGhost}>Sair</button></form>{canCreateProjects?<Link className={styles.button} href="/owner/projects/new">Novo projeto <span>＋</span></Link>:null}</nav>
  </header>

  <section className={styles.heading}>
   <div><span className={styles.eyebrow}>PAINEL DO OWNER</span><h1>Projetos</h1><p>Gerencie seus sites, acompanhe atividade e veja rapidamente o que precisa de atenção.</p></div>
   <span className={styles.projectCount}>{totalProjects} {totalProjects===1?'projeto':'projetos'}</span>
  </section>

  {query.deleted?<div className={styles.notice} role="status"><strong>Projeto excluído.</strong> {query.deleted} foi removido.</div>:null}

  <section className={styles.statsBar} aria-label="Resumo da operação">
   <article><strong>{published}</strong><span>publicados</span></article>
   <article><strong>{configuring}</strong><span>configurando</span></article>
   <article><strong>{newLeads}</strong><span>novos contatos</span></article>
   <article className={attention?styles.statAttention:styles.statClear}><strong>{attention?attention:'✓'}</strong><span>{attention?`${attention===1?'pendência':'pendências'}`:'tudo em ordem'}</span></article>
  </section>

  <div className={styles.layout}>
   <section className={styles.projectsSection}>
    <div className={styles.sectionHead}><div><span className={styles.miniEyebrow}>WORKSPACE</span><h2>Todos os projetos</h2></div>{canCreateProjects?<Link className={styles.inlineAction} href="/owner/projects/new">Adicionar projeto <span>＋</span></Link>:null}</div>
    <OwnerProjectsClient projects={projectViews}/>
   </section>

   <aside className={styles.aside}>
    {attention===0&&newLeads===0?<div className={styles.allClear}><span>✓</span><div><strong>Tudo em ordem</strong><small>Nenhuma ação necessária agora.</small></div></div>:<section className={styles.priorityPanel}><div className={styles.panelHead}><span className={styles.miniEyebrow}>AGORA</span><h2>Prioridades</h2></div><div className={styles.priorityList}>{attention>0?<div className={styles.priorityItem}><span className={styles.priorityWarn}>!</span><div><strong>{attention} {attention===1?'pendência':'pendências'}</strong><small>Domínio ou publicação</small></div></div>:null}{newLeads>0&&leadProject?<Link className={styles.priorityItem} href={`/dashboard/${encodeURIComponent(leadProject.slug)}/leads`}><span className={styles.priorityLead}>↗</span><div><strong>{newLeads} {newLeads===1?'contato novo':'contatos novos'}</strong><small>Abrir atendimento</small></div></Link>:null}</div></section>}

    <section className={styles.activityPanel}><div className={styles.panelHead}><span className={styles.miniEyebrow}>RECENTE</span><h2>Atividade</h2></div><div className={styles.activityList}>{recentActivity.length===0?<div className={styles.emptyActivity}>Sem movimentações recentes.</div>:recentActivity.map(item=><Link href={item.href} className={styles.activityItem} key={item.key}><i className={item.label==='Novo lead'||item.label==='Novo pedido'?styles.activityLead:styles.activityProject}/><div><strong>{item.title}</strong><span>{item.label}{item.projectName?` · ${item.projectName}`:''}</span><small>{fmtDate(item.date)}</small></div><b>›</b></Link>)}</div></section>
   </aside>
  </div>
 </div></main>;
}
