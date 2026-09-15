import { createSupabaseServerClient } from '@/lib/supabase/server';

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

export async function readPublishedRootContent() {
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
