(() => {
  if (window.WebAppCapUxPolishLoaded) return;
  window.WebAppCapUxPolishLoaded = true;

  const path = location.pathname.toLowerCase();
  const isDashboard = path === '/admin/dashboard.html';
  const isContent = path === '/admin/' || path === '/admin/index.html' || path === '/admin';
  if (!isDashboard && !isContent) return;

  const cfg = window.VITRINE_SUPABASE;
  if (!cfg || !window.supabase) return;

  const sb = window.WebAppCapUxPolishSupabase || (window.WebAppCapUxPolishSupabase = window.supabase.createClient(cfg.url, cfg.publishableKey, {
    auth: { persistSession: true, autoRefreshToken: true }
  }));
  const params = new URLSearchParams(location.search);
  const slug = window.WebAppCapTenantResolver?.cleanSlug(params.get('project') || window.VITRINE_PROJECT_CONTEXT?.slug || cfg.projectSlug);
  const labelRole = role => ({ owner: 'Owner', admin: 'Admin', editor: 'Cliente', viewer: 'Visualizador' })[String(role || '').toLowerCase()] || 'Usuário';
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  async function currentRole() {
    const session = (await sb.auth.getSession()).data?.session;
    if (!session?.user || !slug) return null;
    const project = await sb.from('projects').select('id').eq('slug', slug).maybeSingle();
    if (project.error || !project.data) return null;
    const member = await sb.from('project_members').select('role').eq('project_id', project.data.id).eq('user_id', session.user.id).maybeSingle();
    return member.error ? null : (member.data?.role || null);
  }

  function makeRoleBadge(role) {
    const badge = document.createElement('span');
    badge.className = 'webappcap-role-badge';
    badge.textContent = `Perfil: ${labelRole(role)}`;
    return badge;
  }

  async function logout() {
    try { await sb.auth.signOut(); }
    finally { location.href = '/admin/'; }
  }

  async function enhanceDashboard(role) {
    let actions = document.querySelector('.top .actions');
    for (let i = 0; !actions && i < 50; i++) { await wait(100); actions = document.querySelector('.top .actions'); }
    if (!actions || actions.dataset.uxPolished) return;
    actions.dataset.uxPolished = '1';
    actions.classList.add('webappcap-session-actions');
    actions.prepend(makeRoleBadge(role));

    const exit = document.createElement('button');
    exit.type = 'button';
    exit.className = 'webappcap-logout';
    exit.textContent = 'Sair';
    exit.onclick = logout;
    actions.appendChild(exit);

    const sectionTitles = [...document.querySelectorAll('.section-title')];
    if (sectionTitles[0]) {
      const h2 = sectionTitles[0].querySelector('h2');
      const p = sectionTitles[0].querySelector('p');
      if (h2) h2.textContent = 'Editar projeto';
      if (p) p.textContent = 'Escolha uma área para configurar o site.';
    }
    if (sectionTitles[1]) {
      const h2 = sectionTitles[1].querySelector('h2');
      const p = sectionTitles[1].querySelector('p');
      if (h2) h2.textContent = 'Gestão e recursos';
      if (p) p.textContent = 'Configurações administrativas, métricas e ferramentas do projeto.';
    }

    const banner = document.querySelector('.status-banner');
    const pulse = document.getElementById('draftPulse');
    const draftText = document.getElementById('draftText');
    if (banner && !document.querySelector('.webappcap-dashboard-note')) {
      const syncNote = () => {
        const text = String(draftText?.textContent || '').toLowerCase();
        const pending = pulse?.classList.contains('warn') || text.includes('aguardando') || text.includes('não publicad') || text.includes('alterações novas');
        let note = document.querySelector('.webappcap-dashboard-note');
        if (pending && !note) {
          note = document.createElement('div');
          note.className = 'webappcap-dashboard-note';
          note.textContent = 'Há alterações no rascunho que ainda não estão no site publicado.';
          banner.insertAdjacentElement('afterend', note);
        } else if (!pending && note) note.remove();
      };
      syncNote();
      if (draftText) new MutationObserver(syncNote).observe(draftText, { childList: true, subtree: true, characterData: true });
      if (pulse) new MutationObserver(syncNote).observe(pulse, { attributes: true, attributeFilter: ['class'] });
    }
  }

  function findAnchor(test) {
    return [...document.querySelectorAll('a[href]')].find(a => test(a, String(a.textContent || '').trim().toLowerCase()));
  }

  function hideOriginalAction(el) {
    if (!el) return;
    el.dataset.uxOriginalAction = '1';
    el.style.display = 'none';
  }

  async function enhanceContent(role) {
    let host = document.querySelector('main') || document.querySelector('.main') || document.querySelector('.content');
    for (let i = 0; !host && i < 60; i++) { await wait(100); host = document.querySelector('main') || document.querySelector('.main') || document.querySelector('.content'); }
    if (!host || document.getElementById('webappcapEditorTools')) return;

    document.body.classList.add('webappcap-dashboard-navigation');
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.setAttribute('aria-hidden', 'true');

    const tools = document.createElement('div');
    tools.id = 'webappcapEditorTools';
    tools.className = 'webappcap-editor-tools';
    tools.innerHTML = '<div class="webappcap-editor-tools-left"></div><div class="webappcap-editor-tools-right"></div>';
    host.prepend(tools);
    const left = tools.querySelector('.webappcap-editor-tools-left');
    const right = tools.querySelector('.webappcap-editor-tools-right');

    const dashboard = document.createElement('a');
    dashboard.href = `/admin/dashboard.html?project=${encodeURIComponent(slug || '')}`;
    dashboard.textContent = '← Dashboard';
    left.appendChild(dashboard);
    left.appendChild(makeRoleBadge(role));

    const state = document.createElement('span');
    state.className = 'ux-save-state';
    state.dataset.uxDirtyIndicator = '1';
    state.textContent = window.WebAppCapUX?.state?.dirty ? 'Alterações não salvas' : 'Tudo salvo';
    left.appendChild(state);

    const preview = findAnchor((a, text) => text.includes('preview') || a.href.includes('/preview.html'));
    if (preview) {
      const a = document.createElement('a');
      a.href = preview.href; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = 'Preview ↗';
      right.appendChild(a);
      hideOriginalAction(preview);
    }

    const published = document.getElementById('publishedLink') || findAnchor((a, text) => text.includes('site publicado'));
    if (published) {
      const a = document.createElement('a');
      a.href = published.href; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = 'Site ↗';
      a.onclick = event => { event.preventDefault(); published.click(); };
      right.appendChild(a);
      hideOriginalAction(published);
    }

    const save = document.getElementById('saveButton');
    if (save) {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'primary'; button.textContent = 'Salvar rascunho';
      button.onclick = () => save.click();
      right.appendChild(button);
    }

    const publish = document.getElementById('publishButton');
    if (publish) {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'dark'; button.textContent = 'Publicar';
      button.onclick = () => publish.click();
      right.appendChild(button);
      hideOriginalAction(publish);
    }

    const originalActionContainers = [...document.querySelectorAll('header .actions, header .top-actions, .page-head .actions')];
    originalActionContainers.forEach(container => {
      const visible = [...container.children].some(child => getComputedStyle(child).display !== 'none');
      if (!visible) container.style.display = 'none';
    });

    const markDirty = () => window.WebAppCapUX?.markDirty?.(true);
    document.addEventListener('input', event => { if (event.target.closest?.('input,textarea,select,[contenteditable="true"]')) markDirty(); }, true);
    document.addEventListener('change', event => { if (event.target.closest?.('input,textarea,select,[contenteditable="true"]')) markDirty(); }, true);

    if (save) save.addEventListener('click', async () => {
      for (let i = 0; i < 60; i++) {
        await wait(100);
        const text = String(document.getElementById('statusText')?.textContent || '').toLowerCase();
        if (text.includes('salvo') || text.includes('sincroniz')) {
          window.WebAppCapUX?.markDirty?.(false);
          break;
        }
      }
    });
  }

  (async () => {
    try {
      const role = await currentRole();
      if (!role) return;
      if (isDashboard) await enhanceDashboard(role);
      if (isContent) await enhanceContent(role);
    } catch (error) {
      console.warn('[WebAppCap UX polish]', error);
    }
  })();
})();