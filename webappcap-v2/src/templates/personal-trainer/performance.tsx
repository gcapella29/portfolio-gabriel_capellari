import { Barlow_Condensed, IBM_Plex_Mono, Manrope } from 'next/font/google';
import styles from './performance-v2.module.css';
import type { TemplateRenderProps } from '../types';
import { PersonalTrainerLeadForm } from './lead-form';
import { PersonalTrainerPremiumMotion } from './premium-motion';
import { trainerContent } from './shared/content';

const displayFont=Barlow_Condensed({subsets:['latin'],weight:['600','700'],variable:'--font-pt-display',display:'swap'});
const bodyFont=Manrope({subsets:['latin'],variable:'--font-pt-body',display:'swap'});
const utilityFont=IBM_Plex_Mono({subsets:['latin'],weight:['500','600','700'],variable:'--font-pt-util',display:'swap'});
const value=(obj:Record<string,unknown>,key:string)=>String(obj[key]??'').trim();
const mediaUrl=(obj:Record<string,unknown>,key:string)=>{const item=obj[key];return item&&typeof item==='object'&&'url' in item?String((item as {url?:unknown}).url||''):''};
const repeatables=(obj:Record<string,unknown>,key:string)=>Array.isArray(obj[key])?(obj[key] as Array<Record<string,unknown>>).map(item=>({title:String(item.title||item.name||'').trim(),text:String(item.description||item.text||'').trim()})).filter(item=>item.title):[];
const legacyPairs=(v:string)=>v.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).map(row=>{const [title,...rest]=row.split('|');return{title:title.trim(),text:rest.join('|').trim()}}).filter(x=>x.title);
const legacyLines=(v:string)=>v.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
const wa=(v:string)=>v?`https://wa.me/${v.replace(/\D/g,'')}`:'#contato';

export function PerformanceTrainerTemplate(props:TemplateRenderProps){
 const {project,data,preview=false}=props,c=trainerContent(props),name=c.name,nameParts=name.split(/\s+/),first=nameParts[0]||name,last=nameParts.slice(1).join(' ');
 const logo=mediaUrl(data.media,'logo'),heroVideo=mediaUrl(data.media,'hero_video'),cref=value(data.content,'trainer_cref'),specialty=value(data.content,'trainer_specialty')||c.specialty;
 const services=repeatables(data.content,'services').length?repeatables(data.content,'services'):legacyPairs(value(data.content,'trainer_services'));
 const method=repeatables(data.content,'method').length?repeatables(data.content,'method'):legacyPairs(value(data.content,'trainer_method'));
 const credentials=repeatables(data.content,'credentials').length?repeatables(data.content,'credentials').map(x=>x.title):legacyLines(value(data.content,'trainer_credentials'));
 const stats=repeatables(data.content,'results').slice(0,3); const gallery=c.gallery; const accent=c.accent;
 const cssVars={'--pt-accent':accent,'--pt-head-font':'var(--font-pt-display)','--pt-body-font':'var(--font-pt-body)','--pt-util-font':'var(--font-pt-util)'} as React.CSSProperties;
 const tape=[c.offer,'Treino individualizado','Método','Progressão','Consistência',c.proof].filter(Boolean) as string[];const insta=c.instagramHref;
 return <div className={`${styles.site} ${displayFont.variable} ${bodyFont.variable} ${utilityFont.variable}`} style={cssVars} data-pt-premium-root>
  <PersonalTrainerPremiumMotion/>{preview&&<div className={styles.preview}>Preview do rascunho · ainda não publicado</div>}
  <div className={styles.topBar}><span>{locationLabel(c.location)}</span><div><a href="#metodo">Como funciona</a><a href="#resultados">Resultados</a><a href="#contato">Começar agora →</a></div></div>
  <header className={styles.header}><a className={styles.brand} href="#inicio">{logo&&<img src={logo} alt=""/>}<span><strong>{name}</strong><small>{specialty}{cref?` · ${cref}`:''}</small></span></a><nav className={styles.nav}><a href="#metodo">Método</a><a href="#resultados">Resultados</a><a href="#treinador">Treinador</a></nav><a className={styles.headerCta} href="#contato">Avaliação →</a></header>
  <main>
   <section id="inicio" className={`${styles.hero} ${heroVideo?styles.heroVideoMode:''}`}>
    <div className={styles.heroMedia}>{heroVideo?<video autoPlay muted loop playsInline poster={c.hero||undefined}><source src={heroVideo}/></video>:c.hero?<img src={c.hero} alt={name}/>:<div className={styles.heroPlaceholder}>Imagem ou vídeo principal</div>}</div>
    <div className={`${styles.heroCopy} ${styles.reveal}`} data-pt-reveal><span className={styles.eyebrow}>{specialty} / {c.location||'atendimento personalizado'}</span><h1 className={styles.positioning}>{c.heroTitle}</h1>{c.heroText&&<p className={styles.heroText}>{c.heroText}</p>}<div className={styles.actions}><a className={styles.primary} href="#contato">Começar minha jornada →</a><a className={styles.textLink} href="#metodo">Conhecer o método ↓</a></div></div>
    <div className={styles.heroSignature}><strong>{first}{last&&<> <span>{last}</span></>}</strong><small>{cref||specialty}</small></div>
   </section>
   {tape.length>0&&<section className={styles.tape} aria-label="Destaques"><div className={styles.tapeTrack}>{[...tape,...tape].map((item,i)=><span className={styles.tapeItem} key={`${item}-${i}`}>{item}</span>)}</div></section>}

   <section className={`${styles.transitionStatement} ${styles.reveal}`} data-pt-reveal><span className={styles.sectionLabel}>Performance pessoal</span><h2>Mais forte para a vida começa aqui.</h2><p>{c.offer||'Um acompanhamento estruturado, adaptado à sua rotina e orientado por evolução mensurável.'}</p></section>

   {(stats.length>0||c.proof)&&<section className={styles.proofSplit}><div className={`${styles.proofNumbers} ${styles.reveal}`} data-pt-reveal><span className={styles.sectionLabel}>Resultados mensuráveis</span>{stats.length?stats.map((item,i)=><article key={`${item.title}-${i}`}><strong>{item.title}</strong><p>{item.text}</p></article>):<article><strong>01</strong><p>{c.proof}</p></article>}</div><div className={styles.proofPhoto}>{gallery[0]?.url?<img src={gallery[0].url} alt="Resultado em destaque"/>:c.hero?<img src={c.hero} alt={name}/>:null}</div></section>}

   {services.length>0&&<section id="acompanhamento" className={`${styles.section} ${styles.light} ${styles.diagnosis}`}><div className={`${styles.diagnosisIntro} ${styles.reveal}`} data-pt-reveal><span className={styles.sectionLabel}>01 / Sistema</span><h2 className={styles.sectionTitle}>Um método completo. Adaptado a você.</h2></div><div className={`${styles.prescription} ${styles.reveal}`} data-pt-reveal>{services.map((item,i)=><article className={styles.service} key={`${item.title}-${i}`}><span>{String(i+1).padStart(2,'0')}</span><div><h3>{item.title}</h3>{item.text&&<p>{item.text}</p>}</div></article>)}</div></section>}
   {method.length>0&&<section id="metodo" className={`${styles.section} ${styles.dark}`}><div className={`${styles.systemHead} ${styles.reveal}`} data-pt-reveal><div><span className={styles.sectionLabel}>02 / Como funciona</span><h2 className={styles.sectionTitle}>Clareza. Execução. Evolução.</h2></div><p>Um processo simples de entender e rigoroso na execução.</p></div><div className={`${styles.progression} ${styles.reveal}`} style={{'--steps':method.length} as React.CSSProperties} data-pt-reveal>{method.map((item,i)=><article className={styles.step} key={`${item.title}-${i}`}><span>PASSO {String(i+1).padStart(2,'0')}</span><h3>{item.title}</h3>{item.text&&<p>{item.text}</p>}</article>)}</div></section>}
   {(gallery.length>0||c.proof)&&<section id="resultados" className={`${styles.section} ${styles.light}`}><div className={`${styles.resultsHead} ${styles.reveal}`} data-pt-reveal><div><span className={styles.sectionLabel}>03 / Histórias reais</span><h2 className={styles.sectionTitle}>{c.resultsTitle}</h2></div>{c.proof&&<p>{c.proof}</p>}</div>{gallery.length>0&&<div className={styles.mosaic}>{gallery.map((item,i)=>item?.url?<figure className={`${styles.result} ${styles.reveal}`} data-pt-reveal key={`${item.url}-${i}`}><img src={item.url} alt={`Resultado ${i+1}`}/><figcaption>Resultado / {String(i+1).padStart(2,'0')}</figcaption></figure>:null)}</div>}</section>}
   {(c.about||credentials.length||cref)&&<section id="treinador" className={`${styles.section} ${styles.light} ${styles.profile}`}><div className={`${styles.profileImage} ${styles.reveal}`} data-pt-reveal>{c.hero?<img src={c.hero} alt={name}/>:null}</div><div className={`${styles.profileCopy} ${styles.reveal}`} data-pt-reveal><span className={styles.sectionLabel}>04 / Seu treinador</span><h2 className={styles.sectionTitle}>{name}</h2>{c.about&&<p className={styles.about}>{c.about}</p>}<div className={styles.dossier}>{cref&&<div className={styles.dossierRow}><span>Registro</span><strong>{cref}</strong></div>}<div className={styles.dossierRow}><span>Especialidade</span><strong>{specialty}</strong></div>{c.location&&<div className={styles.dossierRow}><span>Atendimento</span><strong>{c.location}</strong></div>}</div>{credentials.length>0&&<ul className={styles.credentials}>{credentials.map((item,i)=><li key={`${item}-${i}`}>+ {item}</li>)}</ul>}</div></section>}
   <section id="contato" className={`${styles.section} ${styles.intake}`}><div className={styles.reveal} data-pt-reveal><span className={styles.sectionLabel}>05 / Próximo passo</span><h2 className={styles.sectionTitle}>{c.scheduleTitle}</h2><p>{c.scheduleText}</p>{c.whatsapp&&<a className={styles.whatsapp} href={wa(c.whatsapp)}>Falar no WhatsApp →</a>}</div><div className={styles.reveal} data-pt-reveal><PersonalTrainerLeadForm projectId={project.id}/></div></section>
   <section className={styles.final}><div className={styles.reveal} data-pt-reveal><span className={styles.sectionLabel}>Seu próximo nível</span><h2>Começa agora.</h2><div className={styles.finalLinks}>{c.whatsapp&&<a href={wa(c.whatsapp)}>WhatsApp ↗</a>}{insta&&<a href={insta}>Instagram ↗</a>}{c.location&&<span>{c.location}</span>}</div></div></section>
  </main><footer className={styles.footer}><span>{name} / {specialty}{cref?` / ${cref}`:''}</span><span>WebAppCap</span></footer>
 </div>;
}
function locationLabel(location:string){return location?`Personal training · ${location}`:'Personal training · acompanhamento individual'}
