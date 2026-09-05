import Link from 'next/link';
import { requireUser } from '@/core/session';
import { projectsForUser } from '@/core/projects';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import OwnerProjectsClient, { type OwnerProjectView } from './owner-projects-client';
import styles from '../owner.module.css';

const fmtDate=(value:string|null)=>value?new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(value)):'—';

export default async function OwnerProjectsPage(){
  const user=await requireUser();
  const projects=(await projectsForUser(user.id)).filter(project=>project.owner_id===user.id);
  const ids=projects.map(project=>project.id);
  const sb=await createSupabaseServerClient();

  const [stateResult,leadResult]=await Promise.all([
    ids.length?sb.from('project_v2_state').select('project_id,segment,template_key,lifecycle,onboarding_step,native_subdomain,custom_domain,domain_status,updated_at').in('project_id',ids):Promise.resolve({data:[],error:null}),
    ids.length?sb.from('site_leads').select('id,project_id,name,status,created_at').in('project_id',ids).order('created_at',{ascending:false}).limit(500):Promise.resolve({data:[],error:null})
  ]);

  const states=stateResult.data||[];
  const leads=leadResult.data||[];
  const stateByProject=new Map(states.map(state=>[state.project_id,state]));
  const projectById=new Map(projects.map(project=>[project.id,project]));

  const projectViews:OwnerProjectView[]=projects.map(project=>{
    const state=stateByProject.get(project.id);
    const projectLeads=leads.filter(lead=>lead.project_id===project.id);
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
      leadsNew:projectLeads.filter(lead=>lead.status==='new').length
    };
  });

  const published=projectViews.filter(project=>project.published).length;
  const configuring=projectViews.length-published;
  const newLeads=leads.filter(lead=>lead.status==='new').length;
  const attention=projectViews.filter(project=>project.domainStatus==='error'||project.leadsNew>0||(!project.published&&project.onboardingStep==='completed')).length;

  const recentActivity=[
    ...leads.slice(0,8).map(lead=>({
      key:`lead-${lead.id}`,
      date:lead.created_at as string|null,
      label:'Novo lead',
      title:lead.name||'Contato recebido',
      project:projectById.get(lead.project_id),
      href:projectById.get(lead.project_id)?`/dashboard/${encodeURIComponent(projectById.get(lead.project_id)!.slug)}/leads`:'#'
    })),
    ...projectViews.filter(project=>project.updatedAt).map(project=>({
      key:`project-${project.id}`,
      date:project.updatedAt,
      label:project.published?'Projeto publicado':'Projeto atualizado',
      title:project.name,
      project:projectById.get(project.id),
      href:`/owner/projects/${encodeURIComponent(project.slug)}`
    }))
  ].sort((a,b)=>new Date(b.date||0).getTime()-new Date(a.date||0).getTime()).slice(0,6);

  return <main className={styles.page}>
    <div className={styles.workspace}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.brandMark}>W</div>
          <div className={styles.brandText}><strong>WebAppCap</strong><span>Owner Workspace</span></div>
        </div>
        <div className={styles.topActions}>
          <Link className={styles.buttonGhost} href="/entry">Área do cliente</Link>
          <Link className={styles.button} href="/owner/projects/new">+ Novo cliente</Link>
        </div>
      </header>

      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>CENTRAL OPERACIONAL</span>
          <h1>Sua operação, em uma única visão.</h1>
          <p>Clientes, publicação, leads, alertas e acessos rápidos organizados para você agir sem depender de ferramentas externas no dia a dia.</p>
        </div>
        <div className={styles.heroMeta}>
          <div><strong>{projects.length}</strong><span>projetos ativos</span></div>
          <div><strong>{newLeads}</strong><span>leads aguardando</span></div>
        </div>
      </section>

      <section className={styles.stats} aria-label="Resumo da operação">
        <article className={styles.stat}><span>Total de clientes</span><strong>{projects.length}</strong><small>carteira ativa</small></article>
        <article className={styles.stat}><span>Publicados</span><strong>{published}</strong><small>{configuring} em configuração</small></article>
        <article className={styles.stat}><span>Novos leads</span><strong>{newLeads}</strong><small>aguardando atendimento</small></article>
        <article className={styles.stat}><span>Precisam de atenção</span><strong>{attention}</strong><small>leads, domínio ou publicação</small></article>
      </section>

      <div className={styles.operationGrid}>
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div><h2>Projetos</h2><p>Pesquise, filtre e acesse as principais ações de cada cliente.</p></div>
            <Link className={styles.buttonGhost} href="/owner/projects/new">Adicionar cliente</Link>
          </div>
          {projects.length===0
            ? <div className={styles.empty}>Nenhum projeto criado ainda. Crie o primeiro cliente para iniciar a operação.</div>
            : <OwnerProjectsClient projects={projectViews}/>} 
        </section>

        <aside className={styles.ownerAside}>
          <section className={styles.sidePanel}>
            <div className={styles.sidePanelHead}><div><span className={styles.miniEyebrow}>ATIVIDADE</span><h2>Movimentações recentes</h2></div></div>
            <div className={styles.activityList}>{recentActivity.length===0?<div className={styles.sideEmpty}>Ainda não há movimentações recentes.</div>:recentActivity.map(item=><Link href={item.href} className={styles.activityItem} key={item.key}>
              <i className={item.label==='Novo lead'?styles.activityLead:styles.activityProject}/>
              <div><strong>{item.title}</strong><span>{item.label}{item.project?` · ${item.project.name}`:''}</span><small>{fmtDate(item.date)}</small></div>
              <b>›</b>
            </Link>)}</div>
          </section>

          <section className={styles.sidePanel}>
            <div className={styles.sidePanelHead}><div><span className={styles.miniEyebrow}>ATALHOS</span><h2>Operação rápida</h2></div></div>
            <div className={styles.ownerShortcuts}>
              <Link href="/owner/projects/new"><span>＋</span><div><strong>Novo cliente</strong><small>Criar projeto e convite</small></div></Link>
              <Link href="/entry"><span>↗</span><div><strong>Área do cliente</strong><small>Visualizar experiência externa</small></div></Link>
              {newLeads>0&&projectViews.find(project=>project.leadsNew>0)&&<Link href={`/dashboard/${encodeURIComponent(projectViews.find(project=>project.leadsNew>0)!.slug)}/leads`}><span>◎</span><div><strong>Atender leads</strong><small>{newLeads} aguardando contato</small></div></Link>}
            </div>
          </section>
        </aside>
      </div>
    </div>
  </main>;
}
