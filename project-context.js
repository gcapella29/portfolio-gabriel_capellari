
(() => {
  const cfg = window.VITRINE_SUPABASE;
  if (!cfg) return;

  const params = new URLSearchParams(window.location.search);
  const querySlug = params.get('project');
  const storedSlug = localStorage.getItem('vitrine-current-project');
  const resolved = querySlug || storedSlug || cfg.projectSlug;

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
      this.slug = cfg.projectSlug;
    },
    withProject(path) {
      const url = new URL(path, window.location.origin);
      url.searchParams.set('project', this.slug);
      return url.pathname + url.search + url.hash;
    }
  };

  if (querySlug) localStorage.setItem('vitrine-current-project', querySlug);
})();
