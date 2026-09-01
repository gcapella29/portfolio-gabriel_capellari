import styles from './performance.module.css';
import type { TemplateRenderProps } from '../types';

const value=(obj:Record<string,unknown>,key:string)=>String(obj[key]??'').trim();
const mediaUrl=(obj:Record<string,unknown>,key:string)=>{const item=obj[key];return item&&typeof item==='object'&&'url' in item?String((item as {url?:unknown}).url||''):''};
const lines=(v:string)=>v.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
const pairs=(v:string)=>lines(v).map(row=>{const [title,...rest]=row.split('|');return {title:title.trim(),text:rest.join('|').trim()}}).filter(x=>x.title);
const wa=(v:string)=>v?`https://wa.me/${v.replace(/\D/g,'')}`:'#contato';
const font=(name:string,fallback:string)=>name?`"${name.replace(/[";]/g,'')}", ${fallback}`:fallback;

export function PerformanceTrainerTemplate({project,data,preview=false}:TemplateRenderProps){
  const name=value(data.identity,'name')||project.name;
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
  const headingFont=value(data.appearance,'heading_font')||'Montserrat';
  const bodyFont=value(data.appearance,'body_font')||'DM Sans';
  const scale=value(data.appearance,'scale')==='large'?'1.08':value(data.appearance,'scale')==='compact'?'.93':'1';
  const space=value(data.appearance,'density')==='airy'?'1.18':value(data.appearance,'density')==='compact'?'.84':'1';
  const align=['left','center','right'].includes(value(data.appearance,'alignment'))?value(data.appearance,'alignment'):'left';
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
  const cssVars={'--pt-accent':accent,'--pt-head-font':font(headingFont,'Arial, sans-serif'),'--pt-body-font':font(bodyFont,'Arial, sans-serif'),'--pt-scale':scale,'--pt-space':space,'--pt-align':align} as React.CSSProperties;

  return <div className={styles.site} style={cssVars}>
    {preview&&<div className={styles.previewBar}>Preview do rascunho · alterações ainda não publicadas</div>}
    <header className={styles.nav}><a href="#inicio" className={styles.brand}>{logo?<img src={logo} alt={name}/>:<span>{name}</span>}</a><nav><a href="#acompanhamento">Acompanhamento</a><a href="#resultados">Resultados</a><a href="#metodo">Método</a><a href="#sobre">Sobre</a></nav><a className={styles.navCta} href={wa(whatsapp)}>Consultar horários</a></header>
    <main>
      <section id="inicio" className={styles.hero}><div className={styles.heroCopy}><span className={styles.kicker}>{specialty}{location?` · ${location}`:''}</span><h1>{heroTitle}</h1>{heroText&&<p>{heroText}</p>}<div className={styles.heroActions}><a className={styles.primary} href={wa(whatsapp)}>Quero começar →</a><a className={styles.secondary} href="#resultados">Ver resultados ↓</a></div><div className={styles.meta}>{location&&<span>{location}</span>}{cref&&<span>{cref}</span>}</div></div><div className={styles.heroMedia}>{hero?<img src={hero} alt={name}/>:<div className={styles.heroPlaceholder}><span>Imagem principal</span></div>}</div></section>
      {(offer||proof)&&<section className={styles.proofStrip}>{offer&&<strong>{offer}</strong>}{proof&&<p>{proof}</p>}</section>}
      {services.length>0&&<section id="acompanhamento" className={styles.lightSection}><div className={styles.sectionHead}><span>Seu objetivo, seu plano</span><h2>Para quem é o acompanhamento</h2></div><div className={styles.cardGrid}>{services.map((item,i)=><article className={styles.serviceCard} key={`${item.title}-${i}`}><b>{String(i+1).padStart(2,'0')}</b><h3>{item.title}</h3>{item.text&&<p>{item.text}</p>}</article>)}</div></section>}
      {(gallery.length>0||proof)&&<section id="resultados" className={styles.darkSection}><div className={styles.sectionHead}><span>Prova social</span><h2>{resultTitle}</h2>{proof&&<p>{proof}</p>}</div>{gallery.length>0&&<div className={styles.gallery}>{gallery.map((item,i)=>item?.url?<figure key={`${item.url}-${i}`}><img src={item.url} alt={`Resultado ${i+1}`}/></figure>:null)}</div>}</section>}
      <section className={styles.schedule}><div><span>Agenda</span><h2>{scheduleTitle}</h2><p>{scheduleText}</p></div><a className={styles.scheduleButton} href={wa(whatsapp)}>Consultar disponibilidade →</a></section>
      {method.length>0&&<section id="metodo" className={styles.lightSection}><div className={styles.sectionHead}><span>Como funciona</span><h2>Do primeiro contato à evolução</h2></div><div className={styles.methodGrid}>{method.map((item,i)=><article key={`${item.title}-${i}`}><span>{String(i+1).padStart(2,'0')}</span><div><h3>{item.title}</h3>{item.text&&<p>{item.text}</p>}</div></article>)}</div></section>}
      {(about||credentials.length>0||cref)&&<section id="sobre" className={styles.about}><div className={styles.sectionHead}><span>Conheça seu treinador</span><h2>Por que treinar comigo?</h2></div><div className={styles.aboutGrid}><div>{about&&<p className={styles.aboutText}>{about}</p>}</div><aside>{cref&&<div className={styles.credential}><small>Registro profissional</small><strong>{cref}</strong></div>}{credentials.length>0&&<ul>{credentials.map((item,i)=><li key={`${item}-${i}`}>{item}</li>)}</ul>}</aside></div></section>}
      <section id="contato" className={styles.finalCta}><span>Próximo passo</span><h2>Pronto para começar?</h2><p>Conte seu objetivo e consulte os horários disponíveis para começar seu acompanhamento.</p><div><a className={styles.primary} href={wa(whatsapp)}>Falar no WhatsApp →</a>{instagram&&<a className={styles.secondaryDark} href={instagram.startsWith('http')?instagram:`https://instagram.com/${instagram.replace(/^@/,'')}`}>Instagram ↗</a>}</div></section>
    </main>
    <footer className={styles.footer}><strong>{name}</strong><span>{specialty}{cref?` · ${cref}`:''}</span></footer>{whatsapp&&<a className={styles.mobileCta} href={wa(whatsapp)}>Consultar horários</a>}
  </div>;
}
