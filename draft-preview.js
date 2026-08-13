
(async () => {
  if (!window.supabase || !window.VITRINE_SUPABASE) return;
  const cfg=window.VITRINE_SUPABASE,sb=window.supabase.createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true}});
  const session=await sb.auth.getSession();
  if(!session.data.session?.user){
    document.body.innerHTML='<main style="font-family:sans-serif;padding:3rem"><h1>Preview privado</h1><p>Faça login em /admin/ e abra o preview novamente.</p></main>';return;
  }
  const p=await sb.from('projects').select('id').eq('owner_id',session.data.session.user.id).eq('slug',cfg.projectSlug).single();
  if(p.error)return;
  const d=await sb.from('project_drafts').select('snapshot').eq('project_id',p.data.id).maybeSingle();
  const s=d.data?.snapshot;if(!s)return;

  const lang=()=>document.documentElement.lang.toLowerCase().startsWith('en')?'en':'pt';
  const pick=(o,k)=>o?.[`${k}_${lang()}`]??o?.[`${k}_pt`]??o?.[k]??'';
  const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');

  function visible(key,id){const sec=s[key],el=document.getElementById(id);if(el&&sec)el.hidden=sec.is_visible===false;return !sec||sec.is_visible!==false}
  function render(){
    let c=s.hero?.content||{};
    const role=document.querySelector('.hero-role'),badge=document.querySelector('.hero .badge'),name=document.querySelector('.hero-name');
    if(name&&c.name_html)name.innerHTML=c.name_html;if(role)role.textContent=pick(c,'role');if(badge&&c.location)badge.textContent=c.location;
    if(Array.isArray(c.ticker)&&c.ticker.length)document.querySelectorAll('.ticker-group').forEach(g=>g.innerHTML=c.ticker.map(x=>`<span>${esc(x)}</span>`).join(''));

    if(s.stats&&visible('stats','destaques')&&Array.isArray(s.stats.content?.items))document.getElementById('destaques').innerHTML=s.stats.content.items.map(i=>`<div class="stat"><div class="num">${esc(i.num)}</div><div class="lbl">${esc(pick(i,'label'))}</div></div>`).join('');

    c=s.about?.content||{};if(s.about&&visible('about','sobre')){const m={aboutEyebrow:'eyebrow',aboutTitle:'title',aboutParagraph1:'paragraph1',aboutParagraph2:'paragraph2'};for(const [id,k] of Object.entries(m)){const el=document.getElementById(id);if(el){if(id==='aboutTitle')el.innerHTML=pick(c,k);else el.textContent=pick(c,k)}}}

    c=s.wsop?.content||{};if(s.wsop&&visible('wsop','wsop-featured')){const r=document.getElementById('wsop-featured');if(r){r.querySelector('.wsop-copy .eyebrow').textContent=pick(c,'eyebrow');r.querySelector('.wsop-copy h2').innerHTML=pick(c,'title');r.querySelector('.wsop-copy p').textContent=pick(c,'description');if(Array.isArray(c.points))r.querySelector('.wsop-points').innerHTML=c.points.map(x=>`<span>${esc(x)}</span>`).join('')}}

    c=s.coverage?.content||{};if(s.coverage&&visible('coverage','cobertura')){const r=document.getElementById('cobertura');if(r){r.querySelector('.section-head .eyebrow').textContent=pick(c,'eyebrow');r.querySelector('.section-head h2').textContent=pick(c,'title');if(Array.isArray(c.items))r.querySelector('.board').innerHTML=c.items.map(i=>`<div class="board-row"><span class="ev">${esc(i.event)}</span><span class="yr">${esc(i.years)}</span></div>`).join('')}}

    c=s.portfolio?.content||{};if(s.portfolio&&visible('portfolio','portfolio')){const r=document.getElementById('portfolio');if(r){r.querySelector('.section-head .eyebrow').textContent=pick(c,'eyebrow');r.querySelector('.section-head h2').textContent=pick(c,'title');const n=r.querySelector('.media-bio-content h3'),b=r.querySelector('.media-bio-content p'),cards=r.querySelector('.press-cards');if(n)n.textContent=c.profile_name||'';if(b)b.textContent=pick(c,'bio');if(cards&&Array.isArray(c.items))cards.innerHTML=c.items.map(i=>`<a class="press-card" href="${esc(i.url)}" target="_blank" rel="noopener"><div><div class="name">${esc(i.name)}</div><div class="desc">${esc(pick(i,'desc'))}</div></div><div class="arrow">→</div></a>`).join('')}}

    c=s.experience?.content||{};if(s.experience&&visible('experience','experiencia')){const r=document.getElementById('experiencia');if(r){r.querySelector('.section-head .eyebrow').textContent=pick(c,'eyebrow');r.querySelector('.section-head h2').textContent=pick(c,'title');if(Array.isArray(c.items))r.querySelector('.log').innerHTML=c.items.map(i=>`<div class="log-entry"><div class="top-line"><span class="role">${esc(pick(i,'role'))}</span><span class="yrs">${esc(i.years)}</span></div><div class="org">${esc(i.org)}</div><div class="note">${esc(pick(i,'note'))}</div></div>`).join('')}}

    c=s.education?.content||{};if(s.education&&visible('education','formacao')){const r=document.getElementById('formacao'),cols=r?.querySelectorAll('.edu-grid > div');if(r){r.querySelector('.section-head .eyebrow').textContent=pick(c,'eyebrow');r.querySelector('.section-head h2').textContent=pick(c,'title')}if(cols?.[0]&&Array.isArray(c.items))cols[0].innerHTML=c.items.map(i=>`<div class="edu-item" style="margin-bottom:1.6rem"><div class="deg">${esc(pick(i,'degree'))}</div><div class="inst">${esc(i.institution)}</div></div>`).join('');if(cols?.[1]&&Array.isArray(c.skills))cols[1].innerHTML=`<div class="stack-title">${esc(pick(c,'skills_title'))}</div><div class="chipstack">${c.skills.map(x=>`<span class="poker-chip">${esc(x)}</span>`).join('')}</div>`}

    c=s.instagram?.content||{};if(s.instagram&&visible('instagram','instagram')){const r=document.getElementById('instagram'),e=r?.querySelector('.section-head .eyebrow'),h=r?.querySelector('.section-head h2'),p=r?.querySelector('.insta-grid > div:first-child > p'),a=document.getElementById('instaHandleLink');if(e)e.textContent=pick(c,'eyebrow');if(h)h.textContent=pick(c,'title');if(p)p.textContent=pick(c,'text');if(a&&c.user){a.textContent=`@${c.user} →`;a.href=`https://www.instagram.com/${c.user}/`}}

    c=s.contact?.content||{};if(s.contact&&visible('contact','contato')){const r=document.getElementById('contato');if(r){const h=r.querySelector('.section-head h2');if(h)h.textContent=pick(c,'title')}}

    c=s.media?.content||{};
    if(c.hero_url){const hb=document.getElementById('heroBg');if(hb){hb.style.backgroundImage=`linear-gradient(180deg,rgba(8,39,32,.48),rgba(8,39,32,.86)),url("${c.hero_url}")`;hb.style.backgroundSize='cover';hb.style.backgroundPosition=c.hero_position||'center center'}}
    const ai=document.querySelector('.about-photo img');if(ai&&c.about_url){ai.src=c.about_url;ai.alt=c.about_alt||ai.alt;ai.style.objectPosition=c.about_position||'top center'}
    const ci=document.querySelector('.contact-photo img');if(ci&&c.contact_url){ci.src=c.contact_url;ci.alt=c.contact_alt||ci.alt;ci.style.objectPosition=c.contact_position||'center center'}

    c=s.seo?.content||{};const title=pick(c,'title'),desc=pick(c,'description');if(title)document.title='PREVIEW · '+title;const md=document.head.querySelector('meta[name="description"]');if(md&&desc)md.content=desc;
  }

  render();
  document.querySelectorAll('[data-language]').forEach(b=>b.addEventListener('click',()=>setTimeout(render,0)));
})();
