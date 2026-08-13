
(() => {
  if (!window.supabase || !window.VITRINE_SUPABASE) return;
  const cfg=window.VITRINE_SUPABASE;
  const sb=window.supabase.createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true}});
  const isEn=()=>document.documentElement.lang.toLowerCase().startsWith('en');

  function meta(name,content,property=false){
    if(!content)return;
    const selector=property?`meta[property="${name}"]`:`meta[name="${name}"]`;
    let el=document.head.querySelector(selector);
    if(!el){el=document.createElement('meta');el.setAttribute(property?'property':'name',name);document.head.appendChild(el)}
    el.setAttribute('content',content);
  }

  function apply(c){
    if(!c)return;
    const title=isEn()?(c.title_en||c.title_pt):(c.title_pt||c.title_en);
    const desc=isEn()?(c.description_en||c.description_pt):(c.description_pt||c.description_en);
    if(title)document.title=title;
    meta('description',desc);
    meta('og:title',title,true);meta('og:description',desc,true);
    meta('twitter:title',title);meta('twitter:description',desc);
    if(c.og_image_url){meta('og:image',c.og_image_url,true);meta('twitter:image',c.og_image_url)}
    if(c.canonical_url){
      let link=document.head.querySelector('link[rel="canonical"]');
      if(!link){link=document.createElement('link');link.rel='canonical';document.head.appendChild(link)}
      link.href=c.canonical_url;meta('og:url',c.canonical_url,true);
    }
    let ld=document.getElementById('vitrine-schema');
    if(!ld){ld=document.createElement('script');ld.id='vitrine-schema';ld.type='application/ld+json';document.head.appendChild(ld)}
    ld.textContent=JSON.stringify({
      '@context':'https://schema.org',
      '@type':c.schema_type||'Person',
      name:'Gabriel Capellari',
      url:c.canonical_url||location.origin
    });
  }

  async function load(){
    try{
      const p=await sb.from('projects').select('id').eq('slug',cfg.projectSlug).eq('is_published',true).maybeSingle();
      if(!p.data)return;
      const q=await sb.from('site_content').select('content').eq('project_id',p.data.id).eq('section_key','seo').maybeSingle();
      apply(q.data?.content);
    }catch(e){console.warn('SEO CMS fallback ativo',e)}
  }
  document.querySelectorAll('[data-language]').forEach(b=>b.addEventListener('click',()=>setTimeout(load,0)));
  load();
})();
