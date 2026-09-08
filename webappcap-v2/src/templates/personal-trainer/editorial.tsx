import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import type { TemplateRenderProps } from '../types';
import { PersonalTrainerLeadForm } from './lead-form';
import styles from './editorial.module.css';

const display=Cormorant_Garamond({subsets:['latin'],weight:['500','600','700'],variable:'--editorial-display',display:'swap'});
const body=DM_Sans({subsets:['latin'],weight:['400','500','600'],variable:'--editorial-body',display:'swap'});
const value=(o:Record<string,unknown>,k:string)=>String(o[k]??'').trim();
const media=(o:Record<string,unknown>,k:string)=>{const x=o[k];return x&&typeof x==='object'&&'url' in x?String((x as {url?:unknown}).url||''):''};
const rows=(v:string)=>v.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).map(x=>{const [title,...rest]=x.split('|');return {title:title.trim(),text:rest.join('|').trim()}});
const lines=(v:string)=>v.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
const wa=(v:string)=>`https://wa.me/${v.replace(/\D/g,'')}`;

export function EditorialTrainerTemplate({project,data,preview=false}:TemplateRenderProps){
 const name=value(data.identity,'name')||project.name, location=value(data.identity,'location');
 const specialty=value(data.content,'trainer_specialty')||'Personal Trainer', cref=value(data.content,'trainer_cref');
 const title=value(data.content,'hero_title')||value(data.identity,'tagline')||'Movimento com intenção. Evolução com método.';
 const text=value(data.content,'hero_text')||value(data.identity,'description');
 const about=value(data.content,'about')||value(data.identity,'description');
 const offer=value(data.content,'primary_offer'), proof=value(data.content,'proof');
 const services=rows(value(data.content,'trainer_services')), method=rows(value(data.content,'trainer_method'));
 const credentials=lines(value(data.content,'trainer_credentials'));
 const hero=media(data.media,'hero'); const gallery=Array.isArray(data.media.gallery)?data.media.gallery as Array<{url?:string}>:[];
 const phone=value(data.contact,'whatsapp')||value(data.contact,'phone'); const instagram=value(data.contact,'instagram');
 const insta=instagram?(instagram.startsWith('http')?instagram:`https://instagram.com/${instagram.replace(/^@/,'')}`):'';
 return <div className={`${styles.site} ${display.variable} ${body.variable}`}>
  {preview&&<div className={styles.preview}>Preview do rascunho · ainda não publicado</div>}
  <header className={styles.header}><a href="#inicio" className={styles.brand}>{name}</a><nav><a href="#metodo">Método</a><a href="#sobre">Sobre</a><a href="#contato">Contato</a></nav><a href="#contato" className={styles.book}>Agendar conversa</a></header>
  <main>
   <section id="inicio" className={styles.hero}><div className={styles.heroCopy}><span className={styles.kicker}>{specialty} · {location||'atendimento personalizado'}</span><h1>{title}</h1>{text&&<p>{text}</p>}<a className={styles.primary} href="#contato">Começar agora <span>↗</span></a></div><figure className={styles.heroImage}>{hero?<img src={hero} alt={name}/>:<div className={styles.placeholder}>Sua imagem principal</div>}<figcaption>{name}{cref?` · ${cref}`:''}</figcaption></figure></section>
   <section className={styles.statement}><span>01</span><p>{offer||'Treino individualizado, atenção aos detalhes e uma rotina construída para a sua realidade.'}</p></section>
   {services.length>0&&<section className={styles.services}><div className={styles.sectionHead}><span>Experiência</span><h2>Um acompanhamento que respeita o seu momento.</h2></div><div className={styles.serviceGrid}>{services.map((s,i)=><article key={i}><span>0{i+1}</span><h3>{s.title}</h3>{s.text&&<p>{s.text}</p>}</article>)}</div></section>}
   {method.length>0&&<section id="metodo" className={styles.method}><div className={styles.sectionHead}><span>Método</span><h2>Clareza para evoluir sem atalhos.</h2></div><div>{method.map((m,i)=><article key={i}><b>{String(i+1).padStart(2,'0')}</b><h3>{m.title}</h3><p>{m.text}</p></article>)}</div></section>}
   {(gallery.length>0||proof)&&<section className={styles.results}><div className={styles.sectionHead}><span>Resultados</span><h2>{value(data.content,'trainer_results_title')||'Consistência que aparece.'}</h2>{proof&&<p>{proof}</p>}</div>{gallery.length>0&&<div className={styles.gallery}>{gallery.slice(0,4).map((g,i)=>g.url?<figure key={i}><img src={g.url} alt={`Resultado ${i+1}`}/></figure>:null)}</div>}</section>}
   <section id="sobre" className={styles.about}><div className={styles.aboutPhoto}>{hero?<img src={hero} alt={name}/>:null}</div><div><span className={styles.kicker}>Sobre o treinador</span><h2>{name}</h2>{about&&<p>{about}</p>}<dl>{cref&&<><dt>Registro</dt><dd>{cref}</dd></>}<dt>Especialidade</dt><dd>{specialty}</dd>{location&&<><dt>Atendimento</dt><dd>{location}</dd></>}</dl>{credentials.length>0&&<ul>{credentials.map((c,i)=><li key={i}>{c}</li>)}</ul>}</div></section>
   <section id="contato" className={styles.contact}><div><span className={styles.kicker}>Próximo passo</span><h2>{value(data.content,'trainer_schedule_title')||'Seu treino pode começar por uma boa conversa.'}</h2><p>{value(data.content,'trainer_schedule_text')||'Conte seu objetivo e vamos entender qual acompanhamento faz sentido para você.'}</p>{phone&&<a href={wa(phone)}>WhatsApp ↗</a>}</div><PersonalTrainerLeadForm projectId={project.id}/></section>
  </main>
  <footer><strong>{name}</strong><span>{specialty}{cref?` · ${cref}`:''}</span><div>{insta&&<a href={insta}>Instagram ↗</a>}<span>WebAppCap</span></div></footer>
 </div>;
}
