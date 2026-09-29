import Link from 'next/link';
import {isPlatformOwner,resolveProjectAccess} from '@/core/session';
import {can} from '@/core/permissions';
import {readProjectState,publicProjectUrl} from '@/core/publishing';
import {projectsForUser} from '@/core/projects';
import {logoutDashboardAction,publishDashboardAction} from './actions';
import styles from './dashboard.module.css';


export default async function DashboardLayout({children,params}:{children:React.ReactNode;params:Promise<{slug:string}>}){
 const {slug}=await params,{project,role,user}=await resolveProjectAccess(slug),state=await readProjectState(project.id),base=`/dashboard/${encodeURIComponent(project.slug)}`;
 const [allUserProjects,platformOwner]=await Promise.all([projectsForUser(user.id),isPlatformOwner(user.id)]);
 const ownedProjects=allUserProjects.filter(item=>item.owner_id===user.id&&item.id!==project.id);
 const siteUrl=publicProjectUrl(state,project.slug),commerce=project.segment==='food-business',canSwitchProject=platformOwner||ownedProjects.length>0,switchProjectUrl=platformOwner?'/owner/projects':`/projects?owned=1&from=${encodeURIComponent(project.slug)}`;
 const nav=project.segment==='commerce'?
  [['✎','Editar site',`${base}/editor/bakery`,can(role,'editContent')],['◎','Pedidos',`${base}/orders`,can(role,'viewLeads')],['↗','Analytics',`${base}/analytics`,can(role,'viewLeads')],['♙','Equipe',`${base}/team`,can(role,'inviteMembers')],['⌁','Domínio',`${base}/settings`,can(role,'manageDomain')]] as const:commerce?
  [['✎','Editar site',`${base}/editor`,can(role,'editContent')],['⚡','Venda rápida',`${base}/editor/sales`,can(role,'editContent')],['◎','Pedidos',`${base}/orders`,can(role,'viewLeads')],['↗','Analytics',`${base}/analytics`,can(role,'viewLeads')],['♙','Equipe',`${base}/team`,can(role,'inviteMembers')],['⌁','Domínio',`${base}/settings`,can(role,'manageDomain')]] as const:
  [['⌂','Visão geral',base,true],['✎','Editar site',`${base}/content`,can(role,'editContent')],['▧','Imagens',`${base}/media`,can(role,'manageMedia')],['◐','Design',`${base}/appearance`,can(role,'editAppearance')],['◎','Leads',`${base}/leads`,can(role,'viewLeads')],['↗','Analytics',`${base}/analytics`,can(role,'viewLeads')],['♙','Equipe',`${base}/team`,can(role,'inviteMembers')],['⌁','Domínio',`${base}/settings`,can(role,'manageDomain')]] as const;
 return <div className={styles.shell}>
  <aside className={styles.sidebar}>
   <Link href={base} className={styles.brand}><span className={styles.brandMark}>W</span><span className={styles.brandText}><strong>WebAppCap</strong><small>Área do cliente</small></span></Link>
   <div className={styles.projectMini}><span>PROJETO ATUAL</span><strong>{project.name}</strong><small>{project.isPublished?'Publicado':'Ainda não publicado'}</small></div>
   <nav className={styles.nav} aria-label="Gerenciamento do projeto">{nav.filter(([, , ,show])=>show).map(([icon,label,href])=><Link key={label} href={href}><i aria-hidden="true">{icon}</i><span>{label}</span></Link>)}</nav>
   <div className={styles.sidebarBottom}><Link href={`${base}/account`}>⚙ Configurações</Link>{canSwitchProject?<Link href={switchProjectUrl}>← Trocar projeto</Link>:null}<form action={logoutDashboardAction}><button type="submit" className={styles.logout}>Sair</button></form></div>
  </aside>
  <main className={styles.main}>
   <header className={styles.topbar}><div className={styles.topIdentity}><strong>{project.name}</strong><small className={styles.projectStatus}><i data-live={project.isPublished}/>{project.isPublished?'Publicado':'Ainda não publicado'}{project.isPublished?<span> · {siteUrl.replace(/^https?:\/\//,'')}</span>:null}</small></div><div className={styles.topActions}>{canSwitchProject?<Link className={styles.switchProjectButton} href={switchProjectUrl}>Projetos</Link>:null}
    <Link className={styles.buttonGhost} href={`/preview/${encodeURIComponent(project.slug)}?draft=${Date.now()}`} target="_blank">Visualizar rascunho ↗</Link>
    {project.isPublished?<a className={styles.buttonGhost} href={siteUrl} target="_blank" rel="noopener noreferrer">Site publicado ↗</a>:null}
    {can(role,'publish')?<form action={publishDashboardAction}><input type="hidden" name="slug" value={project.slug}/><button className={styles.publish}>Publicar</button></form>:null}
   </div></header>
   <div className={`${styles.content} ${styles.pageFrame}`}>{children}</div>
  </main>
 </div>;
}
