import { Manrope, Space_Grotesk } from 'next/font/google';
import styles from './performance.module.css';
import fixes from './performance-fixes.module.css';
import tokens from './performance-tokens.module.css';
import type { TemplateRenderProps } from '../types';
import { PersonalTrainerLeadForm } from './lead-form';
import { PersonalTrainerPremiumMotion } from './premium-motion';

const displayFont=Space_Grotesk({subsets:['latin'],variable:'--font-pt-display',display:'swap'});
const bodyFont=Manrope({subsets:['latin'],variable:'--font-pt-body',display:'swap'});
const value=(obj:Record<string,unknown>,key:string)=>String(obj[key]??'').trim();
const mediaUrl=(obj:Record<string,unknown>,key:string)=>{const item=obj[key];return item&&typeof item==='object'&&'url' in item?String((item as {url?:unknown}).url||''):''};
const lines=(v:string)=>v.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
const pairs=(v:string)=>lines(v).map(row=>{const [title,...rest]=row.split('|');return {title:title.trim(),text:rest.join('|').trim()}}).filter(x=>x.title);
const wa=(v:string)=>v?`https://wa.me/${v.replace(/\D/g,'')}`:'#contato';

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
  const scale=value(data.appearance,'scale')==='large'?'1.08':value(data.appearance,'scale')==='compact'?'.93':'1';
  const density=['compact','normal','airy'].includes(value(data.appearance,'density'))?value(data.appearance,'density'):'normal';
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
  const cssVars={'--pt-accent':accent,'--pt-head-font':'var(--font-pt-display)','--pt-body-font':'var(--font-pt-body)','--pt-scale':scale,'--pt-align':align} as React.CSSProperties;

  return <div className={`${styles.site} ${tokens.tokens} ${fixes.premiumRoot} ${displayFont.variable} ${bodyFont.variable}`} style={cssVars} data-density={density} data-pt-premium-root>
    <PersonalTrainerPremiumMotion/>
    {preview&&<div className={styles.previewBar}>Preview do rascunho · alterações ainda não publicadas</div>}
    <header className={`${styles.nav} ${fixes.premiumNav}`}><a href="#inicio" className={styles.brand}>{logo?<img src={logo} alt={name}/>:<span>{name}</span>}</a><nav><a href="#acompanhamento">Acompanhamento</a><a href="#resultados">Resultados</a><a href="#metodo">Método</a><a href="#sobre">Sobre</a></nav><a className={`${styles.navCta} ${fixes.magneticCta}`} href={wa(whatsapp)}>Consultar horários</a></header>
    <main>
      <section id="inicio" className={`${styles.hero} ${fixes.heroPremium}`}><div className={styles.heroCopy} data-pt-reveal><span className={`${styles.kicker} ${fixes.kickerPremium}`}>{specialty}{location?` · ${location}`:''}</span><h1 className={fixes.heroSafe}>{heroTitle}</h1>{heroText&&<p>{heroText}</p>}<div className={styles.heroActions}><a className={`${styles.primary} ${fixes.magneticCta}`} href="#contato">Quero começar →</a><a className={styles.secondary} href="#resultados">Ver resultados ↓</a></div><div className={styles.meta}>{location&&<span>{location}</span>}{cref&&<span>{cref}</span>}</div></div><div className={`${styles.heroMedia} ${fixes.heroMediaPremium}`} data-pt-reveal>{hero?<img src={hero} alt={name}/>:<div className={styles.heroPlaceholder}><span>Imagem principal</span></div>}<span className={fixes.heroGlow}/></div></section>
      {(offer||proof)&&<section className={`${styles.proofStrip} ${fixes.proofPremium}`} data-pt-reveal>{offer&&<strong>{offer}</strong>}{proof&&<p>{proof}</p>}</section>}
      {services.length>0&&<section id="acompanhamento" className={`${styles.lightSection} ${fixes.sectionPremium}`} data-pt-reveal><div className={styles.sectionHead}><span>Seu objetivo, seu plano</span><h2>Para quem é o acompanhamento</h2></div><div className={styles.cardGrid}>{services.map((item,i)=><article className={`${styles.serviceCard} ${fixes.premiumCard}`} style={{'--delay':`${i*80}ms`} as React.CSSProperties} key={`${item.title}-${i}`} data-pt-reveal><b>{String(i+1).padStart(2,'0')}</b><h3>{item.title}</h3>{item.text&&<p>{item.text}</p>}</article>)}</div></section>}
      {(gallery.length>0||proof)&&<section id="resultados" className={`${styles.darkSection} ${fixes.premiumDark}`} data-pt-reveal><div className={styles.sectionHead}><span>Prova social</span><h2>{resultTitle}</h2>{proof&&<p>{proof}</p>}</div>{gallery.length>0&&<div className={`${styles.gallery} ${fixes.premiumGallery}`}>{gallery.map((item,i)=>item?.url?<figure key={`${item.url}-${i}`} data-pt-reveal><img src={item.url} alt={`Resultado ${i+1}`}/><span>Resultado {String(i+1).padStart(2,'0')}</span></figure>:null)}</div>}</section>}
      <section className={`${styles.schedule} ${fixes.scheduleSafe}`} data-pt-reveal><div><span>Agenda</span><h2>{scheduleTitle}</h2><p>{scheduleText}</p></div><a className={`${styles.scheduleButton} ${fixes.magneticCta}`} href="#contato">Consultar disponibilidade →</a></section>
      {method.length>0&&<section id="metodo" className={`${styles.lightSection} ${fixes.methodPremium}`} data-pt-reveal><div className={styles.sectionHead}><span>Como funciona</span><h2>Do primeiro contato à evolução</h2></div><div className={styles.methodGrid}>{method.map((item,i)=><article key={`${item.title}-${i}`} data-pt-reveal><span>{String(i+1).padStart(2,'0')}</span><div><h3>{item.title}</h3>{item.text&&<p>{item.text}</p>}</div></article>)}</div></section>}
      {(about||credentials.length>0||cref)&&<section id="sobre" className={`${styles.about} ${fixes.premiumAbout}`} data-pt-reveal><div className={styles.sectionHead}><span>Conheça seu treinador</span><h2>Por que treinar comigo?</h2></div><div className={styles.aboutGrid}><div>{about&&<p className={styles.aboutText}>{about}</p>}</div><aside>{cref&&<div className={`${styles.credential} ${fixes.credentialPremium}`}><small>Registro profissional</small><strong>{cref}</strong></div>}{credentials.length>0&&<ul>{credentials.map((item,i)=><li key={`${item}-${i}`}>{item}</li>)}</ul>}</aside></div></section>}
      <section id="contato" className={fixes.leadSection} data-pt-reveal><div className={fixes.leadIntro}><span>Vamos conversar</span><h2>Conte seu objetivo.</h2><p>Preencha os dados ao lado e receba o contato para combinar o melhor formato e horário para o seu acompanhamento.</p><ul className={fixes.benefits}><li><b>01</b><div><strong>Atendimento personalizado</strong><small>De acordo com seu objetivo e sua rotina.</small></div></li><li><b>02</b><div><strong>Horários flexíveis</strong><small>Encontre a melhor opção para treinar.</small></div></li><li><b>03</b><div><strong>Acompanhamento constante</strong><small>Um plano pensado para sua evolução.</small></div></li></ul>{whatsapp&&<a href={wa(whatsapp)}>Prefere WhatsApp? Fale diretamente →</a>}</div><PersonalTrainerLeadForm projectId={project.id}/></section>
      <section className={`${styles.finalCta} ${fixes.premiumFinal}`} data-pt-reveal><span>Próximo passo</span><h2>Pronto para começar?</h2><p>Seu acompanhamento pode começar por aqui. Envie seus dados ou fale diretamente pelo WhatsApp.</p><div>{whatsapp&&<a className={`${styles.primary} ${fixes.magneticCta}`} href={wa(whatsapp)}>Falar no WhatsApp →</a>}{instagram&&<a className={styles.secondaryDark} href={instagram.startsWith('http')?instagram:`https://instagram.com/${instagram.replace(/^@/,'')}`}>Instagram ↗</a>}</div></section>
    </main>
    <footer className={`${styles.footer} ${fixes.premiumFooter}`}><strong>{name}</strong><span>{specialty}{cref?` · ${cref}`:''}</span></footer>{whatsapp&&<a className={`${styles.mobileCta} ${fixes.magneticCta}`} href={wa(whatsapp)}>Consultar horários</a>}
  </div>;
}
