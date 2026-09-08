import { Barlow_Condensed, IBM_Plex_Mono, Manrope } from 'next/font/google';
import styles from './performance-v2.module.css';
import type { TemplateRenderProps } from '../types';
import { PersonalTrainerLeadForm } from './lead-form';
import { PersonalTrainerPremiumMotion } from './premium-motion';
import { trainerContent } from './shared/content';

const displayFont=Barlow_Condensed({subsets:['latin'],weight:['600','700'],variable:'--font-pt-display',display:'swap'});
const bodyFont=Manrope({subsets:['latin'],weight:['400','500','600','700'],variable:'--font-pt-body',display:'swap'});
const utilityFont=IBM_Plex_Mono({subsets:['latin'],weight:['500','600','700'],variable:'--font-pt-util',display:'swap'});
const value=(o:Record<string,unknown>,k:string)=>String(o[k]??'').trim();
const mediaUrl=(o:Record<string,unknown>,k:string)=>{const x=o[k];return x&&typeof x==='object'&&'url' in x?String((x as {url?:unknown}).url||''):''};
const items=(o:Record<string,unknown>,k:string)=>Array.isArray(o[k])?(o[k] as Array<Record<string,unknown>>).map(x=>({title:String(x.title||x.name||'').trim(),text:String(x.description||x.text||'').trim()})).filter(x=>x.title):[];
const pairs=(v:string)=>v.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).map(row=>{const [title,...rest]=row.split('|');return{title:title.trim(),text:rest.join('|').trim()}}).filter(x=>x.title);
const lines=(v:string)=>v.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
const wa=(v:string)=>v?`https://wa.me/${v.replace(/\D/g,'')}`:'#contato';

export function PerformanceTrainerTemplate(props:TemplateRenderProps){
 const {project,data,preview=false}=props,c=trainerContent(props),name=c.name;
 const logo=mediaUrl(data.media,'logo'),heroVideo=mediaUrl(data.media,'hero_video'),cref=value(data.content,'trainer_cref'),specialty=value(data.content,'trainer_specialty')||c.specialty;
 const services=items(data.content,'services').length?items(data.content,'services'):pairs(value(data.content,'trainer_services'));
 const method=items(data.content,'method').length?items(data.content,'method'):pairs(value(data.content,'trainer_method'));
 const credentials=items(data.content,'credentials').length?items(data.content,'credentials').map(x=>x.title):lines(value(data.content,'trainer_credentials'));
 const stats=items(data.content,'results').filter(x=>x.title).slice(0,4),gallery=c.gallery.filter(x=>x?.url),accent=c.accent;
 const cssVars={'--pt-accent':accent,'--pt-head-font':'var(--font-pt-display)','--pt-body-font':'var(--font-pt-body)','--pt-util-font':'var(--font-pt-util)'} as React.CSSProperties;
 const tape=[c.offer,'Treino individualizado','Método','Progressão','Consistência',c.proof].filter(Boolean) as string[];
 const featureServices=services.slice(0,4);
 return <div className={`${styles.site} ${displayFont.variable} ${bodyFont.variable} ${utilityFont.variable}`} style={cssVars} data-pt-premium-root>
  <PersonalTrainerPremiumMotion/>{preview&&<div className={styles.preview}>Preview do rascunho</div>}
  <div className={styles.topBar}><span>{c.location?`Personal training · ${c.location}`:'Personal training · acompanhamento individual'}</span><div><a href="#metodo">Método</a><a href="#resultados">Resultados</a><a className={styles.topAction} href="#contato">Começar agora</a></div></div>
  <header className={styles.header}><a className={styles.brand} href="#inicio">{logo&&<img src={logo} alt=""/>}<span><strong>{name}</strong><small>{specialty}{cref?` · ${cref}`:''}</small></span></a><nav className={styles.nav}><a href="#sistema">Sistema</a><a href="#metodo">Método</a><a href="#resultados">Resultados</a><a href="#treinador">Sobre</a></nav><a className={styles.headerCta} href="#contato">Quero começar →</a></header>
  <main>
   <section id="inicio" className={styles.hero}>
    <div className={styles.heroMedia}>{heroVideo?<video autoPlay muted loop playsInline poster={c.hero||undefined}><source src={heroVideo}/></video>:c.hero?<img src={c.hero} alt={name}/>:<div className={styles.heroPlaceholder}>Imagem ou vídeo principal</div>}</div>
    <div className={styles.heroShade}/><div className={`${styles.heroCopy} ${styles.reveal}`} data-pt-reveal><span className={styles.eyebrow}>{specialty}</span><h1>{c.heroTitle}</h1>{c.heroText&&<p>{c.heroText}</p>}<a className={styles.primary} href="#contato">Começar minha jornada <b>↗</b></a></div>
    <div className={styles.heroFoot}><span>{cref||'Acompanhamento personalizado'}</span><a href="#sistema">Descobrir o método ↓</a></div>
   </section>
   {tape.length>0&&<div className={styles.tape}><div className={styles.tapeTrack}>{[...tape,...tape].map((x,i)=><span key={`${x}-${i}`}>{x}</span>)}</div></div>}

   <section id="sistema" className={styles.intro}><div className={`${styles.introLead} ${styles.reveal}`} data-pt-reveal><span className={styles.sectionLabel}>Um sistema feito para você</span><h2>Mais forte.<br/>Por mais tempo.</h2></div><div className={`${styles.introBody} ${styles.reveal}`} data-pt-reveal><h3>Método comprovado, adaptado ao indivíduo.</h3><p>{c.offer||c.about||'Treino estruturado, acompanhamento próximo e decisões guiadas pela sua evolução.'}</p></div></section>

   {(stats.length>0||gallery[0]?.url)&&<section className={styles.evidence}><div className={styles.evidenceMedia}>{gallery[0]?.url?<img src={gallery[0].url} alt="Acompanhamento e evolução"/>:c.hero&&<img src={c.hero} alt={name}/>}</div>{stats.length>0&&<div className={styles.evidenceStats}><span className={styles.sectionLabel}>Prova em números</span>{stats.map((x,i)=><article className={styles.reveal} data-pt-reveal key={`${x.title}-${i}`}><strong>{x.title}</strong>{x.text&&<p>{x.text}</p>}</article>)}</div>}</section>}

   {featureServices.length>0&&<section className={styles.features}>{featureServices.map((item,i)=>{const photo=gallery[(i+1)%Math.max(gallery.length,1)]?.url;return <article className={styles.feature} key={`${item.title}-${i}`}><div className={`${styles.featureCopy} ${styles.reveal}`} data-pt-reveal><span className={styles.sectionLabel}>{String(i+1).padStart(2,'0')} / Sistema</span><h2>{item.title}</h2>{item.text&&<p>{item.text}</p>}<a href="#metodo">Conheça o processo <b>↗</b></a></div><div className={styles.featureMedia}>{photo?<img src={photo} alt=""/>:c.hero&&<img src={c.hero} alt=""/>}</div></article>})}</section>}

   {c.proof&&<section className={styles.quote}><span className={styles.sectionLabel}>O que guia o trabalho</span><blockquote>“{c.proof}”</blockquote></section>}

   {(gallery.length>1||stats.length>0)&&<section id="resultados" className={styles.results}><div className={`${styles.resultsIntro} ${styles.reveal}`} data-pt-reveal><span className={styles.sectionLabel}>Histórias reais</span><h2>{c.resultsTitle}</h2><p>Resultados não acontecem por acaso. São consequência de método, execução e consistência.</p></div>{gallery.length>1&&<div className={styles.resultsRail}>{gallery.slice(1).map((x,i)=><figure key={`${x.url}-${i}`}><img src={x.url} alt={`Resultado ${i+1}`}/><figcaption><span>Resultado</span><strong>{String(i+1).padStart(2,'0')}</strong></figcaption></figure>)}</div>}</section>}

   {method.length>0&&<section id="metodo" className={styles.method}><div className={`${styles.methodIntro} ${styles.reveal}`} data-pt-reveal><span className={styles.sectionLabel}>O método</span><h2>Clareza em cada etapa.</h2><p>Um processo simples de entender, individual na aplicação e rigoroso na execução.</p></div><div className={styles.methodList}>{method.map((x,i)=><article className={styles.reveal} data-pt-reveal key={`${x.title}-${i}`}><span>{String(i+1).padStart(2,'0')}</span><h3>{x.title}</h3>{x.text&&<p>{x.text}</p>}</article>)}</div></section>}

   {(c.about||credentials.length||cref)&&<section id="treinador" className={styles.trainer}><div className={styles.trainerMedia}>{c.hero&&<img src={c.hero} alt={name}/>}</div><div className={`${styles.trainerCopy} ${styles.reveal}`} data-pt-reveal><span className={styles.sectionLabel}>Seu treinador</span><h2>{name}</h2>{c.about&&<p className={styles.about}>{c.about}</p>}<dl>{cref&&<><dt>Registro</dt><dd>{cref}</dd></>}<dt>Especialidade</dt><dd>{specialty}</dd>{c.location&&<><dt>Atendimento</dt><dd>{c.location}</dd></>}</dl>{credentials.length>0&&<ul>{credentials.map((x,i)=><li key={`${x}-${i}`}>{x}</li>)}</ul>}</div></section>}

   <section id="contato" className={styles.contact}><div className={`${styles.contactPitch} ${styles.reveal}`} data-pt-reveal><span className={styles.sectionLabel}>Seu próximo passo</span><h2>{c.scheduleTitle}</h2><p>{c.scheduleText}</p>{c.whatsapp&&<a href={wa(c.whatsapp)}>Falar no WhatsApp ↗</a>}</div><div className={`${styles.formWrap} ${styles.reveal}`} data-pt-reveal><PersonalTrainerLeadForm projectId={project.id}/></div></section>
   <section className={styles.final}><span>Pronto para evoluir?</span><h2>Começa<br/>agora.</h2><div>{c.whatsapp&&<a href={wa(c.whatsapp)}>WhatsApp ↗</a>}{c.instagramHref&&<a href={c.instagramHref}>Instagram ↗</a>}</div></section>
  </main><footer className={styles.footer}><span>{name} · {specialty}</span><span>WebAppCap</span></footer>
 </div>;
}
