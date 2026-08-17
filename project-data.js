(() => {
  if (window.WebAppCapData?.ready) return;
  if (!window.supabase || !window.VITRINE_SUPABASE || !window.WebAppCapTenantResolver) return;

  const cfg = window.VITRINE_SUPABASE;
  const resolver = window.WebAppCapTenantResolver;
  const params = new URLSearchParams(location.search);
  const route = resolver.fromLocation(window.location, { admin:false });
  const contextSlug = resolver.cleanSlug(window.VITRINE_PROJECT_CONTEXT?.slug);
  const slug = route.slug || contextSlug || null;
  const isDraft = params.get('preview') === 'draft';

  const client = window.WebAppCapSupabase || (
    window.WebAppCapSupabase = window.supabase.createClient(
      cfg.url,
      cfg.publishableKey,
      { auth:{persistSession:true,autoRefreshToken:true} }
    )
  );

  const rowsToSnapshot = rows => {
    const snapshot = {};
    for (const row of rows || []) {
      snapshot[row.section_key] = {
        content: row.content || {},
        is_visible: row.is_visible !== false,
        sort_order: row.sort_order ?? 0
      };
    }
    return snapshot;
  };

  const snapshotToMap = snapshot => new Map(
    Object.entries(snapshot || {}).map(([section_key, section]) => [
      section_key,
      {
        section_key,
        content: section?.content || {},
        is_visible: section?.is_visible !== false,
        sort_order: section?.sort_order ?? 0
      }
    ])
  );

  const failClosed = error => {
    document.documentElement.dataset.webappcapState = 'error';
    document.documentElement.removeAttribute('data-webappcap-project');
    if (typeof window.WebAppCapTenantFail === 'function') window.WebAppCapTenantFail(error);
    document.dispatchEvent(new CustomEvent('webappcap:data-error', { detail:error }));
  };

  const load = async () => {
    if (!slug) throw new Error('Nenhum projeto foi informado para o renderer.');

    if (window.VITRINE_PROJECT_CONTEXT) window.VITRINE_PROJECT_CONTEXT.slug = slug;

    const projectQuery = client
      .from('projects')
      .select('id,slug,name,site_type,subdomain,custom_domain,is_published,owner_id')
      .eq('slug', slug);

    if (!isDraft) projectQuery.eq('is_published', true);

    const { data: project, error: projectError } = await projectQuery.maybeSingle();
    if (projectError) throw projectError;
    if (!project) throw new Error(isDraft
      ? 'Projeto não encontrado.'
      : 'Projeto não encontrado ou ainda não publicado.');

    if (project.slug !== slug) {
      throw new Error('O projeto retornado não corresponde ao endereço solicitado.');
    }

    let snapshot = {};
    if (isDraft) {
      const { data: draft, error } = await client
        .from('project_drafts')
        .select('snapshot,updated_at,last_published_at')
        .eq('project_id', project.id)
        .maybeSingle();
      if (error) throw error;
      if (!draft) throw new Error('Rascunho não encontrado.');
      snapshot = draft.snapshot || {};
    } else {
      const { data: rows, error } = await client
        .from('site_content')
        .select('section_key,content,is_visible,sort_order')
        .eq('project_id', project.id);
      if (error) throw error;
      snapshot = rowsToSnapshot(rows);
    }

    if (!isDraft && Object.keys(snapshot).length === 0) {
      throw new Error('O projeto está publicado, mas ainda não possui conteúdo publicado.');
    }

    const result = {
      cfg, client, slug, isDraft, project, snapshot,
      contentMap: snapshotToMap(snapshot)
    };

    window.WebAppCapData.data = result;
    document.documentElement.dataset.webappcapProject = slug;
    document.documentElement.dataset.webappcapMode = isDraft ? 'draft' : 'published';
    document.documentElement.dataset.webappcapState = 'ready';
    document.dispatchEvent(new CustomEvent('webappcap:data-ready', { detail: result }));
    return result;
  };

  window.WebAppCapData = {
    data: null,
    ready: load().catch(error => {
      window.WebAppCapData.error = error;
      failClosed(error);
      throw error;
    })
  };
})();
