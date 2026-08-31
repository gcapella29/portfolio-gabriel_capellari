(() => {
  const clone = value => structuredClone(value);

  const templates = {
    editorial: {
      key:'editorial',
      name:'Editorial / Jornalista',
      site_type:'editorial',
      description:'Template editorial premium para jornalistas, redatores e profissionais de conteúdo.',
      visual:'linear-gradient(145deg,#082720 0%,#0e3b2e 58%,#164b3c 100%)',
      color:'#fff',
      chips:['Narrativa editorial','Trabalho em destaque','Onde ler','Timeline'],
      layout:[
        ['ticker',true,'editorial-marquee'],['stats',true,'editorial-metrics'],['about',true,'editorial-profile'],['wsop',true,'editorial-feature'],['coverage',true,'editorial-board'],['portfolio',true,'editorial-press'],['experience',true,'editorial-timeline'],['education',true,'editorial-foundations'],['instagram',true,'editorial-social'],['contact',true,'editorial-contact']
      ],
      theme:{colors:{primary:'#082720',secondary:'#0e3b2e',accent:'#e3bb3d',background:'#f7f4ec',surface:'#ffffff',text:'#171310',muted:'#728078'},typography:{heading:'Fraunces',body:'Inter',mono:'IBM Plex Mono',scale:'normal'},layout:{content_width:'1200',section_spacing:'normal',radius:'medium',density:'comfortable'},buttons:{style:'pill',weight:'600'},effects:{shadow:'soft',motion:'normal'}}
    },
    fitness: {
      key:'fitness',
      name:'Personal Trainer / Fitness — Performance',
      site_type:'personal_trainer',
      description:'Template fitness de alta conversão para personal trainers: impacto visual, vídeos logo no início, serviços, método, resultados, agenda e CTA direto para contato.',
      visual:'linear-gradient(125deg,#080a09 0%,#141a16 48%,#28321d 100%)',
      color:'#fff',
      chips:['Hero de impacto','Vídeos/Reels','Método','Resultados','Agenda','WhatsApp'],
      layout:[
        ['fitness_videos',true,'fitness-reels'],
        ['about',true,'fitness-profile'],
        ['coverage',true,'fitness-services'],
        ['wsop',true,'fitness-method'],
        ['stats',true,'fitness-proof'],
        ['portfolio',true,'fitness-results'],
        ['fitness_schedule',true,'fitness-schedule'],
        ['experience',true,'fitness-experience'],
        ['education',true,'fitness-credentials'],
        ['instagram',true,'fitness-social'],
        ['contact',true,'fitness-contact'],
        ['ticker',false,'compact']
      ],
      theme:{
        colors:{primary:'#080a09',secondary:'#182019',accent:'#d9ff43',background:'#f2f3ed',surface:'#ffffff',text:'#101410',muted:'#667067'},
        typography:{heading:'Montserrat',body:'DM Sans',mono:'IBM Plex Mono',scale:'large'},
        layout:{content_width:'1320',section_spacing:'airy',radius:'large',density:'spacious'},
        buttons:{style:'pill',weight:'700'},
        effects:{shadow:'strong',motion:'normal'},
        guardrails:{enabled:true,palette_mode:'performance'}
      }
    },
    educator: {
      key:'educator',
      name:'Professor / Consultor',
      site_type:'educator',
      description:'Template para professores, consultores, mentores e profissionais de conhecimento.',
      visual:'linear-gradient(145deg,#152a44,#325e7c)',
      color:'#fff',
      chips:['Metodologia','Formação','Contato'],
      layout:[['about',true,'image-left'],['stats',true,'split'],['portfolio',true,'list'],['experience',true,'timeline'],['education',true,'split'],['instagram',true,'minimal'],['contact',true,'centered'],['ticker',false,'compact'],['wsop',false,'compact'],['coverage',false,'compact']],
      theme:{colors:{primary:'#152a44',secondary:'#244c67',accent:'#f0b84b',background:'#f7f8fb',surface:'#ffffff',text:'#17202a',muted:'#687684'},typography:{heading:'Playfair Display',body:'Manrope',mono:'IBM Plex Mono',scale:'normal'},layout:{content_width:'1080',section_spacing:'airy',radius:'medium',density:'comfortable'},buttons:{style:'soft',weight:'600'},effects:{shadow:'soft',motion:'subtle'}}
    },
    local: {
      key:'local',
      name:'Comércio Local',
      site_type:'local',
      description:'Template para lojas, restaurantes, barbearias, salões e negócios locais.',
      visual:'linear-gradient(145deg,#4b241d,#8a4b37)',
      color:'#fff',
      chips:['Instagram','Contato','Serviços'],
      layout:[['about',true,'centered'],['portfolio',true,'cards'],['instagram',true,'featured'],['contact',true,'centered'],['stats',false,'minimal'],['ticker',false,'compact'],['wsop',false,'compact'],['coverage',false,'compact'],['experience',false,'compact'],['education',false,'compact']],
      theme:{colors:{primary:'#4b241d',secondary:'#754234',accent:'#e4b66e',background:'#fbf7f1',surface:'#ffffff',text:'#2b201c',muted:'#806f65'},typography:{heading:'Playfair Display',body:'DM Sans',mono:'IBM Plex Mono',scale:'normal'},layout:{content_width:'1100',section_spacing:'normal',radius:'large',density:'spacious'},buttons:{style:'soft',weight:'700'},effects:{shadow:'soft',motion:'subtle'}}
    }
  };

  const api = {
    all(){ return clone(templates); },
    keys(){ return Object.keys(templates); },
    get(key){ return templates[key] ? clone(templates[key]) : null; },
    bySiteType(siteType){ return clone(Object.values(templates).find(t=>t.site_type===siteType) || null); },
    layout(key){ const t=templates[key]; return t ? t.layout.map(([moduleKey,visible,variant],order)=>({key:moduleKey,visible,variant,order})) : []; },
    theme(key){ return templates[key] ? clone(templates[key].theme) : null; }
  };

  window.WebAppCapTemplateRegistry = Object.freeze(api);
})();