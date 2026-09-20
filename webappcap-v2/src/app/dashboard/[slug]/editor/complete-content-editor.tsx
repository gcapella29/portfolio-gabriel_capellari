import {sectionsForSegment,type RepeatableSection} from '@/core/content-schema';
import {RepeatableSections} from '@/app/setup/[slug]/[step]/repeatable-sections';
import ContentWorkspace,{type ContentNavItem} from '../content/content-workspace';
import DirectImageField from '../content/direct-image-field';
import {saveCompleteContentAction} from './complete-content-action';
import styles from './editor-blocks.module.css';

const v=(o:Record<string,unknown>,key:string)=>String(o[key]??'');
const mediaValue=(value:unknown,key:'url'|'position'|'fit',fallback='')=>value&&typeof value==='object'?String((value as Record<string,unknown>)[key]??fallback):key==='url'&&typeof value==='string'?value:fallback;
const productDefinition=():RepeatableSection=>{const source=sectionsForSegment('food-business').find(item=>item.key==='menu_items')!;return{...source,label:'Produtos',description:'Cadastre foto, nome, preço e uma descrição opcional.',fields:source.fields.filter(field=>['image','title','price','description'].includes(field.key))}};
function Block({id,number,title,summary,children,open=false}:{id:string;number:string;title:string;summary:string;children:React.ReactNode;open?:boolean}){return <details className={styles.block} id={id} open={open}><summary><b>{number}</b><span><strong>{title}</strong><small>{summary}</small></span></summary><div className={styles.blockBody}>{children}</div></details>}

export default function CompleteContentEditor({projectId,slug,data,canManageMedia}:{projectId:string;slug:string;data:{identity:Record<string,unknown>;content:Record<string,unknown>;contact:Record<string,unknown>;media:Record<string,unknown>};canManageMedia:boolean}){
 const nav:ContentNavItem[]=[{id:'block-1',label:'Bloco 1 · Início'},{id:'block-2',label:'Bloco 2 · Catálogo'},{id:'block-3',label:'Bloco 3 · Carrinho'},{id:'block-4',label:'Bloco 4 · Instagram e Sobre'}];
 return <ContentWorkspace slug={slug} previewUrl={`/preview/${encodeURIComponent(slug)}`} saved={false} portfolio={false} nav={nav} action={saveCompleteContentAction}>
  <Block id="block-1" number="01" title="Início" summary="Imagem principal e textos do hero" open>
   {canManageMedia?<DirectImageField projectId={projectId} name="uploadedMedia:hero" slot="hero" label="Imagem principal" current={mediaValue(data.media.hero,'url')} currentPosition={mediaValue(data.media.hero,'position','center')} currentFit={mediaValue(data.media.hero,'fit','cover')} help="Troque a imagem e escolha como ela será enquadrada no bloco."/>:null}
   <div className="form-grid"><label className="field"><span>Texto de categorias</span><input name="description" defaultValue={v(data.identity,'description')}/></label><label className="field"><span>Frase de destaque</span><input name="tagline" defaultValue={v(data.identity,'tagline')}/></label></div>
   <label className="field"><span>Texto opcional acima do nome</span><input name="hero_kicker" defaultValue={v(data.content,'hero_kicker')}/></label>
   <p className={styles.fixedNote}>A barra superior e seus textos permanecem padronizados e não são alterados neste editor.</p>
  </Block>
  <Block id="block-2" number="02" title="Catálogo" summary="Subtítulo e cadastro dos produtos">
   <label className="field"><span>Subtítulo do catálogo</span><textarea name="menu_intro" rows={2} defaultValue={v(data.content,'menu_intro')}/></label>
   <RepeatableSections definitions={[productDefinition()]} initial={{menu_items:Array.isArray(data.content.menu_items)?data.content.menu_items:[]}} embedded projectId={canManageMedia?projectId:undefined}/>
  </Block>
  <Block id="block-3" number="03" title="Carrinho" summary="Subtítulo e WhatsApp para pedidos">
   <label className="field"><span>Subtítulo do carrinho</span><textarea name="order_intro" rows={3} defaultValue={v(data.content,'order_intro')}/></label>
   <label className="field"><span>Número do WhatsApp com DDI</span><input name="whatsapp" inputMode="tel" defaultValue={v(data.contact,'whatsapp')} placeholder="5516999999999"/><small>Use somente números, incluindo o código do país e o DDD.</small></label>
  </Block>
  <Block id="block-4" number="04" title="Instagram e Sobre" summary="Perfil da loja e apresentação da criadora">
   <label className="field"><span>Subtítulo do Instagram</span><textarea name="social_intro" rows={2} defaultValue={v(data.content,'social_intro')}/></label>
   <label className="field"><span>Instagram da loja — usuário ou URL</span><input name="instagram" defaultValue={v(data.contact,'instagram')} placeholder="@perfil ou https://instagram.com/perfil"/></label>
   <label className="field"><span>Texto da seção Sobre</span><textarea name="about_main" rows={4} defaultValue={v(data.content,'about_main')}/></label>
   {canManageMedia?<DirectImageField projectId={projectId} name="uploadedMedia:creator" slot="creator" label="Foto da criadora" current={mediaValue(data.media.creator,'url')} currentPosition={mediaValue(data.media.creator,'position','center')} currentFit={mediaValue(data.media.creator,'fit','cover')} help="Escolha a foto e ajuste seu enquadramento."/>:null}
   <div className="form-grid"><label className="field"><span>Nome da criadora</span><input name="creator_name" defaultValue={v(data.content,'creator_name')}/></label><label className="field"><span>Instagram da criadora</span><input name="creator_instagram" defaultValue={v(data.content,'creator_instagram')}/></label></div>
   <label className="field"><span>Texto sobre a criadora</span><textarea name="creator_bio" rows={4} defaultValue={v(data.content,'creator_bio')}/></label>
   <label className="field"><span>Texto do botão de seguir</span><input name="creator_instagram_label" defaultValue={v(data.content,'creator_instagram_label')||'Seguir no Instagram ↗'}/></label>
  </Block>
 </ContentWorkspace>;
}
