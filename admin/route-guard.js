(() => {
  if (!window.supabase || !window.VITRINE_SUPABASE) return;
  const cfg=window.VITRINE_SUPABASE;
  const path=location.pathname.toLowerCase();
  const safe=new Set(['/admin/client.html','/admin/index.html','/admin/','/admin/media.html']);
  if(!path.startsWith('/admin/')||safe.has(path))return;

  const sb=window.WebAppCapRouteGuardSupabase||(window.WebAppCapRouteGuardSupabase=
    window.supabase.createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true}}));

  async function run(){
    const {data:{session}}=await sb.auth.getSession();
    if(!session){document.documentElement.classList.remove('webappcap-route-checking');return}

    const {data:memberships,error}=await sb.from('project_members')
      .select('project_id,role').eq('user_id',session.user.id);

    if(error){document.documentElement.classList.remove('webappcap-route-checking');return}

    const roles=(memberships||[]).map(x=>x.role);
    if(roles.some(r=>r==='owner'||r==='admin')){
      document.documentElement.classList.remove('webappcap-route-checking');
      return;
    }
    if(!roles.some(r=>r==='editor'||r==='viewer')){
      document.documentElement.classList.remove('webappcap-route-checking');
      return;
    }

    const requested=new URLSearchParams(location.search).get('project');
    if(requested){
      location.replace(`/admin/client.html?project=${encodeURIComponent(requested)}`);
      return;
    }

    const first=memberships?.find(x=>x.role==='editor'||x.role==='viewer')?.project_id;
    if(first){
      const {data:p}=await sb.from('projects').select('slug').eq('id',first).maybeSingle();
      if(p?.slug){
        location.replace(`/admin/client.html?project=${encodeURIComponent(p.slug)}`);
        return;
      }
    }
    location.replace('/admin/client.html');
  }
  run();
})();