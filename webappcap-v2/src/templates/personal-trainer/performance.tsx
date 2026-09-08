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
const DEMO_SERVICES=[
 {title:'Treino de precisão',text:'Sessões planejadas para o seu objetivo, nível atual e rotina — sem exercícios aleatórios ou tempo desperdiçado.'},
 {title:'Estratégia construída para você',text:'Planejamento individual, progressão clara e ajustes contínuos conforme sua resposta ao treinamento.'},
 {title:'Coaching e responsabilidade',text:'Acompanhamento próximo para transformar execução, consistência e decisões diárias em progresso sustentável.'},
 {title:'Evolução guiada por dados',text:'Indicadores simples e objetivos ajudam a identificar o que funciona e quando é hora de ajustar o plano.'}
];
const DEMO_METHOD=[
 {title:'Avaliação inicial',text:'Entendemos objetivos, histórico, rotina, limitações e o ponto de partida antes de definir o caminho.'},
 {title:'Plano individual',text:'Treino, frequência e prioridades são organizados em uma estratégia compatível com a sua vida.'},
 {title:'Execução com propósito',text:'Cada sessão tem função clara e cada etapa prepara a próxima, com técnica e intensidade adequadas.'},
 {title:'Acompanhamento contínuo',text:'A evolução é revisada regularmente e o plano muda quando os dados e a resposta do corpo pedem.'}
];
const DEMO_STATS=[
 {title:'10+ anos',text:'de experiência com treinamento individualizado'},
 {title:'100%',text:'planejamento adaptado ao aluno'},
 {title:'1:1',text:'atenção individual durante o acompanhamento'}
];
const DEMO_SCHEDULE=[
 {day:'Seg',hours:'06:00 — 20:00',open:true},
 {day:'Ter',hours:'06:00 — 20:00',open:true},
 {day:'Qua',hours:'06:00 — 20:00',open:true},
 {day:'Qui',hours:'06:00 — 20:00',open:true},
 {day:'Sex',hours:'06:00 — 18:00',open:true},
 {day:'Sáb',hours:'08:00 — 12:00',open:true},
 {day:'Dom',hours:'Fechado',open:false}
];

export function PerformanceTrainerTemplate(props:TemplateRenderProps){
 const {project,data,preview=false}=props,c=trainerContent(props),name=c.name;
 const logo=mediaUrl(data.media,'logo'),heroVideo=mediaUrl(data.media,'hero_video'),cref=value(data.content,'trainer_cref'),specialty=value(data.content,'trainer_specialty')||c.specialty;
 const rawServices=items(data.content,'services').length?items(data.content,'services'):pairs(value(data.content,'trainer_services'));
 const rawMethod=items(data.content,'method').length?items(data.content,'method'):pairs(value(data.content,'trainer_method'));
 const services=(rawServices.length?rawServices:DEMO_SERVICES).slice(0,4);
 const method=rawMethod.length?rawMethod:DEMO_METHOD;
 const credentials=items(data.content,'credentials').length?items(data.content,'credentials').map(x=>x.title):lines(value(data.content,'trainer_credentials'));
 const realStats=items(data.content,'results').filter(x=>x.title).slice(0,4),stats=realStats.length?realStats:DEMO_STATS;
 const gallery=c.gallery.filter(x=>x?.url),accent=c.accent;
 const mediaPool=[...gallery.map(x=>x.url).filter(Boolean),c.hero].filter(Boolean) as string[];
 const photo=(index:number)=>mediaPool.length?mediaPool[index%mediaPool.length]:'';
 const cssVars={'--pt-accent':accent,'--pt-head-font':'var(--font-pt-display)','--pt-body-font':'var(--font-pt-body)','--pt-util-font':'var(--font-pt-util)'} as React.CSSProperties;
 const tape=['Treino individualizado','Força','Composição corporal','Progressão','Consistência','Acompanhamento'].filter(Boolean);
 const resultStories=(gallery.length>1?gallery.slice(1,5):[{url:c.hero},{url:c.hero},{url:c.hero}]).filter(x=>x?.url);
 return <div className={`${styles.site} ${displayFont.variable} ${bodyFont.variable} ${utilityFont.variable}`} style={cssVars} data-pt-premium-root>
  <PersonalTrainerPremiumMotion/>{preview&&<div className={styles.preview}>Preview do rascunho</div>}
  <div className={styles.topBar}><span>{c.location?`Personal training · ${c.location}`:'Personal training · acompanhamento individual'}</span><div><a href="#metodo">Método</a><a href="#resultados">Resultados</a><a className={styles.topAction} href="#contato">Começar agora</a></div></div>
  <header className={styles.header}><a className={styles.brand} href="#inicio">{logo&&<img src={logo} alt=""/>}<span><strong>{name}</strong><small>{specialty}{cref?` · ${cref}`:''}</small></span></a><nav className={styles.nav}><a href="#sistema">Sistema</a><a href="#metodo">Método</a><a href="#resultados">Resultados</a><a href="#treinador">Sobre</a></nav><a className={styles.headerCta} href="#contato">Começar →</a></header>
  <main>
   <section id="inicio" className={styles.hero}>
    <div className={styles.heroMedia}>{heroVideo?<video autoPlay muted loop playsInline preload="metadata" poster={c.hero||undefined}><source src={heroVideo}/></video>:c.hero?<img src={c.hero} alt={name}/>:<div className={styles.heroPlaceholder}>Imagem ou vídeo principal</div>}</div>
    <div className={styles.heroShade}/><div className={`${styles.heroCopy} ${styles.reveal}`} data-pt-reveal><span className={styles.eyebrow}>{specialty}</span><h1>{c.heroTitle||'Seu melhor resultado começa com um plano melhor.'}</h1><p>{c.heroText||'Treino preciso, acompanhamento próximo e evolução construída para durar.'}</p><a className={styles.primary} href="#contato">Começar minha jornada <b>→</b></a></div>
    <div className={styles.heroFoot}><span>{cref||'Acompanhamento personalizado'}</span><a href="#sistema">Conheça o sistema ↓</a></div>
   </section>
   <div className={styles.tape}><div className={styles.tapeTrack}>{[...tape,...tape].map((x,i)=><span key={`${x}-${i}`}>{x}</span>)}</div></div>

   <section id="sistema" className={styles.intro}><div className={`${styles.introLead} ${styles.reveal}`} data-pt-reveal><span className={styles.sectionLabel}>Mais do que sessões</span><h2>Mais forte.<br/>Para a vida.</h2></div><div className={`${styles.introBody} ${styles.reveal}`} data-pt-reveal><h3>Método comprovado. Aplicação individual.</h3><p>{c.offer||'Construa força, melhore sua composição corporal e evolua com um sistema claro, individual e acompanhado de perto.'}</p></div></section>

   <section className={styles.evidence}><div className={styles.evidenceMedia}>{photo(0)?<img src={photo(0)} alt="Treinamento individualizado"/>:<div className={styles.heroPlaceholder}>Foto de treino</div>}</div><div className={styles.evidenceStats}><span className={styles.sectionLabel}>{realStats.length?'Resultados em números':'Demonstração do layout'}</span>{stats.map((x,i)=><article className={styles.reveal} data-pt-reveal key={`${x.title}-${i}`}><strong>{x.title}</strong><p>{x.text}</p></article>)}</div></section>

   <section className={styles.features}>{services.map((item,i)=><article className={styles.feature} key={`${item.title}-${i}`}><div className={`${styles.featureCopy} ${styles.reveal}`} data-pt-reveal><span className={styles.sectionLabel}>{String(i+1).padStart(2,'0')} / O que você recebe</span><h2>{item.title}</h2><p>{item.text}</p><a href="#metodo">Entender o método <b>→</b></a></div><div className={styles.featureMedia}>{photo(i+1)?<img src={photo(i+1)} alt=""/>:<div className={styles.heroPlaceholder}>Foto do serviço</div>}</div></article>)}</section>

   <section className={styles.quote}><span className={styles.sectionLabel}>A diferença</span><blockquote>“{c.proof||'O objetivo não é apenas treinar mais. É saber exatamente o que fazer, por que fazer e como continuar evoluindo.'}”</blockquote></section>

   <section id="resultados" className={styles.results}><div className={`${styles.resultsIntro} ${styles.reveal}`} data-pt-reveal><span className={styles.sectionLabel}>Histórias de evolução</span><h2>{c.resultsTitle||'Pessoas reais. Evolução real.'}</h2><p>Resultados duradouros são consequência de um processo bem executado, acompanhado e ajustado com consistência.</p></div><div className={styles.resultsRail}>{resultStories.map((x,i)=><figure key={`${x.url}-${i}`}><img src={String(x.url)} alt={`História de evolução ${i+1}`}/><figcaption><span>{gallery.length>1?'Evolução real':'Conteúdo demonstrativo'}</span><strong>{String(i+1).padStart(2,'0')}</strong></figcaption></figure>)}</div></section>

   <section id="metodo" className={styles.method}><div className={`${styles.methodIntro} ${styles.reveal}`} data-pt-reveal><span className={styles.sectionLabel}>Como funciona</span><h2>Um sistema.<br/>Sem achismo.</h2><p>Você sabe onde está, qual é o próximo passo e por que cada decisão faz parte do processo.</p></div><div className={styles.methodList}>{method.map((x,i)=><article className={styles.reveal} data-pt-reveal key={`${x.title}-${i}`}><span>Etapa {String(i+1).padStart(2,'0')}</span><h3>{x.title}</h3><p>{x.text}</p></article>)}</div></section>

   {(c.about||credentials.length||cref)&&<section id="treinador" className={styles.trainer}><div className={styles.trainerMedia}>{photo(2)&&<img src={photo(2)} alt={name}/>}</div><div className={`${styles.trainerCopy} ${styles.reveal}`} data-pt-reveal><span className={styles.sectionLabel}>Seu treinador</span><h2>{name}</h2><p className={styles.about}>{c.about||'Acompanhamento individual para transformar objetivos em um processo claro, consistente e sustentável.'}</p><dl>{cref&&<><dt>Registro</dt><dd>{cref}</dd></>}<dt>Especialidade</dt><dd>{specialty}</dd>{c.location&&<><dt>Atendimento</dt><dd>{c.location}</dd></>}</dl>{credentials.length>0&&<ul>{credentials.map((x,i)=><li key={`${x}-${i}`}>{x}</li>)}</ul>}</div></section>}

   <section id="contato" className={styles.contact}><div className={`${styles.contactPitch} ${styles.reveal}`} data-pt-reveal><span className={styles.sectionLabel}>Disponibilidade</span><h2>{c.scheduleTitle||'Horários disponíveis'}</h2><p>{c.scheduleText||'Confira a agenda semanal e envie seus dados para encontrarmos o melhor horário para você.'}</p><div className={styles.scheduleGrid}>{DEMO_SCHEDULE.map((slot)=><div className={`${styles.scheduleRow} ${slot.open?styles.scheduleOpen:styles.scheduleClosed}`} key={slot.day}><strong>{slot.day}</strong><span>{slot.hours}</span><em>{slot.open?'Agenda aberta':'Agenda fechada'}</em></div>)}</div>{c.whatsapp&&<a href={wa(c.whatsapp)}>Consultar horário no WhatsApp →</a>}</div><div className={`${styles.formWrap} ${styles.reveal}`} data-pt-reveal><PersonalTrainerLeadForm projectId={project.id}/></div></section>
   <section className={styles.final}><span>Seu próximo capítulo</span><h2>Começa<br/>agora.</h2><div>{c.whatsapp&&<a href={wa(c.whatsapp)}>WhatsApp →</a>}{c.instagramHref&&<a href={c.instagramHref}>Instagram →</a>}</div></section>
  </main><footer className={styles.footer}><span>{name} · {specialty}</span><span>WebAppCap</span></footer>
 </div>;
}
