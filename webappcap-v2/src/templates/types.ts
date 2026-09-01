import type { SegmentKey } from '@/core/domain';
import type { V2Content } from '@/core/onboarding-data';

export type TemplateRenderProject = {
  id: string;
  slug: string;
  name: string;
  segment: SegmentKey;
  templateKey: string | null;
};

export type TemplateRenderProps = {
  project: TemplateRenderProject;
  data: V2Content;
  preview?: boolean;
};

export type TemplateRenderer = (props: TemplateRenderProps) => React.ReactNode;
