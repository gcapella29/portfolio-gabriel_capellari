(() => {
  const clone=v=>structuredClone(v);
  const common={
    hero:{is_visible:true,content:{name_html:'',location:'',role_pt:'',role_en:'',languages:[],ticker:[]}},
    stats:{is_visible:false,content:{items:[]}},
    about:{is_visible:false,content:{eyebrow_pt:'Sobre',eyebrow_en:'About',title_pt:'Sobre',title_en:'About',paragraph1_pt:'',paragraph1_en:'',paragraph2_pt:'',paragraph2_en:''}},
    wsop:{is_visible:false,content:{}},
    coverage:{is_visible:false,content:{eyebrow_pt:'Trabalhos',eyebrow_en:'Work',title_pt:'Experiência em destaque',title_en:'Featured work',items:[]}},
    portfolio:{is_visible:false,content:{eyebrow_pt:'Portfólio',eyebrow_en:'Portfolio',title_pt:'Trabalhos',title_en:'Work',profile_name:'',bio_pt:'',bio_en:'',items:[]}},
    experience:{is_visible:false,content:{eyebrow_pt:'Experiência',eyebrow_en:'Experience',title_pt:'Experiência profissional',title_en:'Professional experience',items:[]}},
    education:{is_visible:false,content:{eyebrow_pt:'Formação',eyebrow_en:'Education',title_pt:'Formação',title_en:'Education',skills_title_pt:'Competências',skills_title_en:'Skills',items:[],skills:[]}},
    instagram:{is_visible:false,content:{eyebrow_pt:'Redes',eyebrow_en:'Social',title_pt:'Instagram',title_en:'Instagram',text_pt:'',text_en:'',user:'',reel_url:''}},
    contact:{is_visible:true,content:{title_pt:'Contato',title_en:'Contact',email1:'',email2:'',whatsapp_number:'',whatsapp_display:'',instagram_user:'',linkedin_url:'',cv_url:''}},
    media:{is_visible:true,content:{hero_url:'',hero_path:'',hero_fit:'cover',hero_x:50,hero_y:50,hero_zoom:1,about_url:'',about_path:'',about_alt:'',about_fit:'cover',about_x:50,about_y:0,about_zoom:1,contact_url:'',contact_path:'',contact_alt:'',contact_fit:'cover',contact_x:50,contact_y:50,contact_zoom:1,wsop_gallery:[]}},
    seo:{is_visible:true,content:{title_pt:'',title_en:'',description_pt:'',description_en:'',canonical_url:'',og_image_url:'',schema_type:'Person'}}
  };
  const additions={
    fitness:{
      fitness_videos:{is_visible:true,content:{eyebrow_pt:'Em movimento',eyebrow_en:'In motion',title_pt:'Treino na prática',title_en:'Training in action',subtitle_pt:'Conheça meu trabalho em vídeos curtos.',subtitle_en:'See my work in short videos.',items:[]}},
      fitness_schedule:{is_visible:true,content:{eyebrow_pt:'Agenda',eyebrow_en:'Schedule',title_pt:'Horários disponíveis',title_en:'Available times',subtitle_pt:'Consulte os horários disponíveis e entre em contato para reservar.',subtitle_en:'Check available times and get in touch to book.',cta_label_pt:'Reservar horário',cta_label_en:'Book a time',schedule_url:'',slots:[]}}
    }
  };
  function base(key){const registry=window.WebAppCapTemplateRegistry,t=registry?.get(key);if(!t)return null;const snapshot=clone(common);Object.assign(snapshot,clone(additions[key]||{}));snapshot.layout={is_visible:true,content:{version:2,modules:registry.layout(key)}};snapshot.theme={is_visible:true,content:registry.theme(key)};snapshot.template={is_visible:true,content:{key:t.key,name:t.name,version:2,applied_at:new Date().toISOString()}};return snapshot}
  function create(key,input={}){const s=base(key);if(!s)return null;const instagram=String(input.instagram||'').trim().replace(/^@/,'').replace(/^https?:\/\/[^/]+\//,'').replace(/\/$/,'');s.hero.content={...s.hero.content,name_html:input.name||'',location:input.location||'',role_pt:input.role||'',languages:clone(input.languages||[])};s.about.is_visible=!!String(input.about||'').trim();s.about.content.paragraph1_pt=input.about||'';s.instagram.is_visible=!!instagram;s.instagram.content.user=instagram;s.contact.content={...s.contact.content,email1:input.email||'',whatsapp_number:String(input.whatsapp||'').replace(/\D/g,''),whatsapp_display:input.whatsapp||'',instagram_user:instagram};s.seo.content.title_pt=input.name||'';s.seo.content.description_pt=input.role||'';return s}
  function apply(key,existing={}){const baseSnapshot=base(key);if(!baseSnapshot)return null;const out=clone(existing||{});for(const [section,value] of Object.entries(baseSnapshot)){if(['layout','theme','template'].includes(section)){out[section]=value;continue}if(!out[section])out[section]=value}return out}
  window.WebAppCapTemplateContent=Object.freeze({base,create,apply});
})();