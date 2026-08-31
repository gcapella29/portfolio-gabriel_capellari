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

  function field(label,key,value,type='text',placeholder=''){
    const control=type==='textarea'
      ? `<textarea data-fit-field="${key}" placeholder="${esc(placeholder)}">${esc(value)}</textarea>`
      : `<input data-fit-field="${key}" type="${type}" value="${esc(value)}" placeholder="${esc(placeholder)}">`;
    return `<div class="field"><label>${label}</label>${control}</div>`;
  }

  function customEditor(){
    if(!isFitness()) return;
    const editor=host(), content=editor?.__working, key=activeKey();
    if(!editor||!content) return;
    editor.querySelector('[data-fitness-custom-editor]')?.remove();
    let html='';

    if(key==='hero'){
      html=`<div class="repeat-card"><div class="help" style="margin-bottom:1rem">Hero comercial do template Fitness. O nome do profissional continua sendo usado como marca; os campos abaixo controlam a mensagem de venda.</div><div class="repeat-grid">
        ${field('Chamada pequena','kicker',localValue(content,'kicker'),'text','Personal Trainer em Ibitinga')}
        ${field('Título principal','headline',localValue(content,'headline'),'textarea','Treino personalizado para transformar seus objetivos em resultados.')}
        <div class="wide">${field('Descrição','description',localValue(content,'description'),'textarea','Acompanhamento individual, planejamento e evolução de acordo com sua rotina.')}</div>
        ${field('CTA principal','primary_label',localValue(content,'primary_label'),'text','Quero começar')}
        ${field('Link CTA principal','primary_href',content.primary_href||'','text','#agenda')}
        ${field('CTA secundário','secondary_label',localValue(content,'secondary_label'),'text','Conheça meu trabalho')}
        ${field('Link CTA secundário','secondary_href',content.secondary_href||'','text','#servicos')}
      </div></div>`;
    }

    if(key==='coverage') html=`<div class="help" style="margin-bottom:.8rem">Cadastre os serviços como ofertas comerciais claras: nome + modalidade/detalhe curto.</div><div class="repeaters">${(content.items||[]).map((i,n)=>`<div class="repeat-card"><div class="repeat-grid"><div class="field"><label>Nome do serviço</label><input data-fit="service-name" data-i="${n}" value="${esc(i.event||i.name||'')}"></div><div class="field"><label>Modalidade / detalhe</label><input data-fit="service-detail" data-i="${n}" value="${esc(i.years||i.detail||'')}" placeholder="Presencial · Online · Individual"></div></div></div>`).join('')}</div>`;
    if(key==='wsop') html=`<div class="help" style="margin-bottom:.8rem">Explique o processo de atendimento em etapas claras: avaliação, planejamento, treino e acompanhamento.</div>`;
    if(key==='portfolio') html=`<div class="help" style="margin-bottom:1rem">Resultados devem funcionar como prova social. Use dados e depoimentos reais, sempre com autorização.</div><div class="repeaters">${(content.items||[]).map((i,n)=>`<div class="repeat-card" data-result-i="${n}"><div class="repeat-grid">
      <div class="field"><label>Nome do aluno</label><input data-result="name" value="${esc(i.name||'')}"></div>
      <div class="field"><label>Resultado principal</label><input data-result="result" value="${esc(i.result||'')}" placeholder="Ex.: -12 kg em 6 meses"></div>
      <div class="field"><label>Período</label><input data-result="period" value="${esc(i.period||'')}" placeholder="Ex.: 6 meses"></div>
      <div class="field"><label>Objetivo / contexto</label><input data-result="context" value="${esc(i.context||'')}" placeholder="Emagrecimento · força · condicionamento"></div>
      <div class="field wide"><label>Depoimento</label><textarea data-result="testimonial">${esc(localValue(i,'desc'))}</textarea></div>
      <div class="field"><label>Foto antes — URL opcional</label><input data-result="before" value="${esc(i.before_url||'')}" placeholder="https://..."></div>
      <div class="field"><label>Foto depois — URL opcional</label><input data-result="after" value="${esc(i.after_url||'')}" placeholder="https://..."></div>
    </div></div>`).join('')}</div>`;
    if(key==='education') html=`<div class="help" style="margin-bottom:.8rem">Destaque CREF, graduação, especializações e certificações relevantes para gerar confiança.</div>`;
    if(key==='fitness_schedule') html=`<div class="help" style="margin-bottom:.8rem">Mostre disponibilidade de forma simples e mantenha um único caminho de conversão para agendamento ou WhatsApp.</div>`;
    if(!html) return;

    const box=document.createElement('div');box.dataset.fitnessCustomEditor='1';box.style.marginTop='1rem';box.innerHTML=html;editor.appendChild(box);

    if(key==='hero'){
      box.querySelectorAll('[data-fit-field]').forEach(el=>el.oninput=e=>{
        const k=e.target.dataset.fitField;
        if(['primary_href','secondary_href'].includes(k)){content[k]=e.target.value;markDirty();}
        else setLocal(content,k,e.target.value);
      });
    }
    box.querySelectorAll('[data-fit="service-name"]').forEach(el=>el.oninput=e=>{const i=+e.target.dataset.i;content.items[i].event=e.target.value;markDirty();});
    box.querySelectorAll('[data-fit="service-detail"]').forEach(el=>el.oninput=e=>{const i=+e.target.dataset.i;content.items[i].years=e.target.value;markDirty();});
    box.querySelectorAll('[data-result-i]').forEach(card=>{
      const i=+card.dataset.resultI, item=content.items[i];
      card.querySelectorAll('[data-result]').forEach(el=>el.oninput=e=>{
        const k=e.target.dataset.result,v=e.target.value;
        if(k==='testimonial') item[`desc_${locale()}`]=v;
        else if(k==='before') item.before_url=v;
        else if(k==='after') item.after_url=v;
        else item[k]=v;
        markDirty();
      });
    });
  }

  function enhance(){relabel();customEditor();}
  document.addEventListener('click',e=>{if(e.target.closest?.('#nav [data-key],.locale-tab')) setTimeout(enhance,0);},true);
  window.addEventListener('load',()=>setTimeout(enhance,0),{once:true});
})();
