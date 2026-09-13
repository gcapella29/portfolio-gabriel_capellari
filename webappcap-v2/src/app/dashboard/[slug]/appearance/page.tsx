import Link from 'next/link';
import { resolveProjectAccess } from '@/core/session';
import { readV2Content } from '@/core/onboarding-data';
import { templatesForSegment } from '@/core/segments';
import { saveAppearanceAction, saveTemplateAction } from '../actions';
import AppearanceControls from './appearance-controls';
import styles from './appearance.module.css';

const v=(o:Record<string,unknown>,k:string)=>String(o[k]??'');
const color=(value:string)=>/^#[0-9a-f]{6}$/i.test(value)?value:'#d9ff43';
export default async function AppearancePage({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{saved?:string;template?:string}>}){
  const {slug}=await params,{saved,template}=await searchParams,{project}=await resolveProjectAccess(slug),data=await readV2Content(project.id);
  const templates=templatesForSegment(project.segment).filter(item=>item.status==='ready');
  const selectedTemplate=v(data.appearance,'preview_template_key')||project.templateKey||'';
  const appearance={accent:color(v(data.appearance,'accent')),scale:v(data.appearance,'scale')||'normal',headingFont:v(data.appearance,'heading_font')||'Montserrat',bodyFont:v(data.appearance,'body_font')||'DM Sans',alignment:v(data.appearance,'alignment')||'left',density:v(data.appearance,'density')||'normal'};
  return <div className="editor-page">
    <header className={styles.pageIntro}><div><span className="eyebrow dark-text">APARÊNCIA</span><h1>Veja o estilo antes de salvar.</h1><p>Experimente modelo, cores, fontes e proporções. Tudo chega primeiro ao Preview e só muda o site quando você publicar.</p></div><div className={styles.introActions}><Link className="action" href={`/template-lab/${project.segment}/${encodeURIComponent(project.slug)}`} target="_blank">Comparar modelos ↗</Link><Link className="action" href={`/preview/${encodeURIComponent(project.slug)}`} target="_blank">Abrir Preview ↗</Link></div></header>
    {saved&&<div className="notice success"><strong>Rascunho salvo.</strong> A aparência foi atualizada no Preview; o site público ainda não mudou.</div>}
    {template&&<div className="notice success"><strong>Modelo salvo no rascunho.</strong> Confira no Preview e publique quando estiver tudo certo.</div>}

    <section className={`editor-section ${styles.section}`}>
      <div className={styles.sectionHead}><div><span className="eyebrow dark-text">MODELO DO SITE</span><h2>Escolha a composição</h2><p>O conteúdo permanece intacto ao trocar de modelo.</p></div></div>
      <div className={styles.templateGrid}>
        {templates.map(item=>{
          const selected=item.key===selectedTemplate,published=item.key===project.templateKey;
          return <article key={item.key} className={`${styles.templateCard} ${selected?styles.templateCardSelected:''}`}>
            <div className={`${styles.templateVisual} ${item.key.includes('native')?styles.templateVisualNative:''}`} aria-hidden="true"><div><span/><i/></div></div>
            <div className={styles.templateInfo}><div className={styles.templateTop}><div><strong>{item.name}</strong><p>{item.description}</p></div><span className={`${styles.badge} ${selected?styles.badgeSelected:''}`}>{selected?'NO PREVIEW':'DISPONÍVEL'}</span></div>
            <div className={styles.templateFooter}>{published&&<span className={styles.published}>✓ Publicado atualmente</span>}<form action={saveTemplateAction}><input type="hidden" name="slug" value={project.slug}/><input type="hidden" name="templateKey" value={item.key}/><button className={selected?'action':'action primary'} disabled={selected}>{selected?'Selecionado':'Usar no Preview'}</button></form></div></div>
          </article>
        })}
      </div>
      {selectedTemplate!==project.templateKey&&<div className="appearance-note"><strong>Há uma troca de modelo aguardando publicação</strong><p>Confira o Preview e publique quando estiver tudo certo.</p></div>}
    </section>

    <form action={saveAppearanceAction} className="form-stack"><input type="hidden" name="slug" value={project.slug}/><section className={`editor-section ${styles.section}`}><div className={styles.sectionHead}><div><span className="eyebrow dark-text">ESTILO</span><h2>Ajuste e compare em tempo real</h2><p>A prévia ao lado reage às escolhas sem modificar o rascunho.</p></div></div><AppearanceControls initial={appearance}/><div className="appearance-note"><strong>Estrutura protegida</strong><p>Responsividade, contraste e proporções críticas continuam controlados pelo WebAppCap.</p></div></section><div className="sticky-save"><button className="action primary">Salvar aparência no rascunho</button></div></form>
  </div>
}
