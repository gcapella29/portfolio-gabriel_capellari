import {sectionsForSegment,type RepeatableSection} from '@/core/content-schema';
import {RepeatableSections} from '@/app/setup/[slug]/[step]/repeatable-sections';
import ContentWorkspace,{type ContentNavItem} from '../content/content-workspace';
import DirectImageField from '../content/direct-image-field';
import {saveCompleteContentAction} from './complete-content-action';
import styles from './editor-blocks.module.css';

const v=(o:Record<string,unknown>,key:string)=>String(o[key]??'');
const mediaValue=(value:unknown,key:'url'|'position'|'fit'|'zoom',fallback='')=>value&&typeof value==='object'?String((value as Record<string,unknown>)[key]??fallback):key==='url'&&typeof value==='string'?value:fallback;
const visible=(o:Record<string,unknown>,key:string)=>!(key in o&&String(o[key]).trim().toLowerCase()==='false');
const defaultWhatsappOrderMessage='Olá! Quero fazer este pedido:\n\n{itens}\n\nTotal: {total}';
const defaultWhatsappDirectMessage='Olá! Visitei o site da {loja} e gostaria de informações sobre outros produtos.';
const productDefinition=():RepeatableSection=>{const source=sectionsForSegment('food-business').find(item=>item.key==='menu_items')!,order=['image','title','price','description'],labels:Record<string,string>={title:'Nome',price:'Preço',description:'Descrição'};return{...source,label:'Produtos',description:'Cadastre foto, nome, preço e uma descrição opcional.',fields:order.map(key=>source.fields.find(field=>field.key===key)).filter((field):field is NonNullable<typeof field>=>Boolean(field)).map(field=>({...field,label:labels[field.key]||field.label}))}};
function Block({id,number,title,summary,children,open=false}:{id:string;number:string;title:string;summary:string;children:React.ReactNode;open?:boolean}){return <details className={styles.block} id={id} open={open}><summary><b>{number}</b><span><strong>{title}</strong><small>{summary}</small></span></summary><div className={styles.blockBody}>{children}</div></details>}
function VisibilityToggle({name,label,description,defaultChecked}:{name:string;label:string;description:string;defaultChecked:boolean}){return <label className={styles.visibilityToggle}><input type="hidden" name={name} value="false"/><span><strong>{label}</strong><small>{description}</small></span><span className={styles.visibilitySwitch}><input type="checkbox" name={name} value="true" defaultChecked={defaultChecked}/><i aria-hidden="true"/></span></label>}

export default function CompleteContentEditor({projectId,slug,data,canManageMedia}:{projectId:string;slug:string;data:{identity:Record<string,unknown>;content:Record<string,unknown>;contact:Record<string,unknown>;media:Record<string,unknown>};canManageMedia:boolean}){
 const nav:ContentNavItem[]=[{id:'block-1',label:'Bloco 1 · Início'},{id:'block-2',label:'Bloco 2 · Catálogo'},{id:'block-3',label:'Bloco 3 · Carrinho'},{id:'block-4',label:'Bloco 4 · Instagram'},{id:'block-5',label:'Bloco 5 · Sobre'}];
 return <ContentWorkspace slug={slug} previewUrl={`/preview/${encodeURIComponent(slug)}`} saved={false} portfolio={false} nav={nav} action={saveCompleteContentAction}>
  <Block id="block-1" number="01" title="Início" summary="Imagem principal e textos do hero" open>
   {canManageMedia?<DirectImageField projectId={projectId} name="uploadedMedia:hero" slot="hero" label="Imagem principal" current={mediaValue(data.media.hero,'url')} currentPosition={mediaValue(data.media.hero,'position','center')} currentFit={mediaValue(data.media.hero,'fit','cover')} currentZoom={mediaValue(data.media.hero,'zoom','100')} help="Arraste a imagem na prévia para escolher exatamente o que aparece no bloco."/>:null}
   <div className={styles.heroCopyFields}><label className="field"><span>Primeira linha abaixo do nome</span><input name="tagline" defaultValue={v(data.identity,'tagline')}/></label><label className="field"><span>Segunda linha abaixo do nome</span><input name="hero_kicker" defaultValue={v(data.content,'hero_kicker')}/></label></div>
  </Block>
  <Block id="block-2" number="02" title="Catálogo" summary="Subtítulo e cadastro dos produtos">
   <VisibilityToggle name="visibility:catalog" label="Exibir Catálogo" description="Desative para remover este bloco do site e da navegação." defaultChecked={visible(data.content,'show_catalog')}/>
   <label className="field"><span>Subtítulo do catálogo</span><textarea name="menu_intro" rows={2} defaultValue={v(data.content,'menu_intro')}/></label>
   <RepeatableSections definitions={[productDefinition()]} initial={{menu_items:Array.isArray(data.content.menu_items)?data.content.menu_items:[]}} embedded projectId={canManageMedia?projectId:undefined} variant="product-cards"/>
  </Block>
  <Block id="block-3" number="03" title="Carrinho" summary="Subtítulo e WhatsApp para pedidos">
   <VisibilityToggle name="visibility:cart" label="Exibir Carrinho" description="Desative para remover o carrinho do site e da navegação." defaultChecked={visible(data.content,'show_cart')}/>
   <label className="field"><span>Subtítulo do carrinho</span><textarea name="order_intro" rows={3} defaultValue={v(data.content,'order_intro')}/></label>
   <label className="field"><span>Número do WhatsApp com DDI</span><input name="whatsapp" inputMode="tel" defaultValue={v(data.contact,'whatsapp')} placeholder="5516999999999"/><small>Use somente números, incluindo o código do país e o DDD.</small></label>
   <label className="field"><span>Mensagem do pedido no WhatsApp</span><textarea name="whatsapp_order_message" rows={6} maxLength={1500} defaultValue={v(data.content,'whatsapp_order_message')||defaultWhatsappOrderMessage}/><small>Personalize o texto e use os campos dinâmicos: <b>{'{itens}'}</b>, <b>{'{total}'}</b>, <b>{'{quantidade}'}</b> e <b>{'{loja}'}</b>. Eles serão preenchidos automaticamente ao enviar o pedido.</small></label>
   <label className="field"><span>Mensagem do botão “Não encontrou o que queria?”</span><textarea name="whatsapp_direct_message" rows={4} maxLength={1000} defaultValue={v(data.content,'whatsapp_direct_message')||defaultWhatsappDirectMessage}/><small>Esta é a mensagem enviada pelo botão de contato direto. Você pode usar <b>{'{loja}'}</b> para inserir automaticamente o nome da loja.</small></label>
  </Block>
  <Block id="block-4" number="04" title="Instagram" summary="Perfil da loja e publicações">
   <VisibilityToggle name="visibility:instagram" label="Exibir Instagram" description="Se o Sobre ficar ativo sozinho, ele ocupará toda a largura disponível." defaultChecked={visible(data.content,'show_instagram')}/>
   <label className="field"><span>Subtítulo do Instagram</span><textarea name="social_intro" rows={2} defaultValue={v(data.content,'social_intro')}/></label>
   <label className="field"><span>Instagram da loja — usuário ou URL</span><input name="instagram" defaultValue={v(data.contact,'instagram')} placeholder="@perfil ou https://instagram.com/perfil"/></label>
  </Block>
  <Block id="block-5" number="05" title="Sobre" summary="Apresentação da marca e da criadora">
   <VisibilityToggle name="visibility:about" label="Exibir Sobre" description="Se o Instagram ficar ativo sozinho, ele ocupará toda a largura disponível." defaultChecked={visible(data.content,'show_about')}/>
   <label className="field"><span>Texto da seção Sobre</span><textarea name="about_main" rows={4} defaultValue={v(data.content,'about_main')}/></label>
   {canManageMedia?<DirectImageField projectId={projectId} name="uploadedMedia:creator" slot="creator" label="Foto da criadora" current={mediaValue(data.media.creator,'url')} currentPosition={mediaValue(data.media.creator,'position','center')} currentFit={mediaValue(data.media.creator,'fit','cover')} currentZoom={mediaValue(data.media.creator,'zoom','100')} help="Escolha a foto e ajuste seu enquadramento."/>:null}
   <div className="form-grid"><label className="field"><span>Nome da criadora</span><input name="creator_name" defaultValue={v(data.content,'creator_name')}/></label><label className="field"><span>Instagram da criadora</span><input name="creator_instagram" defaultValue={v(data.content,'creator_instagram')}/></label></div>
   <label className="field"><span>Texto sobre a criadora</span><textarea name="creator_bio" rows={4} defaultValue={v(data.content,'creator_bio')}/></label>
   <label className="field"><span>Texto do botão de seguir</span><input name="creator_instagram_label" defaultValue={v(data.content,'creator_instagram_label')||'Seguir no Instagram ↗'}/></label>
  </Block>
 </ContentWorkspace>;
}
