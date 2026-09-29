import {sectionsForSegment,type RepeatableSection} from '@/core/content-schema';
import {RepeatableSections} from '@/app/setup/[slug]/[step]/repeatable-sections';
import ContentWorkspace from '../../content/content-workspace';
import DirectImageField from '../../content/direct-image-field';
import {saveBakeryContentAction} from './actions';
import styles from '../editor-blocks.module.css';

const v=(o:Record<string,unknown>,key:string)=>String(o[key]??'');
const media=(value:unknown,key:'url'|'position'|'fit'|'zoom',fallback='')=>value&&typeof value==='object'?String((value as Record<string,unknown>)[key]??fallback):key==='url'&&typeof value==='string'?value:fallback;
const highlights:RepeatableSection={key:'bakery_highlights',label:'Destaques',description:'Cards do carrossel na ordem em que aparecem.',max:12,fields:[{key:'tag',label:'Selo'},{key:'title',label:'Título'},{key:'description',label:'Texto'},{key:'image',label:'Foto'}]};
const sampleHighlights=[
 {tag:'Clássico da casa',title:'Pão francês crocante',description:'Casquinha fina, miolo macio e fornadas frescas ao longo do dia.',image:'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=1600&q=80'},
 {tag:'Destaque',title:'Croissant amanteigado',description:'Folhado leve e dourado, perfeito com um café passado na hora.',image:'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1600&q=80'},
 {tag:'Feito hoje',title:'Doces e tortas',description:'Receitas artesanais para levar ou montar sua mesa de café.',image:'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=1600&q=80'}
];
const productDefinition=(limit:number):RepeatableSection=>{const base=sectionsForSegment('food-business').find(item=>item.key==='menu_items')!;return{...base,max:limit,label:'Produtos',description:'Foto, nome, categoria, preço e descrição.',fields:base.fields.filter(field=>['image','title','category','price','description'].includes(field.key))}};
function Block({id,number,title,summary,children,open=false}:{id:string;number:string;title:string;summary:string;children:React.ReactNode;open?:boolean}){return <details className={styles.block} id={id} open={open}><summary><b>{number}</b><span><strong>{title}</strong><small>{summary}</small></span></summary><div className={styles.blockBody}>{children}</div></details>}
function Field({name,label,value,rows=0}:{name:string;label:string;value:string;rows?:number}){return <label className="field"><span>{label}</span>{rows?<textarea name={name} rows={rows} defaultValue={value}/>:<input name={name} defaultValue={value}/>}</label>}
export default function BakeryContentEditor({slug,projectId,menuLimit,canManageMedia,canEditAppearance,data}:{slug:string;projectId:string;menuLimit:number;canManageMedia:boolean;canEditAppearance:boolean;data:{appearance:Record<string,unknown>;identity:Record<string,unknown>;content:Record<string,unknown>;contact:Record<string,unknown>;media:Record<string,unknown>}}){
 const content=data.content;
 return <ContentWorkspace slug={slug} previewUrl={`/preview/${encodeURIComponent(slug)}`} saved={false} portfolio={false} nav={[{id:'bakery-1',label:'Início'},{id:'bakery-2',label:'Destaques'},{id:'bakery-3',label:'Cardápio'},{id:'bakery-4',label:'Pedido e contato'}]} action={saveBakeryContentAction} embedded>
  <Block id="bakery-1" number="01" title="Início" summary="Nome, capa e texto principal" open>
   <Field name="name" label="Nome da padaria" value={v(data.identity,'name')}/>
   <Field name="bakery_eyebrow" label="Frase acima do título" value={v(content,'bakery_eyebrow')||'Desde 1998, com pão quente todos os dias'}/>
   <Field name="bakery_hero_title" label="Título da capa (quebra de linha com Enter)" value={v(content,'bakery_hero_title')||v(data.identity,'name')} rows={2}/>
   <Field name="bakery_hero_subtitle" label="Apresentação" value={v(content,'bakery_hero_subtitle')||'Pães artesanais, salgados, doces e café fresquinho em um ambiente simples, tradicional e acolhedor.'} rows={3}/>
   {canManageMedia?<DirectImageField projectId={projectId} name="uploadedMedia:bakery_hero" slot="bakery_hero" label="Foto de fundo da capa" current={media(data.media.bakery_hero,'url')} currentPosition={media(data.media.bakery_hero,'position','center')} currentFit={media(data.media.bakery_hero,'fit','cover')} currentZoom={media(data.media.bakery_hero,'zoom','100')} help="A foto aparece sob o gradiente original do modelo."/>:null}
  </Block>
  <Block id="bakery-2" number="02" title="Destaques" summary="Textos da seção e carrossel com fotos">
   <Field name="bakery_highlights_eyebrow" label="Chamada curta" value={v(content,'bakery_highlights_eyebrow')||'Destaques da casa'}/>
   <Field name="bakery_highlights_title" label="Título (quebra de linha com Enter)" value={v(content,'bakery_highlights_title')||'O que acabou\nde sair do forno'} rows={2}/>
   <Field name="bakery_highlights_intro" label="Descrição" value={v(content,'bakery_highlights_intro')||'Uma vitrine para os produtos do dia: promoções, lançamentos ou os campeões de venda.'} rows={2}/>
   <RepeatableSections definitions={[highlights]} initial={{bakery_highlights:Array.isArray(content.bakery_highlights)?content.bakery_highlights:sampleHighlights}} embedded projectId={canManageMedia?projectId:undefined}/>
  </Block>
  <Block id="bakery-3" number="03" title="Cardápio" summary="Categorias, produtos, fotos e preços">
   <Field name="bakery_menu_title" label="Título (quebra de linha com Enter)" value={v(content,'bakery_menu_title')||'Escolha e monte\nseu pedido'} rows={2}/>
   <Field name="bakery_menu_intro" label="Descrição" value={v(content,'bakery_menu_intro')||'Toque em um item para ver a foto e escolher a quantidade.'} rows={2}/>
   <RepeatableSections definitions={[productDefinition(menuLimit)]} initial={{menu_items:Array.isArray(content.menu_items)?content.menu_items:[]}} embedded projectId={canManageMedia?projectId:undefined} variant="product-cards"/>
  </Block>
  <Block id="bakery-4" number="04" title="Pedido e contato" summary="Chamada do pedido e canais da padaria">
   <Field name="bakery_order_title" label="Título do bloco de pedido" value={v(content,'bakery_order_title')||'Pronto para enviar'}/>
   <Field name="whatsapp" label="WhatsApp com DDI e DDD" value={v(data.contact,'whatsapp')}/>
   <Field name="phone" label="Telefone exibido na capa" value={v(data.contact,'phone')}/>
   <Field name="instagram" label="Perfil ou URL do Instagram" value={v(data.contact,'instagram')}/>
   {canEditAppearance?<Field name="bakery_accent" label="Cor dos botões e detalhes (código hexadecimal)" value={v(data.appearance,'bakery_accent')||'#9c4f2f'}/>:null}
  </Block>
 </ContentWorkspace>;
}
