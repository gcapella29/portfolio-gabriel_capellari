import Link from 'next/link';
import { resolveProjectAccess } from '@/core/session';
import { readV2Content } from '@/core/onboarding-data';
import { templatesForSegment } from '@/core/segments';
import {commerceHeroControls} from '@/core/commerce-hero-controls';
import { saveAppearanceAction, saveTemplateAction } from '../actions';
import AppearanceControls from './appearance-controls';
import styles from './appearance.module.css';
import EditorWorkspaceHeader from '../editor-workspace-header';
import EditorPageControls from '../editor-page-controls';

const v=(o:Record<string,unknown>,k:string)=>String(o[k]??'');
const color=(value:string)=>/^#[0-9a-f]{6}$/i.test(value)?value:'#d9ff43';
export default async function AppearancePage({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{saved?:string;template?:string}>}){
  const {slug}=await params,{saved,template}=await searchParams,{project}=await resolveProjectAccess(slug),data=await readV2Content(project.id);
  const templates=templatesForSegment(project.segment).filter(item=>item.status==='ready');
  const selectedTemplate=v(data.appearance,'preview_template_key')||project.templateKey||'';
  const completeCommerce=project.segment==='food-business'&&!selectedTemplate.includes('sales')&&!selectedTemplate.includes('bakery');
  const appearance={accent:color(v(data.appearance,'accent')),scale:v(data.appearance,'scale')||'normal',alignment:v(data.appearance,'alignment')||'left',density:v(data.appearance,'density')||'normal',supportSize:v(data.appearance,'support_size')||'14',supportBold:v(data.appearance,'support_bold')==='true',supportItalic:v(data.appearance,'support_italic')==='true',buttonSize:v(data.appearance,'button_size')||'12',buttonBold:v(data.appearance,'button_bold')!=='false',buttonItalic:v(data.appearance,'button_italic')==='true',hero:completeCommerce?commerceHeroControls(data.appearance):undefined,heroTypography:data.appearance};
  return <div className="editor-page">
    <EditorWorkspaceHeader eyebrow="EDITAR SITE" title={project.name} description="Ajuste modelo, cor, tipografia e proporções; tudo chega primeiro ao rascunho antes da publicação." facts={[{label:'Área',value:'Design'},{label:'Modelo',value:templates.find(item=>item.key===selectedTemplate)?.name||'Selecionado'}]}/>
    <div className={styles.introActions}><Link className="action" href={project.segment==='food-business'?`/dashboard/${encodeURIComponent(project.slug)}/models`:`/template-lab/${project.segment}/${encodeURIComponent(project.slug)}`} target="_blank" rel="noopener noreferrer">Comparar modelos ↗</Link></div>
    {saved&&<div className="notice success"><strong>Rascunho salvo.</strong> A aparência foi atualizada no Preview; o site público ainda não mudou.</div>}
    {template&&<div className="notice success"><strong>Modelo salvo no rascunho.</strong> Confira no Preview e publique quando estiver tudo certo.</div>}

    <section className={`editor-section ${styles.section}`}>
      <div className={styles.sectionHead}><div><span className="eyebrow dark-text">MODELO DO SITE</span><h2>Escolha a composição</h2><p>O conteúdo permanece intacto ao trocar de modelo.</p></div></div>
      <div className={styles.templateGrid}>
        {templates.map(item=>{
          const selected=item.key===selectedTemplate,published=item.key===project.templateKey;
          return <article key={item.key} className={`${styles.templateCard} ${selected?styles.templateCardSelected:''}`}>
            <div className={`${styles.templateVisual} ${item.key.includes('native')?styles.templateVisualNative:''}`} aria-hidden="true"><div><span/><i/></div></div>
            <div className={styles.templateInfo}><div className={styles.templateTop}><div><strong>{item.name}</strong><p>{item.description}</p></div><span className={`${styles.badge} ${selected?styles.badgeSelected:''}`}>{selected?'NO RASCUNHO':'DISPONÍVEL'}</span></div>
            <div className={styles.templateFooter}>{published&&<span className={styles.published}>✓ Publicado atualmente</span>}<form action={saveTemplateAction}><input type="hidden" name="slug" value={project.slug}/><input type="hidden" name="templateKey" value={item.key}/><button className={selected?'action':'action primary'} disabled={selected}>{selected?'Selecionado':'Aplicar ao rascunho'}</button></form></div></div>
          </article>
        })}
      </div>
      {selectedTemplate!==project.templateKey&&<div className="appearance-note"><strong>Há uma troca de modelo aguardando publicação</strong><p>Confira o Preview e publique quando estiver tudo certo.</p></div>}
    </section>

    <form id="appearance-editor-form" action={saveAppearanceAction} className="form-stack"><input type="hidden" name="slug" value={project.slug}/><section className={`editor-section ${styles.section}`}><div className={styles.sectionHead}><div><span className="eyebrow dark-text">ESTILO</span><h2>Ajuste e compare em tempo real</h2><p>A prévia ao lado reage às escolhas sem modificar o rascunho.</p></div></div><AppearanceControls initial={appearance}/><div className="appearance-note"><strong>Estrutura protegida</strong><p>Responsividade, contraste e proporções críticas continuam controlados pelo WebAppCap.</p></div></section></form><EditorPageControls formId="appearance-editor-form" previewUrl={`/preview/${encodeURIComponent(project.slug)}`} saved={Boolean(saved)} saveLabel="Salvar aparência"/>
  </div>
}
