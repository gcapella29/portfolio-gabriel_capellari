import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { OnboardingStep, ProjectContext } from './domain';
import { getTemplate } from './segments';

export type V2Content = {
  identity: Record<string, unknown>;
  content: Record<string, unknown>;
  media: Record<string, unknown>;
  appearance: Record<string, unknown>;
  contact: Record<string, unknown>;
};

const emptyContent = (): V2Content => ({identity:{},content:{},media:{},appearance:{},contact:{}});

export async function readV2Content(projectId: string): Promise<V2Content> {
  const sb = await createSupabaseServerClient();
  const q = await sb.from('project_v2_content').select('identity,content,media,appearance,contact').eq('project_id', projectId).maybeSingle();
  if (q.error && q.error.code !== 'PGRST116') throw q.error;
  return q.data ? {
    identity:q.data.identity || {}, content:q.data.content || {}, media:q.data.media || {}, appearance:q.data.appearance || {}, contact:q.data.contact || {}
  } : emptyContent();
}

export async function ensureV2Content(projectId: string) {
  const sb = await createSupabaseServerClient();
  const q = await sb.from('project_v2_content').upsert({project_id:projectId},{onConflict:'project_id'});
  if (q.error) throw q.error;
}

export async function saveV2Section(projectId: string, section: keyof V2Content, value: Record<string, unknown>) {
  const sb = await createSupabaseServerClient();
  await ensureV2Content(projectId);
  const q = await sb.from('project_v2_content').update({[section]:value,updated_at:new Date().toISOString()}).eq('project_id',projectId);
  if (q.error) throw q.error;
}

export async function updateOnboardingState(projectId: string, step: OnboardingStep, patch: Record<string, unknown> = {}) {
  const sb = await createSupabaseServerClient();
  const q = await sb.from('project_v2_state').update({onboarding_step:step,lifecycle:step==='completed'?'ready-to-publish':'onboarding',updated_at:new Date().toISOString(),...patch}).eq('project_id',projectId);
  if (q.error) throw q.error;
}

export function validateTemplateForProject(project: ProjectContext, templateKey: string) {
  const template = getTemplate(project.segment, templateKey);
  if (!template || template.status === 'planned') return null;
  return template;
}

export function publicMediaUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  return base ? `${base}/storage/v1/object/public/webappcap-v2-sites/${path}` : path;
}

export async function uploadProjectImage(projectId: string, file: File, slot: string) {
  if (!file || file.size === 0) return null;
  if (!file.type.startsWith('image/')) throw new Error('Envie apenas arquivos de imagem.');
  if (file.size > 10 * 1024 * 1024) throw new Error('A imagem deve ter no máximo 10 MB.');
  const ext = (file.name.split('.').pop() || 'jpg').replace(/[^a-z0-9]/gi,'').toLowerCase();
  const safeSlot = slot.replace(/[^a-z0-9-]/gi,'-').toLowerCase();
  const path = `${projectId}/${safeSlot}-${crypto.randomUUID()}.${ext}`;
  const sb = await createSupabaseServerClient();
  const bytes = Buffer.from(await file.arrayBuffer());
  const result = await sb.storage.from('webappcap-v2-sites').upload(path, bytes, {contentType:file.type,upsert:false});
  if (result.error) throw result.error;
  return {path,url:publicMediaUrl(path)};
}
