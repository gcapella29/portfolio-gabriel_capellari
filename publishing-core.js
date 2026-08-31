(() => {
  const cleanHost = value => String(value || '')
    .trim().toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .replace(/\.$/, '');

  const cleanSubdomain = value => String(value || '')
    .trim().toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '');

  function routeUrl(project, origin = window.location.origin) {
    const resolver = window.WebAppCapTenantResolver;
    const slug = resolver?.cleanSlug(project?.slug);
    if (!slug) return null;

    try {
      const host = new URL(origin).hostname;
      const isPrimaryProject = slug === resolver?.primaryProjectSlug;
      const isPrimaryHost = typeof resolver?.isPrimaryHost === 'function' && resolver.isPrimaryHost(host);
      if (isPrimaryProject && isPrimaryHost) return new URL('/', origin).href;
    } catch {}

    return new URL(`/p/${encodeURIComponent(slug)}`, origin).href;
  }

  function configuredUrl(project) {
    if (!project) return null;
    const custom = cleanHost(project.custom_domain);
    if (custom) return `https://${custom}/`;
    const subdomain = cleanSubdomain(project.subdomain);
    if (subdomain) return `https://${subdomain}.webappcap.com.br/`;
    return null;
  }

  function validationUrl(project) {
    const configured = configuredUrl(project);
    const slug = window.WebAppCapTenantResolver?.cleanSlug(project?.slug);
    if (!configured || !slug) return null;
    const url = new URL(configured);
    url.searchParams.set('webappcap_validate', slug);
    return url.href;
  }

  function publicUrl(project, origin = window.location.origin) {
    const route = routeUrl(project, origin);
    if (!project) return route;
    return String(project.domain_status || '').toLowerCase() === 'active'
      ? (configuredUrl(project) || route)
      : route;
  }

  function previewUrl(project, origin = window.location.origin) {
    const slug = window.WebAppCapTenantResolver?.cleanSlug(project?.slug);
    if (!slug) return null;
    const url = new URL('/preview.html', origin);
    url.searchParams.set('preview', 'draft');
    url.searchParams.set('project', slug);
    return url.href;
  }

  function stable(value) {
    if (Array.isArray(value)) return value.map(stable);
    if (value && typeof value === 'object') {
      return Object.keys(value).sort().reduce((out, key) => {
        out[key] = stable(value[key]);
        return out;
      }, {});
    }
    return value;
  }

  function fingerprint(snapshot) {
    try { return JSON.stringify(stable(snapshot || {})); }
    catch { return ''; }
  }

  function publicationState({ project, draft, published }) {
    const draftSnapshot = draft?.snapshot || draft || {};
    const publishedSnapshot = published?.snapshot || published || {};
    const hasPublishedContent = Object.keys(publishedSnapshot).length > 0;
    const hasDraft = Object.keys(draftSnapshot).length > 0;

    const updatedAt = draft?.updated_at ? new Date(draft.updated_at).getTime() : NaN;
    const publishedAt = draft?.last_published_at ? new Date(draft.last_published_at).getTime() : NaN;
    let changed;
    if (Number.isFinite(updatedAt) && Number.isFinite(publishedAt)) {
      changed = updatedAt > publishedAt + 999;
    } else {
      changed = hasDraft && fingerprint(draftSnapshot) !== fingerprint(publishedSnapshot);
    }

    const domainStatus = project?.domain_status || 'unconfigured';
    const route = routeUrl(project);
    const configured = configuredUrl(project);
    const publicAddress = publicUrl(project);
    const validationAddress = validationUrl(project);
    return {
      isPublished: project?.is_published === true && hasPublishedContent,
      hasDraft,
      hasPublishedContent,
      hasUnpublishedChanges: changed,
      publishedAt: draft?.last_published_at || null,
      updatedAt: draft?.updated_at || null,
      domainStatus,
      domainIsActive: String(domainStatus).toLowerCase() === 'active',
      configuredUrl: configured,
      validationUrl: validationAddress,
      publicUrl: publicAddress,
      previewUrl: previewUrl(project),
      routeUrl: route
    };
  }

  window.WebAppCapPublishing = Object.freeze({
    cleanHost,
    cleanSubdomain,
    configuredUrl,
    validationUrl,
    publicUrl,
    previewUrl,
    routeUrl,
    fingerprint,
    publicationState
  });
})();