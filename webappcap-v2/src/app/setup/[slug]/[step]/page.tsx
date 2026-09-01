import { redirect } from 'next/navigation';
import { resolveProjectAccess } from '@/core/session';
import { onboardingLabels, onboardingPath } from '@/core/onboarding';
import type { OnboardingStep } from '@/core/domain';

const steps = new Set<OnboardingStep>(['account','template','identity','content','media','appearance','contact','domain','review','completed']);

export default async function SetupPage({params}:{params:Promise<{slug:string;step:string}>}) {
  const {slug,step} = await params;
  const access = await resolveProjectAccess(slug);
  const requested = steps.has(step as OnboardingStep) ? step as OnboardingStep : access.project.onboardingStep;
  if (access.role !== 'owner' && requested !== access.project.onboardingStep) redirect(onboardingPath(access.project.onboardingStep, access.project.slug));
  if (requested === 'completed') redirect(`/dashboard/${encodeURIComponent(access.project.slug)}`);
  return <main className="shell"><section className="hero-panel"><span className="eyebrow">CONFIGURAÇÃO · {onboardingLabels[requested]}</span><h1>{access.project.name}</h1><p>Rota de onboarding resolvida no servidor, sem renderizar telas intermediárias. O formulário desta etapa entra no Bloco 2.</p></section></main>;
}
