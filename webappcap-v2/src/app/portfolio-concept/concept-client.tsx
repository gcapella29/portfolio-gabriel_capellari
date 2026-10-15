'use client';

import {useEffect,useMemo,useState} from 'react';
import type {V2Content} from '@/core/onboarding-data';
import {SiteImage} from '@/templates/site-image';
import styles from './concept.module.css';

type Lang='pt'|'en';
type Row=Record<string,unknown>;
const string=(v:unknown)=>String(v??'').trim();
const image=(v:unknown)=>typeof v==='string'?v:string((v&&typeof v==='object'?(v as Row).url:'')||'');
const rows=(v:unknown):Row[]=>Array.isArray(v)?v.filter(x=>x&&typeof x==='object') as Row[]:[];
const bi=(pt:string,en:string,lang:Lang)=>lang==='pt'?pt:en;
const cases=[
 {n:'01',type:{pt:'PLATAFORMAS & PRODUTOS',en:'PLATFORMS & PRODUCTS'},name:'WebAppCap',
  desc:{pt:'Uma plataforma para criar, publicar e gerenciar sites de diferentes negócios, com editor, preview e gestão de conteúdo.',en:'A platform to build, publish and manage websites for different businesses, with editing, previews and content management.'},
  detail:'Next.js · Google Sheets · Vercel',href:'https://www.webappcap.com.br/'},
 {n:'02',type:{pt:'SISTEMAS & OPERAÇÕES',en:'SYSTEMS & OPERATIONS'},name:'Estoque Fácil',
  desc:{pt:'Solução de controle de estoque para operações de e-commerce: produtos, movimentações, organização e rotinas mais eficientes.',en:'An inventory management solution for e-commerce: products, stock movement, organization and simpler workflows.'},
  detail:'Apps Script · Sheets · Operações',href:''},
 {n:'03',type:{pt:'DADOS & AUTOMAÇÃO',en:'DATA & AUTOMATION'},name:'Painéis e automações',
  desc:{pt:'Dashboards e ferramentas que ajudam a visualizar indicadores, organizar processos e tomar decisões com informação clara.',en:'Dashboards and tools that make metrics visible, streamline processes and support more informed decisions.'},
  detail:'Dashboards · Google Workspace',href:''},
 {n:'04',type:{pt:'DESIGN & COMUNICAÇÃO',en:'DESIGN & COMMUNICATION'},name:'Alumni Ibitinga',
  desc:{pt:'Site institucional com experiência responsiva e comunicação organizada em um sistema de conteúdo reutilizável.',en:'A responsive institutional website with clear storytelling and reusable content management.'},
  detail:'Site institucional · UX',href:'https://alumni-ibitinga.webappcap.com.br/'}
] as const;
const focus=[
 {number:'01',pt:'Comunicação e conteúdo',en:'Communication & content'},
 {number:'02',pt:'Produtos digitais',en:'Digital products'},
 {number:'03',pt:'Dados e automação',en:'Data & automation'},
 {number:'04',pt:'Educação e idiomas',en:'Teaching & languages'}
];

export function CapellariConcept({data}:{data:V2Content}){
 const [lang,setLang]=useState<Lang>('pt');
 const [menuOpen,setMenuOpen]=useState(false);
 const [galleryIndex,setGalleryIndex]=useState(0);
 const [copied,setCopied]=useState(false);
 const media=data.media||{};
 const content=data.content||{};
 const contact=data.contact||{};
 const gallery=useMemo(()=>Array.isArray(media.gallery)?media.gallery.map(image).filter(Boolean):[],[media.gallery]);
 const career=rows(content.portfolio_career);
 const skills=rows(content.portfolio_skills);
 const education=rows(content.portfolio_education);
 const press=rows(content.portfolio_links);
 const hero=image(media.hero);
 const aboutPhoto=image(media.about);
 const name=string(data.identity?.name).replace(/["”]+$/,'')||'Gabriel Capellari';
 const cv=string(contact.cv)||'#formacao';
 const email=string(contact.email)||'';
 const whatsapp=string(contact.whatsapp).replace(/\D/g,'');
 const linkedIn=string(contact.linkedin);
 const instagram=string(contact.instagram).replace(/^@/,'');
 const text=(pt:string,en:string)=>bi(pt,en,lang);
 const nextGallery=(step:number)=>setGalleryIndex(n=>(n+step+gallery.length)%Math.max(gallery.length,1));
 const share=async()=>{
   try{await navigator.clipboard.writeText(window.location.href);setCopied(true);window.setTimeout(()=>setCopied(false),1800);}
   catch{setCopied(false)}
 };
 useEffect(()=>{
   const els=Array.from(document.querySelectorAll<HTMLElement>('[data-concept-reveal]'));
   if(!('IntersectionObserver' in window)||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
   const observer=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting){(e.target as HTMLElement).classList.add(styles.revealed);observer.unobserve(e.target)}}},{threshold:.08,rootMargin:'0px 0px -6% 0px'});
   els.forEach(el=>observer.observe(el));return()=>observer.disconnect();
 },[]);
 return <div className={styles.site}>
   <a className={styles.skip} href="#sobre">{text('Pular para o conteúdo','Skip to content')}</a>
   <div className={styles.draftRibbon}>CONCEITO 01 <span>·</span> {text('RASCUNHO — NÃO PUBLICADO','DRAFT — NOT PUBLISHED')}</div>
   <header className={styles.topbar}>
     <a className={styles.brand} href="#inicio" aria-label="Gabriel Capellari — início">GC<span>.</span></a>
     <span className={styles.topMeta}>GABRIEL CAPELLARI <i/> {text('PORTFÓLIO 2026','PORTFOLIO 2026')}</span>
     <nav className={`${styles.nav} ${menuOpen?styles.navOpen:''}`} aria-label={text('Navegação principal','Main navigation')}>
       <a href="#projetos" onClick={()=>setMenuOpen(false)}>{text('Projetos','Projects')}</a>
       <a href="#sobre" onClick={()=>setMenuOpen(false)}>{text('Sobre','About')}</a>
       <a href="#trajetoria" onClick={()=>setMenuOpen(false)}>{text('Trajetória','Background')}</a>
       <a className={styles.navContact} href="#contato" onClick={()=>setMenuOpen(false)}>{text('Contato ↗','Contact ↗')}</a>
     </nav>
     <div className={styles.lang} role="group" aria-label={text('Escolher idioma','Choose language')}>
       <button type="button" aria-pressed={lang==='pt'} onClick={()=>setLang('pt')}>PT</button>
       <button type="button" aria-pressed={lang==='en'} onClick={()=>setLang('en')}>EN</button>
     </div>
     <button className={styles.mobileMenu} type="button" aria-expanded={menuOpen} onClick={()=>setMenuOpen(open=>!open)} aria-label={menuOpen?'Fechar menu':'Abrir menu'}>{menuOpen?'✕':'☰'}</button>
   </header>

   <section className={styles.hero} id="inicio">
     <div className={styles.heroPhoto}>{hero?<SiteImage src={hero} alt="" loading="eager" imageWidth={1800} sizes="(max-width: 760px) 100vw, 55vw"/>:null}<div className={styles.heroPhotoShade}/><span className={styles.photoCaption}>IBITINGA · SP · BR</span></div>
     <div className={styles.heroText}>
       <span className={styles.kicker}><i/>{text('COMUNICAÇÃO, TECNOLOGIA & CRIAÇÃO','COMMUNICATION, TECHNOLOGY & CREATION')}</span>
       <h1>{text('Histórias que viram','Stories turned into')}<br/><em>{text('soluções reais.','real solutions.')}</em></h1>
       <p>{text('Sou Gabriel Capellari. Jornalista, educador e criador de projetos digitais. Combino escrita, pesquisa, dados e tecnologia para transformar ideias em experiências úteis.','I’m Gabriel Capellari — journalist, educator and digital project builder. I combine writing, research, data and technology to turn ideas into useful experiences.')}</p>
       <div className={styles.heroTags}><span>{text('Conteúdo & SEO','Content & SEO')}</span><span>{text('Produtos digitais','Digital products')}</span><span>{text('Dados & automação','Data & automation')}</span></div>
       <div className={styles.heroActions}>
         <a className={styles.actionPrimary} href="#projetos">{text('Explorar projetos ↗','Explore projects ↗')}</a>
         <a className={styles.actionSecondary} href="#contato">{text('Vamos conversar →','Let’s talk →')}</a>
         <a className={styles.actionQuiet} href={cv} target="_blank" rel="noopener noreferrer">{text('Ver currículo ↓','View résumé ↓')}</a><button type="button" className={styles.actionQuiet} onClick={share}>{copied?text('Link copiado ✓','Link copied ✓'):text('Compartilhar ↗','Share ↗')}</button>
       </div>
     </div>
     <span className={styles.verticalStamp}>EDITORIAL <i/> DIGITAL <i/> HUMANO</span>
     <a className={styles.scrollHint} href="#areas">SCROLL TO EXPLORE <span>↓</span></a>
   </section>

   <div className={styles.marquee} aria-label={text('Áreas de atuação','Areas of work')}>
     <div className={styles.marqueeTrack} aria-hidden="true">{[0,1].map(i=><span key={i}>STORYTELLING <b>✳</b> DIGITAL PRODUCTS <b>✳</b> RESEARCH <b>✳</b> DATA & AUTOMATION <b>✳</b> EDUCATION <b>✳</b></span>)}</div>
   </div>

   <section id="areas" className={styles.focus}>
     <div className={styles.focusHead}><span className={styles.sectionNum}>01 / {text('VISÃO AMPLIADA','A WIDER PERSPECTIVE')}</span><p>{text('Minha trajetória não cabe em um único cargo. Essas são as frentes que se conectam no meu trabalho.','My career goes beyond one job title. These are the fields that come together in my work.')}</p></div>
     <div className={styles.focusGrid}>{focus.map(item=><div className={styles.focusItem} key={item.number}><small>{item.number}</small><strong>{text(item.pt,item.en)}</strong><span>↗</span></div>)}</div>
   </section>

   <section className={styles.about} id="sobre">
     <div className={styles.aboutVisual} data-concept-reveal>
       {aboutPhoto?<SiteImage src={aboutPhoto} alt={text('Gabriel em atividade de cobertura audiovisual','Gabriel working on an audiovisual assignment')} imageWidth={1000} sizes="(max-width: 760px) 100vw, 40vw"/>:null}
       <div className={styles.aboutPhotoLabel}><span>GABRIEL CAPELLARI</span><strong>{text('Curiosidade que vira projeto.','Curiosity turned into projects.')}</strong></div>
     </div>
     <div className={styles.aboutCopy} data-concept-reveal>
       <span className={styles.sectionNum}>02 / {text('SOBRE MIM','ABOUT ME')}</span>
       <h2>{text('Uma trajetória feita','A career built on')}<br/><em>{text('de conexões.','connections.')}</em></h2>
       <p>{text('Comecei na educação, encontrei no jornalismo a oportunidade de contar histórias e, nos projetos digitais, uma nova forma de resolver problemas. Hoje reúno essas experiências para trabalhar com conteúdo, produtos, ferramentas e processos.','I started in education, found storytelling through journalism and discovered a new way to solve problems through digital projects. Today I bring those experiences together across content, tools, products and workflows.')}</p>
       <p>{text('A bagagem editorial segue comigo: pesquisa, clareza, atenção aos detalhes e capacidade de entregar sob pressão. A ela se somam a construção de sites, sistemas, painéis de dados e automações — sempre com foco em tornar a tecnologia mais simples para quem usa.','My editorial background stays with me: research, clarity, attention to detail and delivery under pressure. I add website creation, systems, dashboards and automations — focusing on making technology easier for people to use.')}</p>
       <a className={styles.inlineLink} href="#trajetoria">{text('Conheça meu caminho','Explore my journey')} <span>↗</span></a>
     </div>
   </section>

   <section className={styles.projects} id="projetos">
     <div className={styles.projectsHead} data-concept-reveal><div><span className={styles.sectionNum}>03 / {text('PROJETOS SELECIONADOS','SELECTED WORK')}</span><h2>{text('Do problema','From problems')}<br/><em>{text('ao projeto.','to products.')}</em></h2></div><p>{text('Quatro exemplos de como transformo ideias em experiências, organização e soluções concretas.','Four examples of turning ideas into experiences, organization and practical solutions.')}</p></div>
     <div className={styles.projectGrid}>{cases.map((item,i)=><article key={item.n} className={`${styles.projectCard} ${i%2?styles.projectCardLight:''}`} data-concept-reveal>
       <div className={styles.cardHead}><span>{item.n} — 04</span><span>{text(item.type.pt,item.type.en)}</span></div>
       <div className={styles.cardArt} aria-hidden="true"><span>{item.n}</span><b>{i===0?'W':i===1?'E':i===2?'▥':'A'}</b><i/></div>
       <h3>{item.name}</h3><p>{text(item.desc.pt,item.desc.en)}</p>
       <div className={styles.cardFoot}><span>{item.detail}</span><a href={item.href||'#contato'} target={item.href?'_blank':undefined} rel={item.href?'noopener noreferrer':undefined}>{item.href?text('Ver projeto','View project'):text('Saiba mais','Learn more')} ↗</a></div>
     </article>)}</div>
   </section>

   <section className={styles.editorial} id="jornalismo">
     <div className={styles.editorialCopy} data-concept-reveal>
       <span className={styles.sectionNum}>04 / {text('EXPERIÊNCIA EDITORIAL','EDITORIAL EXPERIENCE')}</span>
       <h2>{text('Jornalismo','Journalism')}<br/><em>{text('sem fronteiras.','without borders.')}</em></h2>
       <p>{text('O poker me levou a coberturas internacionais, reportagens ao vivo, entrevistas e projetos editoriais. Essa experiência desenvolveu minha capacidade de apurar, comunicar e trabalhar com ritmo — habilidades que levo para tudo o que construo.','Poker journalism brought me to international events, live reporting, interviews and editorial projects. It sharpened how I research, communicate and work under pressure — skills I bring to everything I build.')}</p>
       <div className={styles.editorialStats}><span>WSOP</span><span>LAS VEGAS</span><span>2022 — 2025</span></div>
       <div className={styles.publications}>{press.map(item=><a key={string(item.name)} href={string(item.url)} target="_blank" rel="noopener noreferrer"><strong>{string(item.name)}</strong><span>{lang==='pt'?string(item.description_pt):string(item.description_en)}</span><b>↗</b></a>)}</div>
     </div>
     <div className={styles.editorialVisual} data-concept-reveal>
       {gallery.length?<><div className={styles.editorialImage}><SiteImage src={gallery[galleryIndex]} alt={text('Registro fotográfico da cobertura da WSOP em Las Vegas','Photo from WSOP Las Vegas coverage')} imageWidth={1100} sizes="(max-width: 760px) 100vw, 50vw"/></div><div className={styles.galleryControls}><span>{String(galleryIndex+1).padStart(2,'0')} / {String(gallery.length).padStart(2,'0')}</span><div><button aria-label={text('Foto anterior','Previous photo')} type="button" onClick={()=>nextGallery(-1)}>←</button><button aria-label={text('Próxima foto','Next photo')} type="button" onClick={()=>nextGallery(1)}>→</button></div></div></>:null}
     </div>
   </section>

   <section className={styles.journey} id="trajetoria">
     <div className={styles.journeyHead} data-concept-reveal><span className={styles.sectionNum}>05 / {text('EXPERIÊNCIA','EXPERIENCE')}</span><h2>{text('O caminho até aqui.','The road so far.')}</h2><p>{text('Pesquisa, ensino, conteúdo e execução: experiências que se complementam.','Research, teaching, content and execution: different experiences, connected skills.')}</p></div>
     <div className={styles.timeline}>{career.map((item,i)=><article key={i} data-concept-reveal><span className={styles.timelineYear}>{string(item.years)}</span><div><span className={styles.timelineCompany}>{string(item.organization)}</span><h3>{lang==='pt'?string(item.role_pt):string(item.role_en)}</h3><p>{lang==='pt'?string(item.description_pt):string(item.description_en)}</p></div><span className={styles.timelineArrow}>↗</span></article>)}</div>
   </section>

   <section className={styles.learning} id="formacao">
     <div data-concept-reveal><span className={styles.sectionNum}>06 / {text('FORMAÇÃO & REPERTÓRIO','EDUCATION & SKILLS')}</span><h2>{text('Aprender. Aplicar.','Learn. Apply.')}<br/><em>{text('Evoluir.','Evolve.')}</em></h2><p>{text('Uma base em Letras e Informática, ampliada por ferramentas e projetos práticos.','A background in Languages and IT, expanded through real projects and practical tools.')}</p></div>
     <div className={styles.learningDetail} data-concept-reveal>
       <h3>{text('Formação','Education')}</h3>
       {education.map((item,i)=><div className={styles.educationRow} key={i}><strong>{lang==='pt'?string(item.title_pt):string(item.title_en)}</strong><span>{string(item.institution)}</span></div>)}
       <h3>{text('Ferramentas e competências','Tools and skills')}</h3>
       <div className={styles.skills}>{['Google Apps Script','Google Sheets','Next.js','Dashboards','Automação','Comunicação',...skills.map(item=>lang==='pt'?string(item.label_pt):string(item.label_en))].filter(Boolean).map((skill,i)=><span key={i}>{skill}</span>)}</div>
     </div>
   </section>

   <section className={styles.contact} id="contato">
     <div className={styles.contactIntro} data-concept-reveal><span className={styles.sectionNum}>07 / {text('PRÓXIMO CAPÍTULO','NEXT CHAPTER')}</span><h2>{text('Vamos criar','Let’s build')}<br/><em>{text('algo relevante.','something meaningful.')}</em></h2><p>{text('Estou aberto a oportunidades e colaborações em comunicação, conteúdo, produtos digitais, dados e projetos que conectem essas áreas.','I’m open to opportunities and collaborations in communication, content, digital products, data and work connecting those fields.')}</p><div className={styles.contactActions}>{email?<a className={styles.contactMain} href={`mailto:${email}`}>{text('Escrever um e-mail ↗','Send an email ↗')}</a>:null}{whatsapp?<a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp ↗</a>:null}</div></div>
     <div className={styles.contactPanel} data-concept-reveal><div className={styles.panelTop}>LET&apos;S CONNECT <span>✳</span></div><strong>{name}</strong><p>{text('Jornalismo · Educação · Produtos digitais · Tecnologia','Journalism · Education · Digital products · Technology')}</p><div>{linkedIn?<a href={linkedIn} target="_blank" rel="noopener noreferrer">LINKEDIN ↗</a>:null}{instagram?<a href={`https://www.instagram.com/${instagram}/`} target="_blank" rel="noopener noreferrer">INSTAGRAM ↗</a>:null}<a href={cv} target="_blank" rel="noopener noreferrer">CURRÍCULO ↓</a><button type="button" onClick={share}>{copied?'COPIADO ✓':text('COPIAR LINK ↗','COPY LINK ↗')}</button></div><small>{text('Os links externos funcionam. Esta página é apenas uma proposta de design; o site oficial permanece igual.','External links are active. This is a design proposal; the official website is unchanged.')}</small></div>
   </section>

   <footer className={styles.footer}><span>GC<span>.</span></span><p>{text('Histórias, ideias e soluções em movimento.','Stories, ideas and solutions in motion.')}</p><a href="#inicio">{text('Voltar ao início ↑','Back to top ↑')}</a></footer>
 </div>;
}
