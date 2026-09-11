import { Archivo_Black, Space_Grotesk } from 'next/font/google';
import type { TemplateRenderProps } from '../types';
import { PersonalTrainerLeadForm } from './lead-form';
import styles from './velocity.module.css';

const display=Archivo_Black({subsets:['latin'],weight:'400',variable:'--velocity-display',display:'swap'});
const body=Space_Grotesk({subsets:['latin'],weight:['400','500','600','700'],variable:'--velocity-body',display:'swap'});
const value=(o:Record<string,unknown>,k:string)=>String(o[k]??'').trim();
const media=(o:Record<string,unknown>,k:string)=>{const x=o[k];return x&&typeof x==='object'&&'url' in x?String((x as {url?:unknown}).url||''):''};
const rows=(v:string)=>v.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).map(x=>{const [title,...rest]=x.split('|');return {title:title.trim(),text:rest.join('|').trim()}});
const wa=(v:string)=>`https://wa.me/${v.replace(/\D/g,'')}`;

export function VelocityTrainerTemplate({project,data,preview=false}:TemplateRenderProps){
 const name=value(data.identity,'name')||project.name, location=value(data.identity,'location');
 const specialty=value(data.content,'trainer_specialty')||'Personal Trainer', cref=value(data.content,'trainer_cref');
 const title=value(data.content,'hero_title')||value(data.identity,'tagline')||'Mais forte. Mais rápido. Mais você.';
 const text=value(data.content,'hero_text')||value(data.identity,'description'); const offer=value(data.content,'primary_offer');
 const proof=value(data.content,'proof'); const about=value(data.content,'about')||value(data.identity,'description');
 const services=rows(value(data.content,'trainer_services')), method=rows(value(data.content,'trainer_method'));
 const hero=media(data.media,'hero'); const gallery=Array.isArray(data.media.gallery)?data.media.gallery as Array<{url?:string}>:[];
 const phone=value(data.contact,'whatsapp')||value(data.contact,'phone'); const instagram=value(data.contact,'instagram');
 const accent=value(data.appearance,'accent')||'#ff4d00';
 const insta=instagram?(instagram.startsWith('http')?instagram:`https://instagram.com/${instagram.replace(/^@/,'')}`):'';
 const ticker=[specialty,offer,'Força','Mobilidade','Performance',proof].filter(Boolean) as string[];
 return <div className={`${styles.site} ${display.variable} ${body.variable}`} style={{'--velocity-accent':accent} as React.CSSProperties}>
  {preview&&<div className={styles.preview}>PREVIEW · RASCUNHO NÃO PUBLICADO</div>}
  <header><a className={styles.logo} href="#inicio">{name}</a><nav><a href="#treino">TREINO</a><a href="#resultados">RESULTADOS</a><a href="#coach">COACH</a></nav><a className={styles.cta} href="#contato">COMEÇAR ↗</a></header>
  <main>
   <section id="inicio" className={styles.hero}><div className={styles.heroPhoto}>{hero?<img src={hero} alt={name}/>:<div className={styles.placeholder}>FOTO / PERFORMANCE</div>}</div><div className={styles.overlay}/><div className={styles.heroCopy}><span>{specialty} / {location||'TREINO PERSONALIZADO'}</span><h1>{title}</h1>{text&&<p>{text}</p>}<a href="#contato">QUERO EVOLUIR <b>→</b></a></div><div className={styles.heroMeta}><span>{cref||'TREINO INDIVIDUAL'}</span><span>SCROLL ↓</span></div></section>
   {ticker.length>0&&<div className={styles.ticker}><div>{[...ticker,...ticker].map((x,i)=><span key={i}>{x} ◆</span>)}</div></div>}
   {services.length>0&&<section id="treino" className={styles.services}><div className={styles.bigLabel}>TREINO</div><div className={styles.servicesIntro}><span>01 / O PLANO</span><h2>SEM TREINO GENÉRICO.</h2><p>{offer||'Cada sessão existe por um motivo. Cada fase prepara a próxima.'}</p></div><div className={styles.cards}>{services.map((s,i)=><article key={i}><b>0{i+1}</b><h3>{s.title}</h3><p>{s.text}</p><span>↗</span></article>)}</div></section>}
   {method.length>0&&<section className={styles.protocol}><div><span>02 / PROTOCOLO</span><h2>PROCESSO<br/>VENCE<br/><i>PRESSA.</i></h2></div><div className={styles.steps}>{method.map((m,i)=><article key={i}><b>{String(i+1).padStart(2,'0')}</b><div><h3>{m.title}</h3><p>{m.text}</p></div></article>)}</div></section>}
   {(gallery.length>0||proof)&&<section id="resultados" className={styles.results}><div className={styles.resultsTitle}><span>03 / PROVA</span><h2>{value(data.content,'trainer_results_title')||'O TRABALHO APARECE.'}</h2>{proof&&<p>{proof}</p>}</div>{gallery.length>0&&<div className={styles.gallery}>{gallery.slice(0,5).map((g,i)=>g.url?<figure key={i}><img src={g.url} alt={`Resultado ${i+1}`}/><figcaption>0{i+1} / RESULTADO</figcaption></figure>:null)}</div>}</section>}
   <section id="coach" className={styles.coach}><div className={styles.coachPhoto}>{hero&&<img src={hero} alt={name}/>}<strong>COACH</strong></div><div className={styles.coachCopy}><span>04 / QUEM TE ACOMPANHA</span><h2>{name}</h2><p>{about}</p><div className={styles.facts}>{cref&&<div><small>REGISTRO</small><b>{cref}</b></div>}<div><small>FOCO</small><b>{specialty}</b></div>{location&&<div><small>BASE</small><b>{location}</b></div>}</div></div></section>
   <section id="contato" className={styles.contact}><div><span>05 / START</span><h2>{value(data.content,'trainer_schedule_title')||'PRONTO PARA O PRÓXIMO NÍVEL?'}</h2><p>{value(data.content,'trainer_schedule_text')||'Envie seu objetivo. O próximo passo é transformar intenção em plano.'}</p>{phone&&<a href={wa(phone)}>WHATSAPP ↗</a>}{insta&&<a href={insta}>INSTAGRAM ↗</a>}</div><div className={styles.form}><PersonalTrainerLeadForm projectId={project.id}/></div></section>
  </main>
  <footer><span>{name} / {specialty}</span><b>WEBAPPCAP / PERFORMANCE SYSTEM</b></footer>
 </div>;
}
