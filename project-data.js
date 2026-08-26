(() => {
  if (window.WebAppCapData?.ready) return;
  if (!window.supabase || !window.VITRINE_SUPABASE || !window.WebAppCapTenantResolver) return;

  const cfg = window.VITRINE_SUPABASE;
  const resolver = window.WebAppCapTenantResolver;
  const schema = window.WebAppCapProjectSchema;
  const params = new URLSearchParams(location.search);
  const route = resolver.fromLocation(window.location, { admin:false });
  const contextSlug = resolver.cleanSlug(window.VITRINE_PROJECT_CONTEXT?.slug);
  const validationSlug = resolver.cleanSlug(params.get('webappcap_validate'));
  const isDraft = params.get('preview') === 'draft';
  const host = String(location.hostname || '').toLowerCase();
  const hostIsPrimary = resolver.isPrimaryHost(host);
  const isDomainValidation = !isDraft && !hostIsPrimary && !!validationSlug;
  const initialSlug = route.slug || (isDomainValidation ? validationSlug : null) || contextSlug || null;

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

  const templateKeyFromType = type => ({
    editorial:'editorial',journalist:'editorial',portfolio:'editorial',other:'editorial',
    personal_trainer:'fitness',fitness:'fitness',
    educator:'educator',language_teacher:'educator',
    local:'local',local_business:'local'
  })[String(type||'').trim().toLowerCase()] || 'editorial';

  const templateNameFromKey = key => ({
    editorial:'Editorial / Jornalista',
    fitness:'Personal Trainer / Fitness',
    educator:'Professor / Consultor',
    local:'Comércio Local'
  })[key] || 'Personalizado';

  const schemaTypeFromProject = project => ['local','local_business'].includes(String(project?.site_type||'').toLowerCase()) ? 'LocalBusiness' : 'Person';

  const normalizeSnapshot = (project, input) => {
    const snapshot = input && typeof input === 'object' ? structuredClone(input) : {};
    const key = String(snapshot?.template?.content?.key || snapshot?.layout?.content?.template_key || templateKeyFromType(project?.site_type)).toLowerCase();
    snapshot.template ||= { is_visible:true, content:{} };
    snapshot.template.content ||= {};
    snapshot.template.content.key ||= key;
    snapshot.template.content.name ||= templateNameFromKey(key);
    snapshot.template.content.version ||= 1;

    snapshot.layout ||= { is_visible:true, content:{} };
    snapshot.layout.content ||= {};
    snapshot.layout.content.template_key ||= key;
    snapshot.layout.content.project_type ||= project?.site_type || '';
    if (!Array.isArray(snapshot.layout.content.modules)) snapshot.layout.content.modules = [];

    snapshot.seo ||= { is_visible:true, content:{} };
    snapshot.seo.content ||= {};
    snapshot.seo.content.schema_type ||= schemaTypeFromProject(project);
    snapshot.seo.content.title_pt ||= project?.name || '';

    snapshot.footer ||= { is_visible:true, content:{} };
    snapshot.footer.content ||= {};
    snapshot.footer.content.brand ||= project?.name || '';
    if (snapshot.footer.content.show_copyright === undefined) snapshot.footer.content.show_copyright = true;

    return snapshot;
  };

  const canonicalType = (project, snapshot) => {
    const templateKey = String(snapshot?.template?.content?.key || '').toLowerCase();
    if (templateKey === 'fitness') return 'personal_trainer';
    if (templateKey === 'educator') return 'language_teacher';
    if (templateKey === 'local') return 'local_business';
    if (templateKey === 'editorial' && ['editorial','other'].includes(String(project.site_type||'').toLowerCase())) return 'journalist';
    return schema?.normalizeType ? schema.normalizeType(project.site_type) : project.site_type;
  };

  const configuredHostMatches = project => {
    const custom = String(project?.custom_domain || '').toLowerCase().replace(/^https?:\/\//,'').replace(/\/.*$/,'').replace(/\.$/,'');
    const subdomain = resolver.subdomainFromHost(host);
    const subMatches = !!subdomain && String(project?.subdomain || '').toLowerCase() === subdomain;
    const customMatches = !!custom && custom === host;
    return customMatches || subMatches;
  };

  async function resolveProject() {
    const fields = 'id,slug,name,site_type,subdomain,custom_domain,domain_status,is_published,owner_id';
    let query = client.from('projects').select(fields);

    if (initialSlug) {
      query = query.eq('slug', initialSlug);
    } else {
      if (hostIsPrimary) throw new Error('Nenhum projeto foi informado para o renderer.');
      const subdomain = resolver.subdomainFromHost(host);
      const clauses = [`custom_domain.eq.${host}`];
      if (subdomain) clauses.push(`subdomain.eq.${subdomain}`);
      query = query.or(clauses.join(',')).eq('domain_status','active');
    }

    if (!isDraft) query = query.eq('is_published', true);
    const { data, error } = await query.limit(2);
    if (error) throw error;
    if (!data?.length) throw new Error(isDraft ? 'Projeto não encontrado.' : 'Projeto não encontrado ou ainda não publicado.');
    if (data.length > 1) throw new Error('O domínio solicitado corresponde a mais de um projeto.');
    return data[0];
  }

  async function requireDraftMembership(project) {
    const { data:{ session }, error:sessionError } = await client.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session?.user) throw new Error('Entre no painel para visualizar este rascunho.');
    const { data:member, error } = await client
      .from('project_members')
      .select('role')
      .eq('project_id', project.id)
      .eq('user_id', session.user.id)
      .maybeSingle();
    if (error) throw error;
    const role = String(member?.role || '').toLowerCase();
    if (!['owner','admin','editor','viewer'].includes(role)) {
      throw new Error('Você não tem acesso ao Preview deste projeto.');
    }
    return role;
  }

  const load = async () => {
    const project = await resolveProject();
    const slug = resolver.cleanSlug(project.slug);
    if (!slug) throw new Error('Projeto retornado com slug inválido.');
    if (initialSlug && slug !== initialSlug) throw new Error('O projeto retornado não corresponde ao endereço solicitado.');

    if (isDraft) await requireDraftMembership(project);

    if (!isDraft && !hostIsPrimary) {
      const status = String(project.domain_status || '').toLowerCase();
      const hostMatches = configuredHostMatches(project);
      const validationAllowed = isDomainValidation && validationSlug === slug && status === 'pending' && hostMatches;
      const activeAllowed = status === 'active' && hostMatches;
      if (!validationAllowed && !activeAllowed) throw new Error('Este domínio ainda não está ativo para este projeto.');
    }

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

    if (!isDraft && Object.keys(snapshot).length === 0) throw new Error('O projeto está publicado, mas ainda não possui conteúdo publicado.');

    snapshot = normalizeSnapshot(project, snapshot);
    project.site_type = canonicalType(project, snapshot);

    const result = { cfg, client, slug, isDraft, isDomainValidation, project, snapshot, contentMap:snapshotToMap(snapshot) };

    window.WebAppCapData.data = result;
    document.documentElement.dataset.webappcapProject = slug;
    document.documentElement.dataset.webappcapProjectType = project.site_type || '';
    document.documentElement.dataset.webappcapTemplate = snapshot.template?.content?.key || '';
    document.documentElement.dataset.webappcapMode = isDraft ? 'draft' : (isDomainValidation ? 'domain-validation' : 'published');
    document.documentElement.dataset.webappcapState = 'ready';
    if (isDomainValidation) document.documentElement.dataset.webappcapDomainValidation = 'true';
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