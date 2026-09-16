import type { V2Content } from './onboarding-data';

export function emptyV2Content(): V2Content {
  return { identity: {}, content: {}, media: {}, appearance: {}, contact: {} };
}

export function normalizeV2Content(value: Partial<V2Content> | null | undefined): V2Content {
  return {
    identity: value?.identity || {},
    content: value?.content || {},
    media: value?.media || {},
    appearance: value?.appearance || {},
    contact: value?.contact || {},
  };
}

export function mergeV2Section(current: V2Content, section: keyof V2Content, patch: Record<string, unknown>): Record<string, unknown> {
  return { ...current[section], ...patch };
}

export function selectedTemplateKey(appearance: Record<string, unknown>, publishedTemplateKey?: string | null) {
  return String(appearance.preview_template_key || publishedTemplateKey || '').trim();
}

export function publicationFlags(draftUpdatedAt?: string | null, publishedAt?: string | null) {
  const draftAt = draftUpdatedAt ? new Date(draftUpdatedAt).getTime() : 0;
  const liveAt = publishedAt ? new Date(publishedAt).getTime() : 0;
  return {
    hasPublished: liveAt > 0,
    hasPendingChanges: draftAt > liveAt,
    draftUpdatedAt: draftUpdatedAt || null,
    publishedAt: publishedAt || null,
  };
}
