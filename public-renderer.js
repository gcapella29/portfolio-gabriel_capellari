(() => {
  const app = document.getElementById('app');
  if (!app || !window.WebAppCapData?.ready) return;

  let locale = 'pt';
  let data = null;

  const esc = value => String(value ?? '')
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'",'&#39;');
  const rich = value => esc(value)
    .replace(/&lt;br\s*\/?&gt;/gi,'<br>')
    .replace(/&lt;em&gt;/gi,'<em>').replace(/&lt;\/em&gt;/gi,'</em>')
    .replace(/\n/g,'<br>');
  const local = (obj,key) => obj?.[`${key}_${locale}`] ?? obj?.[`${key}_pt`] ?? obj?.[key] ?? '';
  const section = key => data?.snapshot?.[key] || null;
  const content = key => section(key)?.content || {};
  const visible = key => section(key)?.is_visible !== false && !!section(key);
  const cleanUrl = value => {
    const url=String(value||'').trim();
    if(!url)return '';
    if(url.startsWith('/')||/^https?:\/\//i.test(url))return url;
    return '';
  };

  function applyTheme(){
    const t=content('theme');
    const c=t.colors||{};
    const typo=t.typography||{};
    const layout=t.layout||{};
    const r=document.documentElement.style;
    if(c.primary)r.setProperty('--primary',c.primary);
    if(c.secondary)r.setProperty('--secondary',c.secondary);
    if(c.accent)r.setProperty('--accent',c.accent);
    if(c.background)r.setProperty('--background',c.background);
    if(c.surface)r.setProperty('--surface',c.surface);
    if(c.text)r.setProperty('--text',c.text);
    if(c.muted)r.setProperty('--muted',c.muted);
    const fonts={Fraunces:"'Fraunces',serif",Montserrat:"'Montserrat',sans-serif",Inter:"'Inter',sans-serif",'DM Sans':"'DM Sans',sans-serif"};
    if(typo.heading)r.setProperty('--heading',fonts[typo.heading]||`'${typo.heading}',sans-serif`);
    if(typo.body)r.setProperty('--body',fonts[typo.body]||`'${typo.body}',sans-serif`);
    if(layout.content_width)r.setProperty('--max',`${parseInt(layout.content_width,10)||1180}px`);
    const radius={small:'8px',medium:'14px',large:'22px'}[layout.radius];
    if(radius)r.setProperty('--radius',radius);
    const themeColor=document.querySelector('meta[name="theme-color"]')||document.head.appendChild(Object.assign(document.createElement('meta'),{name:'theme-color'}));
    themeColor.content=c.primary||'#082720';
  }

  function setMeta(selector,attr,value){
    if(!value)return;
    let el=document.querySelector(selector);
    if(!el){el=document.createElement('meta');document.head.appendChild(el)}
    if(selector.includes('property='))el.setAttribute('property',attr);else el.setAttribute('name',attr);
    el.setAttribute('content',value);
  }

  function applySeo(){
    const s=content('seo');
    const hero=content('hero');
    const title=local(s,'title')||data.project.name||'WebAppCap';
    const description=local(s,'description')||local(hero,'role')||'';
    document.title=title;
    setMeta('meta[name="description"]','description',description);
    setMeta('meta[property="og:title"]','og:title',title);
    setMeta('meta[property="og:description"]','og:description',description);
    setMeta('meta[name="twitter:title"]','twitter:title',title);
    setMeta('meta[name="twitter:description"]','twitter:description',description);
    const og=cleanUrl(s.og_image_url)||cleanUrl(content('media').hero_url);
    if(og){setMeta('meta[property="og:image"]','og:image',og);setMeta('meta[name="twitter:image"]','twitter:image',og)}
    if(s.canonical_url){let link=document.querySelector('link[rel="canonical"]');if(!link){link=document.createElement('link');link.rel='canonical';document.head.appendChild(link)}link.href=s.canonical_url}
  }

  function applySchema(){
    document.querySelectorAll('script[data-webappcap-schema]').forEach(x=>x.remove());
    const h=content('hero'), c=content('contact'), i=content('instagram');
    const name=String(h.name_html||data.project.name||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
    const sameAs=[];
    if(c.linkedin_url)sameAs.push(c.linkedin_url);
    if(c.instagram_user)sameAs.push(`https://www.instagram.com/${c.instagram_user.replace(/^@/,'')}/`);
    else if(i.user)sameAs.push(`https://www.instagram.com/${i.user.replace(/^@/,'')}/`);
    const json={'@context':'https://schema.org','@type':content('seo').schema_type||'Person',name,description:local(content('seo'),'description')||local(h,'role'),email:c.email1||undefined,sameAs:sameAs.length?sameAs:undefined};
    const script=document.createElement('script');script.type='application/ld+json';script.dataset.webappcapSchema='1';script.textContent=JSON.stringify(json);document.head.appendChild(script);
  }

  function hero(){
    const h=content('hero'),m=content('media');
    const bg=cleanUrl(m.hero_url)||cleanUrl(m.hero_path);
    const langs=Array.isArray(h.languages)?h.languages:[];
    const cv=cleanUrl(c('contact').cv_url);
    return `<header class="hero" id="inicio"><div class="hero-bg" ${bg?`style="background-image:url('${esc(bg)}');background-position:${Number(m.hero_x)||50}% ${Number(m.hero_y)||50}%"`:''}></div><div class="hero-inner"><div class="hero-top"><span class="badge">${esc(h.location||'')}</span></div><h1>${rich(h.name_html||data.project.name)}</h1><div class="hero-role">${rich(local(h,'role'))}</div>${langs.length?`<div class="chips">${langs.map(x=>`<span class="chip">${esc(x.flag||'')} ${esc(x.language||'')}${x.level?` — ${esc(x.level)}`:''}</span>`).join('')}</div>`:''}<div class="actions"><a class="btn primary" href="#contato">${locale==='pt'?'Entrar em contato':'Get in touch'} →</a>${cv?`<a class="btn" href="${esc(cv)}" target="_blank" rel="noopener">${locale==='pt'?'Currículo':'Resume'} ↗</a>`:''}<button class="btn" id="langSwitch" type="button">${locale==='pt'?'EN':'PT'}</button></div></div></header>`;
  }
  const c = key => content(key);

  function ticker(){const items=c('hero').ticker||[];if(!items.length)return'';const one=items.map(x=>`<span>${esc(typeof x==='string'?x:x.value||'')}</span>`).join('');return `<div class="ticker"><div class="ticker-track"><div class="ticker-group">${one}</div><div class="ticker-group">${one}</div></div></div>`}
  function stats(){const items=c('stats').items||[];if(!items.length)return'';return `<section class="stats" id="destaques">${items.map(x=>`<div class="stat"><strong>${esc(x.num)}</strong><span>${esc(local(x,'label'))}</span></div>`).join('')}</section>`}
  function about(){const a=c('about'),m=c('media'),img=cleanUrl(m.about_url)||cleanUrl(m.about_path);return `<section class="section alt" id="sobre"><div class="about-grid">${img?`<div class="photo"><img src="${esc(img)}" alt="${esc(m.about_alt||data.project.name)}" loading="lazy"></div>`:''}<div class="copy"><div class="eyebrow">${esc(local(a,'eyebrow'))}</div><h2>${rich(local(a,'title'))}</h2><p>${rich(local(a,'paragraph1'))}</p>${local(a,'paragraph2')?`<p>${rich(local(a,'paragraph2'))}</p>`:''}</div></div></section>`}
  function featured(){const w=c('wsop'),m=c('media'),gallery=Array.isArray(m.wsop_gallery)?m.wsop_gallery:[];const first=gallery[0];const img=cleanUrl(first?.url||first?.path||'');return `<section class="section" id="destaque"><div class="feature-grid">${img?`<div class="photo"><img src="${esc(img)}" alt="${esc(first?.alt||local(w,'title'))}" loading="lazy"></div>`:''}<div class="copy"><div class="eyebrow">${esc(local(w,'eyebrow'))}</div><h2>${rich(local(w,'title'))}</h2><p>${rich(local(w,'description'))}</p>${Array.isArray(w.points)&&w.points.length?`<div class="tags">${w.points.map(x=>`<span class="tag">${esc(typeof x==='string'?x:x.value||'')}</span>`).join('')}</div>`:''}</div></div></section>`}
  function coverage(){const x=c('coverage'),items=x.items||[];return `<section class="section dark" id="trabalhos"><div class="eyebrow">${esc(local(x,'eyebrow'))}</div><h2>${rich(local(x,'title'))}</h2><div class="rows" style="margin-top:2rem">${items.map(i=>`<div class="row"><span>${esc(i.event||i.name||'')}</span><small>${esc(i.years||i.detail||'')}</small></div>`).join('')}</div></section>`}
  function portfolio(){const p=c('portfolio'),items=p.items||[];return `<section class="section" id="portfolio"><div class="eyebrow">${esc(local(p,'eyebrow'))}</div><h2>${rich(local(p,'title'))}</h2>${p.profile_name||local(p,'bio')?`<div class="copy" style="max-width:760px;margin:1.5rem 0 2rem"><h3>${esc(p.profile_name||'')}</h3><p>${rich(local(p,'bio'))}</p></div>`:''}<div class="cards">${items.map(i=>`<a class="card" href="${esc(cleanUrl(i.url)||'#')}" ${i.url?'target="_blank" rel="noopener"':''}><h3>${esc(i.name||'')}</h3><p>${rich(local(i,'desc'))}</p></a>`).join('')}</div></section>`}
  function experience(){const e=c('experience'),items=e.items||[];return `<section class="section dark" id="experiencia"><div class="eyebrow">${esc(local(e,'eyebrow'))}</div><h2>${rich(local(e,'title'))}</h2><div class="timeline" style="margin-top:2.2rem">${items.map(i=>`<article class="timeline-item"><h3>${esc(local(i,'role'))}</h3><div class="meta">${esc(i.org||'')}${i.years?` · ${esc(i.years)}`:''}</div><p>${rich(local(i,'note'))}</p></article>`).join('')}</div></section>`}
  function education(){const e=c('education'),items=e.items||[],skills=e.skills||[];return `<section class="section alt" id="formacao"><div class="eyebrow">${esc(local(e,'eyebrow'))}</div><h2>${rich(local(e,'title'))}</h2><div class="edu-grid" style="margin-top:2rem"><div>${items.map(i=>`<div style="margin-bottom:1.2rem"><h3 style="font-size:1rem">${esc(local(i,'degree'))}</h3><div class="lead" style="font-size:.8rem">${esc(i.institution||'')}</div></div>`).join('')}</div><div><h3 style="margin-bottom:1rem">${esc(local(e,'skills_title'))}</h3><div class="tags">${skills.map(s=>`<span class="tag">${esc(typeof s==='string'?s:s.value||'')}</span>`).join('')}</div></div></div></section>`}
  function instagram(){const i=c('instagram'),user=String(i.user||'').replace(/^@/,'');const reel=cleanUrl(i.reel_url);const embed=reel?`${reel.replace(/\/$/,'')}/embed`:'';return `<section class="section dark" id="instagram"><div class="feature-grid"><div class="copy"><div class="eyebrow">${esc(local(i,'eyebrow'))}</div><h2>${rich(local(i,'title'))}</h2><p>${rich(local(i,'text'))}</p>${user?`<a class="btn" href="https://www.instagram.com/${esc(user)}/" target="_blank" rel="noopener">@${esc(user)} ↗</a>`:''}</div>${embed?`<div class="social-frame"><iframe src="${esc(embed)}" loading="lazy" title="Instagram"></iframe></div>`:''}</div></section>`}
  function contact(){const x=c('contact');const links=[];if(x.email1)links.push(['E-mail',`mailto:${x.email1}`,x.email1]);if(x.email2)links.push(['E-mail',`mailto:${x.email2}`,x.email2]);if(x.whatsapp_number)links.push(['WhatsApp',`https://wa.me/${String(x.whatsapp_number).replace(/\D/g,'')}`,x.whatsapp_display||x.whatsapp_number]);if(x.instagram_user)links.push(['Instagram',`https://instagram.com/${x.instagram_user.replace(/^@/,'')}`,`@${x.instagram_user.replace(/^@/,'')}`]);if(x.linkedin_url)links.push(['LinkedIn',x.linkedin_url,'LinkedIn']);return `<section class="section dark" id="contato"><div class="contact-grid"><div><div class="eyebrow">${locale==='pt'?'Contato':'Contact'}</div><h2>${rich(local(x,'title')|| (locale==='pt'?'Contato':'Contact'))}</h2></div><div class="contact-links">${links.map(([l,u,v])=>`<a href="${esc(u)}" target="_blank" rel="noopener"><small>${esc(l)}</small><br>${esc(v)}</a>`).join('')}</div></div></section>`}
  function videos(){const v=c('fitness_videos'),items=(v.items||[]).filter(i=>i.url||i.path);return `<section class="section dark" id="videos"><div class="eyebrow">${esc(local(v,'eyebrow'))}</div><h2>${rich(local(v,'title'))}</h2><p class="lead">${rich(local(v,'subtitle'))}</p><div class="video-grid" style="margin-top:2rem">${items.map(i=>{const u=cleanUrl(i.url||i.path);if(!u)return'';if(/instagram\.com/i.test(u))return `<div class="video-card"><iframe src="${esc(u.replace(/\/$/,'')+'/embed')}" loading="lazy" title="${esc(local(i,'title')||'Vídeo')}"></iframe></div>`;return `<div class="video-card"><video src="${esc(u)}" controls playsinline preload="metadata"></video></div>`}).join('')}</div></section>`}
  function schedule(){const s=c('fitness_schedule'),slots=s.slots||[],url=cleanUrl(s.schedule_url);return `<section class="section alt" id="agenda"><div class="eyebrow">${esc(local(s,'eyebrow'))}</div><h2>${rich(local(s,'title'))}</h2><p class="lead">${rich(local(s,'subtitle'))}</p>${slots.length?`<div class="schedule-grid" style="margin-top:2rem">${slots.map(x=>`<div class="slot"><strong>${esc(x.day||'')}</strong><span>${esc(x.time||'')}${x.note?` · ${esc(x.note)}`:''}</span></div>`).join('')}</div>`:''}${url?`<div style="margin-top:1.5rem"><a class="btn primary" style="border-color:var(--accent)" href="${esc(url)}" target="_blank" rel="noopener">${esc(local(s,'cta_label')||'Reservar horário')}</a></div>`:''}</section>`}

  const renderers={fitness_videos:videos,fitness_schedule:schedule,stats,about,wsop:featured,coverage,portfolio,experience,education,instagram,contact};

  function moduleKeys(){
    const mods=c('layout').modules;
    if(Array.isArray(mods)&&mods.length)return mods.filter(m=>m.visible!==false).sort((a,b)=>(a.order||0)-(b.order||0)).map(m=>m.key);
    const fallback=['fitness_videos','fitness_schedule','stats','about','wsop','coverage','portfolio','experience','education','instagram','contact'];
    return fallback.filter(visible);
  }

  function render(){
    let html=hero();
    if(visible('hero') && Array.isArray(c('hero').ticker) && c('hero').ticker.length)html+=ticker();
    for(const key of moduleKeys()){
      if(!visible(key))continue;
      const fn=renderers[key];if(fn)html+=fn();
    }
    app.innerHTML=html;
    const sw=document.getElementById('langSwitch');if(sw)sw.onclick=()=>{locale=locale==='pt'?'en':'pt';applySeo();render()};
    const f=content('footer');
    const footer=document.getElementById('footer');
    if(footer && f && section('footer')?.is_visible!==false){footer.textContent=local(f,'text')||`© ${new Date().getFullYear()} ${data.project.name}`;footer.classList.remove('hidden')}
  }

  window.WebAppCapData.ready.then(result=>{
    data=result;
    applyTheme();applySeo();applySchema();render();
    document.documentElement.dataset.webappcapState='ready';
    document.dispatchEvent(new CustomEvent('webappcap:renderer-ready',{detail:{slug:data.slug,type:data.project.site_type}}));
  }).catch(error=>{
    console.error('[WebAppCap renderer]',error);
    document.documentElement.dataset.webappcapState='error';
  });
})();