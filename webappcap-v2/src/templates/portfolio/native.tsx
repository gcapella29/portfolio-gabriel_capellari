'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import type { TemplateRenderProps } from '../types';
import { portfolioDefaults as defaults, type LocalizedText } from './native-data';
import styles from './native.module.css';

type Language='pt'|'en';
const localized=(item:LocalizedText,language:Language)=>item[language];
const stringValue=(record:Record<string,unknown>,key:string,fallback:string)=>String(record[key]??'').trim()||fallback;
const mediaValue=(record:Record<string,unknown>,key:string,fallback:string)=>{const item=record[key];return item&&typeof item==='object'&&'url' in item?String((item as {url?:unknown}).url||fallback):fallback};

export function NativePortfolioTemplate({project,data,preview=false}:TemplateRenderProps){
  const [language,setLanguage]=useState<Language>('pt');
  const [slide,setSlide]=useState(0);
  const name=stringValue(data.identity,'name',project.name||defaults.identity.name);
  const location=stringValue(data.identity,'location',defaults.identity.location);
  const hero=mediaValue(data.media,'hero',defaults.media.hero);
  const instagram=stringValue(data.contact,'instagram',defaults.contact.instagram).replace(/^@/,'');
  const email=stringValue(data.contact,'email',defaults.contact.email);
  const whatsapp=stringValue(data.contact,'whatsapp',defaults.contact.whatsapp).replace(/\D/g,'');
  const gallery=useMemo(()=>{const custom=Array.isArray(data.media.gallery)?data.media.gallery.map(item=>item&&typeof item==='object'&&'url' in item?String((item as {url?:unknown}).url||''):'').filter(Boolean):[];return custom.length?custom:defaults.media.wsop},[data.media.gallery]);

  useEffect(()=>{const stored=window.localStorage.getItem('portfolio-language');if(stored==='en')setLanguage('en')},[]);
  useEffect(()=>{if(gallery.length<2)return;const timer=window.setInterval(()=>setSlide(current=>(current+1)%gallery.length),10000);return()=>window.clearInterval(timer)},[gallery.length]);
  const chooseLanguage=(next:Language)=>{setLanguage(next);window.localStorage.setItem('portfolio-language',next)};
  const moveSlide=(direction:number)=>setSlide(current=>(current+direction+gallery.length)%gallery.length);
  const share=async()=>{const payload={title:`${name} — ${language==='pt'?'Jornalista de Poker':'Poker Journalist'}`,text:language==='pt'?'Portfólio profissional de Gabriel Capellari.':'Gabriel Capellari professional portfolio.',url:window.location.href};if(navigator.share){try{await navigator.share(payload);return}catch(error){if(error instanceof DOMException&&error.name==='AbortError')return}}await navigator.clipboard.writeText(window.location.href)};

  return <div className={styles.site} data-language={language}>
    {preview?<div className={styles.preview}>Preview nativo · ainda não publicado</div>:null}
    <a className={styles.skip} href="#sobre">{language==='pt'?'Pular para o conteúdo':'Skip to content'}</a>
    <header className={styles.hero} id="inicio" style={{backgroundImage:`linear-gradient(180deg,rgba(8,39,32,.46),rgba(8,39,32,.9)),url(${hero})`}}>
      <div className={styles.heroTop}>
        <div className={styles.language} role="group" aria-label="Idioma / Language"><button type="button" aria-pressed={language==='pt'} onClick={()=>chooseLanguage('pt')}>🇧🇷</button><button type="button" aria-pressed={language==='en'} onClick={()=>chooseLanguage('en')}>🇬🇧</button></div>
        <span>{location}</span>
      </div>
      <div className={styles.heroCopy}><h1>{name.split(' ')[0]}<br/><em>{name.split(' ').slice(1).join(' ')}</em></h1><p>{localized(defaults.identity.role,language)}</p><div className={styles.chips}>{defaults.identity.languages.map(item=><span key={item.pt}>{localized(item,language)}</span>)}</div><div className={styles.actions}><a className={styles.primary} href="#portfolio">{language==='pt'?'Ver meu trabalho ↘':'View my work ↘'}</a><a href="#contato">{language==='pt'?'Entrar em contato →':'Get in touch →'}</a><a href={defaults.contact.cv} download>{language==='pt'?'Baixar CV ↓':'Download CV ↓'}</a><button type="button" onClick={share}>{language==='pt'?'Compartilhar ↗':'Share ↗'}</button></div></div>
    </header>

    <div className={styles.ticker} aria-hidden="true"><div>{[...defaults.ticker,...defaults.ticker].map((item,index)=><span key={`${item}-${index}`}>{item} ◆</span>)}</div></div>

    <main>
      <section className={styles.stats} aria-label={language==='pt'?'Destaques':'Highlights'}>{defaults.stats.map(item=><article key={item.number+item.label.pt}><strong>{item.number}</strong><span>{localized(item.label,language)}</span></article>)}</section>

      <section className={`${styles.section} ${styles.about}`} id="sobre"><div className={styles.photo}><Image src={defaults.media.about} alt={name} fill sizes="(max-width: 820px) 100vw, 45vw"/></div><div><span className={styles.eyebrow}>{localized(defaults.about.eyebrow,language)}</span><h2>{localized(defaults.about.title,language)}</h2>{defaults.about.paragraphs.map(paragraph=><p key={paragraph.pt}>{localized(paragraph,language)}</p>)}</div></section>

      <section className={`${styles.section} ${styles.featured}`}><div className={styles.carousel} tabIndex={0} onKeyDown={event=>{if(event.key==='ArrowLeft')moveSlide(-1);if(event.key==='ArrowRight')moveSlide(1)}}>{gallery.map((src,index)=><figure className={index===slide?styles.activeSlide:styles.slide} key={src}><Image src={src} alt={`${name} — WSOP ${2022+Math.min(index,3)}`} fill sizes="(max-width: 820px) 100vw, 50vw"/><figcaption>{2022+Math.min(index,3)} · WSOP Las Vegas</figcaption></figure>)}<button className={styles.previous} type="button" onClick={()=>moveSlide(-1)} aria-label={language==='pt'?'Foto anterior':'Previous photo'}>←</button><button className={styles.next} type="button" onClick={()=>moveSlide(1)} aria-label={language==='pt'?'Próxima foto':'Next photo'}>→</button><div className={styles.counter}>{String(slide+1).padStart(2,'0')} / {String(gallery.length).padStart(2,'0')}</div></div><div className={styles.featuredCopy}><span className={styles.eyebrow}>{localized(defaults.featured.eyebrow,language)}</span><h2>{defaults.featured.title}</h2><p>{localized(defaults.featured.description,language)}</p><div className={styles.yearList}>{defaults.featured.years.map(year=><span key={year}>{year}</span>)}</div></div></section>

      <section className={`${styles.section} ${styles.coverage}`}><header><span className={styles.eyebrow}>{language==='pt'?'Painel de cobertura':'Coverage board'}</span><h2>{language==='pt'?'Torneios cobertos':'Tournaments covered'}</h2></header><div className={styles.board}>{defaults.coverage.map(([event,years])=><div key={event}><strong>{event}</strong><span>{years}</span></div>)}</div></section>

      <section className={`${styles.section} ${styles.portfolio}`} id="portfolio"><header><span className={styles.eyebrow}>{language==='pt'?'Onde ler':'Where to read'}</span><h2>{language==='pt'?'Portfólio publicado':'Published portfolio'}</h2></header><div className={styles.profile}><div className={styles.profilePhoto}><Image src={defaults.media.profile} alt={name} fill sizes="220px"/></div><div><h3>{name}</h3><p>{language==='pt'?'Formado em Letras (Português/Inglês), sempre fui apaixonado por esportes e comunicação. Através das palavras, encontrei uma forma de contar histórias, aproximar pessoas e transformar experiências em conexão.':'With a degree in Languages (Portuguese/English), I have always been passionate about sports and communication. Through words, I found a way to tell stories, bring people together and turn experiences into connection.'}</p><a href={`https://instagram.com/${instagram}`} target="_blank" rel="noreferrer">Instagram</a><a href={defaults.contact.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></div></div><div className={styles.pressCards}>{defaults.links.map(item=><a href={item.href} target="_blank" rel="noreferrer" key={item.name}><span><strong>{item.name}</strong><small>{localized(item.description,language)}</small></span><b>→</b></a>)}</div></section>

      <section className={`${styles.section} ${styles.experience}`}><header><span className={styles.eyebrow}>{language==='pt'?'Histórico de mãos':'Hand history'}</span><h2>{language==='pt'?'Experiência profissional':'Professional experience'}</h2></header><div className={styles.timeline}>{defaults.career.map(item=><article key={`${item.organization}-${item.years}`}><div><h3>{localized(item.role,language)}</h3><time>{item.years}</time></div><strong>{item.organization}</strong><p>{localized(item.description,language)}</p></article>)}</div></section>

      <section className={`${styles.section} ${styles.education}`}><header><span className={styles.eyebrow}>{language==='pt'?'Fundamentos':'Foundations'}</span><h2>{language==='pt'?'Formação & ferramentas':'Education & tools'}</h2></header><div className={styles.educationGrid}><div>{defaults.education.map(([degree,institution])=><article key={degree}><strong>{degree}</strong><span>{institution}</span></article>)}</div><div className={styles.skillStack}>{defaults.skills.map((skill,index)=><span className={index===0?styles.highlightSkill:''} key={skill}>{skill}</span>)}</div></div></section>

      <section className={`${styles.section} ${styles.instagram}`}><div><span className={styles.eyebrow}>{language==='pt'?'Bastidores':'Behind the scenes'}</span><h2>{language==='pt'?'Também no Instagram':'Also on Instagram'}</h2><p>{language==='pt'?'Bastidores de mesa final, viagens de cobertura e o dia a dia da vida de repórter — tudo por lá.':'Final-table behind the scenes, reporting trips and everyday reporter life — all there.'}</p><a href={`https://instagram.com/${instagram}`} target="_blank" rel="noreferrer">@{instagram} →</a></div><iframe src={defaults.contact.reel} title={`Instagram — ${name}`} loading="lazy"/></section>

      <section className={`${styles.section} ${styles.contact}`} id="contato"><div><h2>{language==='pt'?'Contato':'Contact'}</h2><div className={styles.contactLinks}><a href={defaults.contact.cv} download><span>{language==='pt'?'Currículo':'CV'}</span>{language==='pt'?'Baixar CV em PDF ↓':'Download CV as PDF ↓'}</a><button type="button" onClick={share}><span>{language==='pt'?'Portfólio':'Portfolio'}</span>{language==='pt'?'Compartilhar ↗':'Share ↗'}</button><a href={`mailto:${email}`}><span>E-mail</span>{email}</a><a href={`mailto:${defaults.contact.emailAlt}`}><span>{language==='pt'?'E-mail alternativo':'Alternative email'}</span>{defaults.contact.emailAlt}</a><a href={`https://wa.me/${whatsapp}`}><span>WhatsApp</span>{defaults.contact.whatsappLabel}</a><a href={defaults.contact.linkedin} target="_blank" rel="noreferrer"><span>LinkedIn</span>{language==='pt'?'Ver perfil →':'View profile →'}</a></div></div><div className={styles.contactPhoto}><Image src={defaults.media.contact} alt={name} fill sizes="(max-width: 820px) 100vw, 45vw"/></div></section>
    </main>
    <footer className={styles.footer}>{name.toUpperCase()} · {language==='pt'?'JORNALISMO DE POKER · IBITINGA, SP — BRASIL':'POKER JOURNALISM · IBITINGA, SP — BRAZIL'}</footer>
  </div>;
}
