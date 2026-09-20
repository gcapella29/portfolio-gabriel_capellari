import {sectionsForSegment,type RepeatableSection} from '@/core/content-schema';
import {commerceSettings} from '@/core/commerce-settings';
import {RepeatableSections} from '@/app/setup/[slug]/[step]/repeatable-sections';
import ContentWorkspace,{type ContentNavItem} from '../content/content-workspace';
import {saveSalesContentAction} from './sales-content-action';
import styles from './editor-blocks.module.css';

const v=(o:Record<string,unknown>,key:string)=>String(o[key]??'');
const stored=(value:unknown)=>Array.isArray(value)?value:[];

function Block({id,number,title,summary,children,open=false}:{id:string;number:string;title:string;summary:string;children:React.ReactNode;open?:boolean}){
 return <details className={styles.block} id={id} open={open}><summary><b>{number}</b><span><strong>{title}</strong><small>{summary}</small></span></summary><div className={styles.blockBody}>{children}</div></details>;
}

function productDefinition():RepeatableSection{
 const source=sectionsForSegment('food-business').find(def=>def.key==='menu_items')!;
 const order=['image','title','price','description','category','removals','additions'];
 const labels:Record<string,string>={title:'Nome',price:'Preço',description:'Descrição',category:'Categoria',removals:'Opções para retirar',additions:'Adicionais'};
 return {...source,label:'Produtos',description:'Cadastre foto, nome, preço e, se precisar, opções de personalização.',fields:order.map(key=>source.fields.find(field=>field.key===key)).filter((field):field is NonNullable<typeof field>=>Boolean(field)).map(field=>({...field,label:labels[field.key]||field.label}))};
}

export default function SalesContentEditor({slug,projectId,canManageMedia,data}:{slug:string;projectId:string;canManageMedia:boolean;data:{identity:Record<string,unknown>;content:Record<string,unknown>;contact:Record<string,unknown>}}){
 const settings=commerceSettings(data.content),initial={...data.content,menu_items:stored(data.content.menu_items)};
 const nav:ContentNavItem[]=[{id:'sales-block-1',label:'Bloco 1 · Cabeçalho'},{id:'sales-block-2',label:'Bloco 2 · Catálogo'},{id:'sales-block-3',label:'Bloco 3 · WhatsApp'}];
 return <ContentWorkspace slug={slug} previewUrl={`/preview/${encodeURIComponent(slug)}`} saved={false} portfolio={false} nav={nav} action={saveSalesContentAction} embedded>
  <Block id="sales-block-1" number="01" title="Cabeçalho" summary="Frase exibida junto ao nome da loja" open>
   <label className="field"><span>Frase principal</span><input name="tagline" defaultValue={v(data.identity,'tagline')} placeholder="Escolha, personalize e peça pelo WhatsApp."/></label>
   <p className={styles.fixedNote}>O nome da loja é compartilhado com o projeto e não precisa ser repetido neste editor.</p>
  </Block>
  <Block id="sales-block-2" number="02" title={settings.catalogLabel} summary="Título, texto de apoio e produtos">
   <label className="field"><span>Título principal</span><input name="menu_title" defaultValue={v(data.content,'menu_title')||'Peça do seu jeito'}/></label>
   <label className="field"><span>Texto de apoio</span><textarea name="menu_intro" rows={3} defaultValue={v(data.content,'menu_intro')||'Escolha seus produtos, personalize e envie o pedido direto pelo WhatsApp.'}/></label>
   <RepeatableSections definitions={[productDefinition()]} initial={initial} embedded projectId={canManageMedia?projectId:undefined} variant="product-cards"/>
  </Block>
  <Block id="sales-block-3" number="03" title="WhatsApp" summary="Número usado para receber os pedidos">
   <label className="field"><span>WhatsApp com DDI</span><input name="whatsapp" inputMode="tel" defaultValue={v(data.contact,'whatsapp')} placeholder="5516999999999"/><small>Use somente números, incluindo o código do país e o DDD.</small></label>
  </Block>
 </ContentWorkspace>;
}
