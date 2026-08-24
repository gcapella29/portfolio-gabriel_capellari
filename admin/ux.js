(() => {
 if(window.WebAppCapUX)return;
 const state={dirty:false};
 const root=()=>{let r=document.getElementById('webappcapUxToastRoot');if(!r){r=document.createElement('div');r.id='webappcapUxToastRoot';r.className='webappcap-ux-toast-root';document.body.appendChild(r)}return r};
 function toast(message,{type='info',duration=2600}={}){const el=document.createElement('div');el.className=`webappcap-ux-toast ${type}`;el.innerHTML=`<span class="ux-dot"></span><div>${String(message||'')}</div>`;root().appendChild(el);requestAnimationFrame(()=>el.classList.add('show'));setTimeout(()=>{el.classList.remove('show');setTimeout(()=>el.remove()},220)},duration)}
 function setButtonBusy(button,busy,{busyText='Salvando…'}={}){if(!button)return;if(!button.dataset.uxIdleText)button.dataset.uxIdleText=button.textContent;button.disabled=!!busy;button.classList.toggle('ux-busy',!!busy);button.textContent=busy?busyText:button.dataset.uxIdleText}
 function confirmAction({title='Confirmar ação',message='Deseja continuar?',confirmText='Confirmar',cancelText='Cancelar',danger=false}={}){return new Promise(resolve=>{const o=document.createElement('div');o.className='webappcap-ux-modal-backdrop';o.innerHTML=`<div class="webappcap-ux-modal"><div class="ux-kicker">${danger?'AÇÃO SENSÍVEL':'CONFIRMAÇÃO'}</div><h3>${title}</h3><p>${message}</p><div class="ux-modal-actions"><button class="ux-btn ux-btn-ghost" data-cancel>${cancelText}</button><button class="ux-btn ${danger?'ux-btn-danger':'ux-btn-dark'}" data-confirm>${confirmText}</button></div></div>`;document.body.appendChild(o);const done=v=>{o.remove();resolve(v)};o.querySelector('[data-cancel]').onclick=()=>done(false);o.querySelector('[data-confirm]').onclick=()=>done(true);o.onclick=e=>{if(e.target===o)done(false)}})}
 function markDirty(v=true){state.dirty=!!v;document.querySelectorAll('[data-ux-dirty-indicator]').forEach(el=>{el.textContent=state.dirty?'Alterações não salvas':'Tudo salvo';el.classList.toggle('dirty',state.dirty)})}
 function friendlyError(error){const raw=String(error?.message||error||'Erro inesperado.');const l=raw.toLowerCase();if(l.includes('limite do plano')||l.includes('não está disponível neste plano'))return raw;if(l.includes('row-level security')||l.includes('rls')||l.includes('permission'))return'Você não tem permissão para realizar esta alteração.';if(l.includes('duplicate')||l.includes('unique'))return'Esse valor já está sendo usado em outro projeto.';if(l.includes('network')||l.includes('fetch'))return'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.';return raw}
 window.addEventListener('beforeunload',e=>{if(!state.dirty)return;e.preventDefault();e.returnValue=''});
 document.addEventListener('click',async e=>{const a=e.target.closest('a[href]');if(!a||!state.dirty||a.target==='_blank'||a.dataset.uxIgnoreDirty!==undefined)return;const u=new URL(a.href,location.href);if(u.origin!==location.origin)return;e.preventDefault();const ok=await confirmAction({title:'Sair sem salvar?',message:'Existem alterações não salvas nesta página.',confirmText:'Sair mesmo assim',danger:true});if(ok){state.dirty=false;location.href=a.href}},true);

 const path=location.pathname.toLowerCase();
 const isContentEditor=()=>path==='/admin/'||path==='/admin/index.html'||path==='/admin';
 const isMediaEditor=()=>path==='/admin/media.html';
 const waitFor=(predicate,{timeout=8000,interval=80,errorMessage='Tempo esgotado ao concluir a operação.'}={})=>new Promise((resolve,reject)=>{const started=Date.now();const tick=()=>{try{if(predicate())return resolve(true)}catch{}if(Date.now()-started>=timeout)return reject(new Error(errorMessage));setTimeout(tick,interval)};tick()});
 const currentEditorSlug=()=>window.WebAppCapTenantResolver?.cleanSlug(new URLSearchParams(location.search).get('project')||window.VITRINE_PROJECT_CONTEXT?.slug);
 const safeEditorRoute=slug=>slug?new URL(`/p/${encodeURIComponent(slug)}`,location.origin).href:null;
 const clientRoute=slug=>`/admin/client.html${slug?`?project=${encodeURIComponent(slug)}`:''}`;
 async function editorProject(sb){const slug=currentEditorSlug();if(!slug)throw new Error('Projeto não selecionado.');const q=await sb.from('projects').select('id,slug,subdomain,custom_domain,domain_status,is_published').eq('slug',slug).maybeSingle();if(q.error)throw q.error;if(!q.data)throw new Error('Projeto não encontrado.');return q.data}
 function editorPublicUrl(project){const route=safeEditorRoute(project.slug);const active=String(project.domain_status||'').toLowerCase()==='active';if(!active)return route;const custom=String(project.custom_domain||'').trim().toLowerCase().replace(/^https?:\/\//,'').replace(/\/.*$/,'').replace(/\.$/,'');if(custom)return`https://${custom}/`;const sub=String(project.subdomain||'').trim().toLowerCase().replace(/[^a-z0-9-]/g,'').replace(/^-+|-+$/g,'');return sub?`https://${sub}.webappcap.com.br/`:route}
 async function loadAccessControl(){if(window.WebAppCapAccess)return window.WebAppCapAccess;await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='/admin/access-control.js';s.onload=resolve;s.onerror=()=>reject(new Error('Não foi possível carregar as permissões do CMS.'));document.head.appendChild(s)});return window.WebAppCapAccess}

 let entryRouting=false,entryResolved=false;
 async function routeProjectlessAdminEntry(){
   if(!isContentEditor()||new URLSearchParams(location.search).get('project')||entryRouting||entryResolved||!window.supabase||!window.VITRINE_SUPABASE)return false;
   entryRouting=true;document.documentElement.style.visibility='hidden';
   try{
     const cfg=window.VITRINE_SUPABASE,sb=window.WebAppCapEntrySupabase||(window.WebAppCapEntrySupabase=window.supabase.createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true}}));
     const session=(await sb.auth.getSession()).data?.session;
     if(!session){document.documentElement.style.visibility='';return false}
     const params=new URLSearchParams(location.search),next=params.get('next');
     if(next){try{const target=new URL(next,location.origin);if(target.origin===location.origin&&target.pathname.startsWith('/admin/')){location.replace(target.pathname+target.search+target.hash);return true}}catch{}}
     const q=await sb.rpc('webappcap_my_projects',{include_archived:false});if(q.error)throw q.error;
     const projects=q.data||[];
     if(!projects.length){document.documentElement.style.visibility='';toast('Nenhum projeto está vinculado ao seu usuário.',{type:'error',duration:3800});return false}
     if(projects.some(p=>String(p.role||'').toLowerCase()==='owner')){location.replace('/admin/projects.html');return true}
     const chosen=projects.find(p=>!p.archived_at)||projects[0];
     location.replace(clientRoute(chosen.slug));return true;
   }catch(error){console.warn('[WebAppCap entry router]',error);document.documentElement.style.visibility='';return false}
   finally{entryRouting=false;entryResolved=true}
 }
 if(isContentEditor()&&!new URLSearchParams(location.search).get('project')){
   routeProjectlessAdminEntry();
   try{const cfg=window.VITRINE_SUPABASE;if(window.supabase&&cfg){const entryWatcher=window.supabase.createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true}});entryWatcher.auth.onAuthStateChange(event=>{if(event==='SIGNED_IN'){entryResolved=false;setTimeout(routeProjectlessAdminEntry,0)}})}}catch{}
 }

 let preflightRunning=false,preflightDone=false;
 async function preflightRestrictedEditor(){
   if((!isContentEditor()&&!isMediaEditor())||!window.supabase||!window.VITRINE_SUPABASE||preflightRunning||preflightDone)return;
   if(isContentEditor()&&!new URLSearchParams(location.search).get('project')){await routeProjectlessAdminEntry();return}
   preflightRunning=true;
   try{
     const cfg=window.VITRINE_SUPABASE,sb=window.WebAppCapPreflightSupabase||(window.WebAppCapPreflightSupabase=window.supabase.createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true}}));
     const session=await sb.auth.getSession();const user=session.data?.session?.user;if(!user)return;
     const slug=currentEditorSlug();if(!slug)return;
     document.documentElement.style.visibility='hidden';
     const project=await editorProject(sb);
     const member=await sb.from('project_members').select('role').eq('project_id',project.id).eq('user_id',user.id).maybeSingle();if(member.error)throw member.error;
     const access=await loadAccessControl(),role=access.normalizeRole(member.data?.role);
     const needed=isMediaEditor()?'media':'editContent';
     if(!access.can(role,needed)){location.replace(clientRoute(project.slug));return}
     preflightDone=true;document.documentElement.style.visibility='';
   }catch(error){console.warn('[WebAppCap access preflight]',error);document.documentElement.style.visibility='';}
   finally{preflightRunning=false}
 }
 if(isContentEditor()||isMediaEditor()){
   preflightRestrictedEditor();
   try{const cfg=window.VITRINE_SUPABASE;if(window.supabase&&cfg){const watcher=window.supabase.createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true}});watcher.auth.onAuthStateChange((event)=>{if(event==='SIGNED_IN'){preflightDone=false;setTimeout(preflightRestrictedEditor,0)}})}}catch{}
 }

 async function installRoleAwareEditor(){if(!isContentEditor()||!window.supabase||!window.VITRINE_SUPABASE)return null;if(!new URLSearchParams(location.search).get('project'))return null;const cfg=window.VITRINE_SUPABASE,sb=window.supabase.createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true}});const access=await loadAccessControl();const session=await sb.auth.getSession();const user=session.data?.session?.user;if(!user)return null;const project=await editorProject(sb);const member=await sb.from('project_members').select('role').eq('project_id',project.id).eq('user_id',user.id).maybeSingle();if(member.error)throw member.error;const role=access.normalizeRole(member.data?.role);if(!role)return null;
   if(!access.can(role,'editContent')){location.replace(clientRoute(project.slug));return {role,project,redirected:true}}
   const identity=document.getElementById('projectIdentity');if(identity&&!identity.querySelector('[data-role-label]')){const badge=document.createElement('span');badge.dataset.roleLabel='1';badge.style.marginLeft='.55rem';badge.style.opacity='.72';badge.textContent=`· ${access.label(role)}`;identity.appendChild(badge)}
   const nav=document.getElementById('nav');if(nav){const rules=[['/admin/dashboard.html','projects'],['/admin/media.html','media'],['/admin/history.html','history'],['/admin/structure.html','structure'],['/admin/theme.html','theme'],['/admin/templates.html','templates'],['/admin/footer.html','footer'],['/admin/domains.html','domains'],['/admin/projects.html','projects']];const apply=()=>{for(const a of nav.querySelectorAll('a[href]')){const p=new URL(a.href,location.href).pathname;const rule=rules.find(([prefix])=>p===prefix);if(rule&&!access.can(role,rule[1]))a.remove()}if(access.can(role,'history')&&!nav.querySelector('a[href*="/admin/history.html"]')){const a=document.createElement('a');a.href=`/admin/history.html?project=${encodeURIComponent(project.slug)}`;a.textContent='Histórico';nav.appendChild(a)}if(access.can(role,'publish')&&!nav.querySelector('a[href*="/admin/publishing.html"]')){const a=document.createElement('a');a.href=`/admin/publishing.html?project=${encodeURIComponent(project.slug)}`;a.textContent='Publicação';nav.appendChild(a)}};apply();new MutationObserver(apply).observe(nav,{childList:true})}
   const publish=document.getElementById('publishButton');if(publish&&!access.can(role,'publish'))publish.remove();const save=document.getElementById('saveButton');if(save&&!access.can(role,'editContent'))save.disabled=true;
   return {role,project,redirected:false};
 }
 async function installAtomicPublishing(){if(!isContentEditor()||!window.supabase||!window.VITRINE_SUPABASE||!new URLSearchParams(location.search).get('project'))return;const confirmButton=document.getElementById('confirmPublish'),publishedLink=document.getElementById('publishedLink');if(!confirmButton)return;
   const initialSlug=currentEditorSlug();if(publishedLink&&initialSlug){publishedLink.href=safeEditorRoute(initialSlug);publishedLink.dataset.domainGuard='safe-route'}
   const cfg=window.VITRINE_SUPABASE,sb=window.supabase.createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true}});let project;try{project=await editorProject(sb);if(publishedLink){publishedLink.href=editorPublicUrl(project);publishedLink.dataset.domainGuard=String(project.domain_status||'unconfigured').toLowerCase()==='active'?'active-domain':'safe-route'}}catch(error){console.warn('[WebAppCap publishing]',error);return}
   document.addEventListener('click',async event=>{const link=event.target.closest?.('#publishedLink');if(!link)return;event.preventDefault();event.stopImmediatePropagation();try{const fresh=await editorProject(sb);const target=editorPublicUrl(fresh);if(!target)throw new Error('Endereço público indisponível.');link.href=target;link.dataset.domainGuard=String(fresh.domain_status||'unconfigured').toLowerCase()==='active'?'active-domain':'safe-route';window.open(target,'_blank','noopener,noreferrer')}catch(error){console.error('[WebAppCap published link]',error);toast(friendlyError(error),{type:'error',duration:3800})}},true);
   document.addEventListener('click',async event=>{if(event.target!==confirmButton)return;event.preventDefault();event.stopImmediatePropagation();if(confirmButton.dataset.atomicBusy==='1')return;confirmButton.dataset.atomicBusy='1';setButtonBusy(confirmButton,true,{busyText:'Publicando…'});try{if(state.dirty){const save=document.getElementById('saveButton');if(!save)throw new Error('Não foi possível salvar o rascunho antes de publicar.');save.click();await waitFor(()=>state.dirty===false,{timeout:8000,errorMessage:'Tempo esgotado ao salvar o rascunho.'})}const result=await sb.rpc('publish_project_atomic',{p_project_id:project.id});if(result.error)throw result.error;markDirty(false);document.getElementById('publishModal')?.classList.remove('show');const status=document.getElementById('statusText');if(status)status.textContent='Publicado agora · transação concluída';toast('Site publicado com segurança ✓',{type:'success',duration:3200});setTimeout(()=>location.reload(),650)}catch(error){console.error('[WebAppCap atomic publish]',error);toast(friendlyError(error)||'Erro ao publicar.',{type:'error',duration:4200})}finally{delete confirmButton.dataset.atomicBusy;setButtonBusy(confirmButton,false)}} ,true);
 }
 async function bootstrapPhase5Editor(){if(!isContentEditor())return;try{if(!new URLSearchParams(location.search).get('project')){await routeProjectlessAdminEntry();return}await preflightRestrictedEditor();await waitFor(()=>{const status=document.getElementById('statusText');const identity=document.getElementById('projectIdentity');if(!status||!identity)return false;const statusText=String(status.textContent||'').trim();const identityText=String(identity.textContent||'').trim();if(statusText==='Erro')throw new Error('Admin não conseguiu carregar o projeto.');return identityText!=='Projeto'&&statusText!==''&&!/^Conectando/i.test(statusText)},{timeout:12000,interval:100,errorMessage:'Admin não concluiu o carregamento do projeto.'});const accessState=await installRoleAwareEditor();if(accessState?.redirected)return;await installAtomicPublishing()}catch(error){console.warn('[WebAppCap phase 5 bootstrap]',error)}}
 setTimeout(bootstrapPhase5Editor,0);
 window.WebAppCapUX={toast,setButtonBusy,confirm:confirmAction,markDirty,friendlyError,state,preflightRestrictedEditor,routeProjectlessAdminEntry};
})();