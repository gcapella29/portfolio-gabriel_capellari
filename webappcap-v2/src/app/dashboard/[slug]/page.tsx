import Link from 'next/link';
import { redirect } from 'next/navigation';
import { resolveProjectAccess } from '@/core/session';
import { can } from '@/core/permissions';
import { readProjectState } from '@/core/publishing';
import { segments } from '@/core/segments';

export default async function DashboardPage({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{published?:string}>}){
  const {slug}=await params,{published}=await searchParams;const {project,role}=await resolveProjectAccess(slug);if(project.onboardingStep!=='completed'&&role!=='owner')redirect(`/setup/${encodeURIComponent(project.slug)}/${project.onboardingStep}`);const state=await readProjectState(project.id),segment=segments[project.segment],base=`/dashboard/${encodeURIComponent(project.slug)}`;
  const tools=[['Conteúdo','Atualize textos, informações e contatos.',`${base}/content`,'editContent'],['Fotos','Troque logo, hero e galeria.',`${base}/media`,'manageMedia'],['Aparência','Ajuste cor, tipografia, escala e espaçamento.',`${base}/appearance`,'editAppearance'],['Leads','Acompanhe interessados recebidos pelo site.',`${base}/leads`,'viewLeads'],['Configurações','Domínio e informações técnicas essenciais.',`${base}/settings`,'manageDomain']] as const;
  return <div className="dashboard-page"><section className="dashboard-hero"><div><span className="eyebrow">{segment.name}</span><h1>{project.name}</h1><p>{project.isPublished?'Seu site está publicado e pronto para receber atualizações.':'O site ainda não foi publicado.'}</p></div><div className={`status-badge ${project.isPublished?'live':''}`}>{project.isPublished?'● Publicado':'○ Rascunho'}</div></section>{published&&<div className="notice success">Site publicado com sucesso.</div>}<section className="dashboard-summary"><article><span>Modelo</span><strong>{segment.templates.find(t=>t.key===project.templateKey)?.name||'Não definido'}</strong></article><article><span>Endereço</span><strong>{state?.native_subdomain?`${state.native_subdomain}.webappcap.com.br`:'Não configurado'}</strong></article><article><span>Perfil</span><strong>{role}</strong></article></section><section className="tool-grid">{tools.filter(([, , ,cap])=>can(role,cap)).map(([name,desc,href])=><Link className="tool-card" href={href} key={name}><span>Gerenciar</span><h2>{name}</h2><p>{desc}</p><b>→</b></Link>)}</section></div>
}
