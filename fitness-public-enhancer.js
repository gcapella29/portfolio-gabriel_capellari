(() => {
  if (window.WebAppCapFitnessPublicEnhancer) return;
  window.WebAppCapFitnessPublicEnhancer = true;

  const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  const rich=v=>esc(v).replace(/\n/g,'<br>');
  const local=(o,k,locale)=>o?.[`${k}_${locale}`]??o?.[`${k}_pt`]??o?.[k]??'';
  const safeHref=v=>{const s=String(v||'').trim();return s.startsWith('#')||/^https?:\/\//i.test(s)?s:'#contato';};

  function enhance(result){
    const key=String(result?.snapshot?.template?.content?.key||'').toLowerCase();
    if(key!=='fitness') return;
    const locale=document.documentElement.lang?.toLowerCase().startsWith('en')?'en':'pt';
    const snapshot=result.snapshot||{};
    const content=k=>snapshot[k]?.content||{};
    const hero=content('hero'), schedule=content('fitness_schedule'), contact=content('contact');
    const name=String(hero.name_html||result.project?.name||'Personal Trainer').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();

    if(!document.querySelector('.fitness-navbar')){
      const nav=document.createElement('nav');
      nav.className='fitness-navbar';
      nav.innerHTML=`<a class="fitness-brand" href="#inicio">${esc(name)}</a><div class="fitness-nav-links"><a href="#sobre">${locale==='pt'?'Sobre':'About'}</a><a href="#trabalhos">${locale==='pt'?'Serviços':'Services'}</a><a href="#destaque">${locale==='pt'?'Método':'Method'}</a><a href="#portfolio">${locale==='pt'?'Resultados':'Results'}</a><a href="#agenda">${locale==='pt'?'Agenda':'Schedule'}</a></div><a class="fitness-nav-cta" href="${esc(safeHref(schedule.schedule_url||'#agenda'))}">${locale==='pt'?'Agendar treino':'Book training'}</a>`;
      document.body.prepend(nav);
    }

    const heroEl=document.querySelector('.hero');
    if(heroEl){
      const inner=heroEl.querySelector('.hero-inner');
      if(inner){
        const kicker=local(hero,'kicker',locale)||(`${locale==='pt'?'Personal Trainer em':'Personal Trainer in'} ${hero.location||''}`.trim());
        const headline=local(hero,'headline',locale)||local(hero,'role',locale)||name;
        const description=local(hero,'description',locale)||'';
        const primary=local(hero,'primary_label',locale)||(locale==='pt'?'Quero começar':'Get started');
        const secondary=local(hero,'secondary_label',locale)||(locale==='pt'?'Conheça meu trabalho':'See my work');
        const primaryHref=safeHref(hero.primary_href||schedule.schedule_url||'#agenda');
        const secondaryHref=safeHref(hero.secondary_href||'#trabalhos');
        inner.innerHTML=`<div class="fitness-hero-copy"><div class="fitness-kicker">${esc(kicker)}</div><h1>${rich(headline)}</h1>${description?`<p class="fitness-hero-description">${rich(description)}</p>`:''}<div class="fitness-hero-actions"><a class="btn primary" href="${esc(primaryHref)}">${esc(primary)} →</a><a class="btn fitness-secondary" href="${esc(secondaryHref)}">${esc(secondary)} ↘</a></div><div class="fitness-hero-meta">${hero.location?`<span>${esc(hero.location)}</span>`:''}${content('education').cref?`<span>${esc(content('education').cref)}</span>`:''}</div></div>`;
      }
    }

    const results=document.querySelector('#portfolio');
    const items=Array.isArray(content('portfolio').items)?content('portfolio').items:[];
    if(results&&items.length){
      const title=local(content('portfolio'),'title',locale)||(locale==='pt'?'Resultados reais':'Real results');
      const eyebrow=local(content('portfolio'),'eyebrow',locale)||(locale==='pt'?'Resultados de alunos':'Client results');
      results.innerHTML=`<div class="eyebrow">${esc(eyebrow)}</div><h2>${rich(title)}</h2><div class="fitness-results-grid">${items.map(i=>{
        const testimonial=local(i,'desc',locale)||'';
        const before=String(i.before_url||'').trim(), after=String(i.after_url||'').trim();
        const photos=before||after?`<div class="fitness-result-photos">${before?`<img src="${esc(before)}" alt="Antes" loading="lazy">`:''}${after?`<img src="${esc(after)}" alt="Depois" loading="lazy">`:''}</div>`:'';
        return `<article class="fitness-result-card">${photos}<div class="fitness-result-body">${i.result?`<strong class="fitness-result-number">${esc(i.result)}</strong>`:''}<h3>${esc(i.name||'')}</h3>${i.context?`<div class="fitness-result-context">${esc(i.context)}${i.period?` · ${esc(i.period)}`:''}</div>`:''}${testimonial?`<blockquote>“${esc(testimonial)}”</blockquote>`:''}</div></article>`;
      }).join('')}</div>`;
    }

    if(!document.querySelector('.fitness-mobile-cta')){
      const href=safeHref(schedule.schedule_url||(contact.whatsapp_number?`https://wa.me/${String(contact.whatsapp_number).replace(/\D/g,'')}`:'#contato'));
      const a=document.createElement('a');a.className='fitness-mobile-cta';a.href=href;a.textContent=locale==='pt'?'Agendar treino':'Book training';document.body.appendChild(a);
    }
  }

  Promise.resolve(window.WebAppCapData?.ready).then(result=>setTimeout(()=>enhance(result),0)).catch(()=>{});
})();
