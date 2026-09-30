import {redirect} from 'next/navigation';
import {resolveProjectAccess} from '@/core/session';
import {can} from '@/core/permissions';
import {readV2Content} from '@/core/onboarding-data';
import {menuItemLimitForProject} from '@/core/menu-item-limit';
import SalesContentEditor from '../sales-content-editor';
import {saveEditorTemplateAction} from '../actions';
import styles from '../editor.module.css';
import blocks from '../editor-blocks.module.css';

export default async function SalesEditorPage({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{template?:string;savedContent?:string}>}){
 const {slug}=await params,query=await searchParams,{project,role}=await resolveProjectAccess(slug);
 if(project.segment!=='food-business')redirect(`/dashboard/${encodeURIComponent(project.slug)}/content`);
 if(!can(role,'editContent'))redirect(`/dashboard/${encodeURIComponent(project.slug)}`);
 const menuLimit=await menuItemLimitForProject(project.id),data=await readV2Content(project.id),selected=String(data.appearance.preview_template_key||project.templateKey||'commerce-main-1'),active=selected==='commerce-sales-1',canSwitch=can(role,'editAppearance');
 return <div className={styles.page}>
  <section className={blocks.workspaceHeader}>
   <div><span>VENDA RÁPIDA</span><h1>{project.name}</h1><p>Edite a versão enxuta de vendas sem perder os dados compartilhados do projeto.</p></div>
   <div className={blocks.workspaceFacts}><span><small>Versão</small><strong>Venda rápida</strong></span><span><small>Catálogo</small><strong>até {menuLimit} produtos</strong></span></div>
  </section>
  {query.template?<div className={styles.success}>Venda rápida selecionada no rascunho.</div>:null}
  {query.savedContent?<div className={styles.success}>Conteúdo salvo no rascunho. Confira no Preview.</div>:null}
  <section className={blocks.versionBar}><div><span>VERSÃO DO SITE</span><strong>{active?'Venda rápida ativa no Preview':'Site completo ativo no Preview'}</strong><p>A troca preserva os dados do site completo.</p></div><form action={saveEditorTemplateAction}><input type="hidden" name="slug" value={project.slug}/><input type="hidden" name="templateKey" value="commerce-sales-1"/><input type="hidden" name="returnTo" value="sales"/><button disabled={active||!canSwitch}>{!canSwitch?'Somente owner/admin pode trocar':active?'Esta versão já está selecionada':'Alterar para esta versão e salvar'}</button></form></section>
  <section className={styles.realEditor} id="blocks"><div className={styles.sequenceHead}><span>CONTEÚDO</span><h2>Blocos da venda rápida</h2><p>Edite somente o que aparece nesta versão. O restante continua compartilhado com o projeto.</p></div><SalesContentEditor menuLimit={menuLimit} slug={project.slug} projectId={project.id} canManageMedia={can(role,'manageMedia')} saved={Boolean(query.savedContent)} data={{identity:data.identity,content:data.content,contact:data.contact,media:data.media}}/></section>
 </div>;
}
