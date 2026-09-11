window.VITRINE_SUPABASE = Object.freeze({
  url: "https://ownoyzpjiqbzgaeaoyzl.supabase.co",
  publishableKey: "sb_publishable_q1UwNCcinl7S6KN-oCU1rA_99_17BXw",
  // Primary public entry only. Never use this as a generic tenant fallback.
  projectSlug: "gabriel-capellari"
});

window.WebAppCapTenantResolver = Object.freeze({
  primaryProjectSlug: 'gabriel-capellari',
  primaryHosts: Object.freeze([
    'portfolio-gabriel-capellari.vercel.app',
    'webappcap.com.br',
    'www.webappcap.com.br',
    'localhost',
    '127.0.0.1'
  ]),

  cleanSlug(value) {
    const slug = String(value || '').trim();
    return /^[a-z0-9-]+$/i.test(slug) ? slug : null;
  },

  fromLocation(loc = window.location, { admin = loc.pathname.startsWith('/admin') } = {}) {
    const params = new URLSearchParams(loc.search);
    const querySlug = this.cleanSlug(params.get('project'));
    const pathMatch = loc.pathname.match(/^\/p\/([a-z0-9-]+)\/?$/i);
    const pathSlug = this.cleanSlug(pathMatch?.[1]);
    const isPrimaryRoot = !admin && loc.pathname === '/' && this.isPrimaryHost(loc.hostname);
    const rootSlug = isPrimaryRoot ? this.primaryProjectSlug : null;

    return {
      slug: admin ? querySlug : (querySlug || pathSlug || rootSlug || null),
      querySlug,
      pathSlug,
      rootSlug,
      isPrimaryRoot,
      isAdmin: admin
    };
  },

  isPrimaryHost(hostname = window.location.hostname) {
    const host = String(hostname || '').toLowerCase();
    return this.primaryHosts.includes(host) || host.endsWith('.vercel.app');
  },

  subdomainFromHost(hostname = window.location.hostname) {
    const host = String(hostname || '').toLowerCase();
    if (this.isPrimaryHost(host)) return null;
    const firstLabel = host.split('.')[0];
    return firstLabel && firstLabel !== 'www' ? firstLabel : null;
  },

  publicPath(slug) {
    const clean = this.cleanSlug(slug);
    return clean ? `/p/${encodeURIComponent(clean)}` : null;
  }
});

/* Shared, tenant-neutral project schema. */
window.WebAppCapProjectSchema = Object.freeze({
  moduleDefinitions: Object.freeze({
    ticker:Object.freeze({label:'Faixa de destaques',desc:'Faixa animada de chamadas ou destaques.',variants:Object.freeze(['marquee','static','compact'])}),
    fitness_videos:Object.freeze({label:'Vídeos',desc:'Galeria de vídeos curtos, reels ou uploads.',variants:Object.freeze(['fitness-reels','cards','compact'])}),
    fitness_schedule:Object.freeze({label:'Agenda',desc:'Horários disponíveis e chamada para agendamento.',variants:Object.freeze(['fitness-schedule','cards','compact'])}),
    stats:Object.freeze({label:'Números / destaques',desc:'Indicadores, resultados ou diferenciais.',variants:Object.freeze(['cards','minimal','split'])}),
    about:Object.freeze({label:'Sobre',desc:'Apresentação, foto e biografia.',variants:Object.freeze(['image-left','image-right','centered'])}),
    wsop:Object.freeze({label:'Destaque principal',desc:'Bloco especial de método, projeto ou cobertura.',variants:Object.freeze(['featured','compact','text-first'])}),
    coverage:Object.freeze({label:'Trabalhos / serviços',desc:'Lista de serviços, eventos ou projetos realizados.',variants:Object.freeze(['rows','cards','compact'])}),
    portfolio:Object.freeze({label:'Portfólio',desc:'Trabalhos, resultados, matérias e links.',variants:Object.freeze(['cards','list','featured'])}),
    experience:Object.freeze({label:'Experiência',desc:'Histórico profissional.',variants:Object.freeze(['timeline','cards','compact'])}),
    education:Object.freeze({label:'Formação & ferramentas',desc:'Formação, cursos e habilidades.',variants:Object.freeze(['split','stacked','compact'])}),
    instagram:Object.freeze({label:'Instagram / redes',desc:'Bloco social e chamada para perfil.',variants:Object.freeze(['featured','compact','minimal'])}),
    contact:Object.freeze({label:'Contato',desc:'E-mail, WhatsApp e redes profissionais.',variants:Object.freeze(['split','centered','compact'])})
  }),

  types: Object.freeze({
    editorial: Object.freeze({
      label: 'Editorial / Jornalista',
      modules: Object.freeze(['ticker','stats','about','wsop','coverage','portfolio','experience','education','instagram','contact'])
    }),
    personal_trainer: Object.freeze({
      label: 'Personal Trainer / Fitness',
      modules: Object.freeze(['fitness_videos','stats','about','coverage','wsop','portfolio','fitness_schedule','experience','education','instagram','contact'])
    }),
    educator: Object.freeze({
      label: 'Professor / Consultor',
      modules: Object.freeze(['about','stats','portfolio','experience','education','instagram','contact','ticker','wsop','coverage'])
    }),
    local: Object.freeze({
      label: 'Comércio Local',
      modules: Object.freeze(['about','portfolio','instagram','contact','stats','ticker','wsop','coverage','experience','education'])
    })
  }),

  normalizeType(value) {
    const type = String(value || '').trim().toLowerCase();
    if (type === 'fitness') return 'personal_trainer';
    return this.types[type] ? type : 'editorial';
  },

  supports(projectType, moduleKey) {
    const type = this.normalizeType(projectType);
    return this.types[type].modules.includes(moduleKey);
  },

  definitionsFor(projectType) {
    const type = this.normalizeType(projectType);
    return this.types[type].modules
      .map(key => ({key,...this.moduleDefinitions[key]}))
      .filter(item => item.label);
  },

  defaultLayout(projectType) {
    const type = this.normalizeType(projectType);
    const presets = {
      editorial:[
        ['ticker',true,'marquee'],['stats',true,'cards'],['about',true,'image-left'],['wsop',true,'featured'],['coverage',true,'rows'],['portfolio',true,'featured'],['experience',true,'timeline'],['education',true,'split'],['instagram',true,'featured'],['contact',true,'split']
      ],
      personal_trainer:[
        ['fitness_videos',true,'fitness-reels'],['stats',true,'minimal'],['about',true,'image-right'],['coverage',true,'cards'],['wsop',true,'featured'],['portfolio',true,'cards'],['fitness_schedule',true,'fitness-schedule'],['experience',true,'cards'],['education',true,'stacked'],['instagram',true,'featured'],['contact',true,'centered']
      ],
      educator:[
        ['about',true,'image-left'],['stats',true,'split'],['portfolio',true,'list'],['experience',true,'timeline'],['education',true,'split'],['instagram',true,'minimal'],['contact',true,'centered'],['ticker',false,'compact'],['wsop',false,'compact'],['coverage',false,'compact']
      ],
      local:[
        ['about',true,'centered'],['portfolio',true,'cards'],['instagram',true,'featured'],['contact',true,'centered'],['stats',false,'minimal'],['ticker',false,'compact'],['wsop',false,'compact'],['coverage',false,'compact'],['experience',false,'compact'],['education',false,'compact']
      ]
    };
    return presets[type].map(([key,visible,variant],order)=>({key,visible,variant,order}));
  },

  neutralSection(sectionKey, projectType = 'editorial') {
    const type = this.normalizeType(projectType);
    const visible = this.supports(type, sectionKey);
    const sections = {
      hero:{is_visible:true,content:{name_html:'',location:'',role_pt:'',role_en:'',languages:[],ticker:[]}},
      fitness_videos:{is_visible:type==='personal_trainer',content:{eyebrow_pt:'Em movimento',eyebrow_en:'In motion',title_pt:'Treino na prática',title_en:'Training in action',subtitle_pt:'Conheça meu trabalho em vídeos curtos.',subtitle_en:'See my work in short videos.',items:[]}},
      fitness_schedule:{is_visible:type==='personal_trainer',content:{eyebrow_pt:'Agenda',eyebrow_en:'Schedule',title_pt:'Horários disponíveis',title_en:'Available times',subtitle_pt:'Consulte os horários disponíveis e entre em contato para reservar.',subtitle_en:'Check available times and get in touch to book.',cta_label_pt:'Reservar horário',cta_label_en:'Book a time',schedule_url:'',slots:[]}},
      stats:{is_visible:false,content:{items:[]}},
      about:{is_visible:false,content:{eyebrow_pt:'Sobre',eyebrow_en:'About',title_pt:'Sobre',title_en:'About',paragraph1_pt:'',paragraph1_en:'',paragraph2_pt:'',paragraph2_en:''}},
      wsop:{is_visible:false,content:{}},
      coverage:{is_visible:false,content:{eyebrow_pt:'Trabalhos',eyebrow_en:'Work',title_pt:'Experiência em destaque',title_en:'Featured work',items:[]}},
      portfolio:{is_visible:false,content:{eyebrow_pt:'Portfólio',eyebrow_en:'Portfolio',title_pt:'Trabalhos',title_en:'Work',profile_name:'',bio_pt:'',bio_en:'',items:[]}},
      experience:{is_visible:false,content:{eyebrow_pt:'Experiência',eyebrow_en:'Experience',title_pt:'Experiência profissional',title_en:'Professional experience',items:[]}},
      education:{is_visible:false,content:{eyebrow_pt:'Formação',eyebrow_en:'Education',title_pt:'Formação',title_en:'Education',skills_title_pt:'Competências',skills_title_en:'Skills',items:[],skills:[]}},
      instagram:{is_visible:false,content:{eyebrow_pt:'Redes',eyebrow_en:'Social',title_pt:'Instagram',title_en:'Instagram',text_pt:'',text_en:'',user:'',reel_url:''}},
      contact:{is_visible:false,content:{title_pt:'Contato',title_en:'Contact',email1:'',email2:'',whatsapp_number:'',whatsapp_display:'',instagram_user:'',linkedin_url:'',cv_url:''}},
      media:{is_visible:true,content:{hero_url:'',hero_path:'',hero_fit:'cover',hero_x:50,hero_y:50,hero_zoom:1,about_url:'',about_path:'',about_alt:'',about_fit:'cover',about_x:50,about_y:0,about_zoom:1,contact_url:'',contact_path:'',contact_alt:'',contact_fit:'cover',contact_x:50,contact_y:50,contact_zoom:1,wsop_gallery:[]}},
      seo:{is_visible:true,content:{title_pt:'',title_en:'',description_pt:'',description_en:'',canonical_url:'',og_image_url:'',schema_type:'Person'}}
    };
    return structuredClone(sections[sectionKey] || {is_visible:visible,content:{}});
  }
});

/* Fitness CMS adapter: keep the reusable storage keys, but expose only fitness language. */
(() => {
  if (!location.pathname.startsWith('/admin')) return;
  const nav = document.getElementById('nav');
  if (!nav) return;
  const labels = {
    'Números':'Números / Resultados',
    'Coberturas / Trabalhos':'Serviços',
    'Trabalho em destaque':'Método de trabalho',
    'Portfólio':'Resultados / Transformações',
    'Formação':'Formação / Certificações'
  };
  const apply = () => {
    const buttons = [...nav.querySelectorAll('button[data-key]')];
    const fitness = buttons.some(b => b.dataset.key === 'fitness_videos') && buttons.some(b => b.dataset.key === 'fitness_schedule');
    if (!fitness) return;
    document.documentElement.dataset.webappcapAdminType = 'fitness';
    for (const b of buttons) if (labels[b.textContent.trim()]) b.textContent = labels[b.textContent.trim()];
    const active = nav.querySelector('button[data-key].active')?.dataset.key;
    const title = document.getElementById('editorTitle');
    const titleByKey = {stats:'Números / Resultados',coverage:'Serviços',wsop:'Método de trabalho',portfolio:'Resultados / Transformações',education:'Formação / Certificações'};
    if (title && titleByKey[active]) title.textContent = titleByKey[active];
    if (active === 'hero') {
      const host = document.getElementById('editorHost');
      for (const block of host?.querySelectorAll(':scope > div[style*="margin-top"]') || []) {
        const heading = block.querySelector('.toolbar strong');
        if (heading?.textContent.trim() === 'Faixa / destaques') block.remove();
      }
    }
  };
  new MutationObserver(apply).observe(nav,{childList:true,subtree:true});
  const host = document.getElementById('editorHost');
  if (host) new MutationObserver(apply).observe(host,{childList:true,subtree:true});
  queueMicrotask(apply);
})();
