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

  /* -------------------------------------------------------
   * TENANT CLOAK (temporary compatibility layer)
   * -------------------------------------------------------
   * site.html still contains Gabriel's legacy static shell. Non-Gabriel
   * tenants therefore stay hidden until content/media/theme are applied.
   * This disappears when the public renderer becomes data-first.
   * ----------------------------------------------------- */
  const tenantSlug = route.slug;
  const isTenant = !isAdmin && tenantSlug && tenantSlug !== cfg.projectSlug;
  if (!isTenant) return;

  const root = document.documentElement;
  root.classList.add('webappcap-tenant-pending');

  const style = document.createElement('style');
  style.id = 'webappcap-tenant-cloak-style';
  style.textContent = `
    html.webappcap-tenant-pending body{background:#082720!important;min-height:100vh}
    html.webappcap-tenant-pending body > *{visibility:hidden!important}
    html.webappcap-tenant-pending::before{
      content:"";position:fixed;inset:0;z-index:2147483646;
      background:radial-gradient(circle at 72% 22%,rgba(227,187,61,.12),transparent 24%),linear-gradient(145deg,#082720 0%,#0e3b2e 58%,#164b3c 100%);
      pointer-events:none
    }
    html.webappcap-tenant-pending::after{
      content:"";position:fixed;left:50%;top:50%;width:28px;height:28px;margin:-14px 0 0 -14px;z-index:2147483647;
      border:2px solid rgba(255,255,255,.22);border-top-color:#e3bb3d;border-radius:50%;animation:webappcapTenantSpin .7s linear infinite;pointer-events:none
    }
    html.webappcap-tenant-failed::after{
      content:"Não foi possível carregar o site.";width:auto;height:auto;margin:0;transform:translate(-50%,-50%);border:0;animation:none;
      color:#f7f4ec;font:600 12px/1.4 "IBM Plex Mono",monospace;white-space:nowrap
    }
    @keyframes webappcapTenantSpin{to{transform:rotate(360deg)}}
  `;
  document.head.appendChild(style);

  const removeGabrielPreload = () => {
    document.querySelectorAll('link[rel="preload"][href*="hero-gabriel"]').forEach(el=>el.remove());
  };
  removeGabrielPreload();
  const headObserver = new MutationObserver(removeGabrielPreload);
  headObserver.observe(document.head,{childList:true,subtree:true});

  const ready = {content:false,media:false,theme:false};
  let revealed = false;

  function reveal(){
    if(revealed) return;
    revealed = true;
    headObserver.disconnect();
    requestAnimationFrame(()=>{
      root.classList.remove('webappcap-tenant-pending','webappcap-tenant-failed');
      root.classList.add('webappcap-tenant-ready');
    });
  }

  function maybeReveal(){ if(ready.content && ready.media && ready.theme) reveal(); }

  window.WebAppCapTenantReveal = reveal;
  window.WebAppCapTenantFail = () => {
    if(revealed) return;
    root.classList.add('webappcap-tenant-failed');
  };

  document.addEventListener('webappcap:content-rendered',()=>{ready.content=true;maybeReveal()},{once:true});
  document.addEventListener('vitrine:tenant-media-ready',()=>{ready.media=true;maybeReveal()},{once:true});
  document.addEventListener('vitrine:theme-ready',()=>{ready.theme=true;maybeReveal()},{once:true});

  setTimeout(()=>{ if(!revealed && ready.content && ready.media) reveal(); },1800);
  setTimeout(()=>{ if(!revealed) window.WebAppCapTenantFail(); },8000);
})();