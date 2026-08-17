(() => {
  if (window.WebAppCapData?.ready) return;
  if (!window.supabase || !window.VITRINE_SUPABASE) return;

  const cfg = window.VITRINE_SUPABASE;
  const slug = window.VITRINE_PROJECT_CONTEXT?.slug || cfg.projectSlug;
  const params = new URLSearchParams(location.search);
  const isDraft = params.get('preview') === 'draft';

  const client = window.WebAppCapSupabase || (
    window.WebAppCapSupabase = window.supabase.createClient(
      cfg.url,
      cfg.publishableKey,
      { auth:{persistSession:true,autoRefreshToken:true} }
    )
  );

  const rowsToSnapshot = rows => {
    const snapshot = {};
    for (const row of rows || []) {
      snapshot[row.section_key] = {
        content: row.content || {},
        is_visible: row.is_visible !== false,
        sort_order: row.sort_order ?? 0
      };
    }
    return snapshot;
  };

  const snapshotToMap = snapshot => new Map(
    Object.entries(snapshot || {}).map(([section_key, section]) => [
      section_key,
      {
        section_key,
        content: section?.content || {},
        is_visible: section?.is_visible !== false,
        sort_order: section?.sort_order ?? 0
      }
    ])
  );

  const load = async () => {
    const projectQuery = client
      .from('projects')
      .select('id,slug,name,site_type,subdomain,custom_domain,is_published,owner_id')
      .eq('slug', slug);

    if (!isDraft) projectQuery.eq('is_published', true);

    const { data: project, error: projectError } = await projectQuery.maybeSingle();
    if (projectError) throw projectError;
    if (!project) throw new Error(isDraft
      ? 'Projeto não encontrado.'
      : 'Projeto não encontrado ou ainda não publicado.');

    let snapshot = {};
    if (isDraft) {
      const { data: draft, error } = await client
        .from('project_drafts')
        .select('snapshot,updated_at,last_published_at')
        .eq('project_id', project.id)
        .maybeSingle();
      if (error) throw error;
      if (!draft) throw new Error('Rascunho não encontrado.');
      snapshot = draft.snapshot || {};
    } else {
      const { data: rows, error } = await client
        .from('site_content')
        .select('section_key,content,is_visible,sort_order')
        .eq('project_id', project.id);
      if (error) throw error;
      snapshot = rowsToSnapshot(rows);
    }

    const result = {
      cfg, client, slug, isDraft, project, snapshot,
      contentMap: snapshotToMap(snapshot)
    };

    window.WebAppCapData.data = result;
    document.documentElement.dataset.webappcapProject = slug;
    document.documentElement.dataset.webappcapMode = isDraft ? 'draft' : 'published';
    document.dispatchEvent(new CustomEvent('webappcap:data-ready', { detail: result }));
    return result;
  };

  window.WebAppCapData = {
    data: null,
    ready: load().catch(error => {
      window.WebAppCapData.error = error;
      document.dispatchEvent(new CustomEvent('webappcap:data-error', { detail:error }));
      throw error;
    })
  };
})();
;(() => {
  function currentSlug(){
    return window.VITRINE_PROJECT_CONTEXT?.slug ||
      new URLSearchParams(location.search).get('project') ||
      window.VITRINE_SUPABASE?.projectSlug || '';
  }

  window.WebAppCapNeutralizeLegacyFallbacks = function(snapshot){
    try{
      const slug=currentSlug();
      const defaultSlug=window.VITRINE_SUPABASE?.projectSlug;
      if(!slug || slug===defaultSlug || !snapshot)return snapshot;

      const media=snapshot.media?.content||{};
      // If a non-default project has no explicit media in its snapshot,
      // never allow static Gabriel assets to be treated as project media.
      for(const key of ['hero_url','hero_path','about_url','about_path','contact_url','contact_path','profile_url','profile_path']){
        if(media[key]==null)media[key]='';
      }

      const contact=snapshot.contact?.content||{};
      for(const key of ['email1','email2','whatsapp_number','whatsapp_display','instagram_user','linkedin_url','cv_url']){
        if(contact[key]==null)contact[key]='';
      }
      return snapshot;
    }catch(e){
      console.warn('Neutral fallback:',e);
      return snapshot;
    }
  };
})();
