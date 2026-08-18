(() => {
  if (window.WebAppCapData?.ready) return;
  if (!window.supabase || !window.VITRINE_SUPABASE || !window.WebAppCapTenantResolver) return;

  const cfg = window.VITRINE_SUPABASE;
  const resolver = window.WebAppCapTenantResolver;
  const schema = window.WebAppCapProjectSchema;
  const params = new URLSearchParams(location.search);
  const route = resolver.fromLocation(window.location, { admin:false });
  const contextSlug = resolver.cleanSlug(window.VITRINE_PROJECT_CONTEXT?.slug);
  const initialSlug = route.slug || contextSlug || null;
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

  const canonicalType = (project, snapshot) => {
    const templateKey = String(snapshot?.template?.content?.key || '').toLowerCase();
    if (templateKey === 'fitness') return 'personal_trainer';
    return schema?.normalizeType ? schema.normalizeType(project.site_type) : project.site_type;
  };

  async function resolveProject() {
    const fields = 'id,slug,name,site_type,subdomain,custom_domain,is_published,owner_id';
    let query = client.from('projects').select(fields);

    if (initialSlug) {
      query = query.eq('slug', initialSlug);
    } else {
      const host = String(location.hostname || '').toLowerCase();
      if (resolver.isPrimaryHost(host)) throw new Error('Nenhum projeto foi informado para o renderer.');
      const subdomain = resolver.subdomainFromHost(host);
      const clauses = [`custom_domain.eq.${host}`];
      if (subdomain) clauses.push(`subdomain.eq.${subdomain}`);
      query = query.or(clauses.join(','));
    }

    if (!isDraft) query = query.eq('is_published', true);
    const { data, error } = await query.limit(2);
    if (error) throw error;
    if (!data?.length) throw new Error(isDraft ? 'Projeto não encontrado.' : 'Projeto não encontrado ou ainda não publicado.');
    if (data.length > 1) throw new Error('O domínio solicitado corresponde a mais de um projeto.');
    return data[0];
  }

  const load = async () => {
    const project = await resolveProject();
    const slug = resolver.cleanSlug(project.slug);
    if (!slug) throw new Error('Projeto retornado com slug inválido.');
    if (initialSlug && slug !== initialSlug) throw new Error('O projeto retornado não corresponde ao endereço solicitado.');
    if (window.VITRINE_PROJECT_CONTEXT) {
      window.VITRINE_PROJECT_CONTEXT.slug = slug;
      window.VITRINE_PROJECT_CONTEXT.hasProject = true;
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

    project.site_type = canonicalType(project, snapshot);

    const result = {
      cfg, client, slug, isDraft, project, snapshot,
      contentMap: snapshotToMap(snapshot)
    };

    window.WebAppCapData.data = result;
    document.documentElement.dataset.webappcapProject = slug;
    document.documentElement.dataset.webappcapProjectType = project.site_type || '';
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