(() => {
  const cfg = window.VITRINE_SUPABASE;
  const resolver = window.WebAppCapTenantResolver;
  if (!cfg || !resolver) return;

  const route = resolver.fromLocation(window.location);
  const isAdmin = route.isAdmin;
  // Compatibility guard for older admin pages that still contain
  // `context.slug || cfg.projectSlug`. A missing admin selection must never
  // resolve to Gabriel, so legacy consumers receive an explicit non-project
  // sentinel while modern consumers reject it through resolver.cleanSlug().
  const NO_ADMIN_PROJECT = '__no_project_selected__';
  const resolved = isAdmin && !route.slug ? NO_ADMIN_PROJECT : route.slug;

  window.VITRINE_PROJECT_CONTEXT = {
    slug: resolved,
    hasProject: !!route.slug,
    defaultSlug: null,
    legacyPrimarySlug: cfg.projectSlug || null,

    set(slug) {
      const cleanSlug = resolver.cleanSlug(slug);
      if (!cleanSlug) return;
      localStorage.setItem('vitrine-current-project', cleanSlug);
      this.slug = cleanSlug;
      this.hasProject = true;
    },

    clear() {
      localStorage.removeItem('vitrine-current-project');
      document.cookie = 'vitrine_project=; Max-Age=0; Path=/; SameSite=Lax';
      this.slug = isAdmin ? NO_ADMIN_PROJECT : null;
      this.hasProject = false;
    },

    selectedSlug() {
      return this.hasProject ? resolver.cleanSlug(this.slug) : null;
    },

    withProject(path) {
      const url = new URL(path, window.location.origin);
      const selected = this.selectedSlug();
      if (selected) url.searchParams.set('project', selected);
      else url.searchParams.delete('project');
      return url.pathname + url.search + url.hash;
    }
  };

  if (route.querySlug && isAdmin) {
    localStorage.setItem('vitrine-current-project', route.querySlug);
  }

  if (isAdmin && !route.querySlug) {
    localStorage.removeItem('vitrine-current-project');
  }

  if (!isAdmin && !route.slug) {
    if (window.location.pathname !== '/') window.location.replace('/');
    return;
  }
})();
