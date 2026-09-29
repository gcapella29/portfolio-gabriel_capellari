import {redirect} from 'next/navigation';
import {resolveProjectAccess} from '@/core/session';
import {can} from '@/core/permissions';
import {readV2Content} from '@/core/onboarding-data';
import {menuItemLimitForProject} from '@/core/menu-item-limit';
import {saveEditorTemplateAction} from '../actions';
import BakeryContentEditor from './bakery-content-editor';
import styles from '../editor.module.css';
import blocks from '../editor-blocks.module.css';
export default async function BakeryEditorPage({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{template?:string;savedContent?:string}>}){
 const {slug}=await params,query=await searchParams,{project,role}=await resolveProjectAccess(slug);
 if(project.segment!=='commerce')redirect(`/dashboard/${encodeURIComponent(project.slug)}/content`);
 if(!can(role,'editContent'))redirect(`/dashboard/${encodeURIComponent(project.slug)}`);
 const [menuLimit,data]=await Promise.all([menuItemLimitForProject(project.id),readV2Content(project.id)]),selected=String(data.appearance.preview_template_key||project.templateKey||'commerce-bakery-1'),active=selected==='commerce-bakery-1';
 return <div className={styles.page}>
  <section className={`${blocks.workspaceHeader} ${blocks.bakeryWorkspaceHeader}`}>
   <div><span>EDITAR PADARIA</span><h1>{project.name}</h1><p>Gerencie capa, destaques, cardápio e contato mantendo a identidade própria deste modelo.</p></div>
   <div className={blocks.workspaceFacts}><span><small>Modelo</small><strong>Padaria</strong></span><span><small>Catálogo</small><strong>até {menuLimit} produtos</strong></span></div>
  </section>
  {query.template?<div className={styles.success}>Modelo Padaria selecionado no rascunho.</div>:null}
  {query.savedContent?<div className={styles.success}>Rascunho salvo. Confira no Preview.</div>:null}
  <section className={blocks.versionBar}><div><span>VERSÃO DO SITE</span><strong>{active?'Padaria ativa no Preview':'Modelo Padaria disponível'}</strong><p>Modelo de Comércio para padarias. Os modelos da Loja Digital pertencem a outra categoria.</p></div><form action={saveEditorTemplateAction}><input type="hidden" name="slug" value={project.slug}/><input type="hidden" name="templateKey" value="commerce-bakery-1"/><input type="hidden" name="returnTo" value="bakery"/><button disabled={active||!can(role,'editAppearance')}>{active?'Esta versão já está selecionada':'Usar Padaria no Preview'}</button></form></section>
  <section className={`${styles.realEditor} ${blocks.bakeryEditorSurface}`} id="blocks"><div className={styles.sequenceHead}><span>ESTRUTURA DA PADARIA</span><h2>Blocos do site</h2><p>Edite textos, imagens e produtos sem perder o estilo específico do modelo Padaria.</p></div><BakeryContentEditor slug={project.slug} projectId={project.id} menuLimit={menuLimit} canManageMedia={can(role,'manageMedia')} canEditAppearance={can(role,'editAppearance')} data={{appearance:data.appearance,identity:data.identity,content:data.content,contact:data.contact,media:data.media}}/></section>
 </div>;
}
