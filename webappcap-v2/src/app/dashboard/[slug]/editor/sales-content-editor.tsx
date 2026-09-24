import {sectionsForSegment,type RepeatableSection} from '@/core/content-schema';
import {commerceSettings} from '@/core/commerce-settings';
import {RepeatableSections} from '@/app/setup/[slug]/[step]/repeatable-sections';
import ContentWorkspace,{type ContentNavItem} from '../content/content-workspace';
import DirectImageField from '../content/direct-image-field';
import {saveSalesContentAction} from './sales-content-action';
import styles from './editor-blocks.module.css';

const v=(o:Record<string,unknown>,key:string)=>String(o[key]??'');
const stored=(value:unknown)=>Array.isArray(value)?value:[];
const mediaValue=(value:unknown,key:'url'|'position'|'fit'|'zoom',fallback='')=>value&&typeof value==='object'?String((value as Record<string,unknown>)[key]??fallback):key==='url'&&typeof value==='string'?value:fallback;
const defaultSalesWhatsappMessage='Olá! Quero fazer um pedido na {loja}.\n\nITENS DO PEDIDO\n{itens}\n\n💰 TOTAL: {total}';
const defaultDirectWhatsappMessage='Olá! Visitei o site da {loja} e gostaria de informações sobre outros produtos.';

function Block({id,number,title,summary,children,open=false}:{id:string;number:string;title:string;summary:string;children:React.ReactNode;open?:boolean}){
 return <details className={styles.block} id={id} open={open}><summary><b>{number}</b><span><strong>{title}</strong><small>{summary}</small></span></summary><div className={styles.blockBody}>{children}</div></details>;
}

function productDefinition(menuLimit:number):RepeatableSection{
 const source=sectionsForSegment('food-business').find(def=>def.key==='menu_items')!;
 const order=['image','title','category','price','promo_quantity','promo_total','description'];
 const labels:Record<string,string>={title:'Nome',category:'Categoria',price:'Preço unitário',promo_quantity:'Quantidade da promoção',promo_total:'Preço promocional do combo',description:'Descrição'};
 return {...source,max:menuLimit,label:'Produtos',description:'Cadastre foto, nome, categoria, preço e, se quiser, uma promoção por quantidade.',fields:order.map(key=>source.fields.find(field=>field.key===key)).filter((field):field is NonNullable<typeof field>=>Boolean(field)).map(field=>({...field,label:labels[field.key]||field.label}))};
}

export default function SalesContentEditor({menuLimit,slug,projectId,canManageMedia,data}:{menuLimit:number;slug:string;projectId:string;canManageMedia:boolean;data:{identity:Record<string,unknown>;content:Record<string,unknown>;contact:Record<string,unknown>;media:Record<string,unknown>}}){
 const settings=commerceSettings(data.content),initial={...data.content,menu_items:stored(data.content.menu_items)};
 const nav:ContentNavItem[]=[{id:'sales-block-1',label:'Bloco 1 · Cabeçalho'},{id:'sales-block-2',label:'Bloco 2 · Catálogo'},{id:'sales-block-3',label:'Bloco 3 · WhatsApp'}];
 return <ContentWorkspace slug={slug} previewUrl={`/preview/${encodeURIComponent(slug)}`} saved={false} portfolio={false} nav={nav} action={saveSalesContentAction} embedded>
  <Block id="sales-block-1" number="01" title="Cabeçalho" summary="Foto de capa e frase exibida junto ao nome da loja" open>
   {canManageMedia?<DirectImageField projectId={projectId} name="uploadedMedia:sales_hero" slot="sales_hero" label="Foto de capa do hero" current={mediaValue(data.media.sales_hero,'url')} currentPosition={mediaValue(data.media.sales_hero,'position','center')} currentFit={mediaValue(data.media.sales_hero,'fit','cover')} currentZoom={mediaValue(data.media.sales_hero,'zoom','100')} help="Escolha a foto de capa e arraste para ajustar o enquadramento."/>:null}
   <label className="field"><span>Frase principal</span><input name="sales_tagline" defaultValue={v(data.content,'sales_tagline')||v(data.identity,'tagline')} placeholder="Escolha e peça pelo WhatsApp."/></label>
   <p className={styles.fixedNote}>O nome da loja é compartilhado com o projeto e não precisa ser repetido neste editor.</p>
  </Block>
  <Block id="sales-block-2" number="02" title={settings.catalogLabel} summary="Título, texto de apoio e produtos">
   <label className="field"><span>Título principal</span><input name="sales_menu_title" defaultValue={v(data.content,'sales_menu_title')||v(data.content,'menu_title')||'Peça do seu jeito'}/></label>
   <label className="field"><span>Texto de apoio</span><textarea name="sales_menu_intro" rows={3} defaultValue={v(data.content,'sales_menu_intro')||v(data.content,'menu_intro')||'Escolha seus produtos e envie o pedido direto pelo WhatsApp.'}/></label>
   <RepeatableSections definitions={[productDefinition(menuLimit)]} initial={initial} embedded projectId={canManageMedia?projectId:undefined} variant="product-cards"/>
  </Block>
  <Block id="sales-block-3" number="03" title="WhatsApp" summary="Número e mensagem enviada com o pedido">
   <label className="field"><span>WhatsApp com DDI</span><input name="whatsapp" inputMode="tel" defaultValue={v(data.contact,'whatsapp')} placeholder="5516999999999"/><small>Use somente números, incluindo o código do país e o DDD.</small></label>
   <label className="field"><span>Mensagem de envio do pedido</span><textarea name="sales_whatsapp_message" rows={9} maxLength={2000} defaultValue={v(data.content,'sales_whatsapp_message')||defaultSalesWhatsappMessage}/><small>Você pode usar: <b>{'{loja}'}</b>, <b>{'{itens}'}</b> e <b>{'{total}'}</b>. O resumo do carrinho será preenchido automaticamente.</small></label>
   <label className="field"><span>Mensagem do botão “Não encontrou o que queria?”</span><textarea name="sales_whatsapp_direct_message" rows={4} maxLength={1000} defaultValue={v(data.content,'sales_whatsapp_direct_message')||defaultDirectWhatsappMessage}/><small>Esta mensagem será aberta no WhatsApp pelo botão ao final do site. Você pode usar <b>{'{loja}'}</b>.</small></label>
  </Block>
 </ContentWorkspace>;
}
