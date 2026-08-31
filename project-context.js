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

  // Projectless admin entry is only a routing screen. Hide it while resolving
  // the signed-in user's destination so the generic content editor never flashes
  // an expected "no project selected" error before Projects/Client opens.
  if (isAdmin && !route.querySlug && (window.location.pathname === '/admin/' || window.location.pathname === '/admin/index.html' || window.location.pathname === '/admin')) {
    document.documentElement.style.visibility = 'hidden';
    queueMicrotask(async () => {
      try {
        if (!window.supabase) {
          document.documentElement.style.visibility = '';
          return;
        }
        const sb = window.WebAppCapEntrySupabase || (window.WebAppCapEntrySupabase = window.supabase.createClient(cfg.url, cfg.publishableKey, { auth:{persistSession:true,autoRefreshToken:true} }));
        const session = (await sb.auth.getSession()).data?.session;
        if (!session) {
          document.documentElement.style.visibility = '';
          return;
        }
        const q = await sb.rpc('webappcap_my_projects', { include_archived:false });
        if (q.error) throw q.error;
        const projects = q.data || [];
        if (!projects.length) {
          document.documentElement.style.visibility = '';
          return;
        }
        if (projects.some(p => String(p.role || '').toLowerCase() === 'owner')) {
          window.location.replace('/admin/projects.html');
          return;
        }
        const chosen = projects.find(p => !p.archived_at) || projects[0];
        window.location.replace(`/admin/client.html?project=${encodeURIComponent(chosen.slug)}`);
      } catch (error) {
        console.warn('[WebAppCap entry routing]', error);
        document.documentElement.style.visibility = '';
      }
    });
  }

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