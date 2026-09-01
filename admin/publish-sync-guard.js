(() => {
  if (window.WebAppCapPublishSyncGuard) return;
  window.WebAppCapPublishSyncGuard = true;

  const path = location.pathname.toLowerCase();
  if (!['/admin/','/admin/index.html','/admin'].includes(path) || !window.supabase || !window.VITRINE_SUPABASE) return;

  const cfg = window.VITRINE_SUPABASE;
  const resolver = window.WebAppCapTenantResolver;
  const sb = window.WebAppCapPublishGuardSupabase || (window.WebAppCapPublishGuardSupabase = window.supabase.createClient(cfg.url, cfg.publishableKey, {auth:{persistSession:true,autoRefreshToken:true}}));
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const cleanSlug = () => resolver?.cleanSlug(new URLSearchParams(location.search).get('project') || window.VITRINE_PROJECT_CONTEXT?.slug);
  const rowsToSnapshot = rows => Object.fromEntries((rows || []).map(row => [row.section_key, {content:row.content || {}, is_visible:row.is_visible !== false, sort_order:row.sort_order ?? 0}]));
  const stable = value => {
    if (Array.isArray(value)) return value.map(stable);
    if (value && typeof value === 'object') return Object.keys(value).sort().reduce((out,key) => (out[key]=stable(value[key]),out),{});
    return value;
  };
  const same = (a,b) => JSON.stringify(stable(a)) === JSON.stringify(stable(b));

  async function waitDraftSaved() {
    const ux = window.WebAppCapUX;
    if (!ux?.state?.dirty) return;
    const save = document.getElementById('saveButton');
    if (!save) throw new Error('Não foi possível localizar o botão de salvar o rascunho.');
    save.click();
    const started = Date.now();
    while (window.WebAppCapUX?.state?.dirty) {
      if (Date.now() - started > 10000) throw new Error('Tempo esgotado ao salvar o rascunho antes da publicação.');
      await sleep(100);
    }
  }

  async function getProject() {
    const slug = cleanSlug();
    if (!slug) throw new Error('Projeto não selecionado.');
    const q = await sb.from('projects').select('id,slug,is_published').eq('slug',slug).maybeSingle();
    if (q.error) throw q.error;
    if (!q.data) throw new Error('Projeto não encontrado.');
    return q.data;
  }

  async function publishExact(project) {
    const [draftQ,currentQ,sessionQ] = await Promise.all([
      sb.from('project_drafts').select('snapshot').eq('project_id',project.id).maybeSingle(),
      sb.from('site_content').select('section_key,content,is_visible,sort_order').eq('project_id',project.id),
      sb.auth.getSession()
    ]);
    if (draftQ.error) throw draftQ.error;
    if (currentQ.error) throw currentQ.error;
    if (!draftQ.data?.snapshot) throw new Error('Rascunho não encontrado.');

    const snapshot = structuredClone(draftQ.data.snapshot);
    const previous = rowsToSnapshot(currentQ.data);
    const userId = sessionQ.data?.session?.user?.id || null;
    let atomicSucceeded = false;

    const rpc = await sb.rpc('publish_project_atomic',{p_project_id:project.id});
    if (!rpc.error) {
      atomicSucceeded = true;
    } else {
      console.warn('[WebAppCap publish guard] atomic RPC fallback', rpc.error);
      if (Object.keys(previous).length) {
        const version = await sb.from('project_versions').insert({project_id:project.id,snapshot:previous,created_by:userId,label:'Antes da publicação'});
        if (version.error) throw version.error;
      }
    }

    const now = new Date().toISOString();
    const payload = Object.entries(snapshot).map(([section_key,section],i) => ({
      project_id: project.id,
      section_key,
      content: section?.content || {},
      is_visible: section?.is_visible !== false,
      sort_order: section?.sort_order ?? i * 10,
      updated_at: now
    }));
    if (!payload.length) throw new Error('O rascunho está vazio e não pode ser publicado.');

    const upsert = await sb.from('site_content').upsert(payload,{onConflict:'project_id,section_key'});
    if (upsert.error) throw upsert.error;

    if (!project.is_published) {
      const p = await sb.from('projects').update({is_published:true,updated_at:now}).eq('id',project.id);
      if (p.error) throw p.error;
    }

    const draftUpdate = await sb.from('project_drafts').update({last_published_at:now,updated_at:now,...(userId?{updated_by:userId}:{})}).eq('project_id',project.id);
    if (draftUpdate.error) throw draftUpdate.error;

    const verify = await sb.from('site_content').select('section_key,content,is_visible,sort_order').eq('project_id',project.id);
    if (verify.error) throw verify.error;
    const published = rowsToSnapshot(verify.data);
    for (const [key,section] of Object.entries(snapshot)) {
      if (!published[key] || !same({content:section?.content||{},is_visible:section?.is_visible!==false},{content:published[key].content||{},is_visible:published[key].is_visible!==false})) {
        throw new Error(`A publicação não sincronizou corretamente a seção “${key}”.`);
      }
    }

    return {atomicSucceeded, template:snapshot?.template?.content?.key || null};
  }

  document.addEventListener('click', async event => {
    const button = event.target.closest?.('#confirmPublish');
    if (!button || button.dataset.syncGuardBusy === '1') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    button.dataset.syncGuardBusy = '1';
    const idle = button.textContent;
    button.disabled = true;
    button.textContent = 'Publicando…';

    try {
      await waitDraftSaved();
      const project = await getProject();
      const result = await publishExact(project);
      window.WebAppCapUX?.markDirty?.(false);
      document.getElementById('publishModal')?.classList.remove('show');
      const status = document.getElementById('statusText');
      if (status) status.textContent = `Publicado agora · produção sincronizada${result.template?` · ${result.template}`:''}`;
      window.WebAppCapUX?.toast?.('Produção sincronizada com o Preview ✓',{type:'success',duration:3200});
      setTimeout(() => location.reload(), 700);
    } catch (error) {
      console.error('[WebAppCap publish sync guard]', error);
      const message = window.WebAppCapUX?.friendlyError?.(error) || error.message || 'Não foi possível publicar.';
      window.WebAppCapUX?.toast?.(message,{type:'error',duration:4800});
      button.disabled = false;
      button.textContent = idle;
      delete button.dataset.syncGuardBusy;
    }
  }, true);
})();