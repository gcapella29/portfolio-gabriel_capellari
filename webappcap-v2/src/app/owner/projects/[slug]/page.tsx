import Link from 'next/link';
import { resolveProjectAccess } from '@/core/session';
import { segments } from '@/core/segments';
import { onboardingPath } from '@/core/onboarding';

export default async function OwnerProjectPage({params}:{params:Promise<{slug:string}>}) {
  const {slug} = await params;
  const {project,role} = await resolveProjectAccess(slug);
  const segment = segments[project.segment];
  return <main className="shell"><section className="hero-panel"><span className="eyebrow">{segment.name} · {role}</span><h1>{project.name}</h1><p>Estado: {project.lifecycle} · onboarding: {project.onboardingStep} · template: {project.templateKey || 'a escolher'}.</p></section><section className="segment-grid"><Link className="segment-card" href={onboardingPath(project.onboardingStep,project.slug)}><span>Configuração</span><h2>Continuar projeto</h2><p>Abre exatamente na etapa correta.</p></Link><Link className="segment-card" href={`/dashboard/${encodeURIComponent(project.slug)}`}><span>Pós-publicação</span><h2>Dashboard</h2><p>Disponível como destino definitivo após o onboarding.</p></Link></section></main>;
}
