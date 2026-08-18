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

  function publicUrl(project, origin = window.location.origin) {
    if (!project) return null;
    const custom = cleanHost(project.custom_domain);
    if (custom) return `https://${custom}/`;
    const subdomain = cleanSubdomain(project.subdomain);
    if (subdomain) return `https://${subdomain}.webappcap.com.br/`;
    const slug = window.WebAppCapTenantResolver?.cleanSlug(project.slug);
    if (!slug) return null;
    return new URL(`/p/${encodeURIComponent(slug)}`, origin).href;
  }

  function previewUrl(project, origin = window.location.origin) {
    const slug = window.WebAppCapTenantResolver?.cleanSlug(project?.slug);
    if (!slug) return null;
    const url = new URL('/preview.html', origin);
    url.searchParams.set('preview', 'draft');
    url.searchParams.set('project', slug);
    return url.href;
  }

  function routeUrl(project, origin = window.location.origin) {
    const slug = window.WebAppCapTenantResolver?.cleanSlug(project?.slug);
    return slug ? new URL(`/p/${encodeURIComponent(slug)}`, origin).href : null;
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
    const changed = hasDraft && fingerprint(draftSnapshot) !== fingerprint(publishedSnapshot);
    const publishedAt = draft?.last_published_at || null;
    const updatedAt = draft?.updated_at || null;
    return {
      isPublished: project?.is_published === true && hasPublishedContent,
      hasDraft,
      hasPublishedContent,
      hasUnpublishedChanges: changed,
      publishedAt,
      updatedAt,
      domainStatus: project?.domain_status || 'unconfigured',
      publicUrl: publicUrl(project),
      previewUrl: previewUrl(project),
      routeUrl: routeUrl(project)
    };
  }

  window.WebAppCapPublishing = Object.freeze({
    cleanHost,
    cleanSubdomain,
    publicUrl,
    previewUrl,
    routeUrl,
    fingerprint,
    publicationState
  });
})();