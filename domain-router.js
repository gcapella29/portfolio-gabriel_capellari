(() => {
  if (!window.supabase || !window.VITRINE_SUPABASE || !window.WebAppCapTenantResolver) return;

  const cfg = window.VITRINE_SUPABASE;
  const resolver = window.WebAppCapTenantResolver;
  const host = location.hostname.toLowerCase();

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

  const findProject = async () => {
    try {
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

      const path = resolver.publicPath(slug);
      if (!path) throw new Error('Slug de projeto inválido.');
      location.replace(path);

    } catch (error) {
      console.error('WebAppCap domain resolver', error);
      fail('Não foi possível resolver o domínio. Tente novamente em instantes.');
    }
  };

  findProject();
})();
