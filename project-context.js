(() => {
  const cfg = window.VITRINE_SUPABASE;
  if (!cfg) return;

  const params = new URLSearchParams(window.location.search);
  const querySlug = params.get('project');

  const cleanPathMatch = window.location.pathname.match(/^\/p\/([a-z0-9-]+)\/?$/i);
  const cleanPathSlug = cleanPathMatch ? decodeURIComponent(cleanPathMatch[1]) : null;

  const cookieMatch = document.cookie.match(/(?:^|;\s*)vitrine_project=([^;]+)/);
  const cookieSlug = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;

  const isAdmin = window.location.pathname.startsWith('/admin');
  const storedSlug = isAdmin ? localStorage.getItem('vitrine-current-project') : null;

  // Public root on the primary domain should always stay on the default project.
  // Query/path/cookie only override it when a tenant route/domain explicitly resolved.
  const resolved =
    querySlug ||
    cleanPathSlug ||
    cookieSlug ||
    storedSlug ||
    cfg.projectSlug;

  window.VITRINE_PROJECT_CONTEXT = {
    slug: resolved,
    defaultSlug: cfg.projectSlug,

    set(slug) {
      if (!slug) return;
      localStorage.setItem('vitrine-current-project', slug);
      this.slug = slug;
    },

    clear() {
      localStorage.removeItem('vitrine-current-project');
      document.cookie = 'vitrine_project=; Max-Age=0; Path=/; SameSite=Lax';
      this.slug = cfg.projectSlug;
    },

    withProject(path) {
      const url = new URL(path, window.location.origin);
      url.searchParams.set('project', this.slug);
      return url.pathname + url.search + url.hash;
    }
  };

  if (querySlug && isAdmin) {
    localStorage.setItem('vitrine-current-project', querySlug);
  }
})();
