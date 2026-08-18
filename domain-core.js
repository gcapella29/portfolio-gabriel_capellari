(() => {
  const RESERVED = new Set(['www','admin','api','app','mail','smtp','ftp','webmail','support','status','cdn','assets']);
  const hostPattern = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;
  const labelPattern = /^(?=.{1,63}$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;

  const normalizeHost = value => window.WebAppCapPublishing?.cleanHost(value) || String(value || '').trim().toLowerCase();
  const normalizeSubdomain = value => window.WebAppCapPublishing?.cleanSubdomain(value) || String(value || '').trim().toLowerCase();

  function validateCustomDomain(value) {
    const host = normalizeHost(value);
    if (!host) return { valid:true, value:null, reason:null };
    if (!hostPattern.test(host)) return { valid:false, value:host, reason:'Digite um domínio válido, como exemplo.com.br.' };
    if (host.endsWith('.vercel.app') || host.endsWith('.webappcap.com.br')) return { valid:false, value:host, reason:'Use o campo de subdomínio para endereços WebAppCap.' };
    return { valid:true, value:host, reason:null };
  }

  function validateSubdomain(value) {
    const sub = normalizeSubdomain(value);
    if (!sub) return { valid:true, value:null, reason:null };
    if (!labelPattern.test(sub)) return { valid:false, value:sub, reason:'O subdomínio deve usar apenas letras, números e hífens.' };
    if (RESERVED.has(sub)) return { valid:false, value:sub, reason:'Este subdomínio é reservado pela plataforma.' };
    return { valid:true, value:sub, reason:null };
  }

  function status(project) {
    const hasConfiguredHost = !!(normalizeHost(project?.custom_domain) || normalizeSubdomain(project?.subdomain));
    const raw = String(project?.domain_status || '').toLowerCase();
    if (!hasConfiguredHost) return 'unconfigured';
    if (raw === 'active') return 'active';
    return 'pending';
  }

  function labels(value) {
    return ({unconfigured:'Não configurado',pending:'Aguardando conexão',active:'Conectado'})[value] || 'Desconhecido';
  }

  window.WebAppCapDomains = Object.freeze({
    normalizeHost,
    normalizeSubdomain,
    validateCustomDomain,
    validateSubdomain,
    status,
    labels,
    reservedSubdomains:Object.freeze([...RESERVED])
  });
})();