export type SegmentKey = 'portfolio' | 'personal-trainer' | 'food-business' | 'school';
export type TemplateStatus = 'ready' | 'planned' | 'legacy';
export type ProjectRole = 'owner' | 'admin' | 'editor' | 'viewer';
export type DomainStatus = 'unconfigured' | 'native' | 'pending' | 'active' | 'error';

export type TemplateDefinition = {
  key: string;
  segment: SegmentKey;
  name: string;
  description: string;
  status: TemplateStatus;
  preview?: string;
};

export type ProjectLifecycle = 'draft' | 'invited' | 'onboarding' | 'ready-to-publish' | 'published' | 'archived';

export type OnboardingStep =
  | 'account'
  | 'template'
  | 'identity'
  | 'content'
  | 'media'
  | 'appearance'
  | 'contact'
  | 'domain'
  | 'review'
  | 'completed';

export type ProjectContext = {
  id: string;
  slug: string;
  name: string;
  segment: SegmentKey;
  templateKey: string | null;
  lifecycle: ProjectLifecycle;
  onboardingStep: OnboardingStep;
  isPublished: boolean;
};

export type ProjectV2State = {
  projectId: string;
  segment: SegmentKey;
  templateKey: string | null;
  lifecycle: ProjectLifecycle;
  onboardingStep: OnboardingStep;
  onboardingCompletedAt: string | null;
  nativeSubdomain: string | null;
  customDomain: string | null;
  domainStatus: DomainStatus;
};
