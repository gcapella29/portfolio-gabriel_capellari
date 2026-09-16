import { createSupabaseServerClient } from '@/lib/supabase/server';
import { validateCustomDomain } from '@/core/domain-validation';
import { attachCustomDomain, detachCustomDomain, isVercelDomainAutomationConfigured, verifyCustomDomain } from '@/core/vercel-domains';

export type ProjectDomainStatus = 'unconfigured' | 'native' | 'pending' | 'active' | 'error';

export function normalizeNativeSubdomain(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 63);
}

export function normalizeCustomDomain(value: string) {
  return value.toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/\.$/, '').trim();
}

async function ensureDomainAvailability(projectId: string, native: string, custom: string) {
  const sb = await createSupabaseServerClient();
  if (native) {
    const dupe = await sb.from('project_v2_state').select('project_id').eq('native_subdomain', native).neq('project_id', projectId).maybeSingle();
    if (dupe.error) throw dupe.error;
    if (dupe.data) throw new Error('Esse subdomínio já está em uso.');
  }
  if (custom) {
    const dupe = await sb.from('project_v2_state').select('project_id').eq('custom_domain', custom).neq('project_id', projectId).maybeSingle();
    if (dupe.error) throw dupe.error;
    if (dupe.data) throw new Error('Esse domínio próprio já está vinculado a outro projeto.');
  }
}

export async function saveProjectDomains(input: { projectId: string; nativeSubdomain: string; customDomain: string; syncVercel?: boolean }) {
  const native = normalizeNativeSubdomain(input.nativeSubdomain);
  const custom = normalizeCustomDomain(input.customDomain);
  await ensureDomainAvailability(input.projectId, native, custom);

  const sb = await createSupabaseServerClient();
  const previous = await sb.from('project_v2_state').select('custom_domain').eq('project_id', input.projectId).maybeSingle();
  if (previous.error) throw previous.error;
  const oldCustom = previous.data?.custom_domain || '';

  let domainStatus: ProjectDomainStatus = custom ? 'pending' : native ? 'native' : 'unconfigured';
  let vercel: 'manual' | 'ok' | 'error' = 'manual';
  if (input.syncVercel !== false && isVercelDomainAutomationConfigured()) {
    try {
      if (oldCustom && oldCustom !== custom) await detachCustomDomain(oldCustom);
      if (custom && oldCustom !== custom) {
        const attached = await attachCustomDomain(custom);
        domainStatus = attached.verified ? 'active' : 'pending';
      }
      vercel = 'ok';
    } catch (error) {
      console.error('[project-domains] Vercel domain sync failed', error);
      domainStatus = custom ? 'error' : domainStatus;
      vercel = 'error';
    }
  }

  const now = new Date().toISOString();
  const state = await sb.from('project_v2_state').update({ native_subdomain: native || null, custom_domain: custom || null, domain_status: domainStatus, updated_at: now }).eq('project_id', input.projectId);
  if (state.error) throw state.error;
  const legacy = await sb.from('projects').update({ subdomain: native || null, custom_domain: custom || null, domain_status: domainStatus === 'native' ? 'active' : domainStatus }).eq('id', input.projectId);
  if (legacy.error) throw legacy.error;

  return { native, custom, domainStatus, vercel };
}

export async function verifyProjectCustomDomain(projectId: string) {
  const sb = await createSupabaseServerClient();
  const state = await sb.from('project_v2_state').select('custom_domain').eq('project_id', projectId).maybeSingle();
  if (state.error) throw state.error;
  const custom = state.data?.custom_domain || '';
  if (!custom) return { status: 'missing' as const };

  let ok = false;
  if (isVercelDomainAutomationConfigured()) {
    try {
      const verified = await verifyCustomDomain(custom);
      ok = verified.verified;
    } catch (error) {
      console.error('[project-domains] Vercel domain verify failed', error);
    }
  }
  if (!ok) {
    const dns = await validateCustomDomain(custom);
    ok = dns.ok;
  }
  if (!ok) return { status: 'pending' as const };

  const now = new Date().toISOString();
  const a = await sb.from('project_v2_state').update({ domain_status: 'active', updated_at: now }).eq('project_id', projectId);
  if (a.error) throw a.error;
  const b = await sb.from('projects').update({ domain_status: 'active' }).eq('id', projectId);
  if (b.error) throw b.error;
  return { status: 'active' as const };
}
