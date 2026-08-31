(() => {
  if (window.WebAppCapFitnessCmsEditor) return;
  window.WebAppCapFitnessCmsEditor = true;

  const nav = () => document.getElementById('nav');
  const host = () => document.getElementById('editorHost');
  const activeKey = () => nav()?.querySelector('button[data-key].active')?.dataset.key || '';
  const locale = () => document.querySelector('.locale-tab.active')?.dataset.locale || 'pt';
  const esc = value => String(value ?? '').replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  const labels = {
    hero:'Hero', fitness_videos:'Reels', stats:'Números e destaques', about:'Sobre mim',
    coverage:'Serviços', wsop:'Meu método', portfolio:'Resultados de alunos',
    fitness_schedule:'Agenda', experience:'Experiência', education:'Formação e CREF',
    instagram:'Instagram', contact:'Contato', seo:'SEO'
  };

  function isFitness(){
    const buttons=[...(nav()?.querySelectorAll('button[data-key]')||[])];
    return buttons.some(b=>b.dataset.key==='fitness_videos') && buttons.some(b=>b.dataset.key==='fitness_schedule');
  }
  function markDirty(){
    const field=host()?.querySelector('[data-field]');
    if(field) field.dispatchEvent(new Event('input',{bubbles:true}));
    window.WebAppCapUX?.markDirty?.(true);
  }
  function localValue(obj,key){const l=locale();return obj?.[`${key}_${l}`] ?? obj?.[`${key}_pt`] ?? obj?.[key] ?? '';}
  function setLocal(obj,key,value){obj[`${key}_${locale()}`]=value;markDirty();}

  function relabel(){
    if(!isFitness()) return;
    document.documentElement.dataset.webappcapAdminType='fitness';
    nav()?.querySelectorAll('button[data-key]').forEach(b=>{if(labels[b.dataset.key]) b.textContent=labels[b.dataset.key];});
    const title=document.getElementById('editorTitle'); if(title&&labels[activeKey()]) title.textContent=labels[activeKey()];
    if(activeKey()==='hero'){
      host()?.querySelectorAll(':scope > div[style*="margin-top"]').forEach(block=>{
        if(block.querySelector('.toolbar strong')?.textContent.trim()==='Faixa / destaques') block.remove();
      });
    }
  }

  function customEditor(){
    if(!isFitness()) return;
    const editor=host(), content=editor?.__working, key=activeKey();
    if(!editor||!content) return;
    editor.querySelector('[data-fitness-custom-editor]')?.remove();
    let html='';
    if(key==='coverage') html=`<div class="repeaters">${(content.items||[]).map((i,n)=>`<div class="repeat-card"><div class="repeat-grid"><div class="field"><label>Nome do serviço</label><input data-fit="service-name" data-i="${n}" value="${esc(i.event||i.name||'')}"></div><div class="field"><label>Modalidade / detalhe</label><input data-fit="service-detail" data-i="${n}" value="${esc(i.years||i.detail||'')}" placeholder="Presencial · Online · Individual"></div></div></div>`).join('')}</div>`;
    if(key==='wsop') html=`<div class="help" style="margin-bottom:.8rem">Explique o processo de atendimento em etapas claras: avaliação, planejamento, treino e acompanhamento.</div>`;
    if(key==='portfolio') html=`<div class="help" style="margin-bottom:.8rem">Use esta seção para transformações e depoimentos reais. Cadastre um resultado por card e use apenas imagens autorizadas.</div>`;
    if(key==='education') html=`<div class="help" style="margin-bottom:.8rem">Destaque CREF, graduação, especializações e certificações relevantes para gerar confiança.</div>`;
    if(key==='fitness_schedule') html=`<div class="help" style="margin-bottom:.8rem">Mostre disponibilidade de forma simples e mantenha um único caminho de conversão para agendamento ou WhatsApp.</div>`;
    if(!html) return;
    const box=document.createElement('div');box.dataset.fitnessCustomEditor='1';box.style.marginTop='1rem';box.innerHTML=html;editor.appendChild(box);
    box.querySelectorAll('[data-fit="service-name"]').forEach(el=>el.oninput=e=>{const i=+e.target.dataset.i;content.items[i].event=e.target.value;markDirty();});
    box.querySelectorAll('[data-fit="service-detail"]').forEach(el=>el.oninput=e=>{const i=+e.target.dataset.i;content.items[i].years=e.target.value;markDirty();});
  }

  function enhance(){relabel();customEditor();}
  document.addEventListener('click',e=>{if(e.target.closest?.('#nav [data-key],.locale-tab')) setTimeout(enhance,0);},true);
  window.addEventListener('load',()=>setTimeout(enhance,0),{once:true});
})();
