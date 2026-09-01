import type { OnboardingStep, ProjectContext, ProjectRole } from './domain';

export const orderedOnboardingSteps: OnboardingStep[] = [
  'account','template','identity','content','media','appearance','contact','domain','review','completed'
];

export function nextOnboardingStep(current: OnboardingStep): OnboardingStep {
  const index = orderedOnboardingSteps.indexOf(current);
  if (index < 0 || index >= orderedOnboardingSteps.length - 1) return 'completed';
  return orderedOnboardingSteps[index + 1];
}

export function previousOnboardingStep(current: OnboardingStep): OnboardingStep {
  const index=orderedOnboardingSteps.indexOf(current);return index<=0?'account':orderedOnboardingSteps[index-1];
}

export function onboardingPath(step: OnboardingStep, slug: string) {
  if (step === 'completed') return `/dashboard/${encodeURIComponent(slug)}`;
  return `/setup/${encodeURIComponent(slug)}/${step}`;
}

export function destinationForUser(project: ProjectContext, role: ProjectRole) {
  if (role === 'owner') return `/owner/projects/${encodeURIComponent(project.slug)}`;
  if (project.onboardingStep !== 'completed') return onboardingPath(project.onboardingStep, project.slug);
  return `/dashboard/${encodeURIComponent(project.slug)}`;
}

export function canChooseTemplate(role: ProjectRole) { return role === 'owner' || role === 'admin'; }

export const onboardingLabels: Record<OnboardingStep, string> = {
  account:'Conta',template:'Modelo',identity:'Identidade',content:'Conteúdo',media:'Fotos',appearance:'Aparência',contact:'Contato',domain:'Endereço',review:'Revisão',completed:'Concluído'
};
