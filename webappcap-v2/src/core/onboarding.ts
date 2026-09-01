import type { OnboardingStep, ProjectContext, ProjectRole } from './domain';

const orderedSteps: OnboardingStep[] = [
  'account','template','identity','content','media','appearance','contact','domain','review','completed'
];

export function nextOnboardingStep(current: OnboardingStep): OnboardingStep {
  const index = orderedSteps.indexOf(current);
  if (index < 0 || index >= orderedSteps.length - 1) return 'completed';
  return orderedSteps[index + 1];
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

export function canChooseTemplate(role: ProjectRole) {
  return role === 'owner' || role === 'admin';
}

export const onboardingLabels: Record<OnboardingStep, string> = {
  account:'Conta',
  template:'Modelo',
  identity:'Identidade',
  content:'Conteúdo',
  media:'Fotos',
  appearance:'Aparência',
  contact:'Contato',
  domain:'Endereço',
  review:'Revisão',
  completed:'Concluído'
};
