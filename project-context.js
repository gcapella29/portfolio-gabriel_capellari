(() => {
  const cfg = window.VITRINE_SUPABASE;
  const resolver = window.WebAppCapTenantResolver;
  if (!cfg || !resolver) return;
  const route = resolver.fromLocation(window.location), isAdmin = route.isAdmin, NO_ADMIN_PROJECT='__no_project_selected__';
  const resolved=isAdmin&&!route.slug?NO_ADMIN_PROJECT:route.slug;
  window.VITRINE_PROJECT_CONTEXT={slug:resolved,hasProject:!!route.slug,defaultSlug:null,legacyPrimarySlug:cfg.projectSlug||null,set(slug){const clean=resolver.cleanSlug(slug);if(!clean)return;localStorage.setItem('vitrine-current-project',clean);this.slug=clean;this.hasProject=true},clear(){localStorage.removeItem('vitrine-current-project');document.cookie='vitrine_project=; Max-Age=0; Path=/; SameSite=Lax';this.slug=isAdmin?NO_ADMIN_PROJECT:null;this.hasProject=false},selectedSlug(){return this.hasProject?resolver.cleanSlug(this.slug):null},withProject(path){const url=new URL(path,window.location.origin),selected=this.selectedSlug();if(selected)url.searchParams.set('project',selected);else url.searchParams.delete('project');return url.pathname+url.search+url.hash}};
  const isContentEditor=isAdmin&&!!route.querySlug&&(['/admin/','/admin/index.html','/admin'].includes(window.location.pathname));
  if(isContentEditor&&window.MutationObserver&&!window.__WebAppCapNativeMutationObserver){const Native=window.MutationObserver;window.__WebAppCapNativeMutationObserver=Native;window.MutationObserver=class extends Native{observe(target,options){if(target?.id==='nav')return;return super.observe(target,options)}}}
  if(isContentEditor){
    const load=(src,attr)=>{if(document.querySelector(`script[${attr}]`))return;const s=document.createElement('script');s.src=src;s.defer=true;s.setAttribute(attr,'1');document.head.appendChild(s)};
    load('/admin/fitness-reels-editor.js','data-webappcap-fitness-reels-editor');
    load('/admin/fitness-cms-editor.js','data-webappcap-fitness-cms-editor');
    load('/admin/publish-sync-guard.js','data-webappcap-publish-sync-guard');
    const placePreview=()=>{
      const preview=document.getElementById('previewLink');
      const right=document.querySelector('.webappcap-editor-tools-right');
      if(!preview||!right)return false;
      const site=right.querySelector('#publishedLink,[data-published-link],a[href*="/p/"]');
      if(preview.parentElement!==right){if(site)right.insertBefore(preview,site);else right.prepend(preview)}
      preview.textContent='Preview ↗';
      preview.removeAttribute('style');
      preview.classList.remove('btn','ghost');
      if(site){preview.className=site.className;preview.classList.remove('primary','dark','gold')}
      const workflow=document.querySelector('header.top .workflow');
      if(workflow&&!workflow.children.length)workflow.style.display='none';
      return true;
    };
    let tries=0;const timer=setInterval(()=>{tries++;if(placePreview()||tries>80)clearInterval(timer)},100);
    window.addEventListener('load',()=>setTimeout(placePreview,0),{once:true});
  }
  if(!isAdmin){document.addEventListener('webappcap:data-ready',event=>{const key=String(event.detail?.snapshot?.template?.content?.key||'').toLowerCase();if(key!=='fitness')return;const loadCss=(href,attr)=>{if(document.querySelector(`link[${attr}]`))return;const l=document.createElement('link');l.rel='stylesheet';l.href=href;l.setAttribute(attr,'1');document.head.appendChild(l)};const loadJs=(src,attr)=>{if(document.querySelector(`script[${attr}]`))return;const s=document.createElement('script');s.src=src;s.defer=true;s.setAttribute(attr,'1');document.head.appendChild(s)};loadCss('/assets/templates/fitness-v2.css','data-webappcap-template-skin');loadCss('/assets/templates/fitness-v2-polish.css','data-webappcap-template-polish');loadCss('/assets/templates/fitness-conversion.css','data-webappcap-template-conversion');loadJs('/fitness-public-enhancer.js','data-webappcap-fitness-public');loadJs('/fitness-schedule-leads.js','data-webappcap-fitness-schedule-leads')},{once:true})}
  if(route.querySlug&&isAdmin)localStorage.setItem('vitrine-current-project',route.querySlug);if(isAdmin&&!route.querySlug)localStorage.removeItem('vitrine-current-project');
  if(isAdmin&&!route.querySlug&&(['/admin/','/admin/index.html','/admin'].includes(window.location.pathname))){document.documentElement.style.visibility='hidden';queueMicrotask(async()=>{try{if(!window.supabase){document.documentElement.style.visibility='';return}const sb=window.WebAppCapEntrySupabase||(window.WebAppCapEntrySupabase=window.supabase.createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true}}));const session=(await sb.auth.getSession()).data?.session;if(!session){document.documentElement.style.visibility='';return}const q=await sb.rpc('webappcap_my_projects',{include_archived:false});if(q.error)throw q.error;const projects=q.data||[];if(!projects.length){document.documentElement.style.visibility='';return}if(projects.some(p=>String(p.role||'').toLowerCase()==='owner')){window.location.replace('/admin/projects.html');return}const chosen=projects.find(p=>!p.archived_at)||projects[0];window.location.replace(`/admin/client.html?project=${encodeURIComponent(chosen.slug)}`)}catch(error){console.warn('[WebAppCap entry routing]',error);document.documentElement.style.visibility=''}})}
  if(!isAdmin&&!route.slug){const host=String(window.location.hostname||'').toLowerCase(),custom=!resolver.isPrimaryHost(host);if(custom){window.VITRINE_PROJECT_CONTEXT.pendingHost=host;return}if(window.location.pathname!=='/')window.location.replace('/')}
})();