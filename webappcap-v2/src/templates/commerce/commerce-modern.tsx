'use client';

import {useMemo,useState} from 'react';
import {commerceCategories,commerceLineTotal,commercePromoLabel} from '@/core/commerce-promotions';
import {trackCommerceOrder} from '@/lib/commerce-order-tracking';
import type {TemplateRenderProps} from '../types';
import styles from './commerce-modern.module.css';

type Row=Record<string,unknown>;
type Cart=Record<number,number>;

const rows=(v:unknown)=>Array.isArray(v)?v.filter(x=>x&&typeof x==='object') as Row[]:[];
const text=(r:Record<string,unknown>,k:string,f='')=>String(r[k]??'').trim()||f;
const media=(v:unknown)=>v&&typeof v==='object'&&'url'in v?String((v as {url?:unknown}).url||''):typeof v==='string'?v:'';
const ig=(v:string)=>v.startsWith('http')?v:`https://instagram.com/${v.replace(/^@/,'')}`;
const brl=(n:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n);

export function CommerceModernTemplate({project,data}:TemplateRenderProps){
 const name=text(data.identity,'name',project.name||'Sua loja');
 const whatsapp=text(data.contact,'whatsapp').replace(/\D/g,'');
 const instagram=text(data.contact,'instagram'),instagramUrl=instagram?ig(instagram):'';
 const hero=media(data.media.hero),creator=media(data.media.creator);
 const all=rows(data.content.menu_items);
 const products=useMemo(()=>all.map((item,index)=>({item,index})).filter(({item})=>text(item,'active','true').toLowerCase()!=='false'),[data.content.menu_items]);
 const categories=useMemo(()=>commerceCategories(products.map(p=>p.item)),[products]);
 const [cat,setCat]=useState('Todos'),[q,setQ]=useState(''),[cart,setCart]=useState<Cart>({}),[drawer,setDrawer]=useState(false),[zoom,setZoom]=useState<{src:string;alt:string}|null>(null),[customerName,setCustomerName]=useState(''),[customerPhone,setCustomerPhone]=useState('');
 const filtered=useMemo(()=>products.filter(({item})=>(cat==='Todos'||text(item,'category')===cat)&&(!q||`${text(item,'title')} ${text(item,'category')} ${text(item,'description')}`.toLowerCase().includes(q.toLowerCase()))),[products,cat,q]);
 const chosen=products.map(({item,index})=>({item,index,quantity:cart[index]||0})).filter(x=>x.quantity>0);
 const count=chosen.reduce((s,x)=>s+x.quantity,0),total=chosen.reduce((s,x)=>s+commerceLineTotal(x.item,x.quantity),0);
 const change=(index:number,delta:number)=>{setCart(c=>({...c,[index]:Math.max(0,(c[index]||0)+delta)}));if(delta>0)setDrawer(true)};
 const featured=rows(data.content.highlights).slice(0,3);
 const highlights=featured.length?featured:products.slice(0,3).map(x=>x.item);
 const marquee=text(data.content,'modern_marquee','PRODUTINHOS PARA QUEM VIVE A ROTINA VET ✦ FEITO COM AMOR ESPECIALMENTE PARA VOCÊ ✦');
 const heroTitle=text(data.content,'modern_hero_title',`${name} do seu jeitinho.`);
 const heroText=text(data.content,'modern_hero_text',text(data.identity,'description','Produtos criativos e cheios de personalidade para deixar sua rotina ainda mais a sua cara.'));
 const heroKicker=text(data.content,'hero_kicker',text(data.identity,'tagline','Produtinhos para quem vive a rotina vet'));
 const orderTpl=text(data.content,'whatsapp_order_message','Olá! Quero fazer este pedido:\n\n{itens}\n\nTotal: {total}');
 const itemLines=chosen.map(x=>`• ${x.quantity}x ${text(x.item,'title')} — ${brl(commerceLineTotal(x.item,x.quantity))}`).join('\n');
 const order=orderTpl.replaceAll('{itens}',itemLines).replaceAll('{total}',brl(total)).replaceAll('{quantidade}',String(count)).replaceAll('{loja}',name);
 const ready=customerName.trim().length>=2&&customerPhone.replace(/\D/g,'').length>=8;
 const send=whatsapp?`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Nome: ${customerName.trim()}\nTelefone: ${customerPhone.trim()}\n\n${order}`)}`:'#';
 const directTpl=text(data.content,'whatsapp_direct_message','Olá! Visitei o site da {loja} e gostaria de informações sobre outros produtos.');
 const direct=whatsapp?`https://wa.me/${whatsapp}?text=${encodeURIComponent(directTpl.replaceAll('{loja}',name))}`:'#';
 const record=()=>trackCommerceOrder({projectId:project.id,templateKey:'commerce-modern-1',customerName:customerName.trim(),customerPhone:customerPhone.trim(),items:chosen.map(x=>({productIndex:x.index,quantity:x.quantity}))});

 return <div className={styles.site}>
  <div className={styles.strip}><div>{Array.from({length:6},(_,i)=><span key={i}>{marquee}</span>)}</div></div>
  <nav className={styles.nav}><div className={styles.container}><a className={styles.logo} href="#topo"><span>{name}</span></a><div className={styles.links}><a href="#destaques">Destaques</a><a href="#catalogo">Catálogo</a><a href="#sobre">Sobre</a>{instagramUrl?<a href={instagramUrl} target="_blank" rel="noreferrer">Instagram ↗</a>:null}</div><button type="button" onClick={()=>setDrawer(true)}>Carrinho · {count}</button></div></nav>
  <header className={styles.hero} id="topo"><div className={`${styles.container} ${styles.heroGrid}`}>{hero?<div className={styles.heroArt}><img src={hero} alt={`Capa de ${name}`} onClick={()=>setZoom({src:hero,alt:`Capa de ${name}`})}/></div>:<div className={styles.heroFallback}/>}<div className={styles.heroCopy}><span className={styles.tag}>🐾 {heroKicker}</span><h1>{heroTitle}</h1><p>{heroText}</p><div className={styles.heroActions}><a href="#catalogo">Ver produtos ↓</a>{whatsapp?<a href={direct} target="_blank" rel="noreferrer">Falar no WhatsApp</a>:null}{instagramUrl?<a href={instagramUrl} target="_blank" rel="noreferrer">Seguir a loja ↗</a>:null}</div></div><aside className={styles.heroCard}><h3>{text(data.content,'modern_card_title','Escolha seus favoritos e peça pelo WhatsApp.')}</h3><p>{text(data.content,'modern_card_text','Simples e direto, sem cadastro.')}</p><ul><li>Catálogo por categorias</li><li>Promoções em itens selecionados</li><li>Atendimento direto e prático</li></ul></aside></div></header>
  <main>
   <section id="destaques"><div className={styles.container}><div className={styles.sectionTop}><div><span>Destaques de {name}</span><h2>{text(data.content,'modern_highlights_title','Os queridinhos por aqui.')}</h2></div><p>{text(data.content,'modern_highlights_intro','Uma seleção especial para deixar sua rotina mais divertida, colorida e cheia de personalidade.')}</p></div><div className={styles.highlights}>{highlights.map((item,i)=>{const src=media(item.image)||text(item,'image'),title=text(item,'title',`Destaque ${i+1}`);return <article className={i===0?styles.large:styles.highlight} key={i}>{src?<img src={src} alt={title} onClick={()=>setZoom({src,alt:title})}/>:null}<div><small>{text(item,'category','Destaque')}</small><h3>{title}</h3><p>{text(item,'description')}</p></div></article>})}</div></div></section>
   <section id="catalogo"><div className={styles.container}><div className={styles.sectionTop}><div><span>Catálogo</span><h2>Escolha seus favoritos.</h2></div><p>{text(data.content,'menu_intro','Busque pelo nome ou navegue pelas categorias para encontrar o produto perfeito.')}</p></div><div className={styles.chips}><button type="button" aria-pressed={cat==='Todos'} onClick={()=>setCat('Todos')}>Todos <small>{products.length}</small></button>{categories.map(c=><button type="button" key={c} aria-pressed={cat===c} onClick={()=>setCat(c)}>{c} <small>{products.filter(p=>text(p.item,'category')===c).length}</small></button>)}</div><div className={styles.search}><input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar por nome, descrição ou categoria"/><strong>{filtered.length} produtos</strong></div><div className={styles.products}>{filtered.map(({item,index})=>{const src=text(item,'image'),promo=commercePromoLabel(item,brl);return <article className={styles.card} key={index}><button type="button" className={styles.image} onClick={()=>src&&setZoom({src,alt:text(item,'title')})}>{src?<img src={src} alt={text(item,'title')}/>:<span>Sem foto</span>}{promo?<em>{promo}</em>:null}</button><div className={styles.body}><small>{text(item,'category')}</small><h3>{text(item,'title',`Produto ${index+1}`)}</h3><p>{text(item,'description')}</p><div><strong>{text(item,'price','R$ 0,00')}</strong><button type="button" onClick={()=>change(index,1)}>+</button></div></div></article>})}</div><div className={styles.notFound}><div><h3>{text(data.content,'modern_notfound_title','Não encontrou o que queria?')}</h3><p>{text(data.content,'modern_notfound_text',`Entre em contato pelo WhatsApp e a ${name} te ajuda a encontrar o produto ideal.`)}</p></div>{whatsapp?<a href={direct} target="_blank" rel="noreferrer">Falar no WhatsApp ↗</a>:null}</div></div></section>
   <section id="sobre"><div className={`${styles.container} ${styles.about}`}><div className={styles.aboutCopy}><span>Sobre {name}</span><h2>{text(data.content,'about_title','Feito com amor especialmente para você.')}</h2><p>{text(data.content,'about_main',text(data.identity,'description'))}</p>{text(data.content,'creator_name')?<strong>{text(data.content,'creator_name')} · Criadora da marca</strong>:null}<div>{instagramUrl?<a href={instagramUrl} target="_blank" rel="noreferrer">Seguir a loja ↗</a>:null}{text(data.content,'creator_instagram')?<a href={ig(text(data.content,'creator_instagram'))} target="_blank" rel="noreferrer">Seguir a criadora ↗</a>:null}</div></div><div className={styles.aboutPhoto}>{creator?<img src={creator} alt={text(data.content,'creator_name','Criadora da marca')} onClick={()=>setZoom({src:creator,alt:text(data.content,'creator_name','Criadora da marca')})}/>:<span>Adicione a foto da criadora no editor.</span>}</div></div></section>
  </main>
  <footer className={styles.footer}><div className={styles.container}><strong>{name}</strong><a href="https://webappcap.com.br" target="_blank" rel="noreferrer">Site por WebAppCap</a></div></footer>
  <div className={drawer?styles.backdropOn:styles.backdrop} onClick={()=>setDrawer(false)}/>
  <aside className={drawer?styles.drawerOn:styles.drawer}><header><h3>Seu carrinho</h3><button type="button" onClick={()=>setDrawer(false)}>×</button></header><div className={styles.cart}>{chosen.length?chosen.map(x=><div key={x.index}><span><strong>{text(x.item,'title')}</strong><small>{brl(commerceLineTotal(x.item,x.quantity))}</small><i><button type="button" onClick={()=>change(x.index,-1)}>−</button><b>{x.quantity}</b><button type="button" onClick={()=>change(x.index,1)}>+</button></i></span><button type="button" onClick={()=>setCart(c=>({...c,[x.index]:0}))}>Remover</button></div>):<p>Seu carrinho está vazio.</p>}</div><footer><div><span>Total estimado</span><strong>{brl(total)}</strong></div>{chosen.length?<><input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Seu nome"/><input value={customerPhone} onChange={e=>setCustomerPhone(e.target.value)} placeholder="Seu telefone"/>{ready&&whatsapp?<a href={send} target="_blank" rel="noreferrer" onClick={record}>Enviar pedido pelo WhatsApp</a>:<small>Preencha nome e telefone para enviar</small>}</>:null}</footer></aside>
  {zoom?<div className={styles.lightbox} onClick={()=>setZoom(null)}><button type="button">×</button><img src={zoom.src} alt={zoom.alt}/></div>:null}
 </div>;
}
