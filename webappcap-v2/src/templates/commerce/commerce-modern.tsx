'use client';
import {imagePositionStyle} from '@/core/image-placement';

import {useCallback,useDeferredValue,useEffect,useMemo,useRef,useState} from 'react';
import {createPortal} from 'react-dom';
import {commerceBasePrice,commerceLineTotal,commercePromo,commercePromoLabel} from '@/core/commerce-promotions';
import {activeCommerceProducts,restoreModernCart} from '@/core/commerce-catalog';
import {trackCommerceOrder} from '@/lib/commerce-order-tracking';
import type {TemplateRenderProps} from '../types';

type Row=Record<string,unknown>;
type Product={id:number;productIndex:number;name:string;category:string;price:number;promo:string;description:string;image:string;raw:Row};

const str=(o:Record<string,unknown>,key:string,fallback='')=>String(o[key]??'').trim()||fallback;
const mediaUrl=(value:unknown)=>value&&typeof value==='object'&&'url' in value?String((value as {url?:unknown}).url||'').trim():typeof value==='string'?value.trim():'';
const brl=(value:number)=>value.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const norm=(value:string)=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const ig=(value:string)=>value.startsWith('http')?value:`https://instagram.com/${value.replace(/^@/,'')}`;

function mapCommerceProductToModern(raw:Row,productIndex:number):Product{
 const promo=commercePromo(raw);
 return{
  id:productIndex+1,
  productIndex,
  name:str(raw,'title',`Produto ${productIndex+1}`),
  category:str(raw,'category'),
  price:commerceBasePrice(raw),
  promo:promo?`${promo.quantity} por ${brl(promo.total)}`:'',
  description:str(raw,'description'),
  image:str(raw,'image'),
  raw
 };
}

const mediaStyle=(value:unknown,prefix=''):React.CSSProperties=>{const row=value&&typeof value==='object'?value as Row:{};const fit=str(row,`${prefix}fit`,'cover');return {...imagePositionStyle(row[`${prefix}position`]),objectFit:(['cover','contain','fill'].includes(fit)?fit:'cover') as React.CSSProperties['objectFit'],'--media-zoom':Math.max(50,Math.min(200,Number(row[`${prefix}zoom`])||100))/100} as React.CSSProperties};

const markImageLoaded=(event:React.SyntheticEvent<HTMLImageElement>)=>event.currentTarget.classList.add('loaded');

function useReveal(root:React.RefObject<HTMLDivElement|null>,mount:HTMLDivElement|null,visibility:string){
 useEffect(()=>{
  if(!root.current)return;
  if(!('IntersectionObserver'in window)){root.current.querySelectorAll('[data-reveal]').forEach(el=>el.classList.add('in'));return;}
  const io=new IntersectionObserver((list,obs)=>list.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');obs.unobserve(en.target)}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  root.current.querySelectorAll('[data-reveal]').forEach(el=>io.observe(el));
  return()=>io.disconnect();
 },[root,mount,visibility]);
}

export function CommerceModernTemplate({project,data,preview=false}:TemplateRenderProps){
 const host=useRef<HTMLDivElement>(null),root=useRef<HTMLDivElement>(null);
 const highlightsRef=useRef<HTMLDivElement>(null),catalogRef=useRef<HTMLDivElement>(null),cartButtonRef=useRef<HTMLButtonElement>(null);
 const [mount,setMount]=useState<HTMLDivElement|null>(null),[assetsReady,setAssetsReady]=useState(false);
 const [catalogRange,setCatalogRange]=useState({start:1,end:8});
 const [cartPulse,setCartPulse]=useState(false);
 const [highlightIndex,setHighlightIndex]=useState(0);
 useEffect(()=>{
  const el=host.current;if(!el)return;
  const shadow=el.shadowRoot||el.attachShadow({mode:'open'});
  // Font-face declarations must be registered in the document, while template selectors remain isolated.
  let font=document.querySelector<HTMLLinkElement>('link[data-commerce-modern-font]');
  if(!font){font=document.createElement('link');font.rel='stylesheet';font.href='https://fonts.googleapis.com/css2?family=DM+Sans:wght@400..800&family=Manrope:wght@400..800&display=swap';font.dataset.commerceModernFont='';document.head.appendChild(font)}
  font.dataset.users=String(Number(font.dataset.users||0)+1);
  const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href='/templates/commerce-modern/styles.css';
  let cancelled=false,pending=2;
  const done=()=>{pending-=1;if(!cancelled&&pending<=0)setAssetsReady(true)};
  for(const link of [font,sheet]){link.addEventListener('load',done,{once:true});link.addEventListener('error',done,{once:true});}
  const bridge=document.createElement('style');bridge.textContent='.commerce-modern-document{--bg:#eef8ff;--ink:#171717;--blue:#4f89ad;--blue-2:#3f7697;--deep:#315f7a;--sky:#bfe4f7;--muted:#5f6b73;--line:#dbe8f0;--shadow:0 12px 32px rgba(38,81,108,.10);--max:1180px;--heading:"Manrope",system-ui,sans-serif;--font:"DM Sans",system-ui,-apple-system,"Segoe UI",Arial,sans-serif;display:block;min-height:100vh;margin:0;font-family:var(--font);font-size:16px;font-weight:400;font-style:normal;text-align:left;letter-spacing:normal;background:var(--bg);color:var(--ink);line-height:1.5;-webkit-font-smoothing:antialiased}';
  const target=document.createElement('div');target.setAttribute('data-commerce-modern-mount','');
  shadow.append(sheet,bridge,target);setMount(target);
  const timeout=window.setTimeout(()=>{if(!cancelled)setAssetsReady(true)},1200);
  return()=>{cancelled=true;clearTimeout(timeout);for(const link of [font,sheet]){link.removeEventListener('load',done);link.removeEventListener('error',done)};font.dataset.users=String(Number(font.dataset.users||1)-1);if(font.dataset.users==='0')font.remove();sheet.remove();bridge.remove();target.remove()};
 },[]);

 const brand=str(data.identity,'name',project.name||'Vet-se');
 const whatsapp=str(data.contact,'whatsapp').replace(/\D/g,'');
 const showCatalog=String(data.content.show_catalog??true)!=='false',showCart=String(data.content.show_cart??true)!=='false',showAbout=String(data.content.show_about??true)!=='false',showInstagram=String(data.content.show_instagram??true)!=='false';
 const instagram=str(data.contact,'instagram'),instagramUrl=instagram&&showInstagram?ig(instagram):'';
 const creatorInstagram=str(data.content,'creator_instagram'),creatorInstagramUrl=creatorInstagram&&showInstagram?ig(creatorInstagram):'';
 const heroImage=mediaUrl(data.media.hero)||'/assets/media/vet-hero.webp';
 const aboutImage=mediaUrl(data.media.creator);
 const storageKey=`webappcap-modern-${preview?'preview-':''}${project.id}`;
 const catalogSignature=useMemo(()=>JSON.stringify(data.content.menu_items??[]),[data.content.menu_items]);
 const [restoredKey,setRestoredKey]=useState('');

 const products=useMemo<Product[]>(()=>activeCommerceProducts(data.content.menu_items).map(({raw,productIndex})=>mapCommerceProductToModern(raw,productIndex)),[data.content.menu_items]);

 const productById=useMemo(()=>new Map(products.map(product=>[product.id,product])),[products]);
 const byId=(id:string|number)=>productById.get(Number(id));
 const categoryCounts=useMemo(()=>products.reduce<Record<string,number>>((acc,product)=>{if(product.category)acc[product.category]=(acc[product.category]||0)+1;return acc},Object.create(null) as Record<string,number>),[products]);
 const categories=useMemo<(string|null)[]>(()=>[null,...Object.keys(categoryCounts).sort((a,b)=>a.localeCompare(b,'pt-BR',{sensitivity:'base'}))],[categoryCounts]);
 const [pins,ecobag,botton]=useMemo(()=>[
  products.find(p=>norm(p.name).includes('pins para crocs'))||products.find(p=>p.category==='Pins para Crocs')||products[0],
  products.find(p=>norm(p.name).includes('ecobag patinhas'))||products.find(p=>p.category==='Ecobags')||products[1],
  products.find(p=>norm(p.name).includes('patinha lgbt'))||products.find(p=>p.category==='Bottons')||products[2]
 ],[products]);

 const [cart,setCart]=useState<Record<string,number>>({});
 const [open,setOpen]=useState(false),[zoom,setZoom]=useState<{src:string;alt:string}|null>(null),[toast,setToast]=useState('');
 const toastTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const [customerName,setCustomerName]=useState(''),[customerPhone,setCustomerPhone]=useState('');
 const pulseTimer=useRef<ReturnType<typeof setTimeout>|null>(null),pulseFrame=useRef<number|null>(null);
 const closeCart=useCallback(()=>{setOpen(false);cartButtonRef.current?.focus()},[]);
 const [category,setCategory]=useState<string|null>(null),[query,setQuery]=useState('');
 const deferredQuery=useDeferredValue(query);

 useReveal(root,mount,`${showCatalog}:${showAbout}`);

 const restoreKey=`${storageKey}:${catalogSignature}`;
 useEffect(()=>{
  let saved:unknown=null;try{saved=JSON.parse(localStorage.getItem(storageKey)||'null')}catch{/* Storage may be blocked. */}
  setCart(restoreModernCart(saved,catalogSignature,new Set(productById.keys())));setRestoredKey(restoreKey);
 },[storageKey,catalogSignature,productById,restoreKey]);
 useEffect(()=>{if(restoredKey!==restoreKey)return;try{localStorage.setItem(storageKey,JSON.stringify({signature:catalogSignature,items:cart}))}catch{/* Storage may be blocked. */}},[cart,storageKey,catalogSignature,restoredKey,restoreKey]);
 useEffect(()=>{
  if(!open&&!zoom)return;
  const previous=document.body.style.overflow;document.body.style.overflow='hidden';
  return()=>{document.body.style.overflow=previous};
 },[open,zoom]);
 useEffect(()=>()=>{if(toastTimer.current)clearTimeout(toastTimer.current);if(pulseTimer.current)clearTimeout(pulseTimer.current);if(pulseFrame.current!==null)cancelAnimationFrame(pulseFrame.current)},[]);
 useEffect(()=>{
  [heroImage,pins?.image,ecobag?.image,botton?.image].filter(Boolean).forEach(src=>{const img=new Image();img.decoding='async';img.src=String(src)});
 },[heroImage,pins?.image,ecobag?.image,botton?.image]);

 const flash=(msg:string)=>{setToast(msg);if(toastTimer.current)clearTimeout(toastTimer.current);toastTimer.current=setTimeout(()=>setToast(''),2200)};
 const add=(id:number)=>{
  setCart(c=>({...c,[id]:Math.min(999,(c[id]||0)+1)}));
  setCartPulse(false);if(pulseFrame.current!==null)cancelAnimationFrame(pulseFrame.current);if(pulseTimer.current)clearTimeout(pulseTimer.current);pulseFrame.current=requestAnimationFrame(()=>setCartPulse(true));pulseTimer.current=setTimeout(()=>setCartPulse(false),360);
  const product=byId(id);if(product)flash(`${product.name} adicionado ao carrinho`);
 };
 const step=(id:string,d:number)=>setCart(c=>{const n={...c},q=(n[id]||0)+d;if(q<1)delete n[id];else n[id]=Math.min(999,q);return n});
 const remove=(id:string)=>setCart(c=>{const n={...c};delete n[id];return n});
 const entries=useMemo(()=>Object.entries(cart).filter(([id])=>productById.has(Number(id))),[cart,productById]);
 const count=useMemo(()=>entries.reduce((sum,[,qty])=>sum+qty,0),[entries]);
 const total=useMemo(()=>entries.reduce((sum,[id,qty])=>{const product=productById.get(Number(id));return product?sum+commerceLineTotal(product.raw,qty):sum},0),[entries,productById]);
 const q=norm(deferredQuery.trim());
 const list=useMemo(()=>products.filter(product=>(category===null||product.category===category)&&(!q||norm(`${product.name} ${product.category} ${product.description}`).includes(q))),[products,category,q]);
 useEffect(()=>{if(catalogRef.current)catalogRef.current.scrollLeft=0},[category,q,list.length]);
 const wa=(msg='')=>whatsapp?`https://wa.me/${whatsapp}${msg?`?text=${encodeURIComponent(msg)}`:''}`:'#';
 const customerReady=customerName.trim().length>=2&&customerPhone.replace(/\D/g,'').length>=8;
 const send=()=>{
  if(!entries.length||!whatsapp||!customerReady)return;
  const lines=entries.map(([id,qty])=>{const p=byId(id)!;return `• ${qty}x ${p.name} — ${brl(commerceLineTotal(p.raw,qty))}`});
  const orderTemplate=str(data.content,'whatsapp_order_message',`Olá! Gostaria de fazer este pedido na {loja}:\n\n{itens}\n\nTotal estimado: {total}\n\nPode me confirmar a disponibilidade?`);
  const msg=`Nome: ${customerName.trim()}\nTelefone: ${customerPhone.trim()}\n\n${orderTemplate.replaceAll('{loja}',brand).replaceAll('{itens}',lines.join('\n')).replaceAll('{total}',brl(total)).replaceAll('{quantidade}',String(count))}`;
  if(!preview)trackCommerceOrder({projectId:project.id,templateKey:'commerce-modern-1',customerName,customerPhone,items:entries.map(([id,quantity])=>({productIndex:byId(id)!.productIndex,quantity}))});
  window.open(wa(msg),'_blank','noopener,noreferrer');
 };

 const updateCatalogRange=useCallback(()=>{
  const el=catalogRef.current;if(!el||!el.firstElementChild)return;
  const card=el.firstElementChild as HTMLElement;
  const gap=Number.parseFloat(getComputedStyle(el).columnGap)||0,step=card.offsetWidth+gap,visibleColumns=Math.max(1,Math.round((el.clientWidth+gap)/step));
  const column=Math.max(0,Math.round(el.scrollLeft/step));
  const start=column*2+1,end=Math.min(list.length,start+visibleColumns*2-1);
  const next={start:Math.min(start,Math.max(1,list.length)),end};
  setCatalogRange(current=>current.start===next.start&&current.end===next.end?current:next);
 },[list.length]);
 useEffect(()=>{if(!mount||!catalogRef.current)return;updateCatalogRange();const observer=new ResizeObserver(updateCatalogRange);observer.observe(catalogRef.current);return()=>observer.disconnect()},[mount,category,q,updateCatalogRange]);
 const scrollCatalog=(direction:-1|1)=>{
  const el=catalogRef.current;if(!el)return;
  el.scrollBy({left:direction*el.clientWidth*.92,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 };
 const moveHero=(event:React.PointerEvent<HTMLDivElement>)=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const rect=event.currentTarget.getBoundingClientRect(),x=((event.clientX-rect.left)/rect.width-.5)*10,y=((event.clientY-rect.top)/rect.height-.5)*8;
  event.currentTarget.style.setProperty('--hero-x',`${x}px`);event.currentTarget.style.setProperty('--hero-y',`${y}px`);
 };
 const resetHero=(event:React.PointerEvent<HTMLDivElement>)=>{event.currentTarget.style.setProperty('--hero-x','0px');event.currentTarget.style.setProperty('--hero-y','0px')};

 const STRIP=str(data.content,'modern_marquee','PRODUTINHOS PARA QUEM VIVE A ROTINA VET ✦ FEITO COM AMOR ESPECIALMENTE PARA VOCÊ ✦');
 const ext={target:'_blank' as const,rel:'noopener noreferrer'};
 const highlights=[
  {product:pins,cls:'highlight large',tag:'Mais procurados',title:pins?.category||pins?.name||'Destaques',text:pins?`${brl(pins.price)} a unidade. Escolha seus modelos favoritos e finalize o pedido pelo WhatsApp.`:''},
  {product:ecobag,cls:'highlight',tag:'Promoção',title:ecobag?.category||ecobag?.name||'Produtos',text:ecobag?commercePromoLabel(ecobag.raw,brl)||`${brl(ecobag.price)} a unidade`:''},
  {product:botton,cls:'highlight',tag:'Mimos',title:botton?.category||botton?.name||'Produtos',text:botton?commercePromoLabel(botton.raw,brl)||`${brl(botton.price)} a unidade`:''}
 ];

 const updateHighlightIndex=useCallback(()=>{
  const el=highlightsRef.current,first=el?.firstElementChild as HTMLElement|null;
  if(!el||!first)return;
  const gap=Number.parseFloat(getComputedStyle(el).columnGap)||0;
  const width=first.offsetWidth+gap;
  const index=width>0&&el.scrollWidth>el.clientWidth?Math.min(2,Math.max(0,Math.round(el.scrollLeft/width))):0;
  setHighlightIndex(current=>current===index?current:index);
 },[]);
 useEffect(()=>{
  const el=highlightsRef.current;if(!mount||!el)return;
  const observer=new ResizeObserver(updateHighlightIndex);observer.observe(el);
  return()=>observer.disconnect();
 },[mount,updateHighlightIndex]);
 const showHighlight=(index:number)=>{
  const el=highlightsRef.current,target=el?.children[index] as HTMLElement|undefined;
  if(!el||!target)return;
  el.scrollTo({left:target.getBoundingClientRect().left-el.getBoundingClientRect().left+el.scrollLeft,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 };

 const navigateSection=useCallback((event:React.MouseEvent<HTMLAnchorElement>)=>{
  const id=event.currentTarget.hash.slice(1);
  const section=root.current?.querySelector<HTMLElement>(`[id="${id}"]`);
  if(!section)return;
  event.preventDefault();
  section.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 },[]);

 const content=<div ref={root} className={'commerce-modern-document js'+(assetsReady?' assets-ready':' assets-loading')}>
  <div className="topbar" aria-hidden="true"><div className="marquee">{Array.from({length:6},(_,i)=><span key={i}>{STRIP}</span>)}</div></div>

  <nav className="nav" aria-label="Principal"><div className="container nav-inner">
   <a href="#topo" onClick={navigateSection} className="logo" aria-label={`${brand}, início`}><span>{brand}</span></a>
   <div className="nav-links"><a href="#destaques" onClick={navigateSection}>Destaques</a>{showCatalog?<a href="#catalogo" onClick={navigateSection}>Catálogo</a>:null}{showAbout?<a href="#sobre" onClick={navigateSection}>Sobre</a>:null}{instagramUrl?<a href={instagramUrl} {...ext}>Instagram ↗</a>:null}</div>
   {showCart?<button ref={cartButtonRef} className={'cart-pill'+(cartPulse?' cart-pulse':'')} onClick={()=>setOpen(!open)} aria-controls="drawer" aria-expanded={open}>Carrinho · {count}<span className="cart-total-mini"> · {brl(total)}</span></button>:null}
  </div></nav>

  <header className="hero" id="topo"><div className="container hero-grid" onPointerMove={moveHero} onPointerLeave={resetHero}>
   <div className="hero-art"><img style={mediaStyle(data.media.hero)} src={heroImage} fetchPriority="high" decoding="async" onLoad={markImageLoaded} onError={markImageLoaded} alt={`Capa da ${brand}`} tabIndex={0} role="button" onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.currentTarget.click()}}} onClick={()=>setZoom({src:heroImage,alt:`Capa da ${brand}`})}/></div>
   <div className="hero-copy">
    <h1>{str(data.content,'modern_hero_title')?<>{str(data.content,'modern_hero_title')}</>:<>{brand} do seu <span className="mark">jeitinho.</span></>}</h1>
    <p>{str(data.content,'modern_hero_text','Adesivos, chaveiros, mimos, bottons, ecobags e mais para deixar seus materiais e acessórios ainda mais a sua cara.')}</p>
    <div className="hero-actions">{showCatalog?<a href="#catalogo" onClick={navigateSection} className="btn btn-main">Ver produtos ↓</a>:null}{whatsapp?<a href={wa()} {...ext} className="btn btn-soft">Falar no WhatsApp</a>:null}{instagramUrl?<a href={instagramUrl} {...ext} className="btn btn-main">Seguir a loja ↗</a>:null}</div>
   </div>
  </div></header>

  <main>
   <section id="destaques"><div className="container">
    <div className="section-top" data-reveal><div><div className="kicker">Destaques da {brand}</div><h2>{str(data.content,'modern_highlights_title')||<>Os queridinhos<br/>por aqui.</>}</h2></div><p className="section-desc">{str(data.content,'modern_highlights_intro','Uma seleção especial para deixar sua rotina vet mais divertida, colorida e cheia de personalidade.')}</p></div>
    <div ref={highlightsRef} className="highlights" onScroll={updateHighlightIndex} data-reveal tabIndex={0} role="group" aria-label="Produtos em destaque. Em telas pequenas, role horizontalmente para ver mais.">{highlights.map((h,i)=>{const src=h.product?.image||'';return <article className={h.cls} key={i} style={{'--highlight-index':i} as React.CSSProperties}>{src?<img src={src} alt={h.title} loading="eager" decoding="async" onLoad={markImageLoaded} onError={markImageLoaded} tabIndex={0} role="button" onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.currentTarget.click()}}} onClick={()=>setZoom({src,alt:h.title})}/>:null}<div className="highlight-copy"><small>{h.tag}</small><h3>{h.title}</h3><p>{h.text}</p></div></article>})}</div>
    <div className="highlight-pagination" role="group" aria-label="Navegar pelos destaques">{highlights.map((highlight,index)=><button key={index} type="button" onClick={()=>showHighlight(index)} aria-label={`Ver destaque ${index+1}: ${highlight.title}`} aria-pressed={highlightIndex===index}><span aria-hidden="true"/></button>)}</div>
   </div></section>

   {showCatalog?<section id="catalogo"><div className="container">
    <div className="section-top" data-reveal><div><div className="kicker">Catálogo</div><h2>Escolha seus<br/>favoritos.</h2></div><p className="section-desc">{str(data.content,'menu_intro','Busque pelo nome ou navegue pelas categorias para encontrar o produtinho perfeito.')}</p></div>
    <div className="chips" data-reveal role="group" aria-label="Filtrar por categoria">{categories.map(c=>{const n=c===null?products.length:(categoryCounts[c]||0);return <button key={c===null?'all':`category:${c}`} className="chip" title={c??'Todos'} aria-pressed={c===category} onClick={()=>setCategory(c)}>{c??'Todos'} <small>{n} {n===1?'item':'itens'}</small></button>})}</div>
    <div className="shop-tools" data-reveal><input className="search" type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar por nome, descrição ou categoria" aria-label="Buscar produtos"/><div className="counter" aria-live="polite">{list.length} produto{list.length!==1?'s':''}</div></div>
    <div className={'products-shell'+(category===null?' is-carousel':'')} data-reveal>
     {category===null&&list.length>8?<button className="catalog-arrow catalog-prev" type="button" onClick={()=>scrollCatalog(-1)} aria-label="Ver produtos anteriores">‹</button>:null}
     <div ref={catalogRef} className={'products'+(category===null?' products-all':'')} onScroll={category===null?updateCatalogRange:undefined} tabIndex={category===null?0:undefined} aria-label={category===null?'Todos os produtos. Role horizontalmente para ver mais.':undefined}>{list.length?list.map(p=><article className="card" key={p.id}><div className="card-img">{p.promo?<div className="promo">{p.promo}</div>:null}{p.image?<img style={mediaStyle(p.raw,'image_')} src={p.image} alt={p.name} loading="lazy" decoding="async" width="400" height="400" onLoad={markImageLoaded} onError={markImageLoaded} tabIndex={0} role="button" onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.currentTarget.click()}}} onClick={()=>setZoom({src:p.image,alt:p.name})}/>:null}</div><div className="card-body"><div className="meta">{p.category}</div><h3>{p.name}</h3><p>{p.description}</p><div className="price-line"><div className="price">{brl(p.price)}</div>{showCart?<button className="plus" onClick={event=>{event.currentTarget.classList.remove('pop');void event.currentTarget.offsetWidth;event.currentTarget.classList.add('pop');add(p.id)}} aria-label={`Adicionar ${p.name} ao carrinho`}>+</button>:null}</div></div></article>):<div className="empty">Nada encontrado para essa busca. Tente outra palavra ou fale com a gente pelo WhatsApp.</div>}</div>
     {category===null&&list.length>8?<button className="catalog-arrow catalog-next" type="button" onClick={()=>scrollCatalog(1)} aria-label="Ver mais produtos">›</button>:null}
     {category===null&&list.length?<div className="catalog-position" aria-live="polite">{catalogRange.start}–{catalogRange.end} de {list.length}</div>:null}
    </div>
    <div className="notfound" data-reveal><div><h3>{str(data.content,'modern_notfound_title','Não encontrou o que queria?')}</h3><p>{str(data.content,'modern_notfound_text',`Entre em contato pelo WhatsApp e a ${brand} te ajuda a encontrar o produto ideal.`)}</p></div>{whatsapp?<a className="btn btn-main" href={wa(str(data.content,'whatsapp_direct_message','Olá! Visitei o site da {loja} e gostaria de informações sobre outros produtos.').replaceAll('{loja}',brand))} {...ext}>Falar no WhatsApp ↗</a>:null}</div>
   </div></section>:null}

   {showAbout?<section id="sobre"><div className="container"><div className="about-grid" data-reveal>
    <div className="about-copy"><div className="kicker">Sobre a {brand}</div><h2>Feito com amor especialmente para você.</h2><p>{str(data.content,'about_main','A Vet-se nasceu do amor pela Medicina Veterinária e pelo desejo de tornar a rotina vet ainda mais especial, com produtos criativos, funcionais e cheios de personalidade.')}</p><p>{str(data.content,'creator_bio','Aqui você encontra itens pensados por e para quem vive o dia a dia entre consultas, plantões, estudos e muito amor pelos animais.')}</p><div className="signature">{str(data.content,'creator_name','Vitória Catalano')} · Criadora da marca</div><div className="about-actions">{instagramUrl?<a className="btn btn-main" href={instagramUrl} {...ext}>Seguir a loja ↗</a>:null}{creatorInstagramUrl?<a className="btn btn-main" href={creatorInstagramUrl} {...ext}>Seguir a criadora ↗</a>:null}</div></div>
    <div className="about-photo">{aboutImage?<img style={mediaStyle(data.media.creator)} src={aboutImage} alt={str(data.content,'creator_name','Vitória Catalano')} loading="lazy" decoding="async" onLoad={markImageLoaded} onError={markImageLoaded} tabIndex={0} role="button" onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.currentTarget.click()}}} onClick={()=>setZoom({src:aboutImage,alt:str(data.content,'creator_name','Vitória Catalano')})}/>:null}</div>
   </div></div></section>:null}
  </main>

  <footer><div className="container footer"><div><strong>{brand}</strong> · Adesivos · Chaveiros · Mimos · Bottons · Ecobags e mais</div><div>Site por <a href="https://webappcap.com.br" target="_blank" rel="noopener">WebAppCap</a></div></div></footer>

  {showCart?<ModernCart open={open} entries={entries} total={total} whatsapp={whatsapp} productById={productById} onClose={closeCart} customerName={customerName} customerPhone={customerPhone} onName={setCustomerName} onPhone={setCustomerPhone} customerReady={customerReady} onStep={step} onRemove={remove} onSend={send}/>:null}
  <Lightbox zoom={zoom} onClose={()=>setZoom(null)}/>
  <div className={'toast'+(toast?' show':'')} role="status" aria-live="polite">{toast}</div>
 </div>;
 return <div ref={host}>{mount?createPortal(content,mount):null}</div>;
}

function ModernCart({open,entries,total,whatsapp,productById,onClose,onStep,onRemove,onSend,customerName,customerPhone,onName,onPhone,customerReady}:{open:boolean;entries:[string,number][];total:number;whatsapp:string;productById:Map<number,Product>;onClose:()=>void;onStep:(id:string,d:number)=>void;onRemove:(id:string)=>void;onSend:()=>void;customerName:string;customerPhone:string;onName:(value:string)=>void;onPhone:(value:string)=>void;customerReady:boolean}){
 const drawerRef=useRef<HTMLElement>(null);
 useEffect(()=>{
  if(!open)return;
  const drawer=drawerRef.current;if(!drawer)return;
  const focusable=()=>Array.from(drawer.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled])'));
  const first=focusable()[0];first?.focus();
  const onKey=(event:KeyboardEvent)=>{
   if(event.key==='Escape'){event.preventDefault();onClose();return}
   if(event.key!=='Tab')return;
   const items=focusable();if(!items.length)return;
   const firstItem=items[0],lastItem=items[items.length-1];
   if(event.shiftKey&&(drawer.getRootNode() as ShadowRoot).activeElement===firstItem){event.preventDefault();lastItem.focus()}
   else if(!event.shiftKey&&(drawer.getRootNode() as ShadowRoot).activeElement===lastItem){event.preventDefault();firstItem.focus()}
  };
  document.addEventListener('keydown',onKey);return()=>document.removeEventListener('keydown',onKey);
 },[open,onClose]);
 return <>
  <div className={'backdrop'+(open?' show':'')} onClick={onClose}/>
  <aside ref={drawerRef} className={'drawer'+(open?' open':'')} id="drawer" inert={!open} aria-hidden={!open} role="dialog" aria-modal={open?true:undefined} aria-label="Carrinho">
   <div className="drawer-head"><h3>Seu carrinho</h3><button className="close" onClick={onClose} aria-label="Fechar carrinho"><span aria-hidden="true">×</span></button></div>
   <div className="cart-items" aria-live="polite">{entries.length?entries.map(([id,qty])=>{const p=productById.get(Number(id));if(!p)return null;return <div className="cart-row" key={id}>
    <div className="cart-product"><strong>{p.name}</strong><div className="cart-unit">{brl(p.price)} cada</div><div className="stepper" aria-label={`Quantidade de ${p.name}`}><button onClick={()=>onStep(id,-1)} aria-label={`Diminuir ${p.name}`}>−</button><span>{qty}</span><button onClick={()=>onStep(id,1)} aria-label={`Aumentar ${p.name}`}>+</button></div></div>
    <strong className="cart-line-total">{brl(commerceLineTotal(p.raw,qty))}</strong><span/><button className="remove" onClick={()=>onRemove(id)} aria-label={`Remover ${p.name}`}>Remover</button>
   </div>}):<div className="cart-empty">Seu carrinho está vazio. Toque no + de um produto para adicionar.</div>}</div>
   <div className="drawer-foot"><div className="totalrow"><span>Total estimado</span><span>{brl(total)}</span></div><div className="customer-fields"><label>Seu nome<input value={customerName} onChange={event=>onName(event.target.value)} autoComplete="name" maxLength={120}/></label><label>Telefone<input type="tel" value={customerPhone} onChange={event=>onPhone(event.target.value)} autoComplete="tel" maxLength={30}/></label></div><button className="btn wa" disabled={!entries.length||!whatsapp||!customerReady} onClick={onSend}>Enviar pedido pelo WhatsApp</button></div>
  </aside>
 </>;
}

function Lightbox({zoom,onClose}:{zoom:{src:string;alt:string}|null;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const d=ref.current;if(!d)return;if(zoom&&!d.open)d.showModal();if(!zoom&&d.open)d.close()},[zoom]);
 return <dialog id="lightbox" ref={ref} aria-label="Foto ampliada" aria-modal="true" onClose={onClose} onClick={event=>{const target=event.target as HTMLElement;if(target===ref.current||target.closest('.lb-close'))ref.current?.close()}}><button className="lb-close" aria-label="Fechar foto"><span aria-hidden="true">×</span></button><img id="lbImg" src={zoom?.src||undefined} alt={zoom?.alt||''}/><p className="lb-cap">{zoom?.alt||''}</p></dialog>;
}
