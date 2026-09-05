(() => {
  if (!window.WebAppCapData?.ready) return;

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


  const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));

  function hexToRgb(hex){
    const m=String(hex||'').trim().match(/^#?([0-9a-f]{6})$/i);
    if(!m)return null;
    const n=parseInt(m[1],16);
    return {r:(n>>16)&255,g:(n>>8)&255,b:n&255};
  }
  function rgbToHex({r,g,b}){
    return '#'+[r,g,b].map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('');
  }
  function mix(a,b,amount){
    const A=hexToRgb(a),B=hexToRgb(b); if(!A||!B)return a;
    const t=clamp(amount,0,1);
    return rgbToHex({r:A.r+(B.r-A.r)*t,g:A.g+(B.g-A.g)*t,b:A.b+(B.b-A.b)*t});
  }
  function luminance(hex){
    const c=hexToRgb(hex); if(!c)return 0;
    const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};
    return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b);
  }
  function contrast(a,b){
    const x=luminance(a),y=luminance(b);
    return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
  }
  function safeAccent(accent){
    const a=/^#[0-9a-f]{6}$/i.test(String(accent||''))?accent:'#e3bb3d';
    // Accent must support dark button text.
    return contrast(a,'#082720')>=4.2?a:mix(a,'#ffffff',.28);
  }
  function editorialPalette(accent,mode='signature'){
    const a=safeAccent(accent);
    const modes={
      signature:{primary:'#082720',secondary:'#0e3b2e',background:'#f7f4ec',surface:'#ffffff',text:'#171310',muted:'#6f7c75'},
      ink:{primary:'#151515',secondary:'#292929',background:'#f5f1e8',surface:'#ffffff',text:'#171310',muted:'#6f6b63'},
      navy:{primary:'#10283b',secondary:'#173d58',background:'#f4f1e9',surface:'#ffffff',text:'#17202a',muted:'#69747c'}
    };
    return {...(modes[mode]||modes.signature),accent:a};
  }

  function fitnessPalette(accent,mode='performance'){
    const a=safeAccent(accent);
    const modes={
      performance:{primary:'#101312',secondary:'#1d2420',background:'#f4f4ef',surface:'#ffffff',text:'#141615',muted:'#6d746f'},
      redline:{primary:'#111111',secondary:'#271515',background:'#f5f2ed',surface:'#ffffff',text:'#171313',muted:'#736969'},
      fresh:{primary:'#10251d',secondary:'#18372a',background:'#f3f5ef',surface:'#ffffff',text:'#142019',muted:'#68766e'}
    };
    return {...(modes[mode]||modes.performance),accent:a};
  }

  function guardTheme(t,project){
    if(project?.site_type==='journalist'){
      const mode=t.guardrails?.palette_mode||'signature';
      t.colors={...t.colors,...editorialPalette(t.colors?.accent,mode)};
      t.guardrails={...(t.guardrails||{}),enabled:true,palette_mode:mode};
    }else if(project?.site_type==='personal_trainer'){
      const mode=t.guardrails?.palette_mode||'performance';
      t.colors={...t.colors,...fitnessPalette(t.colors?.accent,mode)};
      t.guardrails={...(t.guardrails||{}),enabled:true,palette_mode:mode};
    }
    return t;
  }

  function mergeTheme(raw){
    const t = structuredClone(defaults);
    if(!raw) return t;
    for(const group of Object.keys(t)){
      if(raw[group] && typeof raw[group] === 'object'){
        Object.assign(t[group], raw[group]);
      }
    }
    if(raw?.guardrails)t.guardrails={...raw.guardrails};
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

  function loadThemeFonts(t){
    const families=[t.typography.heading,t.typography.body,t.typography.mono]
      .filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i);
    const builtIn=new Set(['Inter','Fraunces','IBM Plex Mono']);
    const extra=families.filter(f=>!builtIn.has(f));
    if(!extra.length)return;
    const id='webappcap-dynamic-fonts';
    const href='https://fonts.googleapis.com/css2?'+extra
      .map(f=>'family='+encodeURIComponent(f).replace(/%20/g,'+')+':wght@400;500;600;700')
      .join('&')+'&display=swap';
    let link=document.getElementById(id);
    if(!link){link=document.createElement('link');link.id=id;link.rel='stylesheet';document.head.appendChild(link)}
    if(link.href!==href)link.href=href;
  }

  function applyTheme(raw,project=null){
    const t=guardTheme(mergeTheme(raw),project);
    loadThemeFonts(t);
    const root=document.documentElement;
    const isDefaultProject = slug === cfg.projectSlug;
    root.dataset.vitrineThemeScope = isDefaultProject ? 'default' : 'tenant';

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
      /*
       * Theme isolation:
       * colors flow primarily through the original template variables.
       * Avoid forcing component backgrounds/display/layout here.
       */
      :where(.btn,button,a.btn){
        border-radius:var(--vp-button-radius)!important;
        font-weight:var(--vp-button-weight)!important;
      }
      :where(.about-photo img,.contact-photo img){
        border-radius:var(--vp-radius)!important;
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
      :where(.btn,button,a.btn){
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
      /* Density changes spacing rather than scaling whole modules. */
      [data-vitrine-module]{
        --vp-density-factor:var(--vp-density);
      }

      /* Editorial guardrails: semantic surfaces, never rainbow sections. */
      html[data-vitrine-theme-scope="tenant"] body{
        min-height:100vh;
        background:var(--vp-background)!important;
      }
      html[data-vitrine-theme-scope="tenant"] :where(#sobre,#portfolio,#formacao){
        background:var(--vp-background)!important;
        color:var(--vp-text)!important;
      }
      html[data-vitrine-theme-scope="tenant"] :where(#experiencia,#contato,#instagram){
        background:var(--vp-primary)!important;
        color:#fff!important;
      }
      html[data-vitrine-theme-scope="tenant"] :where(#cobertura,#wsop-featured){
        background:var(--vp-secondary)!important;
        color:#fff!important;
      }
      html[data-vitrine-theme-scope="tenant"] :where(.press-card,.mock-card,.card){
        background:var(--vp-surface);
      }
      html[data-vitrine-theme-scope="tenant"] footer{
        background:var(--vp-primary)!important;
      }
    `;

    document.dispatchEvent(new CustomEvent('vitrine:theme-ready',{detail:t}));
  }

  async function loadTheme(){
    try{
      const data=await window.WebAppCapData.ready;
      applyTheme(data.snapshot?.theme?.content,data.project);
    }catch(error){
      console.warn('WebAppCap Theme: usando tema padrão.',error);
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
