import Link from 'next/link';
import {redirect} from 'next/navigation';
import {resolveProjectAccess} from '@/core/session';
import {readV2Content} from '@/core/onboarding-data';
import {templatesForSegment} from '@/core/segments';
import {editorForTemplate} from '@/core/template-editor';
import ContentPage from '../content/page';
import AppearanceControls from '../appearance/appearance-controls';
import SalesContentEditor from './sales-content-editor';
import {saveEditorAppearanceAction,saveEditorTemplateAction} from './actions';
import styles from './editor.module.css';

const v=(o:Record<string,unknown>,key:string)=>String(o[key]??'');
const color=(value:string)=>/^#[0-9a-f]{6}$/i.test(value)?value:'#d9ff43';

export default async function TemplateEditorPage({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{template?:string;savedAppearance?:string;savedContent?:string}>}){
 const {slug}=await params,query=await searchParams,{project}=await resolveProjectAccess(slug);
 if(project.segment!=='food-business')redirect(`/dashboard/${encodeURIComponent(project.slug)}/content`);
 const data=await readV2Content(project.id),templates=templatesForSegment('food-business').filter(item=>item.status==='ready');
 const selected=v(data.appearance,'preview_template_key')||project.templateKey||'commerce-main-1',editor=editorForTemplate(selected)||editorForTemplate('commerce-main-1')!;
 const appearance={accent:color(v(data.appearance,'accent')),scale:v(data.appearance,'scale')||'normal',alignment:v(data.appearance,'alignment')||'left',density:v(data.appearance,'density')||'normal',supportSize:v(data.appearance,'support_size')||'14',supportBold:v(data.appearance,'support_bold')==='true',supportItalic:v(data.appearance,'support_italic')==='true',buttonSize:v(data.appearance,'button_size')||'12',buttonBold:v(data.appearance,'button_bold')!=='false',buttonItalic:v(data.appearance,'button_italic')==='true'};
 const complete=editor.mode==='complete';
 return <div className={styles.page}>
  <header className={styles.intro}><div><span>EDITOR DO SITE</span><h1>{project.name}</h1><p>Escolha o tipo de site e edite somente o que esse modelo utiliza, em uma única sequência.</p></div><div className={styles.headerActions}><Link href={`/preview/${encodeURIComponent(project.slug)}`} target="_blank">Abrir Preview ↗</Link></div></header>
  {query.template?<div className={styles.success}>Modelo alterado no rascunho. O conteúdo anterior foi preservado.</div>:null}
  <section className={styles.templatePicker}><div><span>01 · MODELO</span><h2>Como este site deve funcionar?</h2><p>A troca não apaga dados. Cada modelo mostra apenas os campos que realmente utiliza.</p></div><div className={styles.templateGrid}>{templates.map(item=>{const active=item.key===selected;return <form action={saveEditorTemplateAction} key={item.key} className={`${styles.templateCard} ${active?styles.active:''}`}><input type="hidden" name="slug" value={project.slug}/><input type="hidden" name="templateKey" value={item.key}/><div><small>{item.key==='commerce-main-1'?'SITE COMPLETO':'FOCO EM CONVERSÃO'}</small><strong>{item.name}</strong><p>{item.description}</p></div><button disabled={active}>{active?'Selecionado':'Escolher este'}</button></form>})}</div></section>

  <section className={styles.realEditor} id="content"><div className={styles.sequenceHead}><span>02 · CONTEÚDO</span><h2>{editor.label}</h2><p>{complete?'Edite toda a estrutura do site em uma única página.':'A Venda rápida mostra somente os dados que o template realmente utiliza. Todo o restante continua preservado no projeto para quando você voltar ao Completo.'}</p></div>{query.savedContent?<div className={styles.success}>Conteúdo salvo no rascunho. Confira no Preview antes de publicar.</div>:null}<div className={styles.embeddedContent}>{complete?<ContentPage params={Promise.resolve({slug:project.slug})} searchParams={Promise.resolve({})}/>:<SalesContentEditor slug={project.slug} data={{identity:data.identity,content:data.content,contact:data.contact}}/>}</div></section>

  <section className={styles.appearance} id="appearance"><div className={styles.sequenceHead}><span>03 · APARÊNCIA</span><h2>Identidade visual</h2><p>Cores, proporções e ênfase dos textos ficam no final do mesmo editor.</p></div>{query.savedAppearance?<div className={styles.success}>Aparência salva no rascunho. Confira no Preview antes de publicar.</div>:null}<form action={saveEditorAppearanceAction} className="form-stack"><input type="hidden" name="slug" value={project.slug}/><AppearanceControls initial={appearance}/><div className={styles.saveAppearance}><button className="action primary">Salvar aparência no rascunho</button></div></form></section>
 </div>;
}
