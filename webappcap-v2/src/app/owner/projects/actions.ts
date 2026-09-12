'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { resolveProjectAccess } from '@/core/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type DeleteProjectState = {
  error: string | null;
};

const text = (formData: FormData, key: string) => String(formData.get(key) || '').trim();

export async function deleteOwnerProjectAction(
  _previousState: DeleteProjectState,
  formData: FormData
): Promise<DeleteProjectState> {
  const slug = text(formData, 'slug');
  const password = String(formData.get('password') || '');

  if (!slug || !password) return { error: 'Digite sua senha para confirmar a exclusão.' };

  const { user, project, role } = await resolveProjectAccess(slug);
  if (role !== 'owner' || !user.email) return { error: 'Apenas o owner pode excluir este projeto.' };
  if (project.segment === 'portfolio') return { error: 'O portfólio principal é protegido e não pode ser excluído.' };

  try {
    const sb = await createSupabaseServerClient();
    const verification = await sb.auth.signInWithPassword({ email: user.email, password });
    if (verification.error) return { error: 'Senha incorreta. O projeto não foi alterado.' };

    const currentState = await sb
      .from('project_v2_state')
      .select('lifecycle,native_subdomain,custom_domain,domain_status')
      .eq('project_id', project.id)
      .maybeSingle();

    if (currentState.error) return { error: 'Não foi possível preparar a exclusão. Tente novamente.' };

    const now = new Date().toISOString();
    const stateUpdate = await sb
      .from('project_v2_state')
      .update({
        lifecycle: 'archived',
        native_subdomain: null,
        custom_domain: null,
        domain_status: 'unconfigured',
        updated_at: now
      })
      .eq('project_id', project.id);

    if (stateUpdate.error) return { error: 'Não foi possível excluir o projeto. Nenhum dado foi alterado.' };

    const projectUpdate = await sb
      .from('projects')
      .update({
        archived_at: now,
        is_published: false,
        subdomain: null,
        custom_domain: null,
        domain_status: 'unconfigured'
      })
      .eq('id', project.id)
      .eq('owner_id', user.id)
      .select('id')
      .maybeSingle();

    if (projectUpdate.error || !projectUpdate.data) {
      if (currentState.data) {
        await sb.from('project_v2_state').update({
          lifecycle: currentState.data.lifecycle,
          native_subdomain: currentState.data.native_subdomain,
          custom_domain: currentState.data.custom_domain,
          domain_status: currentState.data.domain_status,
          updated_at: now
        }).eq('project_id', project.id);
      }
      return { error: 'Não foi possível excluir o projeto. Nenhum dado foi alterado.' };
    }
  } catch (error) {
    console.error('[owner:delete-project] unexpected failure', {
      projectId: project.id,
      message: error instanceof Error ? error.message : String(error)
    });
    return { error: 'Ocorreu um erro inesperado. O projeto não foi excluído.' };
  }

  revalidatePath('/owner/projects');
  revalidatePath(`/owner/projects/${encodeURIComponent(project.slug)}`);
  redirect(`/owner/projects?deleted=${encodeURIComponent(project.name)}`);
}
