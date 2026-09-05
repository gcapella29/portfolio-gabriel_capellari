import { Barlow_Condensed, IBM_Plex_Mono, Manrope } from 'next/font/google';
import styles from './performance-v2.module.css';
import type { TemplateRenderProps } from '../types';
import { PersonalTrainerLeadForm } from './lead-form';
import { PersonalTrainerPremiumMotion } from './premium-motion';

const displayFont=Barlow_Condensed({subsets:['latin'],weight:['600','700'],variable:'--font-pt-display',display:'swap'});
const bodyFont=Manrope({subsets:['latin'],variable:'--font-pt-body',display:'swap'});
const utilityFont=IBM_Plex_Mono({subsets:['latin'],weight:['500','600','700'],variable:'--font-pt-util',display:'swap'});
const value=(obj:Record<string,unknown>,key:string)=>String(obj[key]??'').trim();
const mediaUrl=(obj:Record<string,unknown>,key:string)=>{const item=obj[key];return item&&typeof item==='object'&&'url' in item?String((item as {url?:unknown}).url||''):''};
const lines=(v:string)=>v.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
const pairs=(v:string)=>lines(v).map(row=>{const [title,...rest]=row.split('|');return {title:title.trim(),text:rest.join('|').trim()}}).filter(x=>x.title);
const wa=(v:string)=>v?`https://wa.me/${v.replace(/\D/g,'')}`:'#contato';

export function PerformanceTrainerTemplate({project,data,preview=false}:TemplateRenderProps){
  const name=value(data.identity,'name')||project.name;
  const nameParts=name.split(/\s+/); const first=nameParts[0]||name; const last=nameParts.slice(1).join(' ')||'';
  const location=value(data.identity,'location');
  const heroTitle=value(data.content,'hero_title')||value(data.identity,'tagline')||'Treino personalizado para transformar objetivos em evolução.';
  const heroText=value(data.content,'hero_text')||value(data.identity,'description');
  const offer=value(data.content,'primary_offer');
  const proof=value(data.content,'proof');
  const about=value(data.content,'about')||value(data.identity,'description');
  const hero=mediaUrl(data.media,'hero');
  const logo=mediaUrl(data.media,'logo');
  const gallery=Array.isArray(data.media.gallery)?data.media.gallery as Array<{url?:string}>:[];
  const accent=value(data.appearance,'accent')||'#d9ff43';
  const whatsapp=value(data.contact,'whatsapp')||value(data.contact,'phone');
  const instagram=value(data.contact,'instagram');
  const cref=value(data.content,'trainer_cref');
  const specialty=value(data.content,'trainer_specialty')||'Personal Trainer';
  const services=pairs(value(data.content,'trainer_services'));
  const method=pairs(value(data.content,'trainer_method'));
  const credentials=lines(value(data.content,'trainer_credentials'));
  const scheduleTitle=value(data.content,'trainer_schedule_title')||'Vamos encontrar o melhor horário para você.';
  const scheduleText=value(data.content,'trainer_schedule_text')||'Fale sobre seu objetivo e consulte a disponibilidade atual.';
  const resultTitle=value(data.content,'trainer_results_title')||'Resultados construídos com consistência.';
  const cssVars={'--pt-accent':accent,'--pt-head-font':'var(--font-pt-display)','--pt-body-font':'var(--font-pt-body)','--pt-util-font':'var(--font-pt-util)'} as React.CSSProperties;
  const tape=[offer,'Treino individualizado','Técnica','Progressão','Consistência',proof].filter(Boolean) as string[];
  const tapeLoop=[...tape,...tape];
  const insta=instagram?(instagram.startsWith('http')?instagram:`https://instagram.com/${instagram.replace(/^@/,'')}`):'';

  return <div className={`${styles.site} ${displayFont.variable} ${bodyFont.variable} ${utilityFont.variable}`} style={cssVars} data-pt-premium-root>
    <PersonalTrainerPremiumMotion/>
    {preview&&<div className={styles.preview}>Preview do rascunho · ainda não publicado</div>}
    <header className={styles.header}>
      <a className={styles.brand} href="#inicio">{logo&&<img src={logo} alt=""/>}<span><strong>{name}</strong><small>{specialty}{cref?` · ${cref}`:''}</small></span></a>
      <nav className={styles.nav}><a href="#metodo">Método</a><a href="#resultados">Resultados</a><a href="#treinador">Treinador</a></nav>
      <a className={styles.headerCta} href="#contato">Agenda / consultar →</a>
    </header>
    <main>
      <section id="inicio" className={styles.hero}>
        <div className={`${styles.heroCopy} ${styles.reveal}`} data-pt-reveal>
          <span className={styles.eyebrow}>{specialty} / {location||'atendimento personalizado'}</span>
          <h1 className={styles.name}><span>{first}</span>{last&&<span>{last}</span>}</h1>
          <h2 className={styles.positioning}>{heroTitle}</h2>
          {heroText&&<p className={styles.heroText}>{heroText}</p>}
          <div className={styles.actions}><a className={styles.primary} href="#contato">Começar avaliação →</a><a className={styles.textLink} href="#metodo">Ver método ↓</a></div>
        </div>
        <div className={styles.heroMedia}>{hero?<img src={hero} alt={name}/>:<div className={styles.heroPlaceholder}>Imagem principal</div>}<div className={styles.measure}/><span className={styles.photoIndex}>01 / Performance</span><div className={styles.photoMeta}>{cref&&<span>{cref}</span>}<span>{specialty}</span></div></div>
      </section>

      {tape.length>0&&<section className={styles.tape} aria-label="Destaques"><div className={styles.tapeTrack}>{tapeLoop.map((item,i)=><span className={styles.tapeItem} key={`${item}-${i}`}>{item}</span>)}</div></section>}

      {services.length>0&&<section id="acompanhamento" className={`${styles.section} ${styles.light} ${styles.diagnosis}`}>
        <span className={styles.notation} aria-hidden="true">03×12</span>
        <div className={`${styles.diagnosisIntro} ${styles.reveal}`} data-pt-reveal><span className={`${styles.sectionLabel} ${styles.utility}`}>01 / Diagnóstico</span><h2 className={styles.sectionTitle}>O treino começa antes da primeira repetição.</h2>{offer&&<p>{offer}</p>}</div>
        <div className={`${styles.prescription} ${styles.reveal}`} data-pt-reveal>{services.map((item,i)=><article className={styles.service} key={`${item.title}-${i}`}><span>{String(i+1).padStart(2,'0')}</span><div><h3>{item.title}</h3>{item.text&&<p>{item.text}</p>}</div><b>{i%2===0?'foco':'meta'}</b></article>)}</div>
      </section>}

      {method.length>0&&<section id="metodo" className={`${styles.section} ${styles.dark}`}>
        <div className={`${styles.systemHead} ${styles.reveal}`} data-pt-reveal><div><span className={`${styles.sectionLabel} ${styles.utility}`}>02 / Sistema</span><h2 className={styles.sectionTitle}>Progressão que você consegue enxergar.</h2></div><p>Um acompanhamento estruturado para transformar objetivo em processo, execução e evolução consistente.</p></div>
        <div className={`${styles.progression} ${styles.reveal}`} style={{'--steps':method.length} as React.CSSProperties} data-pt-reveal>{method.map((item,i)=><article className={styles.step} key={`${item.title}-${i}`}><span>{String(i+1).padStart(2,'0')} / {String(method.length).padStart(2,'0')}</span><h3>{item.title}</h3>{item.text&&<p>{item.text}</p>}</article>)}</div>
      </section>}

      {(gallery.length>0||proof)&&<section id="resultados" className={`${styles.section} ${styles.light}`}>
        <div className={`${styles.resultsHead} ${styles.reveal}`} data-pt-reveal><div><span className={`${styles.sectionLabel} ${styles.utility}`}>03 / Evidência</span><h2 className={styles.sectionTitle}>{resultTitle}</h2></div>{proof&&<p>{proof}</p>}</div>
        {gallery.length>0?<div className={styles.mosaic}>{gallery.map((item,i)=>item?.url?<figure className={`${styles.result} ${styles.reveal}`} data-pt-reveal key={`${item.url}-${i}`}><img src={item.url} alt={`Resultado ${i+1}`}/><figcaption>Resultado / {String(i+1).padStart(2,'0')}</figcaption></figure>:null)}</div>:proof&&<p className={styles.proofOnly}>{proof}</p>}
      </section>}

      {(about||credentials.length>0||cref)&&<section id="treinador" className={`${styles.section} ${styles.light} ${styles.profile}`}>
        <div className={`${styles.profileImage} ${styles.reveal}`} data-pt-reveal>{hero?<img src={hero} alt={name}/>:<div className={styles.heroPlaceholder}>Foto do treinador</div>}<span className={styles.profileName}>{first}<br/>{last}</span></div>
        <div className={`${styles.profileCopy} ${styles.reveal}`} data-pt-reveal><span className={`${styles.sectionLabel} ${styles.utility}`}>04 / Treinador</span><h2 className={styles.sectionTitle}>{name}</h2>{about&&<p className={styles.about}>{about}</p>}<div className={styles.dossier}>{cref&&<div className={styles.dossierRow}><span>Registro</span><strong>{cref}</strong></div>}<div className={styles.dossierRow}><span>Especialidade</span><strong>{specialty}</strong></div>{location&&<div className={styles.dossierRow}><span>Atendimento</span><strong>{location}</strong></div>}</div>{credentials.length>0&&<ul className={styles.credentials}>{credentials.map((item,i)=><li key={`${item}-${i}`}>+ {item}</li>)}</ul>}</div>
      </section>}

      <section id="contato" className={`${styles.section} ${styles.intake}`}>
        <div className={`${styles.reveal}`} data-pt-reveal><span className={`${styles.sectionLabel} ${styles.utility}`}>05 / Próximo treino</span><h2 className={styles.sectionTitle}>{scheduleTitle}</h2><p>{scheduleText}</p>{whatsapp&&<a className={styles.whatsapp} href={wa(whatsapp)}>Falar direto no WhatsApp →</a>}</div>
        <div className={styles.reveal} data-pt-reveal><PersonalTrainerLeadForm projectId={project.id}/></div>
      </section>

      <section className={styles.final}><div className={styles.reveal} data-pt-reveal><span className={`${styles.sectionLabel} ${styles.utility}`}>Seu próximo nível</span><h2>Começa no próximo treino.</h2><div className={styles.finalLinks}>{whatsapp&&<a href={wa(whatsapp)}>WhatsApp ↗</a>}{insta&&<a href={insta}>Instagram ↗</a>}{location&&<span>{location}</span>}</div></div></section>
    </main>
    <footer className={styles.footer}><span>{name} / {specialty}{cref?` / ${cref}`:''}</span><span>WebAppCap</span></footer>
  </div>;
}
