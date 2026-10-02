'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { resolveProjectAccess } from '@/core/session';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { removeProjectMedia } from '@/core/remove-project-media';

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

export async function permanentlyDeleteArchivedProjectAction(
  _previousState: DeleteProjectState,
  formData: FormData
): Promise<DeleteProjectState> {
  const slug=text(formData,'slug'),confirmation=text(formData,'confirmation');
  const password=String(formData.get('password')||'');
  if(!slug||confirmation!==slug||!password)return{error:'Digite o identificador exato e sua senha para confirmar.'};
  const {requirePlatformOwner}=await import('@/core/session');
  const user=await requirePlatformOwner();
  if(!user.email)return{error:'Conta sem e-mail para confirmar a exclusão.'};
  const sb=await createSupabaseServerClient();
  const p=await sb.from('projects').select('id,slug,owner_id,archived_at').eq('slug',slug).maybeSingle();
  if(p.error||!p.data||p.data.owner_id!==user.id||!p.data.archived_at||slug==='gabriel-capellari')return{error:'Projeto arquivado não encontrado ou sem permissão.'};
  const archivedProject=p.data;
  const verified=await sb.auth.signInWithPassword({email:user.email,password});
  if(verified.error)return{error:'Senha incorreta. O projeto não foi alterado.'};
  const bucket=sb.storage.from('webappcap-v2-sites');
  try {
    // Project uploads use a flat project-id prefix. Remove storage through the API
    // before deleting the database row so the owner's storage policy still applies.
    await removeProjectMedia(async () => {
      const listing=await bucket.list(archivedProject.id,{limit:1000});
      if(listing.error)throw listing.error;
      const files=(listing.data||[]).filter(item=>item.id).map(item=>`${archivedProject.id}/${item.name}`);
      return files;
    }, async files => {
      const removed=await bucket.remove(files);
      if(removed.error)throw removed.error;
    });
    const deleted=await sb.rpc('permanently_delete_archived_project',{target_project_id:archivedProject.id});
    if(deleted.error)throw deleted.error;
  }catch(error){
    const detail = error && typeof error === 'object' && 'message' in error ? String(error.message) : String(error);
    console.error('[owner:permanent-delete]',{slug,message:detail});
    return{error:detail.includes('migração 025') ? detail : 'Não foi possível concluir a exclusão. O projeto continua arquivado. Consulte os logs do servidor para identificar a falha.'};
  }
  revalidatePath('/owner/projects');
  redirect(`/owner/projects?permanentlyDeleted=${encodeURIComponent(slug)}`);
}
