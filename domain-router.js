(() => {
  if (!window.supabase || !window.VITRINE_SUPABASE || !window.WebAppCapTenantResolver) return;

  const cfg = window.VITRINE_SUPABASE;
  const resolver = window.WebAppCapTenantResolver;
  const host = location.hostname.toLowerCase();
  const params = new URLSearchParams(location.search);
  const validationSlug = resolver.cleanSlug(params.get('webappcap_validate'));

  if (resolver.isPrimaryHost(host)) {
    document.documentElement.classList.remove('vitrine-domain-resolving');
    return;
  }

  const sb = window.supabase.createClient(cfg.url, cfg.publishableKey, {
    auth:{persistSession:false,autoRefreshToken:false}
  });

  const fail = (message) => {
    const loader = document.getElementById('vitrineDomainLoader');
    if (loader) {
      loader.innerHTML = `
        <div class="vitrine-domain-loader-inner">
          <strong>Site não encontrado</strong>
          <span>${message}</span>
        </div>`;
    }
  };

  const hostMatchesProject = (project) => {
    const custom = String(project?.custom_domain || '')
      .trim().toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '')
      .replace(/\.$/, '');
    const subdomain = resolver.subdomainFromHost(host);
    const customMatches = !!custom && custom === host;
    const subMatches = !!subdomain && String(project?.subdomain || '').toLowerCase() === subdomain;
    return customMatches || subMatches;
  };

  const redirectToProject = (slug, validation = false) => {
    const path = resolver.publicPath(slug);
    if (!path) throw new Error('Slug de projeto inválido.');
    if (!validation) {
      location.replace(path);
      return;
    }
    const url = new URL(path, location.origin);
    url.searchParams.set('webappcap_validate', slug);
    location.replace(url.pathname + url.search);
  };

  const findValidationProject = async () => {
    if (!validationSlug) return false;

    const q = await sb.from('projects')
      .select('slug,subdomain,custom_domain,domain_status,is_published')
      .eq('slug', validationSlug)
      .eq('is_published', true)
      .maybeSingle();

    if (q.error) throw q.error;
    const project = q.data;
    if (!project || !hostMatchesProject(project)) {
      fail('O endereço de validação não corresponde a este projeto.');
      return true;
    }

    const status = String(project.domain_status || '').toLowerCase();
    if (status !== 'pending' && status !== 'active') {
      fail('Este endereço ainda não está pronto para validação.');
      return true;
    }

    redirectToProject(validationSlug, true);
    return true;
  };

  const findActiveProject = async () => {
    let q = await sb.from('projects')
      .select('slug')
      .eq('custom_domain', host)
      .eq('domain_status', 'active')
      .eq('is_published', true)
      .maybeSingle();

    if (q.error) throw q.error;
    let slug = resolver.cleanSlug(q.data?.slug);

    if (!slug) {
      const subdomain = resolver.subdomainFromHost(host);
      if (subdomain) {
        q = await sb.from('projects')
          .select('slug')
          .eq('subdomain', subdomain)
          .eq('domain_status', 'active')
          .eq('is_published', true)
          .maybeSingle();

        if (q.error) throw q.error;
        slug = resolver.cleanSlug(q.data?.slug);
      }
    }

    if (!slug) {
      fail('Este domínio ainda não está ativo para um projeto publicado.');
      return;
    }

    redirectToProject(slug, false);
  };

  const findProject = async () => {
    try {
      const handledValidation = await findValidationProject();
      if (handledValidation) return;
      await findActiveProject();
    } catch (error) {
      console.error('WebAppCap domain resolver', error);
      fail('Não foi possível resolver o domínio. Tente novamente em instantes.');
    }
  };

  findProject();
})();
