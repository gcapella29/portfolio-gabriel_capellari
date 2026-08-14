(() => {
  if (!window.supabase || !window.VITRINE_SUPABASE) return;

  const cfg = window.VITRINE_SUPABASE;
  const ctx = window.VITRINE_PROJECT_CONTEXT;
  const slug = ctx?.slug || cfg.projectSlug;
  const params = new URLSearchParams(location.search);
  const isDraftPreview = params.get('preview') === 'draft';

  const sb = window.supabase.createClient(cfg.url, cfg.publishableKey, {
    auth:{persistSession:true,autoRefreshToken:true}
  });

  const defaults = {
    colors:{
      primary:'#082720',
      secondary:'#0e3b2e',
      accent:'#e3bb3d',
      background:'#f7f4ec',
      surface:'#ffffff',
      text:'#171310',
      muted:'#728078'
    },
    typography:{
      heading:'Fraunces',
      body:'Inter',
      mono:'IBM Plex Mono',
      scale:'normal'
    },
    layout:{
      content_width:'1200',
      section_spacing:'normal',
      radius:'medium',
      density:'comfortable'
    },
    buttons:{
      style:'pill',
      weight:'600'
    },
    effects:{
      shadow:'soft',
      motion:'normal'
    }
  };

  function mergeTheme(raw){
    const t = structuredClone(defaults);
    if(!raw) return t;
    for(const group of Object.keys(t)){
      if(raw[group] && typeof raw[group] === 'object'){
        Object.assign(t[group], raw[group]);
      }
    }
    return t;
  }

  function ensureStyle(){
    let style=document.getElementById('vitrine-theme-style');
    if(style) return style;
    style=document.createElement('style');
    style.id='vitrine-theme-style';
    document.head.appendChild(style);
    return style;
  }

  function applyTheme(raw){
    const t=mergeTheme(raw);
    const root=document.documentElement;

    root.style.setProperty('--vp-primary', t.colors.primary);
    root.style.setProperty('--vp-secondary', t.colors.secondary);
    root.style.setProperty('--vp-accent', t.colors.accent);
    root.style.setProperty('--vp-background', t.colors.background);
    root.style.setProperty('--vp-surface', t.colors.surface);
    root.style.setProperty('--vp-text', t.colors.text);
    root.style.setProperty('--vp-muted', t.colors.muted);

    // Compatibility layer with the original template.
    // Most of the portfolio CSS still consumes these variables.
    root.style.setProperty('--dark', t.colors.primary);
    root.style.setProperty('--felt-dark', t.colors.primary);
    root.style.setProperty('--felt', t.colors.secondary);
    root.style.setProperty('--gold', t.colors.accent);
    root.style.setProperty('--gold2', t.colors.accent);
    root.style.setProperty('--paper', t.colors.background);
    root.style.setProperty('--cream', t.colors.surface);
    root.style.setProperty('--ink', t.colors.text);
    root.style.setProperty('--muted', t.colors.muted);

    const width=Math.max(760, Math.min(1600, Number(t.layout.content_width)||1200));
    const spacingMap={compact:'2.8rem',normal:'4.8rem',airy:'7rem'};
    const radiusMap={none:'0px',small:'8px',medium:'16px',large:'28px'};
    const densityMap={compact:'.86',comfortable:'1',spacious:'1.12'};
    const scaleMap={small:'.92',normal:'1',large:'1.08'};
    const shadowMap={
      none:'none',
      soft:'0 16px 42px rgba(8,39,32,.10)',
      strong:'0 24px 70px rgba(8,39,32,.18)'
    };

    root.style.setProperty('--vp-content-width', `${width}px`);
    root.style.setProperty('--vp-section-space', spacingMap[t.layout.section_spacing]||spacingMap.normal);
    root.style.setProperty('--vp-radius', radiusMap[t.layout.radius]||radiusMap.medium);
    root.style.setProperty('--vp-density', densityMap[t.layout.density]||densityMap.comfortable);
    root.style.setProperty('--vp-type-scale', scaleMap[t.typography.scale]||scaleMap.normal);
    root.style.setProperty('--vp-shadow', shadowMap[t.effects.shadow]||shadowMap.soft);

    const buttonRadius=t.buttons.style==='square'?'10px':t.buttons.style==='soft'?'16px':'999px';
    root.style.setProperty('--vp-button-radius',buttonRadius);
    root.style.setProperty('--vp-button-weight',t.buttons.weight||'600');

    const motion=t.effects.motion==='reduced'?'.01ms':t.effects.motion==='subtle'?'.18s':'.28s';
    root.style.setProperty('--vp-motion',motion);

    const style=ensureStyle();
    style.textContent=`
      html{font-size:calc(100% * var(--vp-type-scale))}
      body{
        background:var(--vp-background)!important;
        color:var(--vp-text)!important;
        font-family:${JSON.stringify(t.typography.body)},Inter,sans-serif!important;
      }
      .hero,footer,.sidebar{
        background-color:var(--vp-primary)!important;
      }
      :where(.section,.about,.portfolio,.experience,.education,.instagram,.contact,
             #sobre,#portfolio,#experiencia,#formacao,#instagram,#contato,#cobertura,#wsop-featured){
        background-color:var(--vp-background);
        color:var(--vp-text);
      }
      :where(.card,.press-card,.repeat-card,.stat,.contact-card,.media-bio,.board-row,.log-entry,.edu-item){
        background-color:var(--vp-surface)!important;
        color:var(--vp-text)!important;
      }
      h1,h2,h3,h4,.hero-name,.section-head h2{
        font-family:${JSON.stringify(t.typography.heading)},Fraunces,serif!important;
      }
      .eyebrow,.sub,.badge,.btn,.nav,.chip,.poker-chip{
        font-family:${JSON.stringify(t.typography.mono)},"IBM Plex Mono",monospace;
      }
      :where(.wrap,.container,.section-inner,.hero-inner,.footer-inner){
        max-width:var(--vp-content-width)!important;
      }
      :where(section,[data-vitrine-module]){
        scroll-margin-top:2rem;
      }
      :where(.section,.about,.portfolio,.experience,.education,.instagram,.contact,
             #sobre,#portfolio,#experiencia,#formacao,#instagram,#contato,#cobertura,#wsop-featured){
        padding-top:var(--vp-section-space)!important;
        padding-bottom:var(--vp-section-space)!important;
      }
      :where(.card,.press-card,.repeat-card,.stat,.contact-card,.about-photo img,.contact-photo img){
        border-radius:var(--vp-radius)!important;
      }
      :where(.card,.press-card,.stat,.contact-card){
        box-shadow:var(--vp-shadow);
      }
      :where(.btn,button,a.btn){
        border-radius:var(--vp-button-radius)!important;
        font-weight:var(--vp-button-weight)!important;
        transition:transform var(--vp-motion) ease,opacity var(--vp-motion) ease,background var(--vp-motion) ease;
      }
      :where(.btn,button,a.btn):hover{transform:translateY(-1px)}
      body,section,[data-vitrine-module]{transition:background var(--vp-motion) ease,color var(--vp-motion) ease}
      .ticker-wrap,.ticker{
        background:var(--vp-accent)!important;
      }
      .gold,.btn.gold,.publish-btn{
        background:var(--vp-accent)!important;
      }
      .hero,.sidebar,footer{
        --dark:var(--vp-primary);
        --felt:var(--vp-secondary);
      }
      :where(.help,.muted,.desc,.note,.lbl,.inst){
        color:var(--vp-muted)!important;
      }
      [data-vitrine-module]{
        transform:scale(var(--vp-density));
        transform-origin:center top;
      }
      @media(max-width:760px){
        [data-vitrine-module]{transform:none}
      }
    `;

    document.dispatchEvent(new CustomEvent('vitrine:theme-ready',{detail:t}));
  }

  async function loadTheme(){
    try{
      const {data:project,error:projectError}=await sb
        .from('projects')
        .select('id')
        .eq('slug',slug)
        .maybeSingle();
      if(projectError || !project) return;

      if(isDraftPreview){
        const {data:draft,error}=await sb
          .from('project_drafts')
          .select('snapshot')
          .eq('project_id',project.id)
          .maybeSingle();
        if(error) throw error;
        applyTheme(draft?.snapshot?.theme?.content);
        return;
      }

      const {data:row,error}=await sb
        .from('site_content')
        .select('content')
        .eq('project_id',project.id)
        .eq('section_key','theme')
        .maybeSingle();
      if(error) throw error;
      applyTheme(row?.content);
    }catch(error){
      console.warn('Vitrine Pro Theme: usando tema padrão.',error);
      applyTheme(null);
    }
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',loadTheme,{once:true});
  }else loadTheme();

  document.addEventListener('vitrine:tenant-content-ready',loadTheme);
  document.addEventListener('vitrine:layout-ready',loadTheme);
  document.addEventListener('vitrine:tenant-media-ready',loadTheme);
})();
