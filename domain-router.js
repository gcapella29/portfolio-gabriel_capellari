(() => {
  if (!window.supabase || !window.VITRINE_SUPABASE) return;

  const cfg = window.VITRINE_SUPABASE;
  const host = location.hostname.toLowerCase();
  const primaryHosts = new Set([
    'portfolio-gabriel-capellari.vercel.app',
    'localhost',
    '127.0.0.1'
  ]);

  if (primaryHosts.has(host) || host.endsWith('.vercel.app')) {
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
        .eq('is_published', true)
        .maybeSingle();

      if (q.error) throw q.error;
      let slug = q.data?.slug;

      if (!slug) {
        const firstLabel = host.split('.')[0];
        if (firstLabel && firstLabel !== 'www') {
          q = await sb.from('projects')
            .select('slug')
            .eq('subdomain', firstLabel)
            .eq('is_published', true)
            .maybeSingle();

          if (q.error) throw q.error;
          slug = q.data?.slug;
        }
      }

      if (!slug) {
        fail('Este domínio ainda não está associado a um projeto publicado.');
        return;
      }

      // Same route used by the regular public project URL.
      location.replace(`/p/${encodeURIComponent(slug)}`);
    } catch (error) {
      console.error('Vitrine domain resolver', error);
      fail('Não foi possível resolver o domínio. Tente novamente em instantes.');
    }
  };

  findProject();
})();
