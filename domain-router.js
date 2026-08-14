(() => {
  if (!window.supabase || !window.VITRINE_SUPABASE) return;

  const cfg = window.VITRINE_SUPABASE;
  const host = location.hostname.toLowerCase();

  /*
   * Domínios principais:
   * - deployment original da Vercel
   * - domínio oficial WebAppCap
   * - www do domínio oficial
   *
   * Nesses hosts, NÃO usamos resolução multi-cliente.
   * O index.html principal é exibido normalmente.
   */
  const primaryHosts = new Set([
    'portfolio-gabriel-capellari.vercel.app',
    'webappcap.com.br',
    'www.webappcap.com.br',
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
      // 1. Domínio próprio exato.
      let q = await sb.from('projects')
        .select('slug')
        .eq('custom_domain', host)
        .eq('is_published', true)
        .maybeSingle();

      if (q.error) throw q.error;
      let slug = q.data?.slug;

      // 2. Subdomínio wildcard.
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

      // Mesma rota pública usada pelos projetos.
      location.replace(`/p/${encodeURIComponent(slug)}`);

    } catch (error) {
      console.error('WebAppCap domain resolver', error);
      fail('Não foi possível resolver o domínio. Tente novamente em instantes.');
    }
  };

  findProject();
})();
