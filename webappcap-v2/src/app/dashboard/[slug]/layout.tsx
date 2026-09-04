import Link from 'next/link';
import { headers } from 'next/headers';
import { resolveProjectAccess } from '@/core/session';
import { can } from '@/core/permissions';
import { readProjectState, publicProjectUrl } from '@/core/publishing';
import { logoutDashboardAction, publishDashboardAction } from './actions';

export default async function DashboardLayout({children,params}:{children:React.ReactNode;params:Promise<{slug:string}>}){
  const {slug}=await params;const {project,role}=await resolveProjectAccess(slug);const state=await readProjectState(project.id);const base=`/dashboard/${encodeURIComponent(project.slug)}`;
  const h=await headers();const host=(h.get('x-forwarded-host')||h.get('host')||'').split(':')[0].toLowerCase();const isolatedHost=host==='localhost'||host==='127.0.0.1'||host.endsWith('.vercel.app');
  const siteUrl=isolatedHost?`/site/${encodeURIComponent(project.slug)}`:publicProjectUrl(state,project.slug);
  const nav=[['Início',base,true],['Conteúdo',`${base}/content`,can(role,'editContent')],['Fotos',`${base}/media`,can(role,'manageMedia')],['Aparência',`${base}/appearance`,can(role,'editAppearance')],['Leads',`${base}/leads`,can(role,'viewLeads')],['Configurações',`${base}/settings`,can(role,'manageDomain')]] as const;
  return <div className="dashboard-shell"><aside className="dashboard-sidebar"><Link href={base} className="brand">WebAppCap</Link><div className="project-mini"><span>{role}</span><strong>{project.name}</strong></div><nav>{nav.filter(([, ,show])=>show).map(([label,href])=><Link key={label} href={href}>{label}</Link>)}</nav><div className="sidebar-bottom"><Link href={role==='owner'?'/owner/projects':'/projects'} className="sidebar-exit">← Trocar projeto</Link><form action={logoutDashboardAction}><button className="sidebar-exit sidebar-logout" type="submit">Sair</button></form></div></aside><main className="dashboard-main"><header className="dashboard-topbar"><div><span className="eyebrow dark-text">MEU SITE</span><strong>{project.name}</strong></div><div className="dashboard-actions"><Link className="action secondary" href={`/preview/${encodeURIComponent(project.slug)}`} target="_blank">Preview ↗</Link>{project.isPublished&&<a className="action secondary" href={siteUrl} target="_blank" rel="noopener">Ver site ↗</a>}{can(role,'publish')&&<form action={publishDashboardAction}><input type="hidden" name="slug" value={project.slug}/><button className="action primary">Publicar</button></form>}</div></header>{children}</main></div>
}
