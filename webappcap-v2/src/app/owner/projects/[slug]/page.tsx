import Link from 'next/link';
import { resolveProjectAccess } from '@/core/session';
import { segments } from '@/core/segments';
import { onboardingPath } from '@/core/onboarding';

export default async function OwnerProjectPage({params}:{params:Promise<{slug:string}>}) {
  const {slug} = await params;
  const {project,role} = await resolveProjectAccess(slug);
  const segment = segments[project.segment];
  const completed = project.onboardingStep === 'completed';
  return <main className="shell"><div style={{marginBottom:'1rem'}}><Link className="action secondary" href="/owner/projects">← Voltar aos projetos</Link></div><section className="hero-panel"><span className="eyebrow">{segment.name} · {role}</span><h1>{project.name}</h1><p>Estado: {project.lifecycle} · onboarding: {project.onboardingStep} · template: {project.templateKey || 'a escolher'}.</p></section><section className="segment-grid">{!completed&&<Link className="segment-card" href={onboardingPath(project.onboardingStep,project.slug)}><span>Configuração</span><h2>Continuar configuração</h2><p>Abre exatamente na etapa correta.</p></Link>}<Link className="segment-card" href={`/dashboard/${encodeURIComponent(project.slug)}`}><span>{completed?'Projeto pronto':'Pós-publicação'}</span><h2>Abrir Dashboard</h2><p>{completed?'Gerencie conteúdo, fotos, aparência, leads e publicação.':'Disponível como destino definitivo após o onboarding.'}</p></Link></section></main>;
}
