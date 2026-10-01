'use client';

import {useEffect,useMemo,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {commerceBasePrice,commerceLineTotal,commercePromo} from '@/core/commerce-promotions';
import type {TemplateRenderProps} from '../types';

type Row=Record<string,unknown>;
type Product={id:number;productIndex:number;name:string;category:string;price:number;promo:string;description:string;image:string;raw:Row};

const rows=(value:unknown)=>Array.isArray(value)?value.filter(item=>item&&typeof item==='object') as Row[]:[];
const str=(o:Record<string,unknown>,key:string,fallback='')=>String(o[key]??'').trim()||fallback;
const mediaUrl=(value:unknown)=>value&&typeof value==='object'&&'url' in value?String((value as {url?:unknown}).url||'').trim():typeof value==='string'?value.trim():'';
const brl=(value:number)=>value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const norm=(value:string)=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const ig=(value:string)=>value.startsWith('http')?value:`https://instagram.com/${value.replace(/^@/,'')}`;

function useReveal(root:React.RefObject<HTMLDivElement|null>){
 useEffect(()=>{
  if(!root.current||!('IntersectionObserver'in window))return;
  const io=new IntersectionObserver((list,obs)=>list.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');obs.unobserve(en.target)}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  root.current.querySelectorAll('[data-reveal]').forEach(el=>io.observe(el));
  return()=>io.disconnect();
 },[root]);
}

export function CommerceModernTemplate({project,data}:TemplateRenderProps){
 const host=useRef<HTMLDivElement>(null),root=useRef<HTMLDivElement>(null);
 const [mount,setMount]=useState<HTMLDivElement|null>(null),[assetsReady,setAssetsReady]=useState(false);
 useEffect(()=>{
  const el=host.current;if(!el)return;
  const shadow=el.shadowRoot||el.attachShadow({mode:'open'});
  let target=shadow.querySelector('[data-commerce-modern-mount]') as HTMLDivElement|null;
  if(!target){
   const font=document.createElement('link');font.rel='stylesheet';font.href='https://fonts.googleapis.com/css2?family=Nunito:wght@400..1000&display=swap';font.setAttribute('data-modern-asset','font');shadow.appendChild(font);
   const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href='/templates/commerce-modern/styles.css';sheet.setAttribute('data-modern-asset','css');shadow.appendChild(sheet);
   let pending=2;const done=()=>{pending-=1;if(pending<=0)setAssetsReady(true)};font.addEventListener('load',done,{once:true});font.addEventListener('error',done,{once:true});sheet.addEventListener('load',done,{once:true});sheet.addEventListener('error',done,{once:true});
   window.setTimeout(()=>setAssetsReady(true),1200);
   const bridge=document.createElement('style');bridge.textContent='.commerce-modern-document{--bg:#eef8ff;--ink:#171717;--blue:#4f89ad;--blue-2:#3f7697;--deep:#315f7a;--sky:#bfe4f7;--muted:#5f6b73;--line:#dbe8f0;--shadow:0 18px 48px rgba(38,81,108,.14);--max:1180px;--font:"Nunito",system-ui,-apple-system,"Segoe UI",Arial,sans-serif;display:block;min-height:100vh;margin:0;font-family:var(--font);background:var(--bg);color:var(--ink);line-height:1.5;-webkit-font-smoothing:antialiased}';bridge.setAttribute('data-modern-asset','bridge');shadow.appendChild(bridge);
   target=document.createElement('div');target.setAttribute('data-commerce-modern-mount','');shadow.appendChild(target);
  }
  setMount(target);
  if(shadow.querySelector('link[data-modern-asset="css"]')&&shadow.querySelector('link[data-modern-asset="font"]')&&shadow.querySelector('[data-commerce-modern-mount]')?.childNodes.length)setAssetsReady(true);
 },[]);

 const brand=str(data.identity,'name',project.name||'Vet-se');
 const whatsapp=str(data.contact,'whatsapp').replace(/\D/g,'');
 const instagram=str(data.contact,'instagram'),instagramUrl=instagram?ig(instagram):'';
 const creatorInstagram=str(data.content,'creator_instagram'),creatorInstagramUrl=creatorInstagram?ig(creatorInstagram):'';
 const heroImage=mediaUrl(data.media.hero)||'/assets/media/vet-hero.webp';
 const aboutImage=mediaUrl(data.media.creator);
 const storageKey=`webappcap-modern-${project.id}`;

 const products=useMemo<Product[]>(()=>rows(data.content.menu_items).map((raw,productIndex)=>{
  const promo=commercePromo(raw);
  return{id:productIndex+1,productIndex,name:str(raw,'title',`Produto ${productIndex+1}`),category:str(raw,'category'),price:commerceBasePrice(raw),promo:promo?`${promo.quantity} por ${brl(promo.total)}`:'',description:str(raw,'description'),image:str(raw,'image'),raw};
 }).filter(product=>str(product.raw,'active','true').toLowerCase()!=='false'),[data.content.menu_items]);

 const productById=useMemo(()=>new Map(products.map(product=>[product.id,product])),[products]);
 const byId=(id:string|number)=>productById.get(Number(id));
 const categoryCounts=useMemo(()=>products.reduce<Record<string,number>>((acc,product)=>{if(product.category)acc[product.category]=(acc[product.category]||0)+1;return acc},{}),[products]);
 const categories=useMemo(()=>['Todos',...Object.keys(categoryCounts).sort((a,b)=>a.localeCompare(b,'pt-BR',{sensitivity:'base'}))],[categoryCounts]);
 const [pins,ecobag,botton]=useMemo(()=>[
  products.find(p=>norm(p.name).includes('pins para crocs'))||products.find(p=>p.category==='Pins para Crocs'),
  products.find(p=>norm(p.name).includes('ecobag patinhas'))||products.find(p=>p.category==='Ecobags'),
  products.find(p=>norm(p.name).includes('patinha lgbt'))||products.find(p=>p.category==='Bottons')
 ],[products]);

 const [cart,setCart]=useState<Record<string,number>>({});
 const [open,setOpen]=useState(false),[zoom,setZoom]=useState<{src:string;alt:string}|null>(null),[toast,setToast]=useState('');
 const toastTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const [category,setCategory]=useState('Todos'),[query,setQuery]=useState('');

 useReveal(root);

 useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem(storageKey)||'{}') as Record<string,number>;Object.keys(saved).forEach(id=>{if(!productById.has(Number(id)))delete saved[id]});setCart(saved)}catch{/* noop */}},[storageKey,productById]);
 useEffect(()=>{try{localStorage.setItem(storageKey,JSON.stringify(cart))}catch{/* noop */}},[cart,storageKey]);
 useEffect(()=>{document.body.classList.toggle('lock',open&&matchMedia('(max-width:700px)').matches);return()=>document.body.classList.remove('lock')},[open]);
 useEffect(()=>{const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')setOpen(false)};document.addEventListener('keydown',onKey);return()=>document.removeEventListener('keydown',onKey)},[]);
 useEffect(()=>()=>{if(toastTimer.current)clearTimeout(toastTimer.current)},[]);

 const flash=(msg:string)=>{setToast(msg);if(toastTimer.current)clearTimeout(toastTimer.current);toastTimer.current=setTimeout(()=>setToast(''),2200)};
 const add=(id:number)=>{setCart(c=>({...c,[id]:(c[id]||0)+1}));const product=byId(id);if(product)flash(`${product.name} adicionado ao carrinho`)};
 const step=(id:string,d:number)=>setCart(c=>{const n={...c},q=(n[id]||0)+d;if(q<1)delete n[id];else n[id]=q;return n});
 const remove=(id:string)=>setCart(c=>{const n={...c};delete n[id];return n});
 const entries=useMemo(()=>Object.entries(cart).filter(([id])=>productById.has(Number(id))),[cart,productById]);
 const count=useMemo(()=>entries.reduce((sum,[,qty])=>sum+qty,0),[entries]);
 const total=useMemo(()=>entries.reduce((sum,[id,qty])=>{const product=productById.get(Number(id));return product?sum+commerceLineTotal(product.raw,qty):sum},0),[entries,productById]);
 const q=norm(query.trim());
 const list=useMemo(()=>products.filter(product=>(category==='Todos'||product.category===category)&&(!q||norm(`${product.name} ${product.category} ${product.description}`).includes(q))),[products,category,q]);
 const wa=(msg='')=>whatsapp?`https://wa.me/${whatsapp}${msg?`?text=${encodeURIComponent(msg)}`:''}`:'#';
 const send=()=>{if(!entries.length||!whatsapp)return;const lines=entries.map(([id,qty])=>{const p=byId(id)!;return `• ${qty}x ${p.name} — ${brl(commerceLineTotal(p.raw,qty))}`});const msg=`Olá! Gostaria de fazer este pedido na ${brand}:\n\n${lines.join('\n')}\n\nTotal estimado: ${brl(total)}\n\nPode me confirmar a disponibilidade?`;window.open(wa(msg),'_blank','noopener')};

 const STRIP=str(data.content,'modern_marquee','PRODUTINHOS PARA QUEM VIVE A ROTINA VET ✦ FEITO COM AMOR ESPECIALMENTE PARA VOCÊ ✦');
 const ext={target:'_blank' as const,rel:'noopener noreferrer'};
 const highlights=[
  {product:pins,cls:'highlight large',tag:'Mais procurados',title:'Pins para Crocs',text:'R$ 5,00 a unidade. Escolha seus modelos favoritos e finalize o pedido pelo WhatsApp.'},
  {product:ecobag,cls:'highlight',tag:'Promoção',title:'Ecobags',text:'1 por R$ 24,00 · 2 por R$ 40,00'},
  {product:botton,cls:'highlight',tag:'Mimos',title:'Bottons',text:'1 por R$ 8,00 · 2 por R$ 14,00'}
 ];

 const content=<div ref={root} className={'commerce-modern-document js'+(assetsReady?' assets-ready':' assets-loading')}>
  <div className="topbar" aria-hidden="true"><div className="marquee">{Array.from({length:6},(_,i)=><span key={i}>{STRIP}</span>)}</div></div>

  <nav className="nav" aria-label="Principal"><div className="container nav-inner">
   <a href="#topo" className="logo" aria-label={`${brand}, início`}><span>{brand}</span></a>
   <div className="nav-links"><a href="#destaques">Destaques</a><a href="#catalogo">Catálogo</a><a href="#sobre">Sobre</a>{instagramUrl?<a href={instagramUrl} {...ext}>Instagram ↗</a>:null}</div>
   <button className="cart-pill" onClick={()=>setOpen(!open)} aria-controls="drawer">Carrinho · {count}</button>
  </div></nav>

  <header className="hero" id="topo"><div className="container hero-grid">
   <div className="hero-art"><img src={heroImage} fetchPriority="high" decoding="async" alt={`Capa da ${brand}`} onClick={()=>setZoom({src:heroImage,alt:`Capa da ${brand}`})}/></div>
   <div className="hero-copy">
    <h1>{str(data.content,'modern_hero_title')?<>{str(data.content,'modern_hero_title')}</>:<>{brand} do seu <span className="mark">jeitinho.</span></>}</h1>
    <p>{str(data.content,'modern_hero_text','Adesivos, chaveiros, mimos, bottons, ecobags e mais para deixar seus materiais e acessórios ainda mais a sua cara.')}</p>
    <div className="hero-actions"><a href="#catalogo" className="btn btn-main">Ver produtos ↓</a>{whatsapp?<a href={wa()} {...ext} className="btn btn-soft">Falar no WhatsApp</a>:null}{instagramUrl?<a href={instagramUrl} {...ext} className="btn btn-main">Seguir a loja ↗</a>:null}</div>
   </div>
  </div></header>

  <main>
   <section id="destaques"><div className="container">
    <div className="section-top" data-reveal><div><div className="kicker">Destaques da {brand}</div><h2>Os queridinhos<br/>por aqui.</h2></div><p className="section-desc">Uma seleção especial para deixar sua rotina vet mais divertida, colorida e cheia de personalidade.</p></div>
    <div className="highlights" data-reveal>{highlights.map((h,i)=>{const src=h.product?.image||'';return <article className={h.cls} key={h.title} style={{'--highlight-index':i} as React.CSSProperties}>{src?<img src={src} alt={h.title} loading="lazy" decoding="async" onClick={()=>setZoom({src,alt:h.title})}/>:null}<div className="highlight-copy"><small>{h.tag}</small><h3>{h.title}</h3><p>{h.text}</p></div></article>})}</div>
   </div></section>

   <section id="catalogo"><div className="container">
    <div className="section-top" data-reveal><div><div className="kicker">Catálogo</div><h2>Escolha seus<br/>favoritos.</h2></div><p className="section-desc">Busque pelo nome ou navegue pelas categorias para encontrar o produtinho perfeito.</p></div>
    <div className="chips" data-reveal role="group" aria-label="Filtrar por categoria">{categories.map(c=>{const n=c==='Todos'?products.length:(categoryCounts[c]||0);return <button key={c} className="chip" aria-pressed={c===category} onClick={()=>setCategory(c)}>{c} <small>{n} {n===1?'item':'itens'}</small></button>})}</div>
    <div className="shop-tools" data-reveal><input className="search" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar por nome, descrição ou categoria" aria-label="Buscar produtos"/><div className="counter" aria-live="polite">{list.length} produto{list.length!==1?'s':''}</div></div>
    <div className={'products'+(category==='Todos'?' products-all':'')} data-reveal tabIndex={category==='Todos'?0:undefined} aria-label={category==='Todos'?'Todos os produtos. Role horizontalmente para ver mais.':undefined}>{list.length?list.map(p=><article className="card" key={p.id}><div className="card-img">{p.promo?<div className="promo">{p.promo}</div>:null}{p.image?<img src={p.image} alt={p.name} loading="lazy" decoding="async" width="400" height="400" onClick={()=>setZoom({src:p.image,alt:p.name})}/>:null}</div><div className="card-body"><div className="meta">{p.category}</div><h3>{p.name}</h3><p>{p.description}</p><div className="price-line"><div className="price">{brl(p.price)}</div><button className="plus" onClick={()=>add(p.id)} aria-label={`Adicionar ${p.name} ao carrinho`}>+</button></div></div></article>):<div className="empty">Nada encontrado para essa busca. Tente outra palavra ou fale com a gente pelo WhatsApp.</div>}</div>
    <div className="notfound" data-reveal><div><h3>Não encontrou o que queria?</h3><p>Entre em contato pelo WhatsApp e a {brand} te ajuda a encontrar o produto ideal.</p></div>{whatsapp?<a className="btn btn-main" href={wa()} {...ext}>Falar no WhatsApp ↗</a>:null}</div>
   </div></section>

   <section id="sobre"><div className="container"><div className="about-grid" data-reveal>
    <div className="about-copy"><div className="kicker">Sobre a {brand}</div><h2>Feito com amor especialmente para você.</h2><p>{str(data.content,'about_main','A Vet-se nasceu do amor pela Medicina Veterinária e pelo desejo de tornar a rotina vet ainda mais especial, com produtos criativos, funcionais e cheios de personalidade.')}</p><p>{str(data.content,'creator_bio','Aqui você encontra itens pensados por e para quem vive o dia a dia entre consultas, plantões, estudos e muito amor pelos animais.')}</p><div className="signature">{str(data.content,'creator_name','Vitória Catalano')} · Criadora da marca</div><div className="about-actions">{instagramUrl?<a className="btn btn-main" href={instagramUrl} {...ext}>Seguir a loja ↗</a>:null}{creatorInstagramUrl?<a className="btn btn-main" href={creatorInstagramUrl} {...ext}>Seguir a criadora ↗</a>:null}</div></div>
    <div className="about-photo">{aboutImage?<img src={aboutImage} alt={str(data.content,'creator_name','Vitória Catalano')} loading="lazy" decoding="async" onClick={()=>setZoom({src:aboutImage,alt:str(data.content,'creator_name','Vitória Catalano')})}/>:null}</div>
   </div></div></section>
  </main>

  <footer><div className="container footer"><div><strong>{brand}</strong> · Adesivos · Chaveiros · Mimos · Bottons · Ecobags e mais</div><div>Site por <a href="https://webappcap.com.br" target="_blank" rel="noopener">WebAppCap</a></div></div></footer>

  <div className={'backdrop'+(open?' show':'')} onClick={()=>setOpen(false)}/>
  <aside className={'drawer'+(open?' open':'')} id="drawer" aria-label="Carrinho"><div className="drawer-head"><h3>Seu carrinho</h3><button className="close" onClick={()=>setOpen(false)} aria-label="Fechar carrinho">×</button></div><div className="cart-items" aria-live="polite">{entries.length?entries.map(([id,qty])=>{const p=byId(id)!;return <div className="cart-row" key={id}><div><strong>{p.name}</strong><br/><small>{brl(p.price)} cada</small><div className="stepper"><button onClick={()=>step(id,-1)} aria-label={`Diminuir ${p.name}`}>−</button><span>{qty}</span><button onClick={()=>step(id,1)} aria-label={`Aumentar ${p.name}`}>+</button></div></div><strong>{brl(commerceLineTotal(p.raw,qty))}</strong><span/><button className="remove" onClick={()=>remove(id)} aria-label={`Remover ${p.name}`}>Remover</button></div>}):<div className="cart-empty">Seu carrinho está vazio. Toque no + de um produto para adicionar.</div>}</div><div className="drawer-foot"><div className="totalrow"><span>Total estimado</span><span>{brl(total)}</span></div><button className="btn wa" disabled={!entries.length||!whatsapp} onClick={send}>Enviar pedido pelo WhatsApp</button></div></aside>

  <Lightbox zoom={zoom} onClose={()=>setZoom(null)}/>
  <div className={'toast'+(toast?' show':'')} role="status" aria-live="polite">{toast}</div>
 </div>;
 return <div ref={host}>{mount?createPortal(content,mount):null}</div>;
}

function Lightbox({zoom,onClose}:{zoom:{src:string;alt:string}|null;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const d=ref.current;if(!d)return;if(zoom&&!d.open)d.showModal();if(!zoom&&d.open)d.close()},[zoom]);
 return <dialog id="lightbox" ref={ref} aria-label="Foto ampliada" onClose={onClose} onClick={event=>{const target=event.target as HTMLElement;if(target===ref.current||target.closest('.lb-close'))ref.current?.close()}}><button className="lb-close" aria-label="Fechar foto">×</button><img id="lbImg" src={zoom?.src} alt={zoom?.alt||''}/><p className="lb-cap">{zoom?.alt||''}</p></dialog>;
}
