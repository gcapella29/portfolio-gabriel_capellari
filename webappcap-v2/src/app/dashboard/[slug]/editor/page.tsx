import {redirect} from 'next/navigation';
import {can} from '@/core/permissions';
import {resolveProjectAccess} from '@/core/session';
import {readV2Content} from '@/core/onboarding-data';
import CompleteContentEditor from './complete-content-editor';
import {saveEditorTemplateAction} from './actions';
import styles from './editor.module.css';
import blocks from './editor-blocks.module.css';

export default async function TemplateEditorPage({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{template?:string;savedContent?:string}>}){
 const {slug}=await params,query=await searchParams,{project,role}=await resolveProjectAccess(slug);
 if(project.segment!=='food-business')redirect(`/dashboard/${encodeURIComponent(project.slug)}/content`);
 const data=await readV2Content(project.id),selected=String(data.appearance.preview_template_key||project.templateKey||'commerce-main-1'),active=selected==='commerce-main-1',canSwitch=can(role,'editAppearance');
 return <div className={styles.page}>
  {query.template?<div className={styles.success}>Versão completa selecionada no rascunho.</div>:null}
  {query.savedContent?<div className={styles.success}>Alterações salvas no rascunho. Confira no Preview.</div>:null}
  <section className={blocks.versionBar}><div><span>VERSÃO DO SITE</span><strong>{active?'Site completo ativo no Preview':'Venda rápida ativa no Preview'}</strong><p>A troca preserva todo o conteúdo das duas versões.</p></div><form action={saveEditorTemplateAction}><input type="hidden" name="slug" value={project.slug}/><input type="hidden" name="templateKey" value="commerce-main-1"/><button disabled={active||!canSwitch}>{!canSwitch?'Somente owner/admin pode trocar':active?'Esta versão já está selecionada':'Alterar para esta versão e salvar'}</button></form></section>
  <section className={styles.realEditor} id="blocks"><div className={styles.sequenceHead}><span>CONTEÚDO</span><h2>Blocos do site</h2><p>A barra superior permanece padronizada. Fotos e textos são salvos juntos em cada bloco.</p></div><CompleteContentEditor projectId={project.id} slug={project.slug} canManageMedia={can(role,'manageMedia')} data={{identity:data.identity,content:data.content,contact:data.contact,media:data.media}}/></section>
 </div>;
}
