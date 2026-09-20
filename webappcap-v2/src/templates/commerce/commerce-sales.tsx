'use client';

import Image from 'next/image';
import {useEffect,useMemo,useRef,useState,type CSSProperties} from 'react';
import type {TemplateRenderProps} from '../types';
import {commerceSettings,replaceCommerceCatalogTerm} from '@/core/commerce-settings';
import styles from './commerce-sales.module.css';
import polish from './commerce-sales-polish.module.css';

type Row=Record<string,unknown>;
type Extra={name:string;price:number};
type CartLine={id:number;productIndex:number;quantity:number;removed:string[];extras:Extra[];note:string};

const rows=(value:unknown)=>Array.isArray(value)?value.filter(item=>item&&typeof item==='object') as Row[]:[];
const text=(record:Record<string,unknown>,key:string,fallback='')=>String(record[key]??'').trim()||fallback;
const media=(record:Record<string,unknown>,key:string,fallback:string)=>{const value=record[key];return value&&typeof value==='object'&&'url' in value?String((value as {url?:unknown}).url||fallback):typeof value==='string'&&value?value:fallback};
const mediaPosition=(record:Record<string,unknown>,key:string)=>{const value=record[key];return value&&typeof value==='object'&&'position' in value?String((value as {position?:unknown}).position||'center'):'center'};
const number=(value:string)=>Number.parseFloat(value.replace(/[^0-9,.-]/g,'').replace(/\.(?=.*\.)/g,'').replace(',','.'))||0;
const brl=(value:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value);
const lines=(value:unknown)=>String(value||'').split(/\r?\n|;/).map(item=>item.trim()).filter(Boolean);
const extras=(value:unknown)=>lines(value).map(item=>{const [name,raw='0']=item.split('|');return{name:name.trim(),price:number(raw)}}).filter(item=>item.name);

const fallback:Row[]=[
 {title:'Sanduíche da casa',category:'Lanches',description:'Pão artesanal, queijo fresco, tomate e folhas.',price:'R$ 28,00',image:'/commerce/commerce-feature.png',removals:'Queijo\nTomate\nFolhas',additions:'Bacon | 5,00\nQueijo extra | 4,00'},
 {title:'Croissant artesanal',category:'Lanches',description:'Massa folhada, manteiga e fermentação lenta.',price:'R$ 14,00',image:'/commerce/commerce-menu.png',additions:'Queijo | 4,00\nPresunto | 5,00'},
 {title:'Cappuccino',category:'Bebidas',description:'Espresso, leite vaporizado e cacau.',price:'R$ 12,00',image:'/commerce/commerce-hero.png',removals:'Cacau',additions:'Dose extra | 4,00\nLeite vegetal | 3,00'}
];

export function CommerceSalesTemplate({project,data}:TemplateRenderProps){
 const settings=commerceSettings(data.content);
 const storedProducts=rows(data.content.menu_items);
 const products:Row[]=storedProducts.length?storedProducts:fallback;
 const name=text(data.identity,'name',project.name||'Loja local');
 const tagline=text(data.identity,'tagline','Escolha, personalize e peça pelo WhatsApp.');
 const whatsapp=text(data.contact,'whatsapp','5516999999999').replace(/\D/g,'');
 const logo=media(data.media,'logo','/commerce/commerce-menu.png');
 const accent=text(data.appearance,'accent','#159447');
 const vars={'--sales-accent':accent,'--sales-logo-position':mediaPosition(data.media,'logo')} as CSSProperties;
 const categories=useMemo(()=>['Todos',...Array.from(new Set(products.map(item=>text(item,'category','Outros'))))],[products]);
 const [category,setCategory]=useState('Todos'),[query,setQuery]=useState(''),[selected,setSelected]=useState<number|null>(null),[cartOpen,setCartOpen]=useState(false);
 const [quantity,setQuantity]=useState(1),[removed,setRemoved]=useState<string[]>([]),[chosenExtras,setChosenExtras]=useState<Extra[]>([]),[note,setNote]=useState(''),[cart,setCart]=useState<CartLine[]>([]);
 const nextId=useRef(1);
 const defaultSalesWhatsappMessage='Olá! Quero fazer um pedido na {loja}.\n\nITENS DO PEDIDO\n{itens}\n\n💰 TOTAL: {total}',salesWhatsappTemplate=text(data.content,'sales_whatsapp_message',defaultSalesWhatsappMessage);
 const filtered=products.filter(item=>(category==='Todos'||text(item,'category','Outros')===category)&&`${text(item,'title')} ${text(item,'description')}`.toLowerCase().includes(query.toLowerCase()));
 const selectedProduct=selected===null?null:products[selected];
 const selectedExtras=selectedProduct?extras(selectedProduct.additions):[];
 const unitTotal=selectedProduct?number(text(selectedProduct,'price'))+chosenExtras.reduce((sum,item)=>sum+item.price,0):0;
 const cartTotal=cart.reduce((sum,line)=>{const product=products[line.productIndex]||{};return sum+(number(text(product,'price'))+line.extras.reduce((subtotal,item)=>subtotal+item.price,0))*line.quantity},0);
 const cartCount=cart.reduce((sum,line)=>sum+line.quantity,0);

 useEffect(()=>{const modal=selected!==null||cartOpen;if(!modal)return;const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape'){setSelected(null);setCartOpen(false)}};document.body.style.overflow='hidden';window.addEventListener('keydown',onKey);return()=>{document.body.style.overflow='';window.removeEventListener('keydown',onKey)}},[selected,cartOpen]);
 const openProduct=(index:number)=>{setSelected(index);setQuantity(1);setRemoved([]);setChosenExtras([]);setNote('')};
 const toggleRemoved=(value:string)=>setRemoved(current=>current.includes(value)?current.filter(item=>item!==value):[...current,value]);
 const toggleExtra=(value:Extra)=>setChosenExtras(current=>current.some(item=>item.name===value.name)?current.filter(item=>item.name!==value.name):[...current,value]);
 const addToCart=()=>{if(selected===null)return;setCart(current=>[...current,{id:nextId.current++,productIndex:selected,quantity,removed,extras:chosenExtras,note}]);setSelected(null)};
 const message=()=>{const itemLines=cart.flatMap(line=>{const product=products[line.productIndex]||{},base=[`${line.quantity}x ${text(product,'title')} — ${brl((number(text(product,'price'))+line.extras.reduce((sum,item)=>sum+item.price,0))*line.quantity)}`];if(line.removed.length)base.push(`  ❌ Sem: ${line.removed.join(', ')}`);if(line.extras.length)base.push(`  ➕ Adicionais: ${line.extras.map(item=>`${item.name} (${brl(item.price)})`).join(', ')}`);if(line.note)base.push(`  📝 Obs.: ${line.note}`);return base}).join('\n');const rendered=salesWhatsappTemplate.replaceAll('{loja}',name).replaceAll('{itens}',itemLines).replaceAll('{total}',brl(cartTotal)).replace(/\n{3,}/g,'\n\n').trim();return encodeURIComponent(rendered)};

 return <div className={`${styles.site} ${polish.polish}`} data-project={project.slug} style={vars}>
  <header className={styles.header}><div className={styles.brand}><div><Image src={logo} alt={`Logo de ${name}`} fill sizes="64px"/></div><span><strong>{name}</strong><small>{tagline}</small></span></div><button type="button" onClick={()=>setCartOpen(true)} aria-label={`Abrir pedido com ${cartCount} itens`}>Pedido <b>{cartCount}</b></button></header>
  <main><section className={styles.intro}><span>{settings.catalogLabel.toLocaleUpperCase('pt-BR')} ONLINE</span><h1>{replaceCommerceCatalogTerm(text(data.content,'menu_title','Peça do seu jeito'),settings)}</h1><p>{replaceCommerceCatalogTerm(text(data.content,'menu_intro','Escolha seus produtos, personalize e envie o pedido direto pelo WhatsApp.'),settings)}</p><label><span>Buscar no {settings.catalogLabelLower}</span><input type="search" value={query} onChange={event=>setQuery(event.target.value)} placeholder="O que você procura?"/></label></section>
   <nav className={styles.categories} aria-label="Categorias">{categories.map(item=><button type="button" key={item} aria-pressed={category===item} onClick={()=>setCategory(item)}>{item}</button>)}</nav>
   <section className={styles.catalog} aria-label={settings.catalogLabel}>{filtered.map(item=>{const index=products.indexOf(item);return <article className={styles.card} key={index}><button type="button" onClick={()=>openProduct(index)} aria-label={`Ver ${text(item,'title')}`}><div className={styles.photo}><Image src={text(item,'image','/commerce/commerce-feature.png')} alt={text(item,'title','Produto')} fill sizes="(max-width: 700px) 100vw, 33vw"/></div><div className={styles.cardBody}><small>{text(item,'category','Outros')}</small><h2>{text(item,'title',`Produto ${index+1}`)}</h2><p>{text(item,'description')}</p><footer><strong>{text(item,'price','R$ 0,00')}</strong><span>Adicionar</span></footer></div></button></article>})}{!filtered.length?<p className={styles.empty}>Nenhum produto encontrado.</p>:null}</section>
  </main>
  {cartCount?<button className={styles.floatingCart} type="button" onClick={()=>setCartOpen(true)}><span>{cartCount} {cartCount===1?'item':'itens'}</span><strong>Ver pedido · {brl(cartTotal)}</strong></button>:null}
  {selectedProduct?<div className={styles.backdrop} role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)setSelected(null)}}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="product-title"><button className={styles.close} type="button" onClick={()=>setSelected(null)} aria-label="Fechar">×</button><span className={styles.modalCategory}>{text(selectedProduct,'category','Produto')}</span><h2 id="product-title">{text(selectedProduct,'title')} · {text(selectedProduct,'price')}</h2><p>{text(selectedProduct,'description')}</p><div className={styles.quantity}><button type="button" onClick={()=>setQuantity(value=>Math.max(1,value-1))} aria-label="Diminuir quantidade">−</button><strong>{quantity}</strong><button type="button" onClick={()=>setQuantity(value=>value+1)} aria-label="Aumentar quantidade">+</button></div>{lines(selectedProduct.removals).length?<fieldset><legend>Retirar ingredientes</legend>{lines(selectedProduct.removals).map(item=><label key={item}><input type="checkbox" checked={removed.includes(item)} onChange={()=>toggleRemoved(item)}/><span>Sem {item}</span></label>)}</fieldset>:null}{selectedExtras.length?<fieldset><legend>Adicionais</legend>{selectedExtras.map(item=><label key={item.name}><input type="checkbox" checked={chosenExtras.some(extra=>extra.name===item.name)} onChange={()=>toggleExtra(item)}/><span>{item.name}</span><b>+ {brl(item.price)}</b></label>)}</fieldset>:null}<label className={styles.note}><span>Observação</span><textarea value={note} onChange={event=>setNote(event.target.value)} placeholder="Ex.: cortar ao meio"/></label><button className={styles.confirm} type="button" onClick={addToCart}>Adicionar · {brl(unitTotal*quantity)}</button></section></div>:null}
  {cartOpen?<div className={styles.backdrop} role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)setCartOpen(false)}}><section className={`${styles.modal} ${styles.cartModal}`} role="dialog" aria-modal="true" aria-labelledby="cart-title"><button className={styles.close} type="button" onClick={()=>setCartOpen(false)} aria-label="Fechar">×</button><h2 id="cart-title">Seu pedido</h2><div className={styles.cartLines}>{cart.map(line=>{const product=products[line.productIndex]||{},lineTotal=(number(text(product,'price'))+line.extras.reduce((sum,item)=>sum+item.price,0))*line.quantity;return <article key={line.id}><div><strong>{line.quantity}x {text(product,'title')}</strong><b>{brl(lineTotal)}</b></div>{line.removed.length?<small>Sem: {line.removed.join(', ')}</small>:null}{line.extras.length?<small>Adicionais: {line.extras.map(item=>item.name).join(', ')}</small>:null}{line.note?<small>Obs.: {line.note}</small>:null}<button type="button" onClick={()=>setCart(current=>current.filter(item=>item.id!==line.id))}>Remover</button></article>})}{!cart.length?<p className={styles.empty}>Seu pedido ainda está vazio.</p>:null}</div>{cart.length?<><div className={styles.cartTotal}><span>Total</span><strong>{brl(cartTotal)}</strong></div><a className={styles.confirm} href={`https://wa.me/${whatsapp}?text=${message()}`} target="_blank" rel="noreferrer">Enviar pedido pelo WhatsApp ↗</a></>:null}</section></div>:null}
 </div>;
}
