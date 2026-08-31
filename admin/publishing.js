(() => {
  const cfg = window.VITRINE_SUPABASE;
  const resolver = window.WebAppCapTenantResolver;
  const pub = window.WebAppCapPublishing;
  const access = window.WebAppCapAccess;
  const sb = window.supabase.createClient(cfg.url, cfg.publishableKey, {auth:{persistSession:true,autoRefreshToken:true}});
  const $ = id => document.getElementById(id);
  let user = null, project = null, draft = null, published = {}, role = null, state = null, versionCount = 0, latestVersionAt = null, templateAssignment = null;

  const fmt = value => value ? new Date(value).toLocaleString('pt-BR') : '—';
  const rowsToSnapshot = rows => Object.fromEntries((rows || []).map(row => [row.section_key, {content:row.content || {}, is_visible:row.is_visible !== false, sort_order:row.sort_order ?? 0}]));
  const clientHome = slug => `/admin/client.html?project=${encodeURIComponent(slug)}`;
  const templateLabel = value => ({editorial:'Editorial',fitness:'Fitness',personal_trainer:'Personal Trainer',educator:'Educador',local:'Negócio local'})[String(value||'').toLowerCase()] || String(value||'Template');

  function paint(id, text, kind='') { const el=$(id);el.className=`status ${kind}`.trim();el.querySelector('strong').innerHTML=`<span class="dot"></span>${text}`; }
  function setLink(id, href) { const el=$(id);el.href=href||'#';el.classList.toggle('disabled',!href); }
  function copy(value) { if(value) navigator.clipboard.writeText(value); }

  function renderHistoryEvent() {
    const timeline=document.querySelector('.timeline');if(!timeline)return;let event=document.getElementById('versionEvent');
    if(!event){event=document.createElement('div');event.className='event';event.id='versionEvent';event.innerHTML='<strong>Histórico / rollback</strong><span id="versionEventText">—</span>';timeline.appendChild(event)}
    document.getElementById('versionEventText').textContent=versionCount?`${versionCount} versão(ões) salva(s) · mais recente ${fmt(latestVersionAt)}`:'Nenhuma versão salva ainda';
  }

  async function load() {
    const slug=resolver.cleanSlug(window.VITRINE_PROJECT_CONTEXT?.slug);if(!slug)throw new Error('Abra esta tela a partir de um projeto.');
    const p=await sb.from('projects').select('*').eq('slug',slug).maybeSingle();if(p.error||!p.data)throw p.error||new Error('Projeto não encontrado.');project=p.data;
    const member=await sb.from('project_members').select('role').eq('project_id',project.id).eq('user_id',user.id).maybeSingle();if(member.error)throw member.error;
    role=access?.normalizeRole(member.data?.role)||null;if(!role)throw new Error('Sem acesso ao projeto.');
    if(!access?.can(role,'publish')){location.replace(clientHome(project.slug));return false}
    const [d,c,v,a]=await Promise.all([
      sb.from('project_drafts').select('snapshot,updated_at,last_published_at').eq('project_id',project.id).maybeSingle(),
      sb.from('site_content').select('section_key,content,is_visible,sort_order').eq('project_id',project.id),
      sb.from('project_versions').select('created_at',{count:'exact'}).eq('project_id',project.id).order('created_at',{ascending:false}).limit(1),
      sb.from('project_template_assignments').select('template_key,template_version').eq('project_id',project.id).maybeSingle()
    ]);
    if(d.error)throw d.error;if(c.error)throw c.error;if(v.error)throw v.error;if(a.error&&a.error.code!=='42P01')throw a.error;
    draft=d.data||{snapshot:{}};published=rowsToSnapshot(c.data);versionCount=v.count||0;latestVersionAt=v.data?.[0]?.created_at||null;templateAssignment=a.data||null;render();return true;
  }

  function render() {
    state=pub.publicationState({project,draft,published});const q=`?project=${encodeURIComponent(project.slug)}`;
    $('projectLabel').textContent=`${project.name} · ${project.slug}`;$('roleLabel').textContent=`Acesso: ${access?.label(role)||role}`;
    $('content').href=`/admin/index.html${q}`;$('domains').href=`/admin/domains.html${q}`;$('history').href=`/admin/history.html${q}`;
    $('domains').classList.toggle('hidden',!access?.can(role,'domains'));$('history').classList.toggle('hidden',!access?.can(role,'history'));
    paint('pubStatus',state.isPublished?'Publicado':'Não publicado',state.isPublished?'ok':'warn');paint('draftStatus',state.hasUnpublishedChanges?'Alterações pendentes':'Sincronizado',state.hasUnpublishedChanges?'warn':'ok');paint('domainStatus',state.domainIsActive?'Conectado':state.domainStatus==='pending'?'Pendente':'Rota padrão',state.domainIsActive?'ok':state.domainStatus==='pending'?'warn':'');
    const legacyTpl=draft.snapshot?.template?.content;const tplKey=templateAssignment?.template_key||legacyTpl?.key;const tplVersion=templateAssignment?.template_version||legacyTpl?.version||1;paint('templateStatus',tplKey?`${templateLabel(tplKey)} · v${tplVersion}`:'Sem template',tplKey?'ok':'warn');
    $('previewUrl').textContent=state.previewUrl||'—';$('publicUrl').textContent=state.publicUrl||'—';$('routeUrl').textContent=state.routeUrl||'—';$('configuredUrl').textContent=state.configuredUrl||'Nenhum domínio/subdomínio configurado';
    $('configuredNote').textContent=state.configuredUrl?(state.domainIsActive?'Este endereço está ativo e é usado como produção.':'Endereço configurado e pendente. O botão abaixo abre uma validação segura antes de promover o domínio para produção.'):'A rota da plataforma é o endereço público atual.';
    setLink('openPreview',state.previewUrl);setLink('openPublic',state.publicUrl);setLink('openConfigured',state.domainIsActive?state.configuredUrl:state.validationUrl);$('openConfigured').classList.toggle('hidden',!state.configuredUrl);$('copyConfigured').classList.toggle('hidden',!state.configuredUrl);
    if(state.configuredUrl&&!state.domainIsActive)$('openConfigured').textContent='Validar domínio ↗';else if($('openConfigured'))$('openConfigured').textContent='Abrir ↗';
    $('updatedAt').textContent=fmt(state.updatedAt);$('publishedAt').textContent=fmt(state.publishedAt);$('projectMeta').textContent=`${project.site_type||'—'} · ${project.is_published?'ativo':'rascunho'}`;renderHistoryEvent();
    $('publishCallout').className=`callout ${state.hasUnpublishedChanges?'warn':'ok'}`;$('publishCalloutText').textContent=state.hasUnpublishedChanges?'O Preview contém alterações que ainda não estão na produção.':'Rascunho e produção estão sincronizados.';
    const canPublish=access?.can(role,'publish')===true;$('publishNow').classList.toggle('hidden',!canPublish||!state.hasUnpublishedChanges);$('publishNow').disabled=!canPublish||!state.hasUnpublishedChanges;$('openEditor').href=`/admin/index.html${q}`;
    $('copyPreview').onclick=()=>copy(state.previewUrl);$('copyPublic').onclick=()=>copy(state.publicUrl);$('copyConfigured').onclick=()=>copy(state.domainIsActive?state.configuredUrl:state.validationUrl);
  }

  async function publishNow() {
    if(!state?.hasUnpublishedChanges||!access?.can(role,'publish'))return;
    const ok=window.WebAppCapUX?.confirm?await window.WebAppCapUX.confirm({title:'Publicar alterações?',message:'O rascunho atual irá para produção e a versão pública anterior ficará disponível no Histórico.',confirmText:'Publicar agora'}):window.confirm('Publicar o rascunho atual? A versão pública anterior será salva no histórico.');if(!ok)return;
    const button=$('publishNow');button.disabled=true;button.textContent='Publicando…';
    try{const result=await sb.rpc('publish_project_atomic',{p_project_id:project.id});if(result.error)throw result.error;await load();button.textContent='Publicado ✓';window.WebAppCapUX?.toast?.('Publicação concluída e versão anterior salva ✓',{type:'success'});setTimeout(()=>{button.textContent='Publicar agora';render()},1200)}
    catch(error){console.error(error);const missing=/publish_project_atomic|schema cache|function/i.test(error.message||'');const message=missing?'A função de publicação da Fase 4 ainda não foi instalada no Supabase.':(error.message||'Não foi possível publicar.');window.WebAppCapUX?.toast?window.WebAppCapUX.toast(message,{type:'error',duration:4200}):alert(message);button.disabled=false;button.textContent='Publicar agora'}
  }

  async function open(userValue){user=userValue;$('login').classList.add('hidden');$('app').classList.remove('hidden');try{await load()}catch(error){console.error(error);if(project?.slug&&!access?.can(role,'publish')){location.replace(clientHome(project.slug));return}alert(error.message||'Erro ao carregar')}}
  $('publishNow').onclick=publishNow;$('loginForm').onsubmit=async event=>{event.preventDefault();const result=await sb.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});if(result.error){$('err').textContent='E-mail ou senha inválidos.';return}open(result.data.user)};sb.auth.getSession().then(({data})=>{if(data.session?.user)open(data.session.user)});
})();