export type SegmentKey = 'portfolio' | 'personal-trainer' | 'food-business' | 'school';

export type TemplateStatus = 'ready' | 'planned' | 'legacy';

export type TemplateDefinition = {
  key: string;
  segment: SegmentKey;
  name: string;
  description: string;
  status: TemplateStatus;
  preview?: string;
};

export type ProjectLifecycle =
  | 'draft'
  | 'invited'
  | 'onboarding'
  | 'ready-to-publish'
  | 'published'
  | 'archived';

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

export type ProjectRole = 'owner' | 'admin' | 'editor' | 'viewer';
