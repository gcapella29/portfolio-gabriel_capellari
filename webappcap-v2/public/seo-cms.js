(() => {
  if (!window.WebAppCapData?.ready) return;

  const isEn=()=>document.documentElement.lang.toLowerCase().startsWith('en');
  const meta=(name,content,property=false)=>{
    const selector=property?`meta[property="${name}"]`:`meta[name="${name}"]`;
    let el=document.head.querySelector(selector);
    if(!content){if(el)el.remove();return}
    if(!el){el=document.createElement('meta');el.setAttribute(property?'property':'name',name);document.head.appendChild(el)}
    el.content=content;
  };
  const absolute=value=>{
    if(!value)return'';
    try{return new URL(value,location.href).href}catch{return''}
  };

  async function apply(){
    try{
      const data=await window.WebAppCapData.ready;
      const c=data.snapshot?.seo?.content||{};
      const title=isEn()?(c.title_en??c.title_pt):(c.title_pt??c.title_en);
      const desc=isEn()?(c.description_en??c.description_pt):(c.description_pt??c.description_en);
      if(title)document.title=(data.isDraft?'PREVIEW · ':'')+title;

      meta('description',desc);
      meta('og:title',title,true);meta('og:description',desc,true);
      meta('twitter:title',title);meta('twitter:description',desc);

      const image=absolute(c.og_image_url);
      meta('og:image',image,true);meta('twitter:image',image);

      const canonical=absolute(c.canonical_url) || (data.isDraft?'':location.href.split('?')[0]);
      if(canonical){
        let link=document.head.querySelector('link[rel="canonical"]');
        if(!link){link=document.createElement('link');link.rel='canonical';document.head.appendChild(link)}
        link.href=canonical;meta('og:url',canonical,true);
      }

      let ld=document.getElementById('webappcap-schema');
      if(!ld){ld=document.createElement('script');ld.id='webappcap-schema';ld.type='application/ld+json';document.head.appendChild(ld)}
      ld.textContent=JSON.stringify({
        '@context':'https://schema.org',
        '@type':c.schema_type||'Person',
        name:data.project?.name||title||'',
        url:canonical||location.origin
      });
    }catch(e){console.warn('WebAppCap SEO',e)}
  }

  document.querySelectorAll('[data-language]').forEach(b=>b.addEventListener('click',()=>setTimeout(apply,0)));
  apply();
})();