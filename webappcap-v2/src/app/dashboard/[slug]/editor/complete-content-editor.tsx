import Block from './editor-block';
import {imageEditorFrame} from '@/core/image-editor-frame';
import ContentWorkspace,{type ContentNavItem} from '../content/content-workspace';
import DirectImageField from '../content/direct-image-field';
import {saveCompleteContentAction} from './complete-content-action';
import styles from './editor-blocks.module.css';

const v=(o:Record<string,unknown>,key:string)=>String(o[key]??'');
const mediaValue=(value:unknown,key:'url'|'position'|'fit'|'zoom',fallback='')=>value&&typeof value==='object'?String((value as Record<string,unknown>)[key]??fallback):key==='url'&&typeof value==='string'?value:fallback;
const visible=(o:Record<string,unknown>,key:string)=>!(key in o&&String(o[key]).trim().toLowerCase()==='false');
const defaultWhatsappOrderMessage='Olá! Quero fazer este pedido:\n\n{itens}\n\nTotal: {total}';
const defaultWhatsappDirectMessage='Olá! Visitei o site da {loja} e gostaria de informações sobre outros produtos.';

function VisibilityToggle({name,label,description,defaultChecked}:{name:string;label:string;description:string;defaultChecked:boolean}){return <label className={styles.visibilityToggle}><input type="hidden" name={name} value="false"/><span><strong>{label}</strong><small>{description}</small></span><span className={styles.visibilitySwitch}><input type="checkbox" name={name} value="true" defaultChecked={defaultChecked}/><i aria-hidden="true"/></span></label>}
function EditorPanel({eyebrow,title,description,children}:{eyebrow:string;title:string;description:string;children:React.ReactNode}){return <section className={styles.editorPanel}><div className={styles.editorPanelHead}><span>{eyebrow}</span><strong>{title}</strong><small>{description}</small></div><div className={styles.editorPanelBody}>{children}</div></section>}

export default function CompleteContentEditor({projectId,slug,data,canManageMedia,modern=false,saved=false}:{projectId:string;slug:string;data:{identity:Record<string,unknown>;content:Record<string,unknown>;contact:Record<string,unknown>;media:Record<string,unknown>};canManageMedia:boolean;modern?:boolean;saved?:boolean}){
 const nav:ContentNavItem[]=[{id:'block-1',label:'Bloco 1 · Início'},{id:'block-2',label:'Bloco 2 · Catálogo'},{id:'block-3',label:'Bloco 3 · Carrinho'},{id:'block-4',label:'Bloco 4 · Instagram'},{id:'block-5',label:'Bloco 5 · Sobre'}];
 return <ContentWorkspace slug={slug} previewUrl={`/preview/${encodeURIComponent(slug)}`} saved={saved} portfolio={false} nav={nav} action={saveCompleteContentAction}>
  <Block id="block-1" number="01" title="Início" summary="Identidade, imagem principal e textos do hero">
   <EditorPanel eyebrow="IDENTIDADE" title="Como o site aparece" description="Nome exibido na aba do navegador e nos compartilhamentos.">
    <label className="field"><span>Título da aba do navegador</span><input name="browser_title" maxLength={80} defaultValue={v(data.identity,'browser_title')} placeholder="Ex.: Vet-se — Mimos para quem ama a rotina vet"/><small>Se ficar vazio, o sistema gera automaticamente a partir do nome da loja.</small></label>
   </EditorPanel>
   {canManageMedia?<EditorPanel eyebrow="CAPA" title="Imagem principal" description="Escolha o enquadramento que aparece logo na abertura do site."><DirectImageField projectId={projectId} name="uploadedMedia:hero" slot="hero" {...imageEditorFrame(modern?"commerce-modern-1":"commerce-main-1","hero")} label="Imagem principal" current={mediaValue(data.media.hero,'url')} currentPosition={mediaValue(data.media.hero,'position','center')} currentFit={mediaValue(data.media.hero,'fit','cover')} currentZoom={mediaValue(data.media.hero,'zoom','100')} help="Quadro de referência desktop. Ajuste o enquadramento e confira também no Preview mobile."/></EditorPanel>:null}
   <EditorPanel eyebrow="TEXTOS" title="Mensagem principal" description="As duas linhas exibidas abaixo do nome da loja no hero.">
    <div className={styles.heroCopyFields}><label className="field"><span>Primeira linha abaixo do nome</span><input name="tagline" defaultValue={v(data.identity,'tagline')}/></label><label className="field"><span>Segunda linha abaixo do nome</span><input name="hero_kicker" defaultValue={v(data.content,'hero_kicker')}/></label></div>
   </EditorPanel>
   {modern?<EditorPanel eyebrow="MODELO MODERN" title="Textos exclusivos desta versão" description="Estes campos só aparecem no modelo Modern e não alteram o visual Clássico.">
    <label className="field"><span>Faixa animada do topo</span><input name="modern_marquee" defaultValue={v(data.content,'modern_marquee')} placeholder="PRODUTINHOS PARA QUEM VIVE A ROTINA VET ✦ FEITO COM AMOR ESPECIALMENTE PARA VOCÊ ✦"/></label>
    <label className="field"><span>Título principal</span><input name="modern_hero_title" defaultValue={v(data.content,'modern_hero_title')} placeholder="Vet-se do seu jeitinho."/></label>
    <label className="field"><span>Texto principal</span><textarea name="modern_hero_text" rows={3} defaultValue={v(data.content,'modern_hero_text')} placeholder="Adesivos, chaveiros, mimos, bottons, ecobags e mais..."/></label>
   </EditorPanel>:null}
  </Block>
  <Block id="block-2" number="02" title="Catálogo" summary="Visibilidade e texto do bloco">
   <VisibilityToggle name="visibility:catalog" label="Exibir Catálogo" description="Desative para remover este bloco do site e da navegação." defaultChecked={visible(data.content,'show_catalog')}/>
   <label className="field"><span>Subtítulo do catálogo</span><textarea name="menu_intro" rows={2} defaultValue={v(data.content,'menu_intro')}/></label>
   {modern?<EditorPanel eyebrow="MODELO MODERN" title="Destaques e contato direto" description="Textos usados nas seções exclusivas do modelo Modern.">
    <div className="form-grid"><label className="field"><span>Título dos destaques</span><input name="modern_highlights_title" defaultValue={v(data.content,'modern_highlights_title')} placeholder="Os queridinhos por aqui."/></label><label className="field"><span>Introdução dos destaques</span><input name="modern_highlights_intro" defaultValue={v(data.content,'modern_highlights_intro')} placeholder="Uma seleção especial para deixar sua rotina mais divertida."/></label></div>
    <label className="field"><span>Título do contato abaixo do catálogo</span><input name="modern_notfound_title" defaultValue={v(data.content,'modern_notfound_title')} placeholder="Não encontrou o que queria?"/></label>
    <label className="field"><span>Texto do contato abaixo do catálogo</span><textarea name="modern_notfound_text" rows={2} defaultValue={v(data.content,'modern_notfound_text')} placeholder="Entre em contato pelo WhatsApp e a gente te ajuda a encontrar o produto ideal."/></label>
   </EditorPanel>:null}
   <a className="action secondary" href={`/dashboard/${encodeURIComponent(slug)}/catalog`}>Gerenciar produtos no Catálogo →</a>
  </Block>
  <Block id="block-3" number="03" title="Carrinho" summary="Subtítulo e WhatsApp para pedidos">
   <VisibilityToggle name="visibility:cart" label="Exibir Carrinho" description="Desative para remover o carrinho do site e da navegação." defaultChecked={visible(data.content,'show_cart')}/>
   {!modern?<label className="field"><span>Subtítulo do carrinho</span><textarea name="order_intro" rows={3} defaultValue={v(data.content,'order_intro')}/></label>:null}
   <label className="field"><span>Número do WhatsApp com DDI</span><input name="whatsapp" inputMode="tel" defaultValue={v(data.contact,'whatsapp')} placeholder="5516999999999"/><small>Use somente números, incluindo o código do país e o DDD.</small></label>
   <label className="field"><span>Mensagem do pedido no WhatsApp</span><textarea name="whatsapp_order_message" rows={6} maxLength={1500} defaultValue={v(data.content,'whatsapp_order_message')||defaultWhatsappOrderMessage}/><small>Personalize o texto e use os campos dinâmicos: <b>{'{itens}'}</b>, <b>{'{total}'}</b>, <b>{'{quantidade}'}</b> e <b>{'{loja}'}</b>. Eles serão preenchidos automaticamente ao enviar o pedido.</small></label>
   <label className="field"><span>Mensagem do botão “Não encontrou o que queria?”</span><textarea name="whatsapp_direct_message" rows={4} maxLength={1000} defaultValue={v(data.content,'whatsapp_direct_message')||defaultWhatsappDirectMessage}/><small>Esta é a mensagem enviada pelo botão de contato direto. Você pode usar <b>{'{loja}'}</b> para inserir automaticamente o nome da loja.</small></label>
  </Block>
  <Block id="block-4" number="04" title="Instagram" summary="Perfil da loja e publicações">
   <VisibilityToggle name="visibility:instagram" label="Exibir Instagram" description="Se o Sobre ficar ativo sozinho, ele ocupará toda a largura disponível." defaultChecked={visible(data.content,'show_instagram')}/>
   {!modern?<label className="field"><span>Subtítulo do Instagram</span><textarea name="social_intro" rows={2} defaultValue={v(data.content,'social_intro')}/></label>:null}
   <label className="field"><span>Instagram da loja — usuário ou URL</span><input name="instagram" defaultValue={v(data.contact,'instagram')} placeholder="@perfil ou https://instagram.com/perfil"/><small>Este perfil alimenta o botão de seguir a página da loja no Instagram exibido no site.</small></label>
  </Block>
  <Block id="block-5" number="05" title="Sobre" summary="Apresentação da marca e da criadora">
   <VisibilityToggle name="visibility:about" label="Exibir Sobre" description="Se o Instagram ficar ativo sozinho, ele ocupará toda a largura disponível." defaultChecked={visible(data.content,'show_about')}/>
   <label className="field"><span>Texto da seção Sobre</span><textarea name="about_main" rows={4} defaultValue={v(data.content,'about_main')}/></label>
   {canManageMedia?<DirectImageField projectId={projectId} name="uploadedMedia:creator" slot="creator" {...imageEditorFrame(modern?"commerce-modern-1":"commerce-main-1","creator")} label="Foto da criadora" current={mediaValue(data.media.creator,'url')} currentPosition={mediaValue(data.media.creator,'position','center')} currentFit={mediaValue(data.media.creator,'fit','cover')} currentZoom={mediaValue(data.media.creator,'zoom','100')} help="Escolha a foto e ajuste seu enquadramento."/>:null}
   <div className="form-grid"><label className="field"><span>Nome da criadora</span><input name="creator_name" defaultValue={v(data.content,'creator_name')}/></label><label className="field"><span>Instagram da criadora</span><input name="creator_instagram" defaultValue={v(data.content,'creator_instagram')}/></label></div>
   <label className="field"><span>Texto sobre a criadora</span><textarea name="creator_bio" rows={4} defaultValue={v(data.content,'creator_bio')}/></label>
   {!modern?<label className="field"><span>Texto do botão de seguir</span><input name="creator_instagram_label" defaultValue={v(data.content,'creator_instagram_label')||'Seguir no Instagram ↗'}/></label>:null}
  </Block>
 </ContentWorkspace>;
}
