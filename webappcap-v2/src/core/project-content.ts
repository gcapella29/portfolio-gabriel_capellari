import { readV2Content, saveV2Section, type V2Content } from './onboarding-data';
import { mergeV2Section } from './content-snapshot';

export type ProjectContentSection = keyof Pick<V2Content, 'identity' | 'content' | 'appearance' | 'contact'>;

export async function mergeProjectSection(projectId: string, section: ProjectContentSection, patch: Record<string, unknown>) {
  const current = await readV2Content(projectId);
  const value = mergeV2Section(current, section, patch);
  await saveV2Section(projectId, section, value);
  return value;
}

export async function saveProjectIdentity(projectId: string, patch: Record<string, unknown>) {
  return mergeProjectSection(projectId, 'identity', patch);
}

export async function saveProjectContent(projectId: string, patch: Record<string, unknown>) {
  return mergeProjectSection(projectId, 'content', patch);
}

export async function saveProjectAppearance(projectId: string, patch: Record<string, unknown>) {
  return mergeProjectSection(projectId, 'appearance', patch);
}

export async function saveProjectContact(projectId: string, patch: Record<string, unknown>) {
  return mergeProjectSection(projectId, 'contact', patch);
}
