import Link from 'next/link';
import {headers} from 'next/headers';
import {resolveProjectAccess} from '@/core/session';
import {can} from '@/core/permissions';
import {readProjectState,publicProjectUrl} from '@/core/publishing';
import {logoutDashboardAction,publishDashboardAction} from './actions';
import styles from './dashboard.module.css';

export default async function DashboardLayout({children,params}:{children:React.ReactNode;params:Promise<{slug:string}>}){
 const {slug}=await params,{project,role}=await resolveProjectAccess(slug),state=await readProjectState(project.id),base=`/dashboard/${encodeURIComponent(project.slug)}`;
 const h=await headers(),host=(h.get('x-forwarded-host')||h.get('host')||'').split(':')[0].toLowerCase(),isolatedHost=host==='localhost'||host==='127.0.0.1'||host.endsWith('.vercel.app'),siteUrl=isolatedHost?`/site/${encodeURIComponent(project.slug)}`:publicProjectUrl(state,project.slug);
 const nav=[['⌂','Visão geral',base,true],['≡','Conteúdo',`${base}/content`,can(role,'editContent')],['▧','Fotos',`${base}/media`,can(role,'manageMedia')],['◐','Aparência',`${base}/appearance`,can(role,'editAppearance')],['◎','Leads',`${base}/leads`,can(role,'viewLeads')],['↗','Analytics',`${base}/analytics`,can(role,'viewLeads')],['⌁','Configurações',`${base}/settings`,can(role,'manageDomain')]] as const;
 return <div className={styles.shell}>
  <aside className={styles.sidebar}>
   <Link href={base} className={styles.brand}><span className={styles.brandMark}>W</span><span className={styles.brandText}><strong>WebAppCap</strong><small>Área do cliente</small></span></Link>
   <div className={styles.projectMini}><span>{role==='owner'?'Owner':'Cliente'}</span><strong>{project.name}</strong><small>{project.isPublished?'Site publicado':'Em configuração'}</small></div>
   <nav className={styles.nav} aria-label="Gerenciamento do projeto">{nav.filter(([, , ,show])=>show).map(([icon,label,href])=><Link key={label} href={href}><i aria-hidden="true">{icon}</i><span>{label}</span></Link>)}</nav>
   <div className={styles.sidebarBottom}><Link href={role==='owner'?'/owner/projects':'/projects'}>← Trocar projeto</Link><form action={logoutDashboardAction}><button type="submit" className={styles.logout}>Sair</button></form></div>
  </aside>
  <main className={styles.main}>
   <header className={styles.topbar}><div className={styles.topIdentity}><span>PROJETO</span><strong>{project.name}</strong></div><div className={styles.topActions}>
    {can(role,'viewLeads')?<Link className={styles.analyticsButton} href={`${base}/analytics`}>Analytics ↗</Link>:null}
    <Link className={styles.buttonGhost} href={`/preview/${encodeURIComponent(project.slug)}`} target="_blank">Preview ↗</Link>
    {project.isPublished?<a className={styles.buttonGhost} href={siteUrl} target="_blank" rel="noopener noreferrer">Ver site ↗</a>:null}
    {can(role,'publish')?<form action={publishDashboardAction}><input type="hidden" name="slug" value={project.slug}/><button className={styles.publish}>Publicar</button></form>:null}
   </div></header>
   <div className={`${styles.content} ${styles.pageFrame}`}>{children}</div>
  </main>
 </div>;
}
