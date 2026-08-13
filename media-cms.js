
(() => {
  if (!window.supabase || !window.VITRINE_SUPABASE) return;

  const { url, publishableKey, projectSlug: defaultProjectSlug } = window.VITRINE_SUPABASE;
  const projectSlug = window.VITRINE_PROJECT_CONTEXT?.slug || defaultProjectSlug;
  const cms = window.supabase.createClient(url, publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true }
  });

  const esc = value => String(value ?? '')
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'","&#039;");

  function applyStaticImage(selector, url, alt, position) {
    if (!url) return;
    const img = document.querySelector(selector);
    if (!img) return;
    const fallbackSrc = img.getAttribute('src');
    img.onerror = () => {
      img.onerror = null;
      if (fallbackSrc) img.src = fallbackSrc;
    };
    img.src = url;
    if (alt) img.alt = alt;
    if (position) img.style.objectPosition = position;
  }

  function applyHero(content) {
    if (!content.hero_url) return;
    const layer = document.getElementById('heroBg');
    if (!layer) return;
    const test = new Image();
    test.onload = () => {
      layer.style.backgroundImage =
        `linear-gradient(180deg,rgba(8,39,32,.48),rgba(8,39,32,.86)),url("${content.hero_url}")`;
      layer.style.backgroundSize = 'cover';
      layer.style.backgroundPosition = content.hero_position || 'center center';
    };
    test.src = content.hero_url;
  }

  function applyWsopGallery(content) {
    const gallery = content.wsop_gallery;
    if (!Array.isArray(gallery) || !gallery.length) return;

    const carousel = document.getElementById('wsopCarousel');
    const slidesWrap = carousel?.querySelector('.wsop-slides');
    const dotsWrap = carousel?.querySelector('.wsop-dots');
    const counter = carousel?.querySelector('.wsop-counter');
    if (!carousel || !slidesWrap || !dotsWrap) return;

    const ordered = [...gallery].sort((a,b)=>(a.order ?? 0)-(b.order ?? 0));

    slidesWrap.innerHTML = ordered.map((item,i)=>`
      <figure class="wsop-slide${i===0?' is-active':''}" data-wsop-slide="${i}" aria-hidden="${i===0?'false':'true'}">
        <img src="${esc(item.url)}"
             alt="${esc(item.alt || `WSOP Las Vegas ${item.year || ''}`)}"
             loading="${i===0?'eager':'lazy'}"
             decoding="async"
             style="object-position:${esc(item.position || 'center center')}">
        <figcaption>
          <span class="wsop-year">${esc(item.year || '')}</span>
          <span>${esc(item.caption || 'WSOP Las Vegas')}</span>
        </figcaption>
      </figure>`).join('');

    dotsWrap.innerHTML = ordered.map((_,i)=>
      `<button type="button" class="wsop-dot${i===0?' is-active':''}" data-wsop-dot="${i}"
               aria-label="Ir para foto ${i+1}"${i===0?' aria-current="true"':''}></button>`
    ).join('');

    if (counter) {
      counter.innerHTML = `<span id="wsopCurrent">01</span> / ${String(ordered.length).padStart(2,'0')}`;
    }

    // Lightweight carousel controller for CMS-managed photos.
    const slides = [...carousel.querySelectorAll('[data-wsop-slide]')];
    const dots = [...carousel.querySelectorAll('[data-wsop-dot]')];
    const prev = carousel.querySelector('[data-wsop-prev]');
    const next = carousel.querySelector('[data-wsop-next]');
    let index = 0;
    let timer = null;
    let touchStartX = null;

    const show = newIndex => {
      index = (newIndex + slides.length) % slides.length;
      slides.forEach((slide,i)=>{
        const active = i === index;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      dots.forEach((dot,i)=>{
        const active = i === index;
        dot.classList.toggle('is-active', active);
        if (active) dot.setAttribute('aria-current','true');
        else dot.removeAttribute('aria-current');
      });
      const current = document.getElementById('wsopCurrent');
      if (current) current.textContent = String(index+1).padStart(2,'0');
    };

    const schedule = () => {
      clearInterval(timer);
      timer = setInterval(()=>show(index+1), 10000);
    };
    const manual = n => { show(n); schedule(); };

    prev?.addEventListener('click', e => { e.stopImmediatePropagation(); manual(index-1); }, true);
    next?.addEventListener('click', e => { e.stopImmediatePropagation(); manual(index+1); }, true);
    dots.forEach((dot,i)=>dot.addEventListener('click', e => {
      e.stopImmediatePropagation(); manual(i);
    }, true));

    carousel.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); manual(index-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); manual(index+1); }
    }, true);

    carousel.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].clientX;
    }, {passive:true});

    carousel.addEventListener('touchend', e => {
      if (touchStartX === null) return;
      const delta = e.changedTouches[0].clientX - touchStartX;
      touchStartX = null;
      if (Math.abs(delta) < 45) return;
      manual(delta > 0 ? index-1 : index+1);
    }, {passive:true});

    show(0);
    schedule();
  }

  async function loadMedia() {
    try {
      const { data: project, error: projectError } = await cms
        .from('projects')
        .select('id')
        .eq('slug', projectSlug)
        .eq('is_published', true)
        .maybeSingle();

      if (projectError) throw projectError;

      if (project) {
        const { data: row, error: mediaError } = await cms
          .from('site_content')
          .select('content')
          .eq('project_id', project.id)
          .eq('section_key', 'media')
          .maybeSingle();

        if (mediaError) throw mediaError;

        if (row?.content) {
          const c = row.content;
          applyHero(c);
          applyStaticImage('.about-photo img', c.about_url, c.about_alt, c.about_position);
          applyStaticImage('.contact-photo img', c.contact_url, c.contact_alt, c.contact_position);
          applyWsopGallery(c);
        }
      }
    } catch (error) {
      console.warn('Vitrine Pro Media: mídia gerenciada indisponível.', error);
    } finally {
      document.dispatchEvent(new CustomEvent('vitrine:tenant-media-ready'));
    }
  }

  loadMedia();
})();
