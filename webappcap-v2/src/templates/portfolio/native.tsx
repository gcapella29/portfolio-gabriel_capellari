'use client';

import Image from 'next/image';
import { Fraunces, IBM_Plex_Mono, Inter } from 'next/font/google';
import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import type { TemplateRenderProps } from '../types';
import { portfolioDefaults as defaults, type LocalizedText } from './native-data';
import styles from './native.module.css';

const headingFont=Fraunces({subsets:['latin'],weight:'variable',style:['normal','italic'],axes:['opsz'],variable:'--portfolio-heading',display:'swap'});
const bodyFont=Inter({subsets:['latin'],weight:['400','500','600'],variable:'--portfolio-body',display:'swap'});
const monoFont=IBM_Plex_Mono({subsets:['latin'],weight:['400','500','600','700'],variable:'--portfolio-mono',display:'swap'});

type Language='pt'|'en';
type CssVariables=CSSProperties&{'--accent'?:string};
const sectionLinks=[['destaques',{pt:'Destaques',en:'Highlights'}],['sobre',{pt:'Sobre',en:'About'}],['wsop-featured',{pt:'WSOP',en:'WSOP'}],['cobertura',{pt:'Cobertura',en:'Coverage'}],['portfolio',{pt:'Portfólio',en:'Portfolio'}],['experiencia',{pt:'Experiência',en:'Experience'}],['formacao',{pt:'Formação',en:'Education'}],['instagram',{pt:'Instagram',en:'Instagram'}],['contato',{pt:'Contato',en:'Contact'}]] as const;
const localized=(item:LocalizedText,language:Language)=>item[language];
const stringValue=(record:Record<string,unknown>,key:string,fallback:string)=>String(record[key]??'').trim()||fallback;
const mediaValue=(record:Record<string,unknown>,key:string,fallback:string)=>{const item=record[key];return item&&typeof item==='object'&&'url' in item?String((item as {url?:unknown}).url||fallback):typeof item==='string'&&item?item:fallback};

export function NativePortfolioTemplate({project,data,preview=false}:TemplateRenderProps){
  const [language,setLanguage]=useState<Language>('pt');
  const [slide,setSlide]=useState(0);
  const [activeSection,setActiveSection]=useState('destaques');
  const [shareFeedback,setShareFeedback]=useState(false);
  const [leadState,setLeadState]=useState<'idle'|'sending'|'success'|'error'>('idle');
  const siteRef=useRef<HTMLDivElement>(null);
  const heroBackgroundRef=useRef<HTMLDivElement>(null);
  const touchStartRef=useRef<number|null>(null);

  const name=stringValue(data.identity,'name',project.name||defaults.identity.name).replace(/["”]+$/,'').trim();
  const location=stringValue(data.identity,'location',defaults.identity.location);
  const hero=mediaValue(data.media,'hero',defaults.media.hero);
  const aboutImage=mediaValue(data.media,'about',defaults.media.about);
  const profileImage=mediaValue(data.media,'profile',mediaValue(data.media,'logo',defaults.media.profile));
  const contactImage=mediaValue(data.media,'contact',defaults.media.contact);
  const instagram=stringValue(data.contact,'instagram',defaults.contact.instagram).replace(/^@/,'');
  const email=stringValue(data.contact,'email',defaults.contact.email);
  const emailAlt=stringValue(data.contact,'email_alt',defaults.contact.emailAlt);
  const whatsapp=stringValue(data.contact,'whatsapp',defaults.contact.whatsapp).replace(/\D/g,'');
  const whatsappLabel=stringValue(data.contact,'whatsapp_label',defaults.contact.whatsappLabel);
  const linkedin=stringValue(data.contact,'linkedin',defaults.contact.linkedin);
  const cv=stringValue(data.contact,'cv',defaults.contact.cv);
  const reel=stringValue(data.contact,'reel',defaults.contact.reel);
  const role:LocalizedText={pt:stringValue(data.content,'hero_text',defaults.identity.role.pt),en:stringValue(data.content,'hero_text_en',defaults.identity.role.en)};
  const aboutTitle:LocalizedText={pt:stringValue(data.content,'hero_title',defaults.about.title.pt),en:stringValue(data.content,'hero_title_en',defaults.about.title.en)};
  const aboutParagraphs:LocalizedText[]=[
    {pt:stringValue(data.identity,'description',defaults.about.paragraphs[0].pt),en:stringValue(data.identity,'description_en',defaults.about.paragraphs[0].en)},
    {pt:stringValue(data.content,'about',defaults.about.paragraphs[1].pt),en:stringValue(data.content,'about_en',defaults.about.paragraphs[1].en)}
  ];
  const profileBio:LocalizedText={pt:stringValue(data.content,'primary_offer','Formado em Letras (Português/Inglês), sempre fui apaixonado por esportes e comunicação. Através das palavras, encontrei uma forma de contar histórias, aproximar pessoas e transformar experiências em conexão.'),en:stringValue(data.content,'primary_offer_en','With a degree in Languages (Portuguese/English), I have always been passionate about sports and communication. Through words, I found a way to tell stories, bring people together and turn experiences into connection.')};
  const featuredDescription:LocalizedText={pt:stringValue(data.content,'proof',defaults.featured.description.pt),en:stringValue(data.content,'proof_en',defaults.featured.description.en)};
  const gallery=useMemo(()=>{const custom=Array.isArray(data.media.gallery)?data.media.gallery.map(item=>item&&typeof item==='object'&&'url' in item?String((item as {url?:unknown}).url||''):typeof item==='string'?item:'').filter(Boolean):[];return custom.length?custom:defaults.media.wsop},[data.media.gallery]);
  const accent=stringValue(data.appearance,'accent','#e3bb3d');

  useEffect(()=>{const stored=window.localStorage.getItem('portfolio-language');if(stored==='en')setLanguage('en')},[]);
  useEffect(()=>{if(gallery.length<2)return;const timer=window.setInterval(()=>setSlide(current=>(current+1)%gallery.length),10000);return()=>window.clearInterval(timer)},[gallery.length]);
  useEffect(()=>{
    const root=siteRef.current;if(!root)return;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targets=[...root.querySelectorAll<HTMLElement>('[data-reveal]')];
    if(reduced||!('IntersectionObserver' in window)){targets.forEach(target=>target.dataset.visible='true');return}
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){(entry.target as HTMLElement).dataset.visible='true';observer.unobserve(entry.target)}}),{threshold:.12,rootMargin:'0px 0px -50px'});
    targets.forEach(target=>observer.observe(target));return()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    const root=siteRef.current;if(!root||!('IntersectionObserver' in window))return;
    const sections=sectionLinks.map(([id])=>root.querySelector(`#${id}`)).filter(Boolean) as Element[];
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)setActiveSection(entry.target.id)}),{rootMargin:'-35% 0px -55%',threshold:0});
    sections.forEach(section=>observer.observe(section));return()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    const root=siteRef.current;const background=heroBackgroundRef.current;if(!root)return;let frame=0;
    const update=()=>{frame=0;const max=document.documentElement.scrollHeight-window.innerHeight;root.style.setProperty('--scroll-progress',String(max>0?window.scrollY/max:0));if(background&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches)background.style.transform=`translateY(${Math.min(window.scrollY*.25,140)}px) scale(1.08)`};
    const schedule=()=>{if(!frame)frame=window.requestAnimationFrame(update)};update();window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});return()=>{window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);if(frame)window.cancelAnimationFrame(frame)};
  },[]);

  const chooseLanguage=(next:Language)=>{setLanguage(next);window.localStorage.setItem('portfolio-language',next)};
  const moveSlide=(direction:number)=>setSlide(current=>(current+direction+gallery.length)%gallery.length);
  const share=async()=>{const payload={title:`${name} — ${language==='pt'?'Jornalista de Poker':'Poker Journalist'}`,text:language==='pt'?'Portfólio profissional de Gabriel Capellari.':'Gabriel Capellari professional portfolio.',url:window.location.href};if(navigator.share){try{await navigator.share(payload);return}catch(error){if(error instanceof DOMException&&error.name==='AbortError')return}}try{await navigator.clipboard.writeText(window.location.href)}catch{return}setShareFeedback(true);window.setTimeout(()=>setShareFeedback(false),1800)};
  const submitLead=async(event:FormEvent<HTMLFormElement>)=>{event.preventDefault();setLeadState('sending');const form=event.currentTarget;const formData=new FormData(form);formData.set('projectId',project.id);try{const response=await fetch('/api/leads',{method:'POST',body:formData});if(!response.ok)throw new Error('submit_failed');form.reset();setLeadState('success')}catch{setLeadState('error')}};
  const firstName=name.split(' ')[0];const surname=name.split(' ').slice(1).join(' ');
  const cssVariables:CssVariables={'--accent':accent};

  return <div ref={siteRef} className={`${styles.site} ${headingFont.variable} ${bodyFont.variable} ${monoFont.variable}`} data-language={language} style={cssVariables}>
    <div className={styles.progress} aria-hidden="true"/>
    {preview?<div className={styles.preview}>Homologação · renderer nativo</div>:null}
    <a className={styles.skip} href="#sobre">{language==='pt'?'Pular para o conteúdo':'Skip to content'}</a>
    <div className={styles.language} role="group" aria-label={language==='pt'?'Alterar idioma':'Change language'}><button type="button" aria-label="Português" aria-pressed={language==='pt'} onClick={()=>chooseLanguage('pt')}>🇧🇷</button><button type="button" aria-label="English" aria-pressed={language==='en'} onClick={()=>chooseLanguage('en')}>🇬🇧</button></div>
    <header className={styles.hero} id="inicio">
      <div ref={heroBackgroundRef} className={styles.heroBackground} style={{backgroundImage:`linear-gradient(180deg,rgba(8,39,32,.55),rgba(8,39,32,.88) 62%,#082720),url(${hero})`,backgroundPosition:'center 18%'}}/>
      <div className={styles.heroContent}>
        <div className={styles.heroTop}><span>{location}</span></div>
        <div className={styles.heroCopy}><h1>{firstName}<br/><em>{surname}&quot;</em></h1><p>{localized(role,language)}</p><div className={styles.chips}>{defaults.identity.languages.map(item=><span key={item.pt}><i className={styles.chipFlag} data-country={item.country} aria-hidden="true"/>{localized(item,language)}</span>)}</div><div className={styles.actions}><a className={styles.primary} href="#portfolio">{language==='pt'?'Ver meu trabalho ↘':'View my work ↘'}</a><a href="#contato">{language==='pt'?'Entrar em contato →':'Get in touch →'}</a><a href={cv} download>{language==='pt'?'Baixar CV ↓':'Download CV ↓'}</a><button type="button" onClick={share}>{shareFeedback?(language==='pt'?'Link copiado ✓':'Link copied ✓'):(language==='pt'?'Compartilhar ↗':'Share ↗')}</button></div></div>
      </div>
    </header>
    <div className={styles.tickerWrap} aria-hidden="true">
      <div className={styles.tickerTrack}>
        {[0,1].map(group=><div className={styles.tickerGroup} key={group}>{defaults.ticker.map(item=><span key={`${group}-${item}`}>{item}</span>)}</div>)}
      </div>
    </div>
    <main>
      <section className={styles.stats} id="destaques" data-reveal>{defaults.stats.map(item=><article key={item.number+item.label.pt}><strong>{item.number}</strong><span>{localized(item.label,language)}</span></article>)}</section>
      <section className={`${styles.section} ${styles.about}`} id="sobre" data-reveal><div className={styles.photo}><Image src={aboutImage} alt={language==='pt'?`${name} operando câmera durante cobertura ao vivo de torneio de poker`:`${name} operating a camera during live poker tournament coverage`} fill sizes="(max-width: 819px) 100vw, 390px"/></div><div><span className={styles.eyebrow}>{localized(defaults.about.eyebrow,language)}</span><h2>{localized(aboutTitle,language)}</h2>{aboutParagraphs.map(paragraph=><p key={paragraph.pt}>{localized(paragraph,language)}</p>)}</div></section>
      <section className={`${styles.section} ${styles.featured}`} id="wsop-featured" data-reveal><div className={styles.carousel} tabIndex={0} role="region" aria-roledescription="carousel" aria-label={language==='pt'?'Fotos da cobertura da WSOP Las Vegas':'WSOP Las Vegas coverage photos'} onKeyDown={event=>{if(event.key==='ArrowLeft'){event.preventDefault();moveSlide(-1)}if(event.key==='ArrowRight'){event.preventDefault();moveSlide(1)}}} onTouchStart={event=>{touchStartRef.current=event.changedTouches[0].clientX}} onTouchEnd={event=>{if(touchStartRef.current===null)return;const delta=event.changedTouches[0].clientX-touchStartRef.current;touchStartRef.current=null;if(Math.abs(delta)>=45)moveSlide(delta>0?-1:1)}}>{gallery.map((src,index)=>{const meta=defaults.galleryMeta[index]||{year:'2025',alt:{pt:`${name} na WSOP Las Vegas`,en:`${name} at the WSOP in Las Vegas`}};return <figure className={index===slide?styles.activeSlide:styles.slide} aria-hidden={index!==slide} key={src}><Image src={src} alt={localized(meta.alt,language)} fill sizes="(max-width: 819px) 100vw, 50vw" priority={index===0}/><figcaption><strong>{meta.year}</strong><span>WSOP Las Vegas</span></figcaption></figure>})}<button className={styles.previous} type="button" onClick={()=>moveSlide(-1)} aria-label={language==='pt'?'Foto anterior':'Previous photo'}>←</button><button className={styles.next} type="button" onClick={()=>moveSlide(1)} aria-label={language==='pt'?'Próxima foto':'Next photo'}>→</button><div className={styles.carouselUi}><div className={styles.dots}>{gallery.map((_,index)=><button type="button" className={index===slide?styles.activeDot:styles.dot} aria-label={`${language==='pt'?'Ir para foto':'Go to photo'} ${index+1}`} aria-current={index===slide?'true':undefined} onClick={()=>setSlide(index)} key={index}/>)}</div><div>{String(slide+1).padStart(2,'0')} / {String(gallery.length).padStart(2,'0')}</div></div></div><div className={styles.featuredCopy}><span className={styles.eyebrow}>{localized(defaults.featured.eyebrow,language)}</span><h2>WSOP<br/>Las Vegas</h2><p>{localized(featuredDescription,language)}</p><div className={styles.yearList}>{defaults.featured.years.map(year=><span key={year.pt}>{localized(year,language)}</span>)}</div><a className={styles.workLink} href="#portfolio">{language==='pt'?'Ver portfólio →':'View portfolio →'}</a></div></section>
      <section className={`${styles.section} ${styles.coverage}`} id="cobertura" data-reveal><header><span className={styles.eyebrow}>{language==='pt'?'Painel de cobertura':'Coverage board'}</span><h2>{language==='pt'?'Torneios cobertos':'Tournaments covered'}</h2></header><div className={styles.board}>{defaults.coverage.map(([event,years])=><div key={event}><strong>{event}</strong><span>{years}</span></div>)}</div></section>
      <section className={`${styles.section} ${styles.portfolio}`} id="portfolio" data-reveal><header><span className={styles.eyebrow}>{language==='pt'?'Onde ler':'Where to read'}</span><h2>{language==='pt'?'Portfólio publicado':'Published portfolio'}</h2></header><div className={styles.profile}><div className={styles.profilePhoto}><Image src={profileImage} alt={language==='pt'?`${name}, redator na PokerNews Brasil`:`${name}, writer at PokerNews Brazil`} fill sizes="220px"/></div><div><h3>{name}</h3><div className={styles.socialRow}><span>{language==='pt'?'Siga no':'Follow on'}</span><a href={`https://www.instagram.com/${instagram}/`} target="_blank" rel="noreferrer" aria-label="Instagram">IG</a><a href={linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">IN</a></div><p>{localized(profileBio,language)}</p></div></div><div className={styles.pressCards}>{defaults.links.map(item=><a href={item.href} target="_blank" rel="noreferrer" key={item.name}><span><strong>{item.name}</strong><small>{localized(item.description,language)}</small></span><b>→</b></a>)}</div></section>
      <section className={`${styles.section} ${styles.experience}`} id="experiencia" data-reveal><header><span className={styles.eyebrow}>{language==='pt'?'Histórico de mãos':'Hand history'}</span><h2>{language==='pt'?'Experiência profissional':'Professional experience'}</h2></header><div className={styles.timeline}>{defaults.career.map(item=><article key={`${item.organization}-${item.years}`}><div><h3>{localized(item.role,language)}</h3><time>{item.years}</time></div><strong>{item.organization}</strong><p>{localized(item.description,language)}</p></article>)}</div></section>
      <section className={`${styles.section} ${styles.education}`} id="formacao" data-reveal><header><span className={styles.eyebrow}>{language==='pt'?'Fundamentos':'Foundations'}</span><h2>{language==='pt'?'Formação & ferramentas':'Education & tools'}</h2></header><div className={styles.educationGrid}><div>{defaults.education.map(([degree,institution])=><article key={degree.pt}><strong>{localized(degree,language)}</strong><span>{institution}</span></article>)}</div><div><h3 className={styles.stackTitle}>{language==='pt'?'Idiomas & ferramentas — mesa de fichas':'Languages & tools — chip stack'}</h3><div className={styles.skillStack}>{defaults.skills.map((skill,index)=><span className={index<2?styles.highlightSkill:''} key={skill.pt}>{localized(skill,language)}</span>)}</div></div></div></section>
      <section className={`${styles.section} ${styles.instagram}`} id="instagram" data-reveal><div><span className={styles.eyebrow}>{language==='pt'?'Bastidores':'Behind the scenes'}</span><h2>{language==='pt'?'Também no Instagram':'Also on Instagram'}</h2><p>{language==='pt'?'Bastidores de mesa final, viagens de cobertura e o dia a dia da vida de repórter — tudo por lá.':'Final-table behind the scenes, reporting trips and everyday reporter life — all there.'}</p><a href={`https://www.instagram.com/${instagram}/`} target="_blank" rel="noreferrer">@{instagram} →</a></div><div className={styles.reel}><iframe src={reel} title={`Instagram — ${name}`} loading="lazy" allowFullScreen/></div></section>
      <section className={`${styles.section} ${styles.contact}`} id="contato" data-reveal><div><h2>{language==='pt'?'Contato':'Contact'}</h2><div className={styles.contactLinks}><a href={cv} download><span>{language==='pt'?'Currículo':'CV'}</span>{language==='pt'?'Baixar CV em PDF ↓':'Download CV as PDF ↓'}</a><button type="button" onClick={share}><span>{language==='pt'?'Portfólio':'Portfolio'}</span>{shareFeedback?(language==='pt'?'Link copiado ✓':'Link copied ✓'):(language==='pt'?'Compartilhar ↗':'Share ↗')}</button><a href={`mailto:${email}`}><span>E-mail</span>{email}</a><a href={`mailto:${emailAlt}`}><span>{language==='pt'?'E-mail alternativo':'Alternative email'}</span>{emailAlt}</a><a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer"><span>WhatsApp</span>{whatsappLabel}</a><a href={`https://www.instagram.com/${instagram}/`} target="_blank" rel="noreferrer"><span>Instagram</span>@{instagram} →</a><a href={linkedin} target="_blank" rel="noreferrer"><span>LinkedIn</span>{language==='pt'?'Ver perfil →':'View profile →'}</a></div></div><div className={styles.contactPhoto}><Image src={contactImage} alt={language==='pt'?`${name} filmando mesa final durante torneio de poker`:`${name} filming a poker tournament final table`} fill sizes="(max-width: 819px) 100vw, 520px"/></div>
        <div className={styles.leadCard}>
          <h2 id="lead-title">{language==='pt'?'Fale comigo pelo WebAppCap':'Contact me through WebAppCap'}</h2>
          <p>{language==='pt'?'Preencha seus dados e retornaremos o contato.':'Fill in your details and we will get back to you.'}</p>
          <form onSubmit={submitLead}>
            <label><span>{language==='pt'?'Nome':'Name'}</span><input name="name" required minLength={2} autoComplete="name"/></label>
            <div className={styles.leadRow}><label><span>E-mail</span><input name="email" type="email" autoComplete="email"/></label><label><span>{language==='pt'?'Telefone / WhatsApp':'Phone / WhatsApp'}</span><input name="phone" required autoComplete="tel" inputMode="tel"/></label></div>
            <label><span>{language==='pt'?'Mensagem':'Message'}</span><textarea name="message" required minLength={3} rows={5}/></label>
            <input className={styles.honeypot} name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"/>
            <label className={styles.consent}><input name="consent" type="checkbox" required/><span>{language==='pt'?'Concordo com o uso dos meus dados para retorno deste contato.':'I agree to the use of my data to reply to this contact.'}</span></label>
            <button type="submit" disabled={leadState==='sending'}>{leadState==='sending'?(language==='pt'?'Enviando…':'Sending…'):(language==='pt'?'Quero entrar em contato':'I want to get in touch')}</button>
            <div className={styles.formStatus} role="status" aria-live="polite">{leadState==='success'?(language==='pt'?'Mensagem enviada com sucesso.':'Message sent successfully.'):leadState==='error'?(language==='pt'?'Não foi possível enviar agora. Tente novamente.':'Unable to send right now. Please try again.'):''}</div>
          </form>
        </div>
      </section>
    </main>
    <nav className={styles.sectionNav} aria-label={language==='pt'?'Navegação rápida':'Quick navigation'}>{sectionLinks.map(([id,label])=><a href={`#${id}`} className={activeSection===id?styles.activeNav:undefined} aria-label={localized(label,language)} key={id}/>)}</nav>
    <footer className={styles.footer}>{name.toUpperCase()} · {language==='pt'?'JORNALISMO DE POKER · IBITINGA, SP — BRASIL':'POKER JOURNALISM · IBITINGA, SP — BRAZIL'}</footer>
  </div>;
}
