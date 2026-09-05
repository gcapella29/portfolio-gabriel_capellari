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

  const nonEmpty = value => {
    if (Array.isArray(value)) return value.some(nonEmpty);
    if (value && typeof value === 'object') return Object.values(value).some(nonEmpty);
    return String(value ?? '').trim().length > 0;
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

  const setText = (el,value) => { if(el) el.textContent=value ?? ''; };
  const setRich = (el,value) => { if(el) el.innerHTML=sanitizeRich(value); };

  function hasSectionContent(key,row){
    if(!row || row.is_visible===false) return false;
    const c=row.content||{};
    switch(key){
      case 'hero':
        return nonEmpty(c.name_html);
      case 'fitness_videos':
        return Array.isArray(c.items)&&c.items.some(i=>nonEmpty(i?.url));
      case 'fitness_schedule':
        return Array.isArray(c.slots)&&c.slots.some(i=>nonEmpty(i?.day)||nonEmpty(i?.time));
      case 'stats':
        return Array.isArray(c.items) && c.items.some(i=>nonEmpty(i?.num)||nonEmpty(i?.label_pt)||nonEmpty(i?.label_en));
      case 'about':
        // Default heading "Sobre" alone must not create an empty section.
        return [c.paragraph1_pt,c.paragraph1_en,c.paragraph2_pt,c.paragraph2_en].some(nonEmpty);
      case 'wsop':
        return [c.title_pt,c.title_en,c.description_pt,c.description_en].some(nonEmpty)
          || (Array.isArray(c.points)&&c.points.some(nonEmpty));
      case 'coverage':
        return Array.isArray(c.items) && c.items.some(i=>nonEmpty(i?.event)||nonEmpty(i?.years));
      case 'portfolio':
        return nonEmpty(c.bio_pt)||nonEmpty(c.bio_en)
          || (Array.isArray(c.items)&&c.items.some(i=>nonEmpty(i?.name)||nonEmpty(i?.url)||nonEmpty(i?.desc_pt)||nonEmpty(i?.desc_en)));
      case 'experience':
        return Array.isArray(c.items) && c.items.some(i=>nonEmpty(i?.role_pt)||nonEmpty(i?.role_en)||nonEmpty(i?.org)||nonEmpty(i?.years)||nonEmpty(i?.note_pt)||nonEmpty(i?.note_en));
      case 'education':
        return (Array.isArray(c.items)&&c.items.some(i=>nonEmpty(i?.degree_pt)||nonEmpty(i?.degree_en)||nonEmpty(i?.institution)))
          || (Array.isArray(c.skills)&&c.skills.some(nonEmpty));
      case 'instagram':
        return [c.user,c.reel_url,c.text_pt,c.text_en].some(nonEmpty);
      case 'contact':
        return [c.email1,c.email2,c.whatsapp_number,c.instagram_user,c.linkedin_url,c.cv_url].some(nonEmpty);
      default:
        return nonEmpty(c);
    }
  }

  function sectionState(row,id,isTenant,key){
    const el=document.getElementById(id);
    if(!el) return false;
    if(isTenant){
      const show=hasSectionContent(key,row);
      el.hidden=!show;
      return show;
    }
    if(!row) return true;
    el.hidden=row.is_visible===false;
    return row.is_visible!==false;
  }

  function hide(el){ if(el) el.hidden=true; }
  function show(el){ if(el) el.hidden=false; }

  function prepareTenant(){
    [
      'destaques','sobre','wsop-featured','cobertura','portfolio',
      'experiencia','formacao','instagram','contato'
    ].forEach(id=>hide(document.getElementById(id)));

    // Languages: shell starts bilingual, tenant starts with no switch until proven otherwise.
    hide(document.getElementById('languageToggle'));
    const flags=document.querySelector('.hero-flags');
    if(flags){flags.innerHTML='';flags.hidden=true}

    // Static ticker/stats from Gabriel must never survive.
    document.querySelectorAll('.ticker-group').forEach(g=>g.innerHTML='');
    const ticker=document.querySelector('.ticker-wrap'); if(ticker) ticker.hidden=true;
    const stats=document.getElementById('destaques'); if(stats) stats.innerHTML='';

    // Remove every personal shell CTA/link before tenant content is rendered.
    document.querySelectorAll('a[href*="CV-Gabriel-Capellari.pdf"]').forEach(a=>{
      a.hidden=true;a.removeAttribute('href');
    });
    document.querySelectorAll('.hero-actions a[href*="instagram.com"]').forEach(a=>{
      a.hidden=true;a.removeAttribute('href');
    });

    // The contact shell contains Gabriel links and values.
    document.querySelectorAll('#contato .contact-links a,#contato .contact-links button').forEach(el=>el.hidden=true);

    // Static portrait in portfolio never acts as fallback for another project.
    hide(document.querySelector('#portfolio .media-bio-photo'));
    hide(document.querySelector('#portfolio .social-row'));

    // Shell footer is handled by footer-cms.js; hide immediately to avoid a flash.
    hide(document.querySelector('footer'));
  }

  function renderHero(map,isTenant){
    const row=map.get('hero');
    if(!row){
      if(isTenant) hide(document.querySelector('.hero'));
      return;
    }
    const c=row.content||{};
    setRich(document.querySelector('.hero-name'),c.name_html??'');
    setText(document.querySelector('.hero-role'),pick(c,'role'));
    setText(document.querySelector('.hero .badge'),c.location??'');

    const languages=Array.isArray(c.languages)
      ? c.languages.filter(x=>nonEmpty(x?.language)||nonEmpty(x?.flag))
      : [];

    const flags=document.querySelector('.hero-flags');
    if(flags){
      flags.innerHTML=languages.map(item=>{
        const left=[item.flag,item.language].filter(Boolean).join(' ');
        const text=item.level?`${left} — ${item.level}`:left;
        return text?`<span class="chip">${esc(text)}</span>`:'';
      }).join('');
      flags.hidden=languages.length===0;
    }

    // Only offer language switching if there are at least 2 enabled languages.
    const toggle=document.getElementById('languageToggle');
    if(toggle){
      toggle.hidden=languages.length<2;
      if(languages.length<2){
        document.documentElement.lang='pt-BR';
        toggle.querySelectorAll('[data-language]').forEach(b=>{
          b.setAttribute('aria-pressed',b.dataset.language==='pt'?'true':'false');
        });
      }
    }

    const ticker=Array.isArray(c.ticker)?c.ticker.filter(nonEmpty):[];
    document.querySelectorAll('.ticker-group').forEach(g=>{
      g.innerHTML=ticker.map(x=>`<span>${esc(typeof x==='string'?x:x?.value)}</span>`).join('');
    });
    const tickerWrap=document.querySelector('.ticker-wrap');
    if(tickerWrap) tickerWrap.hidden=ticker.length===0;
  }


  function instagramEmbedUrl(url){
    try{
      const u=new URL(url,location.origin);
      if(!/(^|\.)instagram\.com$/i.test(u.hostname))return '';
      const m=u.pathname.match(/\/(reel|p)\/([^/]+)/i);
      return m?`https://www.instagram.com/${m[1]}/${m[2]}/embed`:'';
    }catch{return ''}
  }

  function ensureFitnessSections(project){
    if(project?.site_type!=='personal_trainer')return;
    const hero=document.querySelector('.hero');
    if(!hero)return;

    let videos=document.getElementById('fitness-videos');
    if(!videos){
      videos=document.createElement('section');
      videos.id='fitness-videos';
      videos.className='fitness-videos';
      videos.dataset.vitrineModule='fitness_videos';
      videos.innerHTML='<div class="fitness-wrap"><div class="fitness-section-head"><div class="eyebrow"></div><h2></h2><p></p></div><div class="fitness-video-grid"></div></div>';
      hero.parentNode.insertBefore(videos,hero.nextSibling);
    }

    let schedule=document.getElementById('fitness-schedule');
    if(!schedule){
      schedule=document.createElement('section');
      schedule.id='fitness-schedule';
      schedule.className='fitness-schedule';
      schedule.dataset.vitrineModule='fitness_schedule';
      schedule.innerHTML='<div class="fitness-wrap"><div class="fitness-schedule-copy"><div class="eyebrow"></div><h2></h2><p></p><a class="fitness-book-btn" target="_blank" rel="noopener"></a></div><div class="fitness-slots"></div></div>';
      videos.parentNode.insertBefore(schedule,videos.nextSibling);
    }
  }

  function renderFitnessVideos(map,isTenant,project){
    ensureFitnessSections(project);
    const root=document.getElementById('fitness-videos'); if(!root)return;
    const row=map.get('fitness_videos');
    const show=project?.site_type==='personal_trainer'&&hasSectionContent('fitness_videos',row);
    root.hidden=!show;if(!show||!row)return;
    const c=row.content||{};
    setText(root.querySelector('.eyebrow'),pick(c,'eyebrow'));
    setText(root.querySelector('h2'),pick(c,'title'));
    setText(root.querySelector('.fitness-section-head p'),pick(c,'subtitle'));
    const items=(c.items||[]).slice(0,3).filter(i=>nonEmpty(i?.url));
    root.querySelector('.fitness-video-grid').innerHTML=items.map((item,i)=>{
      const url=safeUrl(item.url);
      const insta=instagramEmbedUrl(item.url);
      const title=pick(item,'title')||`Vídeo ${i+1}`;
      if(insta)return `<article class="fitness-video-card"><div class="fitness-video-frame"><iframe src="${esc(insta)}" loading="lazy" allowtransparency="true" allowfullscreen title="${esc(title)}"></iframe></div><div class="fitness-video-title">${esc(title)}</div></article>`;
      if(url)return `<article class="fitness-video-card"><div class="fitness-video-frame"><video src="${esc(url)}" controls muted playsinline preload="metadata"></video></div><div class="fitness-video-title">${esc(title)}</div></article>`;
      return '';
    }).join('');
  }

  function renderFitnessSchedule(map,isTenant,project){
    ensureFitnessSections(project);
    const root=document.getElementById('fitness-schedule');if(!root)return;
    const row=map.get('fitness_schedule');
    const show=project?.site_type==='personal_trainer'&&hasSectionContent('fitness_schedule',row);
    root.hidden=!show;if(!show||!row)return;
    const c=row.content||{};
    setText(root.querySelector('.eyebrow'),pick(c,'eyebrow'));
    setText(root.querySelector('h2'),pick(c,'title'));
    setText(root.querySelector('.fitness-schedule-copy p'),pick(c,'subtitle'));
    const slots=(c.slots||[]).filter(s=>nonEmpty(s?.day)||nonEmpty(s?.time));
    root.querySelector('.fitness-slots').innerHTML=slots.map(s=>`<div class="fitness-slot"><span class="fitness-day">${esc(s.day||'')}</span><strong>${esc(s.time||'')}</strong>${pick(s,'note')?`<small>${esc(pick(s,'note'))}</small>`:''}</div>`).join('');
    const btn=root.querySelector('.fitness-book-btn');
    const href=safeUrl(c.schedule_url);
    btn.hidden=!href;
    if(href){btn.href=href;btn.textContent=pick(c,'cta_label')||(lang()==='en'?'Book a time':'Reservar horário')}
  }

  function renderStats(map,isTenant){
    const row=map.get('stats');
    if(!sectionState(row,'destaques',isTenant,'stats')||!row)return;
    const items=(row.content?.items||[]).filter(i=>nonEmpty(i?.num)||nonEmpty(i?.label_pt)||nonEmpty(i?.label_en));
    const el=document.getElementById('destaques');
    if(el) el.innerHTML=items.map(i=>
      `<div class="stat"><div class="num">${esc(i.num)}</div><div class="lbl">${esc(pick(i,'label'))}</div></div>`
    ).join('');
  }

  function renderAbout(map,isTenant){
    const row=map.get('about');
    if(!sectionState(row,'sobre',isTenant,'about')||!row)return;
    const c=row.content||{};
    setText(document.getElementById('aboutEyebrow'),pick(c,'eyebrow'));
    setRich(document.getElementById('aboutTitle'),pick(c,'title'));
    setText(document.getElementById('aboutParagraph1'),pick(c,'paragraph1'));
    setText(document.getElementById('aboutParagraph2'),pick(c,'paragraph2'));
  }

  function renderWsop(map,isTenant){
    const row=map.get('wsop');
    if(!sectionState(row,'wsop-featured',isTenant,'wsop')||!row)return;
    const c=row.content||{},root=document.getElementById('wsop-featured');
    setText(root?.querySelector('.wsop-copy .eyebrow'),pick(c,'eyebrow'));
    setRich(root?.querySelector('.wsop-copy h2'),pick(c,'title'));
    setText(root?.querySelector('.wsop-copy p'),pick(c,'description'));
    const pts=root?.querySelector('.wsop-points');
    if(pts){
      const points=Array.isArray(c.points)?c.points.filter(nonEmpty):[];
      pts.innerHTML=points.map(x=>`<span>${esc(typeof x==='string'?x:x?.value)}</span>`).join('');
    }
  }

  function renderCoverage(map,isTenant){
    const row=map.get('coverage');
    if(!sectionState(row,'cobertura',isTenant,'coverage')||!row)return;
    const c=row.content||{},root=document.getElementById('cobertura');
    setText(root?.querySelector('.section-head .eyebrow'),pick(c,'eyebrow'));
    setText(root?.querySelector('.section-head h2'),pick(c,'title'));
    const items=(c.items||[]).filter(i=>nonEmpty(i?.event)||nonEmpty(i?.years));
    const board=root?.querySelector('.board');
    if(board)board.innerHTML=items.map(i=>
      `<div class="board-row"><span class="ev">${esc(i.event)}</span><span class="yr">${esc(i.years)}</span></div>`
    ).join('');
  }

  function renderPortfolio(map,isTenant){
    const row=map.get('portfolio');
    if(!sectionState(row,'portfolio',isTenant,'portfolio')||!row)return;
    const c=row.content||{},root=document.getElementById('portfolio');
    setText(root?.querySelector('.section-head .eyebrow'),pick(c,'eyebrow'));
    setText(root?.querySelector('.section-head h2'),pick(c,'title'));
    setText(root?.querySelector('.media-bio-content h3'),c.profile_name??'');
    setText(root?.querySelector('.media-bio-content p'),pick(c,'bio'));
    const items=(c.items||[]).filter(i=>nonEmpty(i?.name)||nonEmpty(i?.url)||nonEmpty(i?.desc_pt)||nonEmpty(i?.desc_en));
    const cards=root?.querySelector('.press-cards');
    if(cards)cards.innerHTML=items.map(i=>{
      const href=safeUrl(i.url)||'#';
      return `<a class="press-card" href="${esc(href)}" target="_blank" rel="noopener noreferrer">
        <div><div class="name">${esc(i.name)}</div><div class="desc">${esc(pick(i,'desc'))}</div></div><div class="arrow">→</div>
      </a>`;
    }).join('');
  }

  function renderExperience(map,isTenant){
    const row=map.get('experience');
    if(!sectionState(row,'experiencia',isTenant,'experience')||!row)return;
    const c=row.content||{},root=document.getElementById('experiencia');
    setText(root?.querySelector('.section-head .eyebrow'),pick(c,'eyebrow'));
    setText(root?.querySelector('.section-head h2'),pick(c,'title'));
    const items=(c.items||[]).filter(i=>nonEmpty(i?.role_pt)||nonEmpty(i?.role_en)||nonEmpty(i?.org)||nonEmpty(i?.years)||nonEmpty(i?.note_pt)||nonEmpty(i?.note_en));
    const log=root?.querySelector('.log');
    if(log)log.innerHTML=items.map(i=>
      `<div class="log-entry"><div class="top-line"><span class="role">${esc(pick(i,'role'))}</span><span class="yrs">${esc(i.years)}</span></div><div class="org">${esc(i.org)}</div><div class="note">${esc(pick(i,'note'))}</div></div>`
    ).join('');
  }

  function renderEducation(map,isTenant){
    const row=map.get('education');
    if(!sectionState(row,'formacao',isTenant,'education')||!row)return;
    const c=row.content||{},root=document.getElementById('formacao'),cols=root?.querySelectorAll('.edu-grid > div');
    setText(root?.querySelector('.section-head .eyebrow'),pick(c,'eyebrow'));
    setText(root?.querySelector('.section-head h2'),pick(c,'title'));
    const items=(c.items||[]).filter(i=>nonEmpty(i?.degree_pt)||nonEmpty(i?.degree_en)||nonEmpty(i?.institution));
    const skills=(c.skills||[]).filter(nonEmpty);
    if(cols?.[0])cols[0].innerHTML=items.map(i=>
      `<div class="edu-item" style="margin-bottom:1.6rem"><div class="deg">${esc(pick(i,'degree'))}</div><div class="inst">${esc(i.institution)}</div></div>`
    ).join('');
    if(cols?.[1])cols[1].innerHTML=skills.length
      ? `<div class="stack-title">${esc(pick(c,'skills_title'))}</div><div class="chipstack">${skills.map(x=>`<span class="poker-chip">${esc(typeof x==='string'?x:x?.value)}</span>`).join('')}</div>`
      : '';
  }

  function renderInstagram(map,isTenant){
    const row=map.get('instagram');
    if(!sectionState(row,'instagram',isTenant,'instagram')||!row)return;
    const c=row.content||{},root=document.getElementById('instagram');
    setText(root?.querySelector('.section-head .eyebrow'),pick(c,'eyebrow'));
    setText(root?.querySelector('.section-head h2'),pick(c,'title'));
    setText(root?.querySelector('.insta-grid > div:first-child > p'),pick(c,'text'));

    const handle=document.getElementById('instaHandleLink');
    const user=String(c.user||'').replace(/^@/,'').trim();
    if(handle){
      handle.hidden=!user;
      if(user){handle.textContent=`@${user} →`;handle.href=`https://www.instagram.com/${encodeURIComponent(user)}/`}
      else handle.removeAttribute('href');
    }

    const frame=document.getElementById('reelFrame');
    const reel=safeUrl(c.reel_url);
    if(frame){
      frame.hidden=!reel;
      frame.innerHTML=reel
        ? `<iframe src="${esc(reel.replace(/\/?$/,'/')+'embed')}" allowtransparency="true" allowfullscreen loading="lazy" title="Instagram"></iframe>`
        : '';
    }
  }

  function renderContact(map,isTenant){
    const row=map.get('contact');
    if(!sectionState(row,'contato',isTenant,'contact')||!row)return;
    const c=row.content||{},root=document.getElementById('contato');
    setText(root?.querySelector('.section-head h2'),pick(c,'title')||(lang()==='en'?'Contact':'Contato'));

    const anchors=[...root.querySelectorAll('.contact-links a')];
    const buttons=[...root.querySelectorAll('.contact-links button')];
    anchors.forEach(a=>a.hidden=true);
    buttons.forEach(b=>b.hidden=true);

    const findByLabel=label => anchors.find(a=>a.querySelector('.lbl')?.textContent.trim().toLowerCase()===label);
    const configure=(a,showIt,href,text)=>{
      if(!a)return;
      a.hidden=!showIt;
      if(showIt){a.href=href;const node=[...a.childNodes].find(n=>n.nodeType===Node.TEXT_NODE);if(node)node.nodeValue=` ${text}`}
      else a.removeAttribute('href');
    };

    const emailLinks=anchors.filter(a=>a.querySelector('.lbl')?.textContent.toLowerCase().includes('e-mail'));
    configure(emailLinks[0],!!c.email1,`mailto:${c.email1}`,c.email1||'');
    configure(emailLinks[1],!!c.email2,`mailto:${c.email2}`,c.email2||'');

    const waNum=String(c.whatsapp_number||'').replace(/\D/g,'');
    const wa=anchors.find(a=>a.querySelector('.lbl')?.textContent.toLowerCase().includes('whatsapp'));
    configure(wa,!!waNum,`https://wa.me/${waNum}`,c.whatsapp_display||c.whatsapp_number||'');

    const igUser=String(c.instagram_user||'').replace(/^@/,'').trim();
    const ig=anchors.find(a=>a.querySelector('.lbl')?.textContent.toLowerCase().includes('instagram'));
    configure(ig,!!igUser,`https://www.instagram.com/${encodeURIComponent(igUser)}/`,`@${igUser} →`);

    const liUrl=safeUrl(c.linkedin_url);
    const li=anchors.find(a=>a.querySelector('.lbl')?.textContent.toLowerCase().includes('linkedin'));
    configure(li,!!liUrl,liUrl,lang()==='en'?'View profile →':'Ver perfil →');

    const cvUrl=safeUrl(c.cv_url);
    const cv=anchors.find(a=>a.querySelector('.lbl')?.textContent.toLowerCase().includes('curr'));
    configure(cv,!!cvUrl,cvUrl,lang()==='en'?'Download CV ↓':'Baixar CV em PDF ↓');

    // Portfolio share remains generic, but only inside a real contact section.
    const share=buttons.find(b=>b.hasAttribute('data-share-portfolio'));
    if(share)share.hidden=false;
  }

  function reconcileHeroActions(map,isTenant){
    if(!isTenant)return;
    const portfolioVisible=hasSectionContent('portfolio',map.get('portfolio'));
    const contactVisible=hasSectionContent('contact',map.get('contact'));
    const c=map.get('contact')?.content||{};

    const work=document.querySelector('[data-event="hero_portfolio"]');
    const contact=document.querySelector('[data-event="hero_contact"]');
    const cv=document.querySelector('[data-event="hero_cv"]');
    const share=document.querySelector('[data-event="hero_share"]');

    if(work)work.hidden=!portfolioVisible;
    if(contact)contact.hidden=!contactVisible;

    if(cv){
      const url=safeUrl(c.cv_url);
      cv.hidden=!url;
      if(url)cv.href=url;else cv.removeAttribute('href');
    }

    // Sharing an empty shell is not a meaningful primary CTA.
    if(share)share.hidden=!(portfolioVisible||contactVisible);

    const actions=document.querySelector('.hero-actions');
    if(actions){
      const visible=[...actions.children].some(el=>!el.hidden);
      actions.hidden=!visible;
    }
  }

  async function render(){
    try{
      const data=await window.WebAppCapData.ready;
      const map=data.contentMap;
      const isTenant=data.slug!==data.cfg.projectSlug;

      if(isTenant)prepareTenant();

      ensureFitnessSections(data.project);
      try{renderFitnessVideos(map,isTenant,data.project)}catch(e){console.warn('renderFitnessVideos',e)}
      try{renderFitnessSchedule(map,isTenant,data.project)}catch(e){console.warn('renderFitnessSchedule',e)}
      [renderHero,renderStats,renderAbout,renderWsop,renderCoverage,
       renderPortfolio,renderExperience,renderEducation,renderInstagram,renderContact]
       .forEach(fn=>{try{fn(map,isTenant)}catch(e){console.warn(fn.name,e)}});

      reconcileHeroActions(map,isTenant);

      if(isTenant){
        const languages=Array.isArray(map.get('hero')?.content?.languages)
          ? map.get('hero').content.languages.filter(x=>nonEmpty(x?.language)||nonEmpty(x?.flag))
          : [];
        const toggle=document.getElementById('languageToggle');
        if(toggle)toggle.hidden=languages.length<2;

        const actions=document.querySelector('.hero-actions');
        if(actions){
          const visible=[...actions.children].some(el=>!el.hidden);
          actions.hidden=!visible;
        }
      }

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