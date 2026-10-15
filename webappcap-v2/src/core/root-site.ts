import { createSupabaseServerClient } from '@/lib/supabase/server';
import { readSnapshotPreviewBySlug } from './snapshot-preview';

export type RootSiteContent = Record<string, string>;

const normalize = (value: unknown): RootSiteContent => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => typeof item === 'string')
      .map(([key, item]) => [key, String(item).trim()]),
  );
};

export const rootValue = (content: RootSiteContent, key: string, fallback: string) =>
  content[key]?.trim() || fallback;

export const rootSnapshotEnabled = process.env.WEBAPPCAP_ROOT_CONTENT_SOURCE === 'snapshot';

/**
 * Root snapshot is a deliberately gated cutover. Until the production env
 * is explicitly switched, the existing Supabase-backed root stays live.
 * Once enabled, transient snapshot failure uses the legacy root as rollback.
 */
export async function readPublishedRootContent() {
  if (rootSnapshotEnabled) {
    try {
      const published = await readSnapshotPreviewBySlug('webappcap');
      if (published?.project.templateKey === 'platform-root-v1') {
        const value = normalize(published.data.content);
        if (Object.keys(value).length > 0) return value;
      }
      console.warn('Root snapshot not available; using legacy published content');
    } catch (error) {
      console.error('Root snapshot read failed; using legacy published content', error);
    }
  }

  try {
    const sb = await createSupabaseServerClient();
    const result = await sb.rpc('webappcap_public_root_content');
    if (result.error) return {};
    return normalize(result.data);
  } catch {
    return {};
  }
}

export async function readRootDraft() {
  const sb = await createSupabaseServerClient();
  const result = await sb.from('platform_root_content').select('draft,published_at,updated_at').eq('id', true).maybeSingle();
  if (result.error && result.error.code !== 'PGRST116') return { draft: {}, publishedAt: null, updatedAt: null };
  return {
    draft: normalize(result.data?.draft),
    publishedAt: result.data?.published_at || null,
    updatedAt: result.data?.updated_at || null,
  };
}
