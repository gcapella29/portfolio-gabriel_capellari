(() => {
  const normalizeRole = role => String(role || '').trim().toLowerCase();

  const matrix = Object.freeze({
    owner: Object.freeze({editContent:true,publish:true,media:true,history:true,restoreVersion:true,structure:true,theme:true,templates:true,footer:true,domains:true,team:true,projects:true,analytics:true,leads:true,preview:true,publicSite:true}),
    admin: Object.freeze({editContent:true,publish:true,media:true,history:true,restoreVersion:true,structure:true,theme:true,templates:true,footer:true,domains:true,team:true,projects:true,analytics:true,leads:true,preview:true,publicSite:true}),
    editor: Object.freeze({editContent:true,publish:true,media:true,history:true,restoreVersion:false,structure:false,theme:false,templates:false,footer:false,domains:false,team:false,projects:false,analytics:false,leads:false,preview:true,publicSite:true}),
    viewer: Object.freeze({editContent:false,publish:false,media:false,history:false,restoreVersion:false,structure:false,theme:false,templates:false,footer:false,domains:false,team:false,projects:false,analytics:false,leads:false,preview:true,publicSite:true})
  });

  const empty = Object.freeze({});
  function permissions(role) { return matrix[normalizeRole(role)] || empty; }
  function can(role, capability) { return permissions(role)[capability] === true; }
  function requireCapability(role, capability, message = 'Você não tem permissão para acessar esta função.') { if (!can(role, capability)) throw new Error(message); return true; }
  function label(role) { return ({owner:'Owner',admin:'Admin',editor:'Cliente',viewer:'Visualizador'})[normalizeRole(role)] || 'Sem acesso'; }

  window.WebAppCapAccess = Object.freeze({ normalizeRole, permissions, can, requireCapability, label, matrix });

  if (!document.querySelector('script[data-webappcap-ux-polish]')) {
    const script = document.createElement('script');
    script.src = '/admin/ux-polish.js';
    script.dataset.webappcapUxPolish = '1';
    document.head.appendChild(script);
  }
})();