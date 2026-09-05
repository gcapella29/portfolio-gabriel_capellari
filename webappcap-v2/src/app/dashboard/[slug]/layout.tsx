import Link from 'next/link';
import { headers } from 'next/headers';
import { resolveProjectAccess } from '@/core/session';
import { can } from '@/core/permissions';
import { readProjectState, publicProjectUrl } from '@/core/publishing';
import { logoutDashboardAction, publishDashboardAction } from './actions';
import styles from './dashboard.module.css';

export default async function DashboardLayout({children,params}:{children:React.ReactNode;params:Promise<{slug:string}>}){
  const {slug}=await params;
  const {project,role}=await resolveProjectAccess(slug);
  const state=await readProjectState(project.id);
  const base=`/dashboard/${encodeURIComponent(project.slug)}`;
  const h=await headers();
  const host=(h.get('x-forwarded-host')||h.get('host')||'').split(':')[0].toLowerCase();
  const isolatedHost=host==='localhost'||host==='127.0.0.1'||host.endsWith('.vercel.app');
  const siteUrl=isolatedHost?`/site/${encodeURIComponent(project.slug)}`:publicProjectUrl(state,project.slug);
  const nav=[['Início',base,true],['Conteúdo',`${base}/content`,can(role,'editContent')],['Fotos',`${base}/media`,can(role,'manageMedia')],['Aparência',`${base}/appearance`,can(role,'editAppearance')],['Leads',`${base}/leads`,can(role,'viewLeads')],['Configurações',`${base}/settings`,can(role,'manageDomain')]] as const;

  return <div className={styles.shell}>
    <aside className={styles.sidebar}>
      <Link href={base} className={styles.brand}>
        <div className={styles.brandMark}>W</div>
        <div className={styles.brandText}><strong>WebAppCap</strong><span>Project Workspace</span></div>
      </Link>
      <div className={styles.projectMini}><span>{role}</span><strong>{project.name}</strong></div>
      <nav className={styles.nav}>{nav.filter(([, ,show])=>show).map(([label,href])=><Link key={label} href={href}><i className={styles.navDot}/>{label}</Link>)}</nav>
      <div className={styles.sidebarBottom}>
        <Link href={role==='owner'?'/owner/projects':'/projects'}>← Trocar projeto</Link>
        <form action={logoutDashboardAction}><button type="submit" className={styles.logout}>Sair</button></form>
      </div>
    </aside>

    <main className={styles.main}>
      <header className={styles.topbar}>
        <div className={styles.topIdentity}><span>MEU SITE</span><strong>{project.name}</strong></div>
        <div className={styles.topActions}>
          <Link className={styles.buttonGhost} href={`/preview/${encodeURIComponent(project.slug)}`} target="_blank">Preview ↗</Link>
          {project.isPublished&&<a className={styles.buttonGhost} href={siteUrl} target="_blank" rel="noopener">Ver site ↗</a>}
          {can(role,'publish')&&<form action={publishDashboardAction}><input type="hidden" name="slug" value={project.slug}/><button className={styles.publish}>Publicar</button></form>}
        </div>
      </header>
      <div className={`${styles.content} ${styles.pageFrame}`}>{children}</div>
    </main>
  </div>;
}
