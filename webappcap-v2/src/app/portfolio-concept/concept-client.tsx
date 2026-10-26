'use client';

import {capellariCopy,capellariRows} from '@/core/capellari-editor';
import {useEffect,useMemo,useState} from 'react';
import type {V2Content} from '@/core/onboarding-data';
import {SiteImage} from '@/templates/site-image';
import styles from './concept.module.css';
import {capellariMedia,portfolioUrl,useDefaultCapellariCases,portfolioCv,CAPELLARI_CV_LINKS} from '@/core/capellari-preview';

type Lang='pt'|'en';
type Row=Record<string,unknown>;
const string=(v:unknown)=>String(v??'').trim();
const image=(v:unknown)=>portfolioUrl(typeof v==='string'?v:(v&&typeof v==='object'?(v as Row).url:''));
const rows=(v:unknown):Row[]=>Array.isArray(v)?v.filter(x=>x&&typeof x==='object') as Row[]:[];
const bi=(pt:string,en:string,lang:Lang)=>lang==='pt'?pt:en;
const defaultCases=capellariRows({identity:{},content:{},appearance:{},contact:{},media:{}},'portfolio_concept_cases');

export function CapellariConcept({data,preview=false,reference=false}:{data:V2Content;preview?:boolean;reference?:boolean}){
 const [lang,setLang]=useState<Lang>('pt');
 const [menuOpen,setMenuOpen]=useState(false);
 const [galleryIndex,setGalleryIndex]=useState(0);
 const [copied,setCopied]=useState(false);
 const media=capellariMedia(data);
 const content=data.content||{};
 const copy=(id:string)=>capellariCopy(data,id,lang);
 const suppliedCases=rows(content.portfolio_concept_cases);
 const focus=capellariRows(data,'portfolio_concept_focus');
 const tags=capellariRows(data,'portfolio_concept_tags');
 const marquee=capellariRows(data,'portfolio_concept_marquee');
 const editorialStats=capellariRows(data,'portfolio_concept_editorial_stats');
 const tools=capellariRows(data,'portfolio_concept_tools');
 const cases=(useDefaultCapellariCases(content)?defaultCases:suppliedCases).slice(0,12).map((item,i)=>{
   const row=item as Row;
   const category=(row.type&&typeof row.type==='object'?row.type:{}) as Row;
   const description=(row.desc&&typeof row.desc==='object'?row.desc:{}) as Row;
   return{
     n:string(row.n)||String(i+1).padStart(2,'0'),
     name:string(row.name||row.title)||'Projeto',
     type:{pt:string(row.type_pt||category.pt)||'PROJETO DIGITAL',en:string(row.type_en||category.en)||'DIGITAL PROJECT'},
     desc:{pt:string(row.description_pt||description.pt),en:string(row.description_en||description.en)},
     detail:string(row.stack||row.detail),
     href:portfolioUrl(row.url||row.href),
     image:image(row.image)
   };
 });
 const contact=data.contact||{};
 const gallery=useMemo(()=>Array.isArray(media.gallery)?media.gallery.map(image).filter(Boolean):[],[media.gallery]);
 const career=rows(content.portfolio_career);
 const skills=rows(content.portfolio_skills);
 const education=rows(content.portfolio_education);
 const galleryMeta=rows(content.portfolio_gallery_meta);
 const press=rows(content.portfolio_links);
 const hero=image(media.hero);
 const aboutPhoto=image(media.about);
 const name=string(data.identity?.name).replace(/["”]+$/,'')||'Gabriel Capellari';
 const monogram=string(data.identity?.portfolio_monogram)||'GC';
 const monogramSuffix=typeof data.identity?.portfolio_monogram_suffix==='string'?data.identity.portfolio_monogram_suffix:'.';
 const cv=portfolioCv(contact,lang,'#formacao',CAPELLARI_CV_LINKS);
 const email=string(contact.email)||'';
 const whatsapp=string(contact.whatsapp).replace(/\D/g,'');
 const linkedIn=portfolioUrl(contact.linkedin);
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
 return <div className={styles.site} lang={lang==='pt'?'pt-BR':'en'}>
   <a className={styles.skip} href="#sobre">{copy('pular_para_o_conteudo')}</a>
   {reference?<div className={styles.draftRibbon}>{text('REFERÊNCIA VISUAL · DADOS PUBLICADOS','VISUAL REFERENCE · PUBLISHED DATA')}</div>:preview?<div className={styles.draftRibbon}>CONCEITO 01 <span>·</span> {text('RASCUNHO — NÃO PUBLICADO','DRAFT — NOT PUBLISHED')}</div>:null}
   <header className={styles.topbar}>
     <a className={styles.brand} href="#inicio" aria-label={name+' — '+copy('inicio_link')}>{monogram}<span>{monogramSuffix}</span></a>
     <span className={styles.topMeta}>{name.toUpperCase()} <i/> {copy('portfolio_2026')}</span>
     <nav className={`${styles.nav} ${menuOpen?styles.navOpen:''}`} aria-label={copy('navegacao_principal')}>
       <a href="#projetos" onClick={()=>setMenuOpen(false)}>{copy('projetos')}</a>
       <a href="#sobre" onClick={()=>setMenuOpen(false)}>{copy('sobre')}</a>
       <a href="#trajetoria" onClick={()=>setMenuOpen(false)}>{copy('trajetoria')}</a>
       <a className={styles.navContact} href="#contato" onClick={()=>setMenuOpen(false)}>{copy('contato')}</a>
     </nav>
     <div className={styles.lang} role="group" aria-label={copy('escolher_idioma')}>
       <button type="button" aria-pressed={lang==='pt'} onClick={()=>setLang('pt')}>PT</button>
       <button type="button" aria-pressed={lang==='en'} onClick={()=>setLang('en')}>EN</button>
     </div>
     <button className={styles.mobileMenu} type="button" aria-expanded={menuOpen} onClick={()=>setMenuOpen(open=>!open)} aria-label={menuOpen?copy('fechar_menu'):copy('abrir_menu')}>{menuOpen?'✕':'☰'}</button>
   </header>

   <section className={styles.hero} id="inicio">
     <div className={styles.heroPhoto}>{hero?<SiteImage src={hero} alt={copy('hero_alt')} loading="eager" imageWidth={1800} sizes="(max-width: 760px) 100vw, 55vw"/>:null}<div className={styles.heroPhotoShade}/><span className={styles.photoCaption}>{string(data.identity?.location).toUpperCase()}</span></div>
     <div className={styles.heroText}>
       <span className={styles.kicker}><i/>{copy('comunicacao_tecnologia_criacao')}</span>
       <h1>{copy('hero_title')}<br/><em>{copy('hero_accent')}</em></h1>
       <p>{copy('intro')}</p>
       <div className={styles.heroTags}>{tags.map((item,i)=><span key={i}>{string(item['label_'+lang])}</span>)}</div>
       <div className={styles.heroActions}>
         <a className={styles.actionPrimary} href="#projetos">{copy('explorar_projetos')}</a>
         <a className={styles.actionSecondary} href="#contato">{copy('vamos_conversar')}</a>
         <a className={styles.actionQuiet} href={cv} target="_blank" rel="noopener noreferrer">{copy('ver_curriculo')}</a><button type="button" className={styles.actionQuiet} onClick={share}>{copied?copy('link_copiado'):copy('compartilhar')}</button>
       </div>
     </div>
     <span className={styles.verticalStamp}>{copy('stamp_editorial')} <i/> {copy('stamp_digital')} <i/> {copy('stamp_human')}</span>
     <a className={styles.scrollHint} href="#areas">{copy('scroll_hint')} <span>↓</span></a>
   </section>

   <div className={styles.marquee} aria-label={copy('areas_de_atuacao')}>
     <div className={styles.marqueeTrack}>{[0,1].map(i=><span key={i} aria-hidden={i===1?true:undefined}>{marquee.map((item,i)=><span key={i}>{string(item['label_'+lang])} <b aria-hidden="true">✳</b> </span>)}</span>)}</div>
   </div>

   <section id="areas" className={styles.focus}>
     <div className={styles.focusHead}><span className={styles.sectionNum}>01 / {copy('visao_ampliada')}</span><p>{copy('focus_intro')}</p></div>
     <div className={styles.focusGrid}>{focus.map(item=><div className={styles.focusItem} key={string(item.number)}><small>{string(item.number)}</small><strong>{string(item['label_'+lang])}</strong><span>↗</span></div>)}</div>
   </section>

   <section className={styles.about} id="sobre">
     <div className={styles.aboutVisual} data-concept-reveal>
       {aboutPhoto?<SiteImage src={aboutPhoto} alt={copy('gabriel_em_atividade_de_cobertura_audiovisual')} imageWidth={1000} sizes="(max-width: 760px) 100vw, 40vw"/>:null}
       <div className={styles.aboutPhotoLabel}><span>{name.toUpperCase()}</span><strong>{copy('curiosidade_que_vira_projeto')}</strong></div>
     </div>
     <div className={styles.aboutCopy} data-concept-reveal>
       <span className={styles.sectionNum}>02 / {copy('sobre_mim')}</span>
       <h2>{copy('uma_trajetoria_feita')}<br/><em>{copy('de_conexoes')}</em></h2>
       <p>{copy('about_a')}</p>
       <p>{copy('about_b')}</p>
       <a className={styles.inlineLink} href="#trajetoria">{copy('conheca_meu_caminho')} <span>↗</span></a>
     </div>
   </section>

   <section className={styles.projects} id="projetos">
     <div className={styles.projectsHead} data-concept-reveal><div><span className={styles.sectionNum}>03 / {copy('projetos_selecionados')}</span><h2>{copy('do_problema')}<br/><em>{copy('ao_projeto')}</em></h2></div><p>{copy('quatro_exemplos_de_como_transformo_ideias_em_exp')}</p></div>
     <div className={styles.projectGrid}>{cases.map((item,i)=><article key={item.n} className={`${styles.projectCard} ${i%2?styles.projectCardLight:''}`} data-concept-reveal>
       <div className={styles.cardHead}><span>{item.n} — {String(cases.length).padStart(2,'0')}</span><span>{text(item.type.pt,item.type.en)}</span></div>
       <div className={styles.cardArt} aria-hidden="true">{item.image?<SiteImage src={item.image} alt="" imageWidth={900} sizes="(max-width: 760px) 100vw, 45vw"/>:<><span>{item.n}</span><b>{i===0?'W':i===1?'E':i===2?'▥':'A'}</b><i/></>}</div>
       <h3>{item.name}</h3><p>{text(item.desc.pt,item.desc.en)}</p>
       <div className={styles.cardFoot}><span>{item.detail}</span><a href={item.href||'#contato'} target={item.href?'_blank':undefined} rel={item.href?'noopener noreferrer':undefined}>{item.href?copy('ver_projeto'):copy('saiba_mais')} ↗</a></div>
     </article>)}</div>
   </section>

   <section className={styles.editorial} id="jornalismo">
     <div className={styles.editorialCopy} data-concept-reveal>
       <span className={styles.sectionNum}>04 / {copy('experiencia_editorial')}</span>
       <h2>{copy('jornalismo')}<br/><em>{copy('sem_fronteiras')}</em></h2>
       <p>{copy('o_poker_me_levou_a_coberturas_internacionais_rep')}</p>
       <div className={styles.editorialStats}>{editorialStats.map((item,i)=><span key={i}>{string(item['label_'+lang])}</span>)}</div>
       <div className={styles.publications}>{press.map(item=><a key={string(item.name)} href={portfolioUrl(item.url)||'#contato'} target="_blank" rel="noopener noreferrer"><strong>{string(item.name)}</strong><span>{lang==='pt'?string(item.description_pt):string(item.description_en)}</span><b>↗</b></a>)}</div>
     </div>
     <div className={styles.editorialVisual} data-concept-reveal>
       {gallery.length?<><div className={styles.editorialImage}><SiteImage src={gallery[galleryIndex%gallery.length]} alt={string(galleryMeta[galleryIndex%gallery.length]?.[lang==='pt'?'alt_pt':'alt_en'])||copy('registro_fotografico_da_cobertura_da_wsop_em_las')} imageWidth={1100} sizes="(max-width: 760px) 100vw, 50vw"/></div><div className={styles.galleryControls}><span>{String(galleryIndex+1).padStart(2,'0')} / {String(gallery.length).padStart(2,'0')}</span><div><button aria-label={copy('foto_anterior')} type="button" onClick={()=>nextGallery(-1)}>←</button><button aria-label={copy('proxima_foto')} type="button" onClick={()=>nextGallery(1)}>→</button></div></div></>:null}
     </div>
   </section>

   <section className={styles.journey} id="trajetoria">
     <div className={styles.journeyHead} data-concept-reveal><span className={styles.sectionNum}>05 / {copy('experiencia')}</span><h2>{copy('o_caminho_ate_aqui')}</h2><p>{copy('pesquisa_ensino_conteudo_e_execucao_experiencias')}</p></div>
     <div className={styles.timeline}>{career.map((item,i)=><article key={i} data-concept-reveal><span className={styles.timelineYear}>{string(item.years)}</span><div><span className={styles.timelineCompany}>{string(item.organization)}</span><h3>{lang==='pt'?string(item.role_pt):string(item.role_en)}</h3><p>{lang==='pt'?string(item.description_pt):string(item.description_en)}</p></div><span className={styles.timelineArrow}>↗</span></article>)}</div>
   </section>

   <section className={styles.learning} id="formacao">
     <div data-concept-reveal><span className={styles.sectionNum}>06 / {copy('formacao_repertorio')}</span><h2>{copy('aprender_aplicar')}<br/><em>{copy('evoluir')}</em></h2><p>{copy('uma_base_em_letras_e_informatica_ampliada_por_fe')}</p></div>
     <div className={styles.learningDetail} data-concept-reveal>
       <h3>{copy('formacao')}</h3>
       {education.map((item,i)=><div className={styles.educationRow} key={i}><strong>{lang==='pt'?string(item.title_pt):string(item.title_en)}</strong><span>{string(item.institution)}</span></div>)}
       <h3>{copy('ferramentas_e_competencias')}</h3>
       <div className={styles.skills}>{[...tools.map(item=>string(item['label_'+lang])),...skills.map(item=>lang==='pt'?string(item.label_pt):string(item.label_en))].filter(Boolean).map((skill,i)=><span key={i}>{skill}</span>)}</div>
     </div>
   </section>

   <section className={styles.contact} id="contato">
     <div className={styles.contactIntro} data-concept-reveal><span className={styles.sectionNum}>07 / {copy('proximo_capitulo')}</span><h2>{copy('vamos_criar')}<br/><em>{copy('algo_relevante')}</em></h2><p>{copy('contact')}</p><div className={styles.contactActions}>{email?<a className={styles.contactMain} href={`mailto:${email}`}>{copy('escrever_um_e_mail')}</a>:null}{whatsapp?<a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">{copy('whatsapp_button')}</a>:null}</div></div>
     <div className={styles.contactPanel} data-concept-reveal><div className={styles.panelTop}>{copy('connect_panel')} <span>✳</span></div><strong>{name}</strong><p>{copy('jornalismo_educacao_produtos_digitais_tecnologia')}</p><div>{linkedIn?<a href={linkedIn} target="_blank" rel="noopener noreferrer">{copy('linkedin_button')}</a>:null}{instagram?<a href={`https://www.instagram.com/${instagram}/`} target="_blank" rel="noopener noreferrer">{copy('instagram_button')}</a>:null}<a href={cv} target="_blank" rel="noopener noreferrer">{copy('curriculo')}</a><button type="button" onClick={share}>{copied?copy('copiado'):copy('copiar_link')}</button></div><small hidden={!preview&&!reference}>{reference?text('Esta referência usa os dados publicados. Para conferir alterações, gere um preview do rascunho no Owner.','This reference uses published data. Generate a draft preview in Owner to check edits.'):text('Esta prévia usa uma cópia do rascunho. Gere outra após salvar novas alterações.','This preview uses a draft copy. Generate another after saving changes.')}</small></div>
   </section>

   <footer className={styles.footer}><span>{monogram}<span>{monogramSuffix}</span></span><p>{copy('historias_ideias_e_solucoes_em_movimento')}</p><a href="#inicio">{copy('voltar_ao_inicio')}</a></footer>
 </div>;
}
