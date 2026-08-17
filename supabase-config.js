window.VITRINE_SUPABASE = Object.freeze({
  url: "https://ownoyzpjiqbzgaeaoyzl.supabase.co",
  publishableKey: "sb_publishable_q1UwNCcinl7S6KN-oCU1rA_99_17BXw",
  // Legacy identity only. Never use this as an implicit tenant fallback.
  projectSlug: "gabriel-capellari"
});

window.WebAppCapTenantResolver = Object.freeze({
  primaryHosts: Object.freeze([
    'portfolio-gabriel-capellari.vercel.app',
    'webappcap.com.br',
    'www.webappcap.com.br',
    'localhost',
    '127.0.0.1'
  ]),

  cleanSlug(value) {
    const slug = String(value || '').trim();
    return /^[a-z0-9-]+$/i.test(slug) ? slug : null;
  },

  fromLocation(loc = window.location, { admin = loc.pathname.startsWith('/admin') } = {}) {
    const params = new URLSearchParams(loc.search);
    const querySlug = this.cleanSlug(params.get('project'));
    const pathMatch = loc.pathname.match(/^\/p\/([a-z0-9-]+)\/?$/i);
    const pathSlug = this.cleanSlug(pathMatch?.[1]);

    return {
      slug: admin ? querySlug : (querySlug || pathSlug || null),
      querySlug,
      pathSlug,
      isAdmin: admin
    };
  },

  isPrimaryHost(hostname = window.location.hostname) {
    const host = String(hostname || '').toLowerCase();
    return this.primaryHosts.includes(host) || host.endsWith('.vercel.app');
  },

  subdomainFromHost(hostname = window.location.hostname) {
    const host = String(hostname || '').toLowerCase();
    if (this.isPrimaryHost(host)) return null;
    const firstLabel = host.split('.')[0];
    return firstLabel && firstLabel !== 'www' ? firstLabel : null;
  },

  publicPath(slug) {
    const clean = this.cleanSlug(slug);
    return clean ? `/p/${encodeURIComponent(clean)}` : null;
  }
});
