'use client';

import Image from 'next/image';
import { useMemo,useState,type CSSProperties } from 'react';
import type { TemplateRenderProps } from '../types';
import styles from './commerce.module.css';

type Row=Record<string,unknown>;
type Cart=Record<number,number>;
type Vars=CSSProperties&{'--commerce-accent'?:string;'--commerce-heading'?:string;'--commerce-body'?:string};

const rows=(value:unknown)=>Array.isArray(value)?value.filter(item=>item&&typeof item==='object') as Row[]:[];
const text=(record:Record<string,unknown>,key:string,fallback='')=>String(record[key]??'').trim()||fallback;
const image=(record:Record<string,unknown>,key:string,fallback:string)=>{const value=record[key];return value&&typeof value==='object'&&'url' in value?String((value as {url?:unknown}).url||fallback):typeof value==='string'&&value?value:fallback};
const money=(value:string)=>{const cleaned=value.replace(/[^0-9,.-]/g,'').replace(/\.(?=.*\.)/g,'').replace(',','.');return Number.parseFloat(cleaned)||0};
const currency=(value:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value);

const fallbackNews=[
 {title:'Forno aberto todo dia',description:'Uma nova seleção de pães de fermentação lenta, assados em pequenos lotes.',image:'/commerce/commerce-hero.png'},
 {title:'Almoço de terça a sábado',description:'Pratos leves, ingredientes da estação e um cardápio que muda toda semana.',image:'/commerce/commerce-feature.png'},
 {title:'Café da tarde',description:'Bolos, cafés e uma pausa sem pressa no meio do dia.',image:'/commerce/commerce-menu.png'}
];
const fallbackHighlights=[
 {title:'Sanduíche da casa',description:'Pão artesanal, queijo fresco, tomate e folhas selecionadas.',image:'/commerce/commerce-feature.png'},
 {title:'Cappuccino cremoso',description:'Café encorpado, leite vaporizado e finalização delicada.',image:'/commerce/commerce-menu.png'},
 {title:'Cheesecake de frutas vermelhas',description:'Massa leve, recheio cremoso e frutas frescas.',image:'/commerce/commerce-menu.png'}
];
const fallbackMenu=[
 {title:'Sanduíche da casa',description:'Pão rústico, queijo fresco, tomate e folhas.',price:'R$ 28,00',image:'/commerce/commerce-feature.png'},
 {title:'Croissant artesanal',description:'Massa folhada, manteiga e fermentação lenta.',price:'R$ 14,00',image:'/commerce/commerce-menu.png'},
 {title:'Cappuccino',description:'Espresso, leite vaporizado e cacau.',price:'R$ 12,00',image:'/commerce/commerce-menu.png'},
 {title:'Cheesecake',description:'Fatia com calda de frutas vermelhas.',price:'R$ 18,00',image:'/commerce/commerce-menu.png'},
 {title:'Pão de queijo',description:'Porção com seis unidades assadas na hora.',price:'R$ 16,00',image:'/commerce/commerce-hero.png'}
];

export function CommerceTemplate({project,data}:TemplateRenderProps){
 const key=project.templateKey||text(data.appearance,'preview_template_key','commerce-main-1');
 const variant=key.includes('night')?'night':key.includes('classic')?'classic':'main';
 const name=text(data.identity,'name',project.name||'Casa Aurora');
 const tagline=text(data.identity,'tagline','Feito hoje. Servido com calma.');
 const location=text(data.identity,'location','Rua das Flores, 120 · Centro');
 const phone=text(data.contact,'phone','(16) 3342-2026');
 const whatsapp=text(data.contact,'whatsapp','5516999999999').replace(/\D/g,'');
 const hero=image(data.media,'hero','/commerce/commerce-hero.png');
 const news=rows(data.content.news).length?rows(data.content.news):fallbackNews;
 const highlights=rows(data.content.highlights).length?rows(data.content.highlights):fallbackHighlights;
 const menu=rows(data.content.menu_items).length?rows(data.content.menu_items):fallbackMenu;
 const [active,setActive]=useState(0);
 const [cart,setCart]=useState<Cart>({});
 const total=useMemo(()=>menu.reduce((sum,item,index)=>sum+money(text(item,'price'))*(cart[index]||0),0),[menu,cart]);
 const chosen=menu.map((item,index)=>({...item,index,quantity:cart[index]||0})).filter(item=>item.quantity>0);
 const change=(index:number,delta:number)=>setCart(current=>({...current,[index]:Math.max(0,(current[index]||0)+delta)}));
 const message=encodeURIComponent(['Olá! Quero fazer este pedido:',...chosen.map(item=>`• ${item.quantity}x ${text(item,'title')} — ${currency(money(text(item,'price'))*item.quantity)}`),`Total: ${currency(total)}`].join('\n'));
 const vars:Vars={'--commerce-accent':text(data.appearance,'accent',variant==='night'?'#ff6b35':variant==='classic'?'#9d3b2e':'#ef5b3f'),'--commerce-heading':text(data.appearance,'heading_font',variant==='night'?'Space Grotesk':variant==='classic'?'Georgia':'Arial Black'),'--commerce-body':text(data.appearance,'body_font','Arial')};

 return <div className={styles.site} data-variant={variant} style={vars}>
  <header className={styles.topbar}><a className={styles.wordmark} href="#inicio">{name}</a><nav aria-label="Navegação principal"><a href="#inicio">Início</a><a href="#novidades">Novidades</a><a href="#destaques">Destaques</a><a href="#cardapio">Cardápio</a><a href="#pedido">Pedido <span>{chosen.reduce((sum,item)=>sum+item.quantity,0)}</span></a></nav></header>
  <main>
   <section className={styles.hero} id="inicio"><Image src={hero} alt={`Ambiente de ${name}`} fill priority sizes="100vw"/><div className={styles.heroShade}/><div className={styles.heroCopy}><span>COMÉRCIO LOCAL · FEITO PERTO</span><h1>{name}</h1><p>{tagline}</p><div className={styles.heroMeta}><span>{location}</span><a href={`tel:${phone.replace(/\D/g,'')}`}>{phone}</a><a className={styles.whatsapp} href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">Falar no WhatsApp ↗</a></div></div><a className={styles.scrollCue} href="#novidades">Descobrir ↓</a></section>

   <section className={styles.section} id="novidades"><header className={styles.sectionHead}><span>01 · AGORA</span><h2>Novidades</h2><p>O que acabou de chegar por aqui.</p></header><div className={styles.gallery}>{news.map((item,index)=><article className={styles.galleryCard} key={index}><div><Image src={text(item,'image','/commerce/commerce-hero.png')} alt={text(item,'title','Novidade')} fill sizes="(max-width: 760px) 90vw, 33vw"/></div><span>0{index+1}</span><h3>{text(item,'title',`Novidade ${index+1}`)}</h3><p>{text(item,'description')}</p><a href="#cardapio">Ver no cardápio →</a></article>)}</div></section>

   <section className={`${styles.section} ${styles.highlights}`} id="destaques"><header className={styles.sectionHead}><span>02 · ESCOLHAS DA CASA</span><h2>Destaques</h2><p>Os favoritos de quem já conhece.</p></header><div className={styles.highlightList}>{highlights.map((item,index)=><article key={index}><div className={styles.highlightImage}><Image src={text(item,'image','/commerce/commerce-feature.png')} alt={text(item,'title','Destaque')} fill sizes="(max-width: 760px) 100vw, 48vw"/></div><div><span>DESTAQUE 0{index+1}</span><h3>{text(item,'title',`Destaque ${index+1}`)}</h3><p>{text(item,'description')}</p><a href="#cardapio">Escolher no cardápio ↘</a></div></article>)}</div></section>

   <section className={`${styles.section} ${styles.menu}`} id="cardapio"><header className={styles.sectionHead}><span>03 · MENU</span><h2>Cardápio</h2><p>Passe sobre um item ou toque para ver todos os detalhes.</p></header><div className={styles.menuGrid}><div className={styles.menuRows}>{menu.map((item,index)=><button type="button" className={active===index?styles.activeMenu:undefined} onMouseEnter={()=>setActive(index)} onFocus={()=>setActive(index)} onClick={()=>setActive(index)} key={index}><span>{String(index+1).padStart(2,'0')}</span><strong>{text(item,'title',`Item ${index+1}`)}</strong><small>{text(item,'description')}</small><b>{text(item,'price','R$ 0,00')}</b><i>↗</i></button>)}</div><aside className={styles.menuPreview}><div><Image src={text(menu[active]||{},'image','/commerce/commerce-menu.png')} alt={text(menu[active]||{},'title','Item do cardápio')} fill sizes="(max-width: 760px) 92vw, 40vw"/></div><span>SELEÇÃO ATUAL</span><h3>{text(menu[active]||{},'title','Escolha um item')}</h3><p>{text(menu[active]||{},'description')}</p><strong>{text(menu[active]||{},'price','')}</strong><button type="button" onClick={()=>change(active,1)}>Adicionar ao pedido +</button></aside></div></section>

   <section className={`${styles.section} ${styles.order}`} id="pedido"><header className={styles.sectionHead}><span>04 · SEU PEDIDO</span><h2>Monte do seu jeito</h2><p>Escolha os itens, ajuste as quantidades e envie tudo pelo WhatsApp.</p></header><div className={styles.orderGrid}><div className={styles.orderOptions}>{menu.map((item,index)=><article key={index}><div><strong>{text(item,'title')}</strong><span>{text(item,'price')}</span></div><div className={styles.counter}><button type="button" onClick={()=>change(index,-1)} aria-label={`Remover ${text(item,'title')}`}>−</button><b>{cart[index]||0}</b><button type="button" onClick={()=>change(index,1)} aria-label={`Adicionar ${text(item,'title')}`}>+</button></div></article>)}</div><aside className={styles.receipt}><span>PEDIDO · {name}</span><h3>Seu pedido</h3>{chosen.length?chosen.map(item=><p key={item.index}><span>{item.quantity}× {text(item,'title')}</span><b>{currency(money(text(item,'price'))*item.quantity)}</b></p>):<p className={styles.empty}>Suas escolhas aparecerão aqui.</p>}<div className={styles.total}><span>Total</span><strong>{currency(total)}</strong></div><a href={chosen.length?`https://wa.me/${whatsapp}?text=${message}`:'#cardapio'} aria-disabled={!chosen.length} target={chosen.length?'_blank':undefined} rel={chosen.length?'noreferrer':undefined}>{chosen.length?'Enviar pedido pelo WhatsApp ↗':'Escolha um item primeiro'}</a><small>O estabelecimento confirmará disponibilidade, prazo e forma de pagamento.</small></aside></div></section>
  </main>
  <footer><strong>{name}</strong><span>{location} · {phone}</span><a href="#inicio">Voltar ao início ↑</a></footer>
 </div>;
}
