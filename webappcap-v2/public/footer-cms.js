(() => {
  if (!window.WebAppCapData?.ready) return;
  const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');

  async function render(){
    const footer=document.querySelector('footer');if(!footer)return;
    try{
      const data=await window.WebAppCapData.ready;
      const sec=data.snapshot?.footer;
      if(!sec){
        if(data.slug!==data.cfg.projectSlug)footer.hidden=true;
        return;
      }
      const c=sec.content||{};
      if(sec.is_visible===false||c.is_visible===false){footer.hidden=true;return}
      const parts=[c.brand,c.description,c.location].filter(Boolean);
      if(c.show_copyright)parts.push(`© ${new Date().getFullYear()}${c.brand?' '+c.brand:''}`);
      if(!parts.length){footer.hidden=true;return}
      footer.innerHTML=`<div class="container"><span>${parts.map(esc).join(' · ')}</span></div>`;
      footer.hidden=false;
    }catch(e){console.warn('WebAppCap Footer',e)}
  }
  render();
})();