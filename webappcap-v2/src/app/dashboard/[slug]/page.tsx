import { redirect } from 'next/navigation';
import { resolveProjectAccess } from '@/core/session';
import { can } from '@/core/permissions';

export default async function DashboardPage({params}:{params:Promise<{slug:string}>}) {
  const {slug} = await params;
  const {project,role} = await resolveProjectAccess(slug);
  if (project.onboardingStep !== 'completed' && role !== 'owner') redirect(`/setup/${encodeURIComponent(project.slug)}/${project.onboardingStep}`);
  const tools = [
    ['Conteúdo','Textos e informações','editContent'],
    ['Fotos','Biblioteca e enquadramento','manageMedia'],
    ['Aparência','Cores, tipografia e layout','editAppearance'],
    ['Leads','Interessados e contatos','viewLeads'],
    ['Configurações','Domínio, usuários e SEO','manageDomain']
  ] as const;
  return <main className="shell"><section className="hero-panel"><span className="eyebrow">WEBAPPCAP · {role}</span><h1>{project.name}</h1><p>{project.isPublished?'Site publicado.':'Site ainda não publicado.'} Preview, Ver site e Publicar serão ações globais da barra principal.</p></section><section className="segment-grid">{tools.filter(([, ,cap])=>can(role,cap)).map(([name,desc])=><article className="segment-card" key={name}><span>Gerenciar</span><h2>{name}</h2><p>{desc}</p></article>)}</section></main>;
}
