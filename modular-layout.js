(() => {
  if (!window.WebAppCapData?.ready) return;

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


  function ensureVariantStyles(){
    if(document.getElementById('vitrine-module-variant-styles')) return;

    const style=document.createElement('style');
    style.id='vitrine-module-variant-styles';
    style.textContent=`
      [data-vitrine-module]{transition:opacity .2s ease, transform .2s ease}

      [data-vitrine-module="about"][data-vitrine-variant="image-right"] .about-inner,
      [data-vitrine-module="about"][data-vitrine-variant="image-right"] .about-grid{
        direction:rtl;
      }
      [data-vitrine-module="about"][data-vitrine-variant="image-right"] .about-inner > *,
      [data-vitrine-module="about"][data-vitrine-variant="image-right"] .about-grid > *{
        direction:ltr;
      }
      [data-vitrine-module="about"][data-vitrine-variant="centered"]{
        text-align:center;
      }

      [data-vitrine-module="ticker"][data-vitrine-variant="static"] .ticker{
        animation:none!important;
        transform:none!important;
      }
      [data-vitrine-module="ticker"][data-vitrine-variant="compact"]{
        transform:scaleY(.82);
        transform-origin:center top;
      }

      [data-vitrine-module="stats"][data-vitrine-variant="minimal"] .stat{
        background:transparent!important;
        border-color:transparent!important;
        box-shadow:none!important;
      }
      [data-vitrine-module="stats"][data-vitrine-variant="split"]{
        max-width:980px;
        margin-inline:auto;
      }

      [data-vitrine-module="coverage"][data-vitrine-variant="compact"] .board-row,
      [data-vitrine-module="experience"][data-vitrine-variant="compact"] .log-entry,
      [data-vitrine-module="education"][data-vitrine-variant="compact"] .edu-item{
        padding-block:.55rem!important;
      }

      [data-vitrine-module="portfolio"][data-vitrine-variant="list"] .press-cards{
        grid-template-columns:1fr!important;
      }

      [data-vitrine-module="education"][data-vitrine-variant="stacked"] .edu-grid{
        grid-template-columns:1fr!important;
      }

      [data-vitrine-module="instagram"][data-vitrine-variant="minimal"] .insta-grid{
        grid-template-columns:1fr!important;
      }

      [data-vitrine-module="contact"][data-vitrine-variant="centered"]{
        text-align:center;
      }


      /* Editorial / Jornalista Signature
         Uses the existing DOM and content model, so current projects remain compatible. */
      [data-vitrine-module="ticker"][data-vitrine-variant="editorial-marquee"]{
        border-block:1px solid color-mix(in srgb,var(--vp-accent,#e3bb3d) 32%,transparent);
      }
      [data-vitrine-module="ticker"][data-vitrine-variant="editorial-marquee"] .ticker{
        letter-spacing:.08em;
        text-transform:uppercase;
      }

      [data-vitrine-module="stats"][data-vitrine-variant="editorial-metrics"]{
        position:relative;
      }
      [data-vitrine-module="stats"][data-vitrine-variant="editorial-metrics"] .stat{
        box-shadow:none!important;
        border-radius:0!important;
        border-top:1px solid color-mix(in srgb,var(--vp-text,#171310) 16%,transparent)!important;
        background:transparent!important;
      }

      [data-vitrine-module="about"][data-vitrine-variant="editorial-profile"] .about-inner,
      [data-vitrine-module="about"][data-vitrine-variant="editorial-profile"] .about-grid{
        align-items:center;
        gap:clamp(2rem,5vw,5.5rem);
      }
      [data-vitrine-module="about"][data-vitrine-variant="editorial-profile"] h2{
        max-width:12ch;
      }

      [data-vitrine-module="wsop"][data-vitrine-variant="editorial-feature"]{
        position:relative;
        overflow:hidden;
      }
      [data-vitrine-module="wsop"][data-vitrine-variant="editorial-feature"] h2{
        max-width:11ch;
      }

      [data-vitrine-module="coverage"][data-vitrine-variant="editorial-board"] .board-row{
        border-radius:0!important;
        border-inline:0!important;
        transition:padding-left .18s ease,background .18s ease;
      }
      [data-vitrine-module="coverage"][data-vitrine-variant="editorial-board"] .board-row:hover{
        padding-left:.65rem;
      }

      [data-vitrine-module="portfolio"][data-vitrine-variant="editorial-press"] .press-cards{
        align-items:stretch;
      }
      [data-vitrine-module="portfolio"][data-vitrine-variant="editorial-press"] .press-card{
        position:relative;
        overflow:hidden;
      }
      [data-vitrine-module="portfolio"][data-vitrine-variant="editorial-press"] .press-card::before{
        content:"";
        position:absolute;left:0;top:0;bottom:0;width:3px;
        background:var(--vp-accent,#e3bb3d);
        opacity:.9;
      }

      [data-vitrine-module="experience"][data-vitrine-variant="editorial-timeline"] .log-entry{
        border-left:1px solid color-mix(in srgb,var(--vp-accent,#e3bb3d) 55%,transparent);
        padding-left:clamp(1rem,2vw,1.6rem)!important;
      }

      [data-vitrine-module="education"][data-vitrine-variant="editorial-foundations"] .edu-grid{
        gap:clamp(1.2rem,3vw,2.8rem);
      }

      [data-vitrine-module="instagram"][data-vitrine-variant="editorial-social"] .insta-grid{
        align-items:center;
      }

      [data-vitrine-module="contact"][data-vitrine-variant="editorial-contact"]{
        position:relative;
      }
      [data-vitrine-module="contact"][data-vitrine-variant="editorial-contact"] h2{
        max-width:12ch;
      }

      
      /* Neutral Editorial placeholders: new projects never borrow another project's photography. */
      body:not([data-default-project="true"]) .hero:not(.has-project-image),
      [data-vitrine-module="hero"]:not(.has-project-image){
        background-image:
          radial-gradient(circle at 75% 25%,rgba(227,187,61,.16),transparent 22%),
          linear-gradient(145deg,#082720 0%,#0e3b2e 58%,#164b3c 100%)!important;
      }
      body:not([data-default-project="true"]) .about-photo:empty,
      body:not([data-default-project="true"]) .contact-photo:empty{
        background:
          linear-gradient(145deg,rgba(8,39,32,.05),rgba(227,187,61,.10)),
          #eee9dc;
      }

      @media(max-width:760px){
        [data-vitrine-module="about"][data-vitrine-variant="image-right"] .about-inner,
        [data-vitrine-module="about"][data-vitrine-variant="image-right"] .about-grid{
          direction:ltr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function applyLayout(layout) {
    ensureVariantStyles();
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
      const data=await window.WebAppCapData.ready;
      applyLayout(data.snapshot?.layout?.content);
    } catch (error) {
      console.warn('WebAppCap Layout: usando ordem padrão.', error);
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
