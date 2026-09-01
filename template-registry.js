(() => {
  const clone = value => structuredClone(value);

  const templates = {
    editorial: {
      key:'editorial',
      name:'Portfólio',
      site_type:'editorial',
      description:'Template de portfólio profissional para apresentação, trabalhos, experiência, formação e contato.',
      visual:'linear-gradient(145deg,#082720 0%,#0e3b2e 58%,#164b3c 100%)',
      color:'#fff',
      chips:['Portfólio','Trabalhos','Experiência','Contato'],
      layout:[
        ['ticker',true,'editorial-marquee'],['stats',true,'editorial-metrics'],['about',true,'editorial-profile'],['wsop',true,'editorial-feature'],['coverage',true,'editorial-board'],['portfolio',true,'editorial-press'],['experience',true,'editorial-timeline'],['education',true,'editorial-foundations'],['instagram',true,'editorial-social'],['contact',true,'editorial-contact']
      ],
      theme:{colors:{primary:'#082720',secondary:'#0e3b2e',accent:'#e3bb3d',background:'#f7f4ec',surface:'#ffffff',text:'#171310',muted:'#728078'},typography:{heading:'Fraunces',body:'Inter',mono:'IBM Plex Mono',scale:'normal'},layout:{content_width:'1200',section_spacing:'normal',radius:'medium',density:'comfortable'},buttons:{style:'pill',weight:'600'},effects:{shadow:'soft',motion:'normal'}},
      status:'ready'
    },
    fitness: {
      key:'fitness',
      name:'Personal Trainer',
      site_type:'personal_trainer',
      description:'Template de alta conversão para personal trainers, com vídeos, serviços, método, resultados, agenda e contato.',
      visual:'linear-gradient(125deg,#080a09 0%,#141a16 48%,#28321d 100%)',
      color:'#fff',
      chips:['Hero de impacto','Reels','Resultados','Agenda'],
      layout:[
        ['fitness_videos',true,'fitness-reels'],['stats',true,'fitness-proof'],['about',true,'fitness-profile'],['coverage',true,'fitness-services'],['wsop',true,'fitness-method'],['portfolio',true,'fitness-results'],['fitness_schedule',true,'fitness-schedule'],['experience',true,'fitness-experience'],['education',true,'fitness-credentials'],['instagram',true,'fitness-social'],['contact',true,'fitness-contact']
      ],
      theme:{colors:{primary:'#080a09',secondary:'#182019',accent:'#d9ff43',background:'#f2f3ed',surface:'#ffffff',text:'#101410',muted:'#667067'},typography:{heading:'Montserrat',body:'DM Sans',mono:'IBM Plex Mono',scale:'large'},layout:{content_width:'1320',section_spacing:'airy',radius:'large',density:'spacious'},buttons:{style:'pill',weight:'700'},effects:{shadow:'strong',motion:'normal'},guardrails:{enabled:true,palette_mode:'performance'}},
      status:'ready'
    },
    food_business: {
      key:'food_business',
      name:'Comércio Alimentício',
      site_type:'food_business',
      description:'Novo template para restaurantes, lanchonetes, confeitarias, padarias, delivery e outros negócios de alimentação.',
      visual:'linear-gradient(145deg,#221713,#5a2e21 55%,#a85d32 100%)',
      color:'#fff',
      chips:['Do zero','Referências próprias','Mobile first'],
      layout:[],
      theme:{colors:{primary:'#221713',secondary:'#5a2e21',accent:'#e9a94a',background:'#fffaf3',surface:'#ffffff',text:'#211915',muted:'#77675e'},typography:{heading:'Montserrat',body:'DM Sans',mono:'IBM Plex Mono',scale:'normal'},layout:{content_width:'1200',section_spacing:'normal',radius:'medium',density:'comfortable'},buttons:{style:'soft',weight:'700'},effects:{shadow:'soft',motion:'subtle'}},
      status:'draft'
    },
    school: {
      key:'school',
      name:'Escola',
      site_type:'school',
      description:'Novo template institucional para escolas, cursos e instituições de ensino, construído do zero.',
      visual:'linear-gradient(145deg,#10233f,#244f79 58%,#4b7ea6 100%)',
      color:'#fff',
      chips:['Do zero','Institucional','Mobile first'],
      layout:[],
      theme:{colors:{primary:'#10233f',secondary:'#244f79',accent:'#f0b84b',background:'#f6f8fb',surface:'#ffffff',text:'#17202a',muted:'#687684'},typography:{heading:'Manrope',body:'Inter',mono:'IBM Plex Mono',scale:'normal'},layout:{content_width:'1200',section_spacing:'normal',radius:'medium',density:'comfortable'},buttons:{style:'soft',weight:'700'},effects:{shadow:'soft',motion:'subtle'}},
      status:'draft'
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