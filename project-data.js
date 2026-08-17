(() => {
  if (window.WebAppCapData?.ready) return;
  if (!window.supabase || !window.VITRINE_SUPABASE) return;

  const cfg = window.VITRINE_SUPABASE;
  const params = new URLSearchParams(location.search);
  const querySlug = params.get('project')?.trim() || null;
  const pathSlug = location.pathname.match(/^\/p\/([a-z0-9-]+)\/?$/i)?.[1] || null;
  const contextSlug = window.VITRINE_PROJECT_CONTEXT?.slug || null;

  // Public route is authoritative. This prevents stale context/config values
  // from ever selecting a different customer's project.
  const slug = querySlug || pathSlug || contextSlug || null;
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

  const load = async () => {
    if (!slug) {
      throw new Error('Nenhum projeto foi informado para o renderer.');
    }

    // Keep context synchronized with the actual route selected above.
    if (window.VITRINE_PROJECT_CONTEXT) {
      window.VITRINE_PROJECT_CONTEXT.slug = slug;
    }

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

    // Defense in depth: a route must never render data from another slug.
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

    const result = {
      cfg, client, slug, isDraft, project, snapshot,
      contentMap: snapshotToMap(snapshot)
    };

    window.WebAppCapData.data = result;
    document.documentElement.dataset.webappcapProject = slug;
    document.documentElement.dataset.webappcapMode = isDraft ? 'draft' : 'published';
    document.dispatchEvent(new CustomEvent('webappcap:data-ready', { detail: result }));
    return result;
  };

  window.WebAppCapData = {
    data: null,
    ready: load().catch(error => {
      window.WebAppCapData.error = error;
      document.dispatchEvent(new CustomEvent('webappcap:data-error', { detail:error }));
      throw error;
    })
  };
})();