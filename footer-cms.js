(() => {
  if (!window.supabase || !window.VITRINE_SUPABASE) return;

  const { url, publishableKey, projectSlug: defaultProjectSlug } = window.VITRINE_SUPABASE;
  const projectSlug = window.VITRINE_PROJECT_CONTEXT?.slug || defaultProjectSlug;
  const sb = window.supabase.createClient(url, publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true }
  });

  const esc = v => String(v ?? '')
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'","&#039;");

  async function loadFooter(){
    const footer=document.querySelector('footer');
    if(!footer)return;

    try{
      const {data:project,error:pe}=await sb.from('projects')
        .select('id').eq('slug',projectSlug).eq('is_published',true).maybeSingle();
      if(pe)throw pe;
      if(!project)return;

      const {data:row,error:fe}=await sb.from('site_content')
        .select('content').eq('project_id',project.id).eq('section_key','footer').maybeSingle();
      if(fe)throw fe;

      // Secondary/new projects must never inherit the original footer.
      if(!row?.content){
        if(projectSlug!==defaultProjectSlug) footer.hidden=true;
        return;
      }

      const c=row.content;
      if(c.is_visible===false){
        footer.hidden=true;
        return;
      }

      const parts=[];
      if(c.brand)parts.push(c.brand);
      if(c.description)parts.push(c.description);
      if(c.location)parts.push(c.location);

      let line=parts.map(esc).join(' · ');
      if(c.show_copyright){
        const year=new Date().getFullYear();
        const cp=`© ${year}${c.brand?' '+esc(c.brand):''}`;
        line=line?`${line} · ${cp}`:cp;
      }

      if(!line){
        footer.hidden=true;
        return;
      }

      footer.innerHTML=`<div class="container"><span>${line}</span></div>`;
      footer.hidden=false;
    }catch(e){
      console.warn('WebAppCap Footer:',e);
      if(projectSlug!==defaultProjectSlug)footer.hidden=true;
    }
  }

  loadFooter();
})();