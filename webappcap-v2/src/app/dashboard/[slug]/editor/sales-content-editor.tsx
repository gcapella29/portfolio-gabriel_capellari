import {sectionsForSegment,type RepeatableSection} from '@/core/content-schema';
import {commerceSettings} from '@/core/commerce-settings';
import {RepeatableSections} from '@/app/setup/[slug]/[step]/repeatable-sections';
import {saveSalesContentAction} from './sales-content-action';

const v=(o:Record<string,unknown>,key:string)=>String(o[key]??'');
const stored=(value:unknown)=>Array.isArray(value)?value:[];

export default function SalesContentEditor({slug,projectId,canManageMedia,data}:{slug:string;projectId:string;canManageMedia:boolean;data:{identity:Record<string,unknown>;content:Record<string,unknown>;contact:Record<string,unknown>}}){
 const settings=commerceSettings(data.content),source=sectionsForSegment('food-business').find(def=>def.key==='menu_items')!,menuDefinition:[RepeatableSection]=[{...source,fields:source.fields.filter(field=>['image','title','price','description','category','removals','additions'].includes(field.key))}];
 const initial={...data.content,menu_items:stored(data.content.menu_items)};
 return <form action={saveSalesContentAction} className="form-stack">
  <input type="hidden" name="slug" value={slug}/>
  <section className="editor-card"><span className="eyebrow dark-text">OFERTA</span><h3>Identidade essencial</h3><p>Somente os dados exibidos no topo da Venda rápida.</p><div className="form-grid"><label className="field"><span>Nome do comércio</span><input name="name" defaultValue={v(data.identity,'name')}/></label><label className="field"><span>Frase principal</span><input name="tagline" defaultValue={v(data.identity,'tagline')}/></label></div></section>
  <section className="editor-card"><span className="eyebrow dark-text">PRODUTOS</span><h3>{settings.catalogLabel}</h3><p>Os mesmos produtos do projeto são reutilizados ao trocar de modelo.</p><div className="form-grid"><label className="field"><span>Nome da seção</span><input name="catalog_label" defaultValue={settings.catalogLabel} placeholder="Catálogo, Cardápio ou Produtos"/></label><label className="field"><span>Título principal</span><input name="menu_title" defaultValue={v(data.content,'menu_title')||'Peça do seu jeito'}/></label></div><label className="field"><span>Texto de apoio</span><textarea name="menu_intro" rows={3} defaultValue={v(data.content,'menu_intro')||'Escolha seus produtos, personalize e envie o pedido direto pelo WhatsApp.'}/></label><RepeatableSections definitions={menuDefinition} initial={initial} embedded projectId={canManageMedia?projectId:undefined}/></section>
  <section className="editor-card"><span className="eyebrow dark-text">CONVERSÃO</span><h3>Pedido pelo WhatsApp</h3><p>Este é o canal usado pelo botão final do pedido.</p><label className="field"><span>WhatsApp com DDI</span><input name="whatsapp" defaultValue={v(data.contact,'whatsapp')} placeholder="5516999999999"/></label></section>
  <div className="sticky-actions"><button className="action primary">Salvar conteúdo no rascunho</button></div>
 </form>;
}
