'use client';

import {useEffect,useMemo,useRef,useState} from 'react';
import {commerceCategories,commerceLineTotal,commercePromoLabel} from '@/core/commerce-promotions';
import type {TemplateRenderProps} from '../types';
import styles from './commerce-modern.module.css';

type Row=Record<string,unknown>;
type Cart=Record<number,number>;

const rows=(v:unknown)=>Array.isArray(v)?v.filter(x=>x&&typeof x==='object') as Row[]:[];
const text=(r:Record<string,unknown>,k:string,f='')=>String(r[k]??'').trim()||f;
const media=(v:unknown)=>v&&typeof v==='object'&&'url'in v?String((v as {url?:unknown}).url||'').trim():typeof v==='string'?v.trim():'';
const ig=(v:string)=>v.startsWith('http')?v:`https://instagram.com/${v.replace(/^@/,'')}`;
const brl=(n:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n);

function MarkedTitle({value}:{value:string}){
 const parts=value.trim().split(/\s+/),last=parts.pop()||'';
 return <>{parts.length?parts.join(' ')+' ':''}<span className={styles.mark}>{last}</span></>;
}

export function CommerceModernTemplate({project,data}:TemplateRenderProps){
 const root=useRef<HTMLDivElement>(null);
 const name=text(data.identity,'name',project.name||'Sua loja');
 const whatsapp=text(data.contact,'whatsapp').replace(/\D/g,'');
 const instagram=text(data.contact,'instagram'),instagramUrl=instagram?ig(instagram):'';
 const hero=media(data.media.hero),creator=media(data.media.creator);
 const all=rows(data.content.menu_items);
 const products=useMemo(()=>all.map((item,index)=>({item,index})).filter(({item})=>text(item,'active','true').toLowerCase()!=='false'),[data.content.menu_items]);
 const categories=useMemo(()=>commerceCategories(products.map(p=>p.item)),[products]);
 const [cat,setCat]=useState('Todos'),[q,setQ]=useState(''),[cart,setCart]=useState<Cart>({}),[drawer,setDrawer]=useState(false),[zoom,setZoom]=useState<{src:string;alt:string}|null>(null);
 const filtered=useMemo(()=>products.filter(({item})=>(cat==='Todos'||text(item,'category')===cat)&&(!q||`${text(item,'title')} ${text(item,'category')} ${text(item,'description')}`.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(q.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()))),[products,cat,q]);
 const chosen=products.map(({item,index})=>({item,index,quantity:cart[index]||0})).filter(x=>x.quantity>0);
 const count=chosen.reduce((s,x)=>s+x.quantity,0),total=chosen.reduce((s,x)=>s+commerceLineTotal(x.item,x.quantity),0);
 const change=(index:number,delta:number)=>setCart(c=>({...c,[index]:Math.max(0,(c[index]||0)+delta)}));
 const featured=rows(data.content.highlights).slice(0,3);
 const highlights=featured.length?featured:products.slice(0,3).map(x=>x.item);
 const marquee=text(data.content,'modern_marquee','PRODUTINHOS PARA QUEM VIVE A ROTINA VET ✦ FEITO COM AMOR ESPECIALMENTE PARA VOCÊ ✦');
 const heroTitle=text(data.content,'modern_hero_title',`${name} do seu jeitinho.`);
 const heroText=text(data.content,'modern_hero_text',text(data.identity,'description','Produtos criativos e cheios de personalidade para deixar sua rotina ainda mais a sua cara.'));
 const heroKicker=text(data.content,'hero_kicker',text(data.identity,'tagline','Produtinhos para quem vive a rotina vet'));
 const directTpl=text(data.content,'whatsapp_direct_message','Olá! Visitei o site da {loja} e gostaria de informações sobre outros produtos.');
 const direct=whatsapp?`https://wa.me/${whatsapp}?text=${encodeURIComponent(directTpl.replaceAll('{loja}',name))}`:'#';
 const orderLines=chosen.map(x=>`• ${x.quantity}x ${text(x.item,'title')} — ${brl(commerceLineTotal(x.item,x.quantity))}`);
 const orderMessage=`Olá! Gostaria de fazer este pedido na ${name}:\n\n${orderLines.join('\n')}\n\nTotal estimado: ${brl(total)}\n\nPode me confirmar a disponibilidade?`;
 const orderHref=whatsapp?`https://wa.me/${whatsapp}?text=${encodeURIComponent(orderMessage)}`:'#';

 useEffect(()=>{
  const host=root.current;if(!host||typeof IntersectionObserver==='undefined')return;
  const nodes=host.querySelectorAll('[data-reveal]');
  const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add(styles.in);io.unobserve(entry.target)}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  nodes.forEach(node=>io.observe(node));return()=>io.disconnect();
 },[]);

 useEffect(()=>{document.body.classList.toggle(styles.bodyLock,drawer&&window.matchMedia('(max-width:700px)').matches);return()=>document.body.classList.remove(styles.bodyLock)},[drawer]);

 return <div ref={root} className={styles.site}>
  <div className={styles.topbar} aria-hidden="true"><div className={styles.marquee}>{Array.from({length:6},(_,i)=><span key={i}>{marquee}</span>)}</div></div>

  <nav className={styles.nav} aria-label="Principal">
   <div className={`${styles.container} ${styles.navInner}`}>
    <a href="#topo" className={styles.logo} aria-label={`${name}, início`}><span>{name}</span></a>
    <div className={styles.navLinks}><a href="#destaques">Destaques</a><a href="#catalogo">Catálogo</a><a href="#sobre">Sobre</a>{instagramUrl?<a href={instagramUrl} target="_blank" rel="noreferrer">Instagram ↗</a>:null}</div>
    <button className={styles.cartPill} type="button" onClick={()=>setDrawer(v=>!v)}>Carrinho · {count}</button>
   </div>
  </nav>

  <header className={styles.hero} id="topo">
   <div className={`${styles.container} ${styles.heroGrid}`}>
    <div className={styles.heroArt}>{hero?<img src={hero} alt={`Capa de ${name}`} onClick={()=>setZoom({src:hero,alt:`Capa de ${name}`})}/>:null}</div>
    <div className={styles.heroCopy}>
     <div className={styles.tag}>🐾 {heroKicker}</div>
     <h1><MarkedTitle value={heroTitle}/></h1>
     <p>{heroText}</p>
     <div className={styles.heroActions}><a href="#catalogo" className={`${styles.btn} ${styles.btnMain}`}>Ver produtos ↓</a>{whatsapp?<a href={direct} target="_blank" rel="noreferrer" className={`${styles.btn} ${styles.btnSoft}`}>Falar no WhatsApp</a>:null}{instagramUrl?<a href={instagramUrl} target="_blank" rel="noreferrer" className={`${styles.btn} ${styles.btnMain}`}>Seguir a loja ↗</a>:null}</div>
    </div>
    <aside className={styles.heroCard}><h3>{text(data.content,'modern_card_title','Escolha seus favoritos e peça pelo WhatsApp.')}</h3><p>{text(data.content,'modern_card_text','Simples e direto, sem cadastro.')}</p><ul><li>Adesivos, bottons, ecobags e mais</li><li>Promoções em itens selecionados</li><li>Atendimento direto e prático</li></ul></aside>
   </div>
  </header>

  <main>
   <section id="destaques"><div className={styles.container}>
    <div className={styles.sectionTop} data-reveal><div><div className={styles.kicker}>Destaques da {name}</div><h2>{text(data.content,'modern_highlights_title','Os queridinhos por aqui.')}</h2></div><p className={styles.sectionDesc}>{text(data.content,'modern_highlights_intro','Uma seleção especial para deixar sua rotina mais divertida, colorida e cheia de personalidade.')}</p></div>
    <div className={styles.highlights} data-reveal>{highlights.map((item,i)=>{const src=media(item.image)||text(item,'image'),title=text(item,'title',`Destaque ${i+1}`);return <article className={`${styles.highlight} ${i===0?styles.large:''}`} key={i}>{src?<img src={src} alt={title} onClick={()=>setZoom({src,alt:title})}/>:null}<div className={styles.highlightCopy}><small>{text(item,'category','Destaque')}</small><h3>{title}</h3><p>{text(item,'description')}</p></div></article>})}</div>
   </div></section>

   <section id="catalogo"><div className={styles.container}>
    <div className={styles.sectionTop} data-reveal><div><div className={styles.kicker}>Catálogo</div><h2>Escolha seus favoritos.</h2></div><p className={styles.sectionDesc}>{text(data.content,'menu_intro','Busque pelo nome ou navegue pelas categorias para encontrar o produtinho perfeito.')}</p></div>
    <div className={styles.chips} data-reveal><button className={styles.chip} type="button" aria-pressed={cat==='Todos'} onClick={()=>setCat('Todos')}>Todos <small>{products.length} {products.length===1?'item':'itens'}</small></button>{categories.map(c=>{const n=products.filter(p=>text(p.item,'category')===c).length;return <button className={styles.chip} type="button" key={c} aria-pressed={cat===c} onClick={()=>setCat(c)}>{c} <small>{n} {n===1?'item':'itens'}</small></button>})}</div>
    <div className={styles.shopTools} data-reveal><input className={styles.search} type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar por nome, descrição ou categoria"/><div className={styles.counter}>{filtered.length} produto{filtered.length===1?'':'s'}</div></div>
    <div className={styles.products} data-reveal>{filtered.length?filtered.map(({item,index})=>{const src=text(item,'image'),title=text(item,'title',`Produto ${index+1}`),promo=commercePromoLabel(item,brl);return <article className={styles.card} key={index}><div className={styles.cardImg}>{promo?<div className={styles.promo}>{promo}</div>:null}{src?<img src={src} alt={title} onClick={()=>setZoom({src,alt:title})}/>:null}</div><div className={styles.cardBody}><div className={styles.meta}>{text(item,'category')}</div><h3>{title}</h3><p>{text(item,'description')}</p><div className={styles.priceLine}><div className={styles.price}>{text(item,'price','R$ 0,00')}</div><button className={styles.plus} type="button" onClick={()=>{change(index,1);setDrawer(true)}} aria-label={`Adicionar ${title} ao carrinho`}>+</button></div></div></article>}):<div className={styles.empty}>Nada encontrado para essa busca. Tente outra palavra ou fale com a gente pelo WhatsApp.</div>}</div>
    <div className={styles.notfound} data-reveal><div><h3>{text(data.content,'modern_notfound_title','Não encontrou o que queria?')}</h3><p>{text(data.content,'modern_notfound_text',`Entre em contato pelo WhatsApp e a ${name} te ajuda a encontrar o produto ideal.`)}</p></div>{whatsapp?<a className={`${styles.btn} ${styles.btnMain}`} href={direct} target="_blank" rel="noreferrer">Falar no WhatsApp ↗</a>:null}</div>
   </div></section>

   <section id="sobre"><div className={`${styles.container} ${styles.aboutGrid}`} data-reveal>
    <div className={styles.aboutCopy}><div className={styles.kicker}>Sobre a {name}</div><h2>{text(data.content,'about_title','Feito com amor especialmente para você.')}</h2><p>{text(data.content,'about_main',text(data.identity,'description'))}</p>{text(data.content,'creator_bio')?<p>{text(data.content,'creator_bio')}</p>:null}{text(data.content,'creator_name')?<div className={styles.signature}>{text(data.content,'creator_name')} · Criadora da marca</div>:null}<div className={styles.aboutActions}>{instagramUrl?<a className={`${styles.btn} ${styles.btnMain}`} href={instagramUrl} target="_blank" rel="noreferrer">Seguir a loja ↗</a>:null}{text(data.content,'creator_instagram')?<a className={`${styles.btn} ${styles.btnSoft}`} href={ig(text(data.content,'creator_instagram'))} target="_blank" rel="noreferrer">Seguir a criadora ↗</a>:null}</div></div>
    <div className={styles.aboutPhoto}>{creator?<img src={creator} alt={text(data.content,'creator_name','Criadora da marca')} onClick={()=>setZoom({src:creator,alt:text(data.content,'creator_name','Criadora da marca')})}/>:null}</div>
   </div></section>
  </main>

  <footer className={styles.footerWrap}><div className={`${styles.container} ${styles.footer}`}><div><strong>{name}</strong> · Adesivos · Chaveiros · Mimos · Bottons · Ecobags e mais</div><div>Site por <a href="https://webappcap.com.br" target="_blank" rel="noreferrer">WebAppCap</a></div></div></footer>

  <div className={drawer?`${styles.backdrop} ${styles.show}`:styles.backdrop} onClick={()=>setDrawer(false)}/>
  <aside className={drawer?`${styles.drawer} ${styles.open}`:styles.drawer} aria-label="Carrinho">
   <div className={styles.drawerHead}><h3>Seu carrinho</h3><button className={styles.close} type="button" onClick={()=>setDrawer(false)}>×</button></div>
   <div className={styles.cartItems}>{chosen.length?chosen.map(x=><div className={styles.cartRow} key={x.index}><div><strong>{text(x.item,'title')}</strong><br/><small>{text(x.item,'price')} cada</small><div className={styles.stepper}><button type="button" onClick={()=>change(x.index,-1)}>−</button><span>{x.quantity}</span><button type="button" onClick={()=>change(x.index,1)}>+</button></div></div><strong>{brl(commerceLineTotal(x.item,x.quantity))}</strong><span/><button className={styles.remove} type="button" onClick={()=>setCart(c=>({...c,[x.index]:0}))}>Remover</button></div>):<div className={styles.cartEmpty}>Seu carrinho está vazio. Toque no + de um produto para adicionar.</div>}</div>
   <div className={styles.drawerFoot}><div className={styles.totalrow}><span>Total estimado</span><span>{brl(total)}</span></div>{chosen.length&&whatsapp?<a className={`${styles.btn} ${styles.wa}`} href={orderHref} target="_blank" rel="noreferrer">Enviar pedido pelo WhatsApp</a>:<button className={`${styles.btn} ${styles.wa}`} disabled>Enviar pedido pelo WhatsApp</button>}</div>
  </aside>

  {zoom?<div className={styles.lightbox} role="dialog" aria-modal="true" onClick={()=>setZoom(null)}><div className={styles.lightboxInner} onClick={e=>e.stopPropagation()}><button className={styles.lbClose} type="button" onClick={()=>setZoom(null)}>×</button><img src={zoom.src} alt={zoom.alt}/><p className={styles.lbCap}>{zoom.alt}</p></div></div>:null}
 </div>;
}
