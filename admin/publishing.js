(() => {
  const cfg = window.VITRINE_SUPABASE;
  const resolver = window.WebAppCapTenantResolver;
  const pub = window.WebAppCapPublishing;
  const sb = window.supabase.createClient(cfg.url, cfg.publishableKey, {auth:{persistSession:true,autoRefreshToken:true}});
  const $ = id => document.getElementById(id);
  let user = null, project = null, draft = null, published = {}, role = null, state = null;

  const fmt = value => value ? new Date(value).toLocaleString('pt-BR') : '—';
  const rowsToSnapshot = rows => Object.fromEntries((rows || []).map(row => [row.section_key, {
    content:row.content || {}, is_visible:row.is_visible !== false, sort_order:row.sort_order ?? 0
  }]));

  function paint(id, text, kind='') {
    const el = $(id);
    el.className = `status ${kind}`.trim();
    el.querySelector('strong').innerHTML = `<span class="dot"></span>${text}`;
  }

  function setLink(id, href) {
    const el = $(id);
    el.href = href || '#';
    el.classList.toggle('disabled', !href);
  }

  function copy(value) {
    if (!value) return;
    navigator.clipboard.writeText(value);
  }

  async function load() {
    const slug = resolver.cleanSlug(window.VITRINE_PROJECT_CONTEXT?.slug);
    if (!slug) throw new Error('Abra esta tela a partir de um projeto.');

    const p = await sb.from('projects').select('*').eq('slug', slug).maybeSingle();
    if (p.error || !p.data) throw p.error || new Error('Projeto não encontrado.');
    project = p.data;

    const member = await sb.from('project_members').select('role').eq('project_id', project.id).eq('user_id', user.id).maybeSingle();
    if (member.error) throw member.error;
    role = member.data?.role || null;
    if (!role) throw new Error('Sem acesso ao projeto.');

    const d = await sb.from('project_drafts').select('snapshot,updated_at,last_published_at').eq('project_id', project.id).maybeSingle();
    if (d.error) throw d.error;
    draft = d.data || {snapshot:{}};

    const c = await sb.from('site_content').select('section_key,content,is_visible,sort_order').eq('project_id', project.id);
    if (c.error) throw c.error;
    published = rowsToSnapshot(c.data);
    render();
  }

  function render() {
    state = pub.publicationState({project, draft, published});
    const q = `?project=${encodeURIComponent(project.slug)}`;
    $('projectLabel').textContent = `${project.name} · ${project.slug}`;
    $('roleLabel').textContent = `Acesso: ${role}`;
    $('content').href = `/admin/index.html${q}`;
    $('domains').href = `/admin/domains.html${q}`;
    $('history').href = `/admin/history.html${q}`;

    paint('pubStatus', state.isPublished ? 'Publicado' : 'Não publicado', state.isPublished ? 'ok' : 'warn');
    paint('draftStatus', state.hasUnpublishedChanges ? 'Alterações pendentes' : 'Sincronizado', state.hasUnpublishedChanges ? 'warn' : 'ok');
    paint('domainStatus', state.domainIsActive ? 'Conectado' : state.domainStatus === 'pending' ? 'Pendente' : 'Rota padrão', state.domainIsActive ? 'ok' : state.domainStatus === 'pending' ? 'warn' : '');
    const tpl = draft.snapshot?.template?.content;
    paint('templateStatus', tpl?.key ? `${tpl.key} · v${tpl.version || 1}` : 'Sem template', tpl?.key ? 'ok' : 'warn');

    $('previewUrl').textContent = state.previewUrl || '—';
    $('publicUrl').textContent = state.publicUrl || '—';
    $('routeUrl').textContent = state.routeUrl || '—';
    $('configuredUrl').textContent = state.configuredUrl || 'Nenhum domínio/subdomínio configurado';
    $('configuredNote').textContent = state.configuredUrl
      ? (state.domainIsActive ? 'Este endereço está ativo e é usado como produção.' : 'Endereço configurado, mas ainda não promovido para produção.')
      : 'A rota da plataforma é o endereço público atual.';

    setLink('openPreview', state.previewUrl);
    setLink('openPublic', state.publicUrl);
    setLink('openConfigured', state.configuredUrl);
    $('openConfigured').classList.toggle('hidden', !state.configuredUrl);
    $('copyConfigured').classList.toggle('hidden', !state.configuredUrl);

    $('updatedAt').textContent = fmt(state.updatedAt);
    $('publishedAt').textContent = fmt(state.publishedAt);
    $('projectMeta').textContent = `${project.site_type || '—'} · ${project.is_published ? 'ativo' : 'rascunho'}`;
    $('publishCallout').className = `callout ${state.hasUnpublishedChanges ? 'warn' : 'ok'}`;
    $('publishCalloutText').textContent = state.hasUnpublishedChanges
      ? 'O Preview contém alterações que ainda não estão na produção.'
      : 'Rascunho e produção estão sincronizados.';

    const canPublish = ['owner','admin','editor'].includes(role);
    $('publishNow').classList.toggle('hidden', !canPublish || !state.hasUnpublishedChanges);
    $('publishNow').disabled = !canPublish || !state.hasUnpublishedChanges;
    $('openEditor').href = `/admin/index.html${q}`;

    $('copyPreview').onclick = () => copy(state.previewUrl);
    $('copyPublic').onclick = () => copy(state.publicUrl);
    $('copyConfigured').onclick = () => copy(state.configuredUrl);
  }

  async function publishNow() {
    if (!state?.hasUnpublishedChanges || !['owner','admin','editor'].includes(role)) return;
    if (!window.confirm('Publicar o rascunho atual? A versão pública anterior será salva no histórico.')) return;
    const button = $('publishNow');
    button.disabled = true;
    button.textContent = 'Publicando…';
    try {
      const result = await sb.rpc('publish_project_atomic', {p_project_id:project.id});
      if (result.error) throw result.error;
      await load();
      button.textContent = 'Publicado ✓';
      setTimeout(() => { button.textContent = 'Publicar agora'; render(); }, 1200);
    } catch (error) {
      console.error(error);
      const missing = /publish_project_atomic|schema cache|function/i.test(error.message || '');
      alert(missing
        ? 'A função de publicação da Fase 4 ainda não foi instalada no Supabase.'
        : (error.message || 'Não foi possível publicar.'));
      button.disabled = false;
      button.textContent = 'Publicar agora';
    }
  }

  async function open(userValue) {
    user = userValue;
    $('login').classList.add('hidden');
    $('app').classList.remove('hidden');
    try { await load(); }
    catch (error) { console.error(error); alert(error.message || 'Erro ao carregar'); }
  }

  $('publishNow').onclick = publishNow;
  $('loginForm').onsubmit = async event => {
    event.preventDefault();
    const result = await sb.auth.signInWithPassword({email:$('email').value.trim(), password:$('password').value});
    if (result.error) { $('err').textContent = 'E-mail ou senha inválidos.'; return; }
    open(result.data.user);
  };
  sb.auth.getSession().then(({data}) => { if (data.session?.user) open(data.session.user); });
})();