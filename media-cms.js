(() => {
  if (!window.WebAppCapData?.ready) return;

  const { url, publishableKey, projectSlug: defaultProjectSlug } = window.VITRINE_SUPABASE;
  const projectSlug = window.VITRINE_PROJECT_CONTEXT?.slug || defaultProjectSlug;
  const cms = window.supabase.createClient(url, publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true }
  });

  const esc = value => String(value ?? '')
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'","&#039;");

  const clamp = (n,min,max) => Math.max(min,Math.min(max,Number(n)));
  const fitCss = fit => fit === 'contain' ? 'contain' : fit === 'original' ? 'scale-down' : 'cover';

  function mediaSettings(content,key,fallbackPosition='50% 50%'){
    const legacy = String(content[`${key}_position`] || fallbackPosition);
    const legacyParts = legacy.match(/(top|bottom|center|\d+%)\s+(left|right|center|\d+%)/i);
    let x = Number(content[`${key}_x`]);
    let y = Number(content[`${key}_y`]);

    if(!Number.isFinite(x)){
      if(/left/i.test(legacy)) x=0;
      else if(/right/i.test(legacy)) x=100;
      else x=50;
    }
    if(!Number.isFinite(y)){
      if(/top/i.test(legacy)) y=0;
      else if(/bottom/i.test(legacy)) y=100;
      else y=50;
    }

    return {
      fit: content[`${key}_fit`] || 'cover',
      x: clamp(x,0,100),
      y: clamp(y,0,100),
      zoom: clamp(content[`${key}_zoom`] ?? 1,0.5,2)
    };
  }

  function applyStaticImage(selector, content, key, alt, isTenant=false) {
    const imageUrl = content[`${key}_url`];
    const img = document.querySelector(selector);
    if (!img) return;

    if (!imageUrl) {
      if (isTenant) {
        img.hidden=true;
        img.removeAttribute('src');
        img.removeAttribute('srcset');
        const parent=img.parentElement;
        if(parent){parent.hidden=true;parent.classList.add('webappcap-media-empty')}
      }
      return;
    }

    const fallbackSrc = isTenant ? '' : img.getAttribute('src');
    img.hidden=false;
    const parent=img.parentElement;
    if(parent){parent.hidden=false;parent.classList.remove('webappcap-media-empty')}

    img.onerror = () => {
      img.onerror = null;
      if (fallbackSrc) img.src = fallbackSrc;
      else { img.hidden=true; if(parent)parent.hidden=true; }
    };

    const s = mediaSettings(content,key,key==='about'?'50% 0%':'50% 50%');
    img.src = imageUrl;
    if (alt) img.alt = alt;

    img.style.setProperty('object-fit', fitCss(s.fit), 'important');
    img.style.setProperty('object-position', `${s.x}% ${s.y}%`, 'important');
    img.style.setProperty('transform', `scale(${s.zoom})`, 'important');
    img.style.setProperty('transform-origin', `${s.x}% ${s.y}%`, 'important');

    if(parent){
      parent.style.overflow='hidden';
      if(s.fit!=='cover') parent.style.background='#ece8dd';
    }
  }

  function applyHero(content,isTenant=false) {
    const layer = document.getElementById('heroBg');
    if (!layer) return;
    if (!content.hero_url) {
      if(isTenant){
        layer.style.backgroundImage='radial-gradient(circle at 72% 22%,rgba(227,187,61,.14),transparent 24%),linear-gradient(145deg,#082720 0%,#0e3b2e 58%,#164b3c 100%)';
        layer.style.backgroundSize='cover';
        layer.style.backgroundPosition='center';
        layer.style.transform='none';
      }
      return;
    }
    const s = mediaSettings(content,'hero','50% 50%');

    const test = new Image();
    test.onload = () => {
      layer.style.backgroundImage =
        `linear-gradient(180deg,rgba(8,39,32,.48),rgba(8,39,32,.86)),url("${content.hero_url}")`;
      layer.style.setProperty('background-size',
        s.fit==='contain' ? 'contain' : s.fit==='original' ? 'auto' : 'cover',
        'important');
      layer.style.setProperty('background-position', `${s.x}% ${s.y}%`, 'important');
      layer.style.setProperty('background-repeat', 'no-repeat', 'important');
      layer.style.setProperty('transform', `scale(${s.zoom})`, 'important');
      layer.style.setProperty('transform-origin', `${s.x}% ${s.y}%`, 'important');
    };
    test.src = content.hero_url;
  }

  function gallerySettings(item){
    const legacy=String(item.position||'center center');
    let x=Number(item.x),y=Number(item.y);
    if(!Number.isFinite(x)) x=/left/i.test(legacy)?0:/right/i.test(legacy)?100:50;
    if(!Number.isFinite(y)) y=/top/i.test(legacy)?0:/bottom/i.test(legacy)?100:50;
    return {
      fit:item.fit||'contain',
      x:clamp(x,0,100),
      y:clamp(y,0,100),
      zoom:clamp(item.zoom??1,0.5,2)
    };
  }

  function applyWsopGallery(content,isTenant=false) {
    const gallery = content.wsop_gallery;
    if (!Array.isArray(gallery) || !gallery.length) {
      if(isTenant){
        const carousel=document.getElementById('wsopCarousel');
        if(carousel){
          const slides=carousel.querySelector('.wsop-slides');if(slides)slides.innerHTML='';
          const dots=carousel.querySelector('.wsop-dots');if(dots)dots.innerHTML='';
          carousel.hidden=true;
        }
      }
      return;
    }

    const carousel = document.getElementById('wsopCarousel');
    const slidesWrap = carousel?.querySelector('.wsop-slides');
    const dotsWrap = carousel?.querySelector('.wsop-dots');
    const counter = carousel?.querySelector('.wsop-counter');
    if (!carousel || !slidesWrap || !dotsWrap) return;
    carousel.hidden=false;

    const ordered = [...gallery].sort((a,b)=>(a.order ?? 0)-(b.order ?? 0));

    slidesWrap.innerHTML = ordered.map((item,i)=>{
      const s=gallerySettings(item);
      return `
      <figure class="wsop-slide${i===0?' is-active':''}" data-wsop-slide="${i}" aria-hidden="${i===0?'false':'true'}">
        <img src="${esc(item.url)}"
             alt="${esc(item.alt || `Foto ${item.year || ''}`)}"
             loading="${i===0?'eager':'lazy'}"
             decoding="async"
             style="object-fit:${fitCss(s.fit)}!important;object-position:${s.x}% ${s.y}%!important;transform:scale(${s.zoom})!important;transform-origin:${s.x}% ${s.y}%!important">
        <figcaption>
          <span class="wsop-year">${esc(item.year || '')}</span>
          <span>${esc(item.caption || '')}</span>
        </figcaption>
      </figure>`;
    }).join('');

    dotsWrap.innerHTML = ordered.map((_,i)=>
      `<button type="button" class="wsop-dot${i===0?' is-active':''}" data-wsop-dot="${i}"
               aria-label="Ir para foto ${i+1}"${i===0?' aria-current="true"':''}></button>`
    ).join('');

    if (counter) counter.innerHTML =
      `<span id="wsopCurrent">01</span> / ${String(ordered.length).padStart(2,'0')}`;

    const slides=[...carousel.querySelectorAll('[data-wsop-slide]')];
    const dots=[...carousel.querySelectorAll('[data-wsop-dot]')];
    const prev=carousel.querySelector('[data-wsop-prev]');
    const next=carousel.querySelector('[data-wsop-next]');
    let index=0,timer=null,touchStartX=null;

    const show=n=>{
      index=(n+slides.length)%slides.length;
      slides.forEach((slide,i)=>{
        const active=i===index;
        slide.classList.toggle('is-active',active);
        slide.setAttribute('aria-hidden',active?'false':'true');
      });
      dots.forEach((dot,i)=>{
        const active=i===index;
        dot.classList.toggle('is-active',active);
        if(active)dot.setAttribute('aria-current','true');else dot.removeAttribute('aria-current');
      });
      const current=document.getElementById('wsopCurrent');
      if(current)current.textContent=String(index+1).padStart(2,'0');
    };
    const schedule=()=>{clearInterval(timer);timer=setInterval(()=>show(index+1),10000)};
    const manual=n=>{show(n);schedule()};

    prev?.addEventListener('click',e=>{e.stopImmediatePropagation();manual(index-1)},true);
    next?.addEventListener('click',e=>{e.stopImmediatePropagation();manual(index+1)},true);
    dots.forEach((dot,i)=>dot.addEventListener('click',e=>{e.stopImmediatePropagation();manual(i)},true));
    carousel.addEventListener('keydown',e=>{
      if(e.key==='ArrowLeft'){e.preventDefault();manual(index-1)}
      if(e.key==='ArrowRight'){e.preventDefault();manual(index+1)}
    },true);
    carousel.addEventListener('touchstart',e=>{touchStartX=e.changedTouches[0].clientX},{passive:true});
    carousel.addEventListener('touchend',e=>{
      if(touchStartX===null)return;
      const d=e.changedTouches[0].clientX-touchStartX;touchStartX=null;
      if(Math.abs(d)>=45)manual(d>0?index-1:index+1);
    },{passive:true});

    show(0);schedule();
  }

  async function loadMedia() {
    try {
      const data = await window.WebAppCapData.ready;
      const c = data.snapshot?.media?.content || {};
      const isTenant=data.slug!==data.cfg.projectSlug;

      if(isTenant){
        // The portfolio portrait is part of Gabriel's static shell and has no tenant media field.
        const portfolioPhoto=document.querySelector('#portfolio .media-bio-photo');
        if(portfolioPhoto)portfolioPhoto.hidden=true;
      }

      applyHero(c,isTenant);
      applyStaticImage('.about-photo img', c, 'about', c.about_alt,isTenant);
      applyStaticImage('.contact-photo img', c, 'contact', c.contact_alt,isTenant);
      applyWsopGallery(c,isTenant);
    } catch (error) {
      console.warn('WebAppCap Media: mídia gerenciada indisponível.', error);
    } finally {
      document.dispatchEvent(new CustomEvent('vitrine:tenant-media-ready'));
    }
  }

  loadMedia();
})();