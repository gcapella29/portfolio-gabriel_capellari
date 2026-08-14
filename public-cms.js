(() => {
  if (!window.WebAppCapData?.ready) return;

  const esc = value => String(value ?? '')
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'","&#039;");

  const safeUrl = (value, allowed=['http:','https:']) => {
    if (!value) return '';
    try {
      const u = new URL(value, location.origin);
      return allowed.includes(u.protocol) ? u.href : '';
    } catch { return ''; }
  };

  const sanitizeRich = value => {
    const tpl = document.createElement('template');
    tpl.innerHTML = String(value ?? '');
    const allowed = new Set(['BR','EM','STRONG','I','B']);
    [...tpl.content.querySelectorAll('*')].forEach(el => {
      if (!allowed.has(el.tagName)) el.replaceWith(...el.childNodes);
      else [...el.attributes].forEach(a => el.removeAttribute(a.name));
    });
    return tpl.innerHTML;
  };

  const lang = () =>
    document.documentElement.lang.toLowerCase().startsWith('en') ? 'en' : 'pt';

  const pick = (obj,key) =>
    obj?.[`${key}_${lang()}`] ?? obj?.[`${key}_pt`] ?? obj?.[key] ?? '';

  function setText(el, value) { if (el) el.textContent = value ?? ''; }
  function setRich(el, value) { if (el) el.innerHTML = sanitizeRich(value); }

  function setSectionState(row,id,isTenant){
    const el=document.getElementById(id);
    if (!el) return false;
    if (!row) {
      if (isTenant) el.hidden=true;
      return !isTenant;
    }
    el.hidden=row.is_visible===false;
    return row.is_visible!==false;
  }

  function prepareTenant(isTenant){
    if(!isTenant)return;
    [
      'destaques','sobre','wsop-featured','cobertura','portfolio',
      'experiencia','formacao','instagram','contato'
    ].forEach(id=>{const el=document.getElementById(id);if(el)el.hidden=true});
    const flags=document.querySelector('.hero-flags');
    if(flags){flags.innerHTML='';flags.hidden=true}
    document.querySelectorAll('.ticker-group').forEach(g=>g.innerHTML='');
  }

  function renderHero(map,isTenant){
    const row=map.get('hero');
    if(!row){ if(isTenant) document.querySelector('.hero')?.setAttribute('hidden',''); return; }
    const c=row.content||{};
    setRich(document.querySelector('.hero-name'), c.name_html ?? '');
    setText(document.querySelector('.hero-role'), pick(c,'role'));
    setText(document.querySelector('.hero .badge'), c.location ?? '');

    const flags=document.querySelector('.hero-flags');
    if(flags){
      if(Array.isArray(c.languages)){
        flags.innerHTML=c.languages.map(item=>{
          const left=[item.flag,item.language].filter(Boolean).join(' ');
          const text=item.level?`${left} — ${item.level}`:left;
          return text ? `<span class="chip">${esc(text)}</span>` : '';
        }).join('');
        flags.hidden=c.languages.length===0;
      }else if(isTenant){
        flags.innerHTML='';flags.hidden=true;
      }
    }

    const tickerWrap=document.querySelector('.ticker-wrap');
    if(Array.isArray(c.ticker)){
      document.querySelectorAll('.ticker-group').forEach(g=>{
        g.innerHTML=c.ticker.map(x=>`<span>${esc(typeof x==='string'?x:x?.value)}</span>`).join('');
      });
      if(tickerWrap) tickerWrap.hidden=c.ticker.length===0;
    }else if(isTenant && tickerWrap){
      tickerWrap.hidden=true;
    }
  }

  function renderStats(map,isTenant){
    const row=map.get('stats'); if(!setSectionState(row,'destaques',isTenant)||!row)return;
    const items=row.content?.items;
    const el=document.getElementById('destaques');
    if(Array.isArray(items)&&el) el.innerHTML=items.map(i=>
      `<div class="stat"><div class="num">${esc(i.num)}</div><div class="lbl">${esc(pick(i,'label'))}</div></div>`
    ).join('');
  }

  function renderAbout(map,isTenant){
    const row=map.get('about');if(!setSectionState(row,'sobre',isTenant)||!row)return;
    const c=row.content||{};
    setText(document.getElementById('aboutEyebrow'),pick(c,'eyebrow'));
    setRich(document.getElementById('aboutTitle'),pick(c,'title'));
    setText(document.getElementById('aboutParagraph1'),pick(c,'paragraph1'));
    setText(document.getElementById('aboutParagraph2'),pick(c,'paragraph2'));
  }

  function renderWsop(map,isTenant){
    const row=map.get('wsop');if(!setSectionState(row,'wsop-featured',isTenant)||!row)return;
    const c=row.content||{},root=document.getElementById('wsop-featured');
    setText(root?.querySelector('.wsop-copy .eyebrow'),pick(c,'eyebrow'));
    setRich(root?.querySelector('.wsop-copy h2'),pick(c,'title'));
    setText(root?.querySelector('.wsop-copy p'),pick(c,'description'));
    const pts=root?.querySelector('.wsop-points');
    if(pts&&Array.isArray(c.points))pts.innerHTML=c.points.map(x=>`<span>${esc(typeof x==='string'?x:x?.value)}</span>`).join('');
  }

  function renderCoverage(map,isTenant){
    const row=map.get('coverage');if(!setSectionState(row,'cobertura',isTenant)||!row)return;
    const c=row.content||{},root=document.getElementById('cobertura');
    setText(root?.querySelector('.section-head .eyebrow'),pick(c,'eyebrow'));
    setText(root?.querySelector('.section-head h2'),pick(c,'title'));
    const board=root?.querySelector('.board');
    if(board&&Array.isArray(c.items))board.innerHTML=c.items.map(i=>
      `<div class="board-row"><span class="ev">${esc(i.event)}</span><span class="yr">${esc(i.years)}</span></div>`
    ).join('');
  }

  function renderPortfolio(map,isTenant){
    const row=map.get('portfolio');if(!setSectionState(row,'portfolio',isTenant)||!row)return;
    const c=row.content||{},root=document.getElementById('portfolio');
    setText(root?.querySelector('.section-head .eyebrow'),pick(c,'eyebrow'));
    setText(root?.querySelector('.section-head h2'),pick(c,'title'));
    setText(root?.querySelector('.media-bio-content h3'),c.profile_name??'');
    setText(root?.querySelector('.media-bio-content p'),pick(c,'bio'));
    const cards=root?.querySelector('.press-cards');
    if(cards&&Array.isArray(c.items))cards.innerHTML=c.items.map(i=>{
      const href=safeUrl(i.url)||'#';
      return `<a class="press-card" href="${esc(href)}" target="_blank" rel="noopener noreferrer">
        <div><div class="name">${esc(i.name)}</div><div class="desc">${esc(pick(i,'desc'))}</div></div><div class="arrow">→</div>
      </a>`;
    }).join('');
  }

  function renderExperience(map,isTenant){
    const row=map.get('experience');if(!setSectionState(row,'experiencia',isTenant)||!row)return;
    const c=row.content||{},root=document.getElementById('experiencia');
    setText(root?.querySelector('.section-head .eyebrow'),pick(c,'eyebrow'));
    setText(root?.querySelector('.section-head h2'),pick(c,'title'));
    const log=root?.querySelector('.log');
    if(log&&Array.isArray(c.items))log.innerHTML=c.items.map(i=>
      `<div class="log-entry"><div class="top-line"><span class="role">${esc(pick(i,'role'))}</span><span class="yrs">${esc(i.years)}</span></div><div class="org">${esc(i.org)}</div><div class="note">${esc(pick(i,'note'))}</div></div>`
    ).join('');
  }

  function renderEducation(map,isTenant){
    const row=map.get('education');if(!setSectionState(row,'formacao',isTenant)||!row)return;
    const c=row.content||{},root=document.getElementById('formacao'),cols=root?.querySelectorAll('.edu-grid > div');
    setText(root?.querySelector('.section-head .eyebrow'),pick(c,'eyebrow'));
    setText(root?.querySelector('.section-head h2'),pick(c,'title'));
    if(cols?.[0]&&Array.isArray(c.items))cols[0].innerHTML=c.items.map(i=>
      `<div class="edu-item" style="margin-bottom:1.6rem"><div class="deg">${esc(pick(i,'degree'))}</div><div class="inst">${esc(i.institution)}</div></div>`
    ).join('');
    if(cols?.[1]&&Array.isArray(c.skills))cols[1].innerHTML=
      `<div class="stack-title">${esc(pick(c,'skills_title'))}</div><div class="chipstack">${c.skills.map(x=>`<span class="poker-chip">${esc(typeof x==='string'?x:x?.value)}</span>`).join('')}</div>`;
  }

  function renderInstagram(map,isTenant){
    const row=map.get('instagram');if(!setSectionState(row,'instagram',isTenant)||!row)return;
    const c=row.content||{},root=document.getElementById('instagram');
    setText(root?.querySelector('.section-head .eyebrow'),pick(c,'eyebrow'));
    setText(root?.querySelector('.section-head h2'),pick(c,'title'));
    setText(root?.querySelector('.insta-grid > div:first-child > p'),pick(c,'text'));

    const handle=document.getElementById('instaHandleLink');
    const user=String(c.user||'').replace(/^@/,'').trim();
    if(handle){
      if(user){handle.hidden=false;handle.textContent=`@${user} →`;handle.href=`https://www.instagram.com/${encodeURIComponent(user)}/`}
      else{handle.hidden=true;handle.removeAttribute('href')}
    }

    const frame=document.getElementById('reelFrame');
    const reel=safeUrl(c.reel_url);
    if(frame){
      if(reel){
        frame.hidden=false;
        const embed=reel.replace(/\/?$/,'/')+'embed';
        frame.innerHTML=`<iframe src="${esc(embed)}" allowtransparency="true" allowfullscreen loading="lazy" title="Instagram"></iframe>`;
      }else{
        frame.hidden=true;frame.innerHTML='';
      }
    }
  }

  function renderContact(map,isTenant){
    const row=map.get('contact');if(!setSectionState(row,'contato',isTenant)||!row)return;
    const c=row.content||{},root=document.getElementById('contato');
    setText(root?.querySelector('.section-head h2'),pick(c,'title')||(lang()==='en'?'Contact':'Contato'));

    const anchors=[...root.querySelectorAll('.contact-links a')];
    const emailLinks=anchors.filter(a=>a.href.startsWith('mailto:'));
    const wa=anchors.find(a=>a.href.includes('wa.me'));
    const ig=anchors.find(a=>a.href.includes('instagram.com'));
    const li=anchors.find(a=>a.href.includes('linkedin.com'));

    const configure=(a,show,href,text)=>{
      if(!a)return;
      a.hidden=!show;
      if(show){a.href=href;a.lastChild.nodeValue=` ${text}`}
      else a.removeAttribute('href');
    };

    configure(emailLinks[0],!!c.email1,`mailto:${c.email1}`,c.email1);
    configure(emailLinks[1],!!c.email2,`mailto:${c.email2}`,c.email2);

    const waNum=String(c.whatsapp_number||'').replace(/\D/g,'');
    configure(wa,!!waNum,`https://wa.me/${waNum}`,c.whatsapp_display||c.whatsapp_number||'');

    const igUser=String(c.instagram_user||'').replace(/^@/,'').trim();
    configure(ig,!!igUser,`https://www.instagram.com/${encodeURIComponent(igUser)}/`,`@${igUser} →`);

    const liUrl=safeUrl(c.linkedin_url);
    if(li){li.hidden=!liUrl;if(liUrl)li.href=liUrl;else li.removeAttribute('href')}
  }

  async function render(){
    try{
      const data=await window.WebAppCapData.ready;
      const map=data.contentMap;
      const isTenant=data.slug!==data.cfg.projectSlug;
      prepareTenant(isTenant);

      [renderHero,renderStats,renderAbout,renderWsop,renderCoverage,
       renderPortfolio,renderExperience,renderEducation,renderInstagram,renderContact]
       .forEach(fn=>{try{fn(map,isTenant)}catch(e){console.warn(fn.name,e)}});

      document.dispatchEvent(new CustomEvent('vitrine:tenant-content-ready',{detail:data}));
      document.dispatchEvent(new CustomEvent('webappcap:content-rendered',{detail:data}));
    }catch(error){
      console.warn('WebAppCap conteúdo indisponível',error);
      const tenantLoader=document.getElementById('vitrineTenantLoader');
      if(tenantLoader){
        tenantLoader.innerHTML=`<div class="vitrine-loader-inner"><strong>Site indisponível no momento</strong><span>${esc(error.message)}</span></div>`;
      }
    }
  }

  document.querySelectorAll('[data-language]').forEach(b=>
    b.addEventListener('click',()=>setTimeout(render,0))
  );

  render();
})();