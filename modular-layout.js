(() => {
  if (!window.supabase || !window.VITRINE_SUPABASE) return;

  const cfg = window.VITRINE_SUPABASE;
  const ctx = window.VITRINE_PROJECT_CONTEXT;
  const slug = ctx?.slug || cfg.projectSlug;
  const isDraftPreview = new URLSearchParams(location.search).get('preview') === 'draft';

  const sb = window.supabase.createClient(cfg.url, cfg.publishableKey, {
    auth:{persistSession:true,autoRefreshToken:true}
  });

  const moduleMap = {
    ticker: () => document.querySelector('.ticker-wrap'),
    stats: () => document.getElementById('destaques'),
    about: () => document.getElementById('sobre'),
    wsop: () => document.getElementById('wsop-featured'),
    coverage: () => document.getElementById('cobertura'),
    portfolio: () => document.getElementById('portfolio'),
    experience: () => document.getElementById('experiencia'),
    education: () => document.getElementById('formacao'),
    instagram: () => document.getElementById('instagram'),
    contact: () => document.getElementById('contato')
  };

  function normalizeModules(raw) {
    if (!Array.isArray(raw)) return [];
    return raw
      .filter(x => x && moduleMap[x.key])
      .map((x,i) => ({
        key:String(x.key),
        visible:x.visible !== false,
        order:Number.isFinite(Number(x.order)) ? Number(x.order) : i,
        variant:x.variant || 'default'
      }))
      .sort((a,b)=>a.order-b.order);
  }

  function applyLayout(layout) {
    const modules = normalizeModules(layout?.modules);
    if (!modules.length) return;

    const footer = document.querySelector('footer');
    if (!footer) return;

    // Order each real DOM block before the footer.
    modules.forEach(item => {
      const el = moduleMap[item.key]?.();
      if (!el) return;
      footer.parentNode.insertBefore(el, footer);
      el.dataset.vitrineModule = item.key;
      el.dataset.vitrineVariant = item.variant;

      // Layout visibility can hide a section, but cannot force-show a section
      // that the content CMS itself marked invisible.
      if (!item.visible) {
        el.dataset.layoutHidden = 'true';
        el.style.setProperty('display','none','important');
        el.setAttribute('aria-hidden','true');
      } else {
        delete el.dataset.layoutHidden;
        el.style.removeProperty('display');
        if (el.getAttribute('aria-hidden') === 'true' && !el.hidden) {
          el.removeAttribute('aria-hidden');
        }
      }
    });

    document.dispatchEvent(new CustomEvent('vitrine:layout-ready'));
  }

  async function loadLayout() {
    try {
      const {data:project,error:projectError}=await sb
        .from('projects')
        .select('id')
        .eq('slug',slug)
        .maybeSingle();

      if (projectError || !project) return;

      if (isDraftPreview) {
        const {data:draft,error}=await sb
          .from('project_drafts')
          .select('snapshot')
          .eq('project_id',project.id)
          .maybeSingle();

        if (error) throw error;
        applyLayout(draft?.snapshot?.layout?.content);
        return;
      }

      const {data:row,error}=await sb
        .from('site_content')
        .select('content')
        .eq('project_id',project.id)
        .eq('section_key','layout')
        .maybeSingle();

      if (error) throw error;
      applyLayout(row?.content);
    } catch (error) {
      console.warn('Vitrine Pro Layout: usando ordem padrão.', error);
    }
  }

  // Run after DOM exists, then re-apply after tenant content/media finishes.
  const schedule = () => requestAnimationFrame(() => requestAnimationFrame(loadLayout));

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule, {once:true});
  } else {
    schedule();
  }

  document.addEventListener('vitrine:tenant-content-ready', schedule);
  document.addEventListener('vitrine:tenant-media-ready', schedule);
  document.addEventListener('vitrine:tenant-ready', schedule);
})();
