window.VITRINE_SUPABASE = Object.freeze({
  url: "https://ownoyzpjiqbzgaeaoyzl.supabase.co",
  publishableKey: "sb_publishable_q1UwNCcinl7S6KN-oCU1rA_99_17BXw",
  // Legacy identity only. Never use this as an implicit tenant fallback.
  projectSlug: "gabriel-capellari"
});

window.WebAppCapTenantResolver = Object.freeze({
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

    return {
      slug: admin ? querySlug : (querySlug || pathSlug || null),
      querySlug,
      pathSlug,
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

/*
 * Shared project schema.
 * This is intentionally tenant-neutral: no person, company, contact,
 * portfolio item or media belonging to Gabriel (or any client) lives here.
 */
window.WebAppCapProjectSchema = Object.freeze({
  types: Object.freeze({
    editorial: Object.freeze({
      label: 'Editorial / Jornalista',
      modules: Object.freeze([
        'ticker','stats','about','wsop','coverage','portfolio',
        'experience','education','instagram','contact'
      ])
    }),
    personal_trainer: Object.freeze({
      label: 'Personal Trainer / Fitness',
      modules: Object.freeze([
        'fitness_videos','fitness_schedule','stats','about','coverage',
        'portfolio','experience','education','instagram','contact','ticker','wsop'
      ])
    }),
    educator: Object.freeze({
      label: 'Professor / Consultor',
      modules: Object.freeze([
        'about','stats','portfolio','experience','education',
        'instagram','contact','ticker','wsop','coverage'
      ])
    }),
    local: Object.freeze({
      label: 'Comércio Local',
      modules: Object.freeze([
        'about','portfolio','instagram','contact','stats','ticker',
        'wsop','coverage','experience','education'
      ])
    })
  }),

  normalizeType(value) {
    const type = String(value || '').trim().toLowerCase();
    // Backward compatibility for projects created by the older wizard.
    if (type === 'fitness') return 'personal_trainer';
    return this.types[type] ? type : 'editorial';
  },

  supports(projectType, moduleKey) {
    const type = this.normalizeType(projectType);
    return this.types[type].modules.includes(moduleKey);
  },

  neutralSection(sectionKey, projectType = 'editorial') {
    const type = this.normalizeType(projectType);
    const visible = this.supports(type, sectionKey);

    const sections = {
      hero: {
        is_visible: true,
        content: {
          name_html:'',location:'',role_pt:'',role_en:'',languages:[],ticker:[]
        }
      },
      fitness_videos: {
        is_visible: type === 'personal_trainer',
        content: {
          eyebrow_pt:'Em movimento',eyebrow_en:'In motion',
          title_pt:'Treino na prática',title_en:'Training in action',
          subtitle_pt:'Conheça meu trabalho em vídeos curtos.',
          subtitle_en:'See my work in short videos.',items:[]
        }
      },
      fitness_schedule: {
        is_visible: type === 'personal_trainer',
        content: {
          eyebrow_pt:'Agenda',eyebrow_en:'Schedule',
          title_pt:'Horários disponíveis',title_en:'Available times',
          subtitle_pt:'Consulte os horários disponíveis e entre em contato para reservar.',
          subtitle_en:'Check available times and get in touch to book.',
          cta_label_pt:'Reservar horário',cta_label_en:'Book a time',
          schedule_url:'',slots:[]
        }
      },
      stats: {is_visible:false,content:{items:[]}},
      about: {
        is_visible:false,
        content:{
          eyebrow_pt:'Sobre',eyebrow_en:'About',title_pt:'Sobre',title_en:'About',
          paragraph1_pt:'',paragraph1_en:'',paragraph2_pt:'',paragraph2_en:''
        }
      },
      wsop: {is_visible:false,content:{}},
      coverage: {
        is_visible:false,
        content:{
          eyebrow_pt:'Trabalhos',eyebrow_en:'Work',
          title_pt:'Experiência em destaque',title_en:'Featured work',items:[]
        }
      },
      portfolio: {
        is_visible:false,
        content:{
          eyebrow_pt:'Portfólio',eyebrow_en:'Portfolio',title_pt:'Trabalhos',title_en:'Work',
          profile_name:'',bio_pt:'',bio_en:'',items:[]
        }
      },
      experience: {
        is_visible:false,
        content:{
          eyebrow_pt:'Experiência',eyebrow_en:'Experience',
          title_pt:'Experiência profissional',title_en:'Professional experience',items:[]
        }
      },
      education: {
        is_visible:false,
        content:{
          eyebrow_pt:'Formação',eyebrow_en:'Education',title_pt:'Formação',title_en:'Education',
          skills_title_pt:'Competências',skills_title_en:'Skills',items:[],skills:[]
        }
      },
      instagram: {
        is_visible:false,
        content:{
          eyebrow_pt:'Redes',eyebrow_en:'Social',title_pt:'Instagram',title_en:'Instagram',
          text_pt:'',text_en:'',user:'',reel_url:''
        }
      },
      contact: {
        is_visible:false,
        content:{
          title_pt:'Contato',title_en:'Contact',email1:'',email2:'',
          whatsapp_number:'',whatsapp_display:'',instagram_user:'',
          linkedin_url:'',cv_url:''
        }
      },
      media: {
        is_visible:true,
        content:{
          hero_url:'',hero_path:'',hero_fit:'cover',hero_x:50,hero_y:50,hero_zoom:1,
          about_url:'',about_path:'',about_alt:'',about_fit:'cover',about_x:50,about_y:0,about_zoom:1,
          contact_url:'',contact_path:'',contact_alt:'',contact_fit:'cover',contact_x:50,contact_y:50,contact_zoom:1,
          wsop_gallery:[]
        }
      },
      seo: {
        is_visible:true,
        content:{
          title_pt:'',title_en:'',description_pt:'',description_en:'',
          canonical_url:'',og_image_url:'',schema_type:'Person'
        }
      }
    };

    const section = sections[sectionKey] || {is_visible:visible,content:{}};
    return structuredClone(section);
  }
});
