(() => {
  const cfg = window.VITRINE_SUPABASE;
  const resolver = window.WebAppCapTenantResolver;
  if (!cfg || !resolver) return;

  const route = resolver.fromLocation(window.location);
  const isAdmin = route.isAdmin;
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

  if (!isAdmin) {
    document.addEventListener('webappcap:data-ready', event => {
      const key = String(event.detail?.snapshot?.template?.content?.key || '').toLowerCase();
      if (key !== 'fitness' || document.querySelector('link[data-webappcap-template-skin="fitness"]')) return;
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = '/assets/templates/fitness-v2.css';
      link.dataset.webappcapTemplateSkin = 'fitness';
      document.head.appendChild(link);
    }, { once:true });
  }

  if (route.querySlug && isAdmin) localStorage.setItem('vitrine-current-project', route.querySlug);
  if (isAdmin && !route.querySlug) localStorage.removeItem('vitrine-current-project');

  // Public custom domains/subdomains are intentionally allowed to continue
  // without a slug here. project-data.js resolves the host against the projects
  // table before any tenant UI is rendered. Never fall back to the primary project.
  if (!isAdmin && !route.slug) {
    const host = String(window.location.hostname || '').toLowerCase();
    const isCustomTenantHost = !resolver.isPrimaryHost(host);
    if (isCustomTenantHost) {
      window.VITRINE_PROJECT_CONTEXT.pendingHost = host;
      return;
    }
    if (window.location.pathname !== '/') window.location.replace('/');
  }
})();