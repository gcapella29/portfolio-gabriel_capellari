(() => {
 const clone=v=>structuredClone(v);
 const modules={
  ticker:{label:'Faixa de destaques',desc:'Chamadas curtas ou destaques em movimento.',variants:{'editorial-marquee':'Marquee editorial',marquee:'Marquee contínuo',static:'Faixa estática',compact:'Compacto'}},
  fitness_videos:{label:'Vídeos',desc:'Reels, vídeos curtos ou uploads.',variants:{'fitness-reels':'Reels / vídeos',cards:'Cards',compact:'Compacto'}},
  fitness_schedule:{label:'Agenda',desc:'Horários disponíveis e chamada para agendamento.',variants:{'fitness-schedule':'Agenda em grade',cards:'Cards',compact:'Compacto'}},
  stats:{label:'Números / destaques',desc:'Indicadores, resultados ou diferenciais.',variants:{'editorial-metrics':'Métricas editoriais','fitness-proof':'Prova social',cards:'Cards',minimal:'Minimalista',split:'Dividido'}},
  about:{label:'Sobre',desc:'Apresentação, foto e biografia.',variants:{'editorial-profile':'Perfil editorial','fitness-profile':'Perfil fitness','image-left':'Imagem à esquerda','image-right':'Imagem à direita',centered:'Centralizado'}},
  wsop:{label:'Destaque principal',desc:'Método, projeto ou cobertura em evidência.',variants:{'editorial-feature':'Destaque editorial','fitness-method':'Método fitness',featured:'Destaque',compact:'Compacto','text-first':'Texto em destaque'}},
  coverage:{label:'Trabalhos / serviços',desc:'Serviços, eventos ou projetos realizados.',variants:{'editorial-board':'Board editorial','fitness-services':'Serviços fitness',rows:'Lista',cards:'Cards',compact:'Compacto'}},
  portfolio:{label:'Portfólio',desc:'Trabalhos, resultados, matérias e links.',variants:{'editorial-press':'Imprensa editorial','fitness-results':'Resultados fitness',cards:'Cards',list:'Lista',featured:'Destaque'}},
  experience:{label:'Experiência',desc:'Histórico profissional.',variants:{'editorial-timeline':'Timeline editorial','fitness-experience':'Experiência fitness',timeline:'Linha do tempo',cards:'Cards',compact:'Compacto'}},
  education:{label:'Formação & ferramentas',desc:'Formação, cursos e habilidades.',variants:{'editorial-foundations':'Formação editorial','fitness-credentials':'Credenciais fitness',split:'Dividido',stacked:'Empilhado',compact:'Compacto'}},
  instagram:{label:'Instagram / redes',desc:'Bloco social e chamada para perfil.',variants:{'editorial-social':'Social editorial','fitness-social':'Social fitness',featured:'Destaque',compact:'Compacto',minimal:'Minimalista'}},
  contact:{label:'Contato',desc:'E-mail, WhatsApp e redes profissionais.',variants:{'editorial-contact':'Contato editorial','fitness-contact':'Contato fitness',split:'Dividido',centered:'Centralizado',compact:'Compacto'}}
 };
 const palettes={
  signature:{label:'Signature — verde editorial',colors:{primary:'#082720',secondary:'#0e3b2e',background:'#f7f4ec',surface:'#ffffff',text:'#171310',muted:'#728078'}},
  ink:{label:'Ink — preto editorial',colors:{primary:'#151515',secondary:'#252525',background:'#f4f2ec',surface:'#ffffff',text:'#171717',muted:'#737373'}},
  navy:{label:'Navy — azul editorial',colors:{primary:'#10233f',secondary:'#1d385e',background:'#f5f7fa',surface:'#ffffff',text:'#17202a',muted:'#6c7785'}},
  performance:{label:'Performance — carvão + lima',colors:{primary:'#101312',secondary:'#1d2420',background:'#f4f4ef',surface:'#ffffff',text:'#141615',muted:'#6d746f'}},
  redline:{label:'Redline — carvão + vermelho',colors:{primary:'#151515',secondary:'#272323',background:'#f5f3f1',surface:'#ffffff',text:'#181515',muted:'#766d6d'}},
  fresh:{label:'Fresh — verde + lima',colors:{primary:'#112d22',secondary:'#1d4735',background:'#f3f7f2',surface:'#ffffff',text:'#142019',muted:'#68766d'}}
 };
 const themeOptions={
  heading:['Fraunces','Playfair Display','Montserrat','Manrope'],body:['Inter','DM Sans','Manrope','Montserrat'],scale:['small','normal','large'],content_width:['980','1100','1200','1320','1440'],section_spacing:['compact','normal','airy'],radius:['none','small','medium','large'],density:['compact','comfortable','spacious'],buttonStyle:['pill','soft','square'],buttonWeight:['500','600','700'],shadow:['none','soft','strong'],motion:['reduced','subtle','normal']
 };
 function module(key){return modules[key]?clone(modules[key]):null}
 function modulesForTemplate(template){return (template?.layout||[]).map(([key])=>({key,...module(key)})).filter(x=>x.label)}
 function variantAllowed(key,value){return !!modules[key]?.variants?.[value]}
 function normalizeModules(template,existing=[]){const map=new Map((existing||[]).map(x=>[x.key,x]));return (template?.layout||[]).map(([key,visible,variant],order)=>{const old=map.get(key);return{key,visible:typeof old?.visible==='boolean'?old.visible:visible,variant:variantAllowed(key,old?.variant)?old.variant:variant,order}})}
 function palette(mode,accent){const p=palettes[mode]||palettes.signature;return{...clone(p.colors),accent:accent||'#e3bb3d'}}
 window.WebAppCapDesignSystem=Object.freeze({module,modulesForTemplate,variantAllowed,normalizeModules,palettes:clone(palettes),themeOptions:clone(themeOptions),palette});
})();