(() => {
  if (window.WebAppCapRouteGuardStarted) return;
  window.WebAppCapRouteGuardStarted = true;
  if (!window.supabase || !window.VITRINE_SUPABASE) return;
  const cfg=window.VITRINE_SUPABASE;
  const path=location.pathname.toLowerCase();
  if(!path.startsWith('/admin/'))return;

  const capabilityByPath={
    '/admin/dashboard.html':'projects',
    '/admin/analytics.html':'analytics',
    '/admin/media.html':'media',
    '/admin/history.html':'history',
    '/admin/structure.html':'structure',
    '/admin/theme.html':'theme',
    '/admin/templates.html':'templates',
    '/admin/footer.html':'footer',
    '/admin/domains.html':'domains',
    '/admin/team.html':'team',
    '/admin/projects.html':'projects',
    '/admin/new-project.html':'projects',
    '/admin/publishing.html':'publish'
  };
  const safe=new Set(['/admin/client.html','/admin/index.html','/admin/']);
  if(safe.has(path))return;
  const capability=capabilityByPath[path];
  if(!capability)return;

  let style=document.getElementById('webappcapRouteGuardStyle');
  const setChecking=()=>{
    if(window.WebAppCapRouteGuardAllowed)return;
    document.documentElement.classList.add('webappcap-route-checking');
    if(!style){style=document.createElement('style');style.id='webappcapRouteGuardStyle';style.textContent='html.webappcap-route-checking body{visibility:hidden!important}';document.head.appendChild(style)}
  };
  const clearChecking=()=>{
    document.documentElement.classList.remove('webappcap-route-checking');
    style?.remove();
    style=null;
  };
  setChecking();

  const sb=window.WebAppCapRouteGuardSupabase||(window.WebAppCapRouteGuardSupabase=
    window.supabase.createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true}}));
  const normalizeRole=role=>String(role||'').trim().toLowerCase();
  const matrix={
    owner:{editContent:true,publish:true,media:true,history:true,restoreVersion:true,structure:true,theme:true,templates:true,footer:true,domains:true,team:true,projects:true,analytics:true},
    admin:{editContent:true,publish:true,media:true,history:true,restoreVersion:true,structure:true,theme:true,templates:true,footer:true,domains:true,team:true,projects:true,analytics:true},
    editor:{editContent:true,publish:true,media:true,history:true,restoreVersion:false,structure:false,theme:false,templates:false,footer:false,domains:false,team:false,projects:false,analytics:false},
    viewer:{editContent:false,publish:false,media:false,history:false,restoreVersion:false,structure:false,theme:false,templates:false,footer:false,domains:false,team:false,projects:false,analytics:false}
  };
  const can=(role,cap)=>matrix[normalizeRole(role)]?.[cap]===true;
  const params=new URLSearchParams(location.search);
  const slugFromUrl=()=>window.WebAppCapTenantResolver?.cleanSlug?.(params.get('project')||window.VITRINE_PROJECT_CONTEXT?.slug)||params.get('project');
  const fallback=slug=>`/admin/${slug?`?project=${encodeURIComponent(slug)}`:''}`;

  let analyticsObserver=null;
  const injectAnalyticsCard=()=>{
    if(path!=='/admin/dashboard.html')return;
    const slug=slugFromUrl();
    if(!slug)return;
    const target=document.getElementById('optional');
    if(!target)return;
    if(!target.querySelector('[data-webappcap-analytics-link]')){
      const a=document.createElement('a');
      a.className='optional-card';
      a.dataset.webappcapAnalyticsLink='1';
      a.href=`/admin/analytics.html?project=${encodeURIComponent(slug)}`;
      a.innerHTML='<strong>Analytics</strong><span>Visitas, conversões e origens de tráfego.</span>';
      target.prepend(a);
    }
    if(!analyticsObserver){
      analyticsObserver=new MutationObserver(()=>{
        if(!target.querySelector('[data-webappcap-analytics-link]')){
          queueMicrotask(injectAnalyticsCard);
        }
      });
      analyticsObserver.observe(target,{childList:true});
    }
  };

  const allow=()=>{
    clearChecking();
    window.WebAppCapRouteGuardAllowed=true;
    window.WebAppCapRouteGuardBlocked=false;
    if(path==='/admin/dashboard.html'){
      setTimeout(injectAnalyticsCard,100);
      setTimeout(injectAnalyticsCard,500);
      setTimeout(injectAnalyticsCard,1200);
    }
  };
  const deny=slug=>{clearChecking();window.WebAppCapRouteGuardBlocked=true;location.replace(fallback(slug))};

  let running=false;
  async function run(){
    if(running)return;
    running=true;
    try{
      const {data:{session}}=await sb.auth.getSession();
      if(!session){allow();return}
      let slug=slugFromUrl();

      if(capability==='projects'){
        const {data:memberships,error}=await sb.from('project_members').select('role').eq('user_id',session.user.id);
        if(error){deny(slug);return}
        if((memberships||[]).some(m=>can(m.role,'projects'))){allow();return}
        deny(slug);return;
      }

      if(!slug){deny(null);return}
      const {data:project,error:pError}=await sb.from('projects').select('id,slug').eq('slug',slug).maybeSingle();
      if(pError||!project){deny(null);return}
      const {data:member,error:mError}=await sb.from('project_members').select('role').eq('project_id',project.id).eq('user_id',session.user.id).maybeSingle();
      if(mError||!member||!can(member.role,capability)){deny(project.slug);return}
      allow();
    } finally {
      running=false;
      if(!window.WebAppCapRouteGuardBlocked) clearChecking();
    }
  }

  window.WebAppCapRouteGuardPromise=run().catch(()=>deny(slugFromUrl()));
  sb.auth.onAuthStateChange((event)=>{
    if(event==='SIGNED_IN'&&!window.WebAppCapRouteGuardAllowed){
      window.WebAppCapRouteGuardPromise=run().catch(()=>deny(slugFromUrl()));
    }
  });
})();