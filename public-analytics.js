(() => {
  if (window.WebAppCapAnalyticsStarted || !window.WebAppCapData?.ready) return;
  window.WebAppCapAnalyticsStarted = true;

  const SESSION_KEY='webappcap_session_id';
  const makeSession=()=>{
    try{
      let id=sessionStorage.getItem(SESSION_KEY);
      if(!id){id=(crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`);sessionStorage.setItem(SESSION_KEY,id)}
      return id;
    }catch{return null}
  };
  const referrerHost=()=>{try{if(!document.referrer)return null;const u=new URL(document.referrer);return u.hostname===location.hostname?null:u.hostname}catch{return null}};
  const eventFromLink=a=>{
    const href=String(a.getAttribute('href')||'').trim();
    const text=String(a.textContent||a.getAttribute('aria-label')||'').trim().replace(/\s+/g,' ').slice(0,160);
    if(!href)return null;
    if(/^mailto:/i.test(href))return['email_click',text||'E-mail'];
    if(/(?:wa\.me|api\.whatsapp\.com|whatsapp:)/i.test(href))return['whatsapp_click',text||'WhatsApp'];
    if(/instagram\.com/i.test(href))return['instagram_click',text||'Instagram'];
    if(/linkedin\.com/i.test(href))return['linkedin_click',text||'LinkedIn'];
    if(/\.(?:pdf|docx?)(?:$|[?#])/i.test(href)||/curr[ií]culo|resume|cv/i.test(text))return['cv_click',text||'Currículo'];
    if(href.startsWith('#'))return href.toLowerCase()==='#contato'?['contact_click',text||'Contato']:null;
    try{const u=new URL(href,location.href);if(u.origin!==location.origin)return['external_click',text||u.hostname]}catch{}
    return null;
  };
  const loadLeadCapture=()=>{
    if(document.querySelector('script[data-webappcap-leads]'))return;
    const script=document.createElement('script');
    script.src='/lead-capture.js';
    script.async=true;
    script.dataset.webappcapLeads='1';
    document.head.appendChild(script);
  };

  window.WebAppCapData.ready.then(data=>{
    if(data.isDraft||!data.project?.id||!data.project?.is_published)return;
    const sb=data.client,projectId=data.project.id,sessionId=makeSession();
    const track=(eventType,label=null)=>sb.rpc('webappcap_track_event',{
      p_project_id:projectId,
      p_event_type:eventType,
      p_event_label:label,
      p_path:location.pathname+location.search,
      p_referrer_host:referrerHost(),
      p_session_id:sessionId
    }).then(({error})=>{if(error)console.debug('[WebAppCap Analytics]',error.message)}).catch(()=>{});

    track('page_view',document.title||data.project.name||null);
    document.addEventListener('click',event=>{
      const a=event.target.closest?.('a[href]');
      if(!a)return;
      const mapped=eventFromLink(a);
      if(mapped)track(mapped[0],mapped[1]);
    },{capture:true,passive:true});
    window.WebAppCapAnalytics=Object.freeze({track});
    loadLeadCapture();
  }).catch(()=>{});
})();
