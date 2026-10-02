import {redirect} from 'next/navigation';
import {can} from '@/core/permissions';
import {resolveProjectAccess} from '@/core/session';
import {readV2Content} from '@/core/onboarding-data';
import {menuItemLimitForProject} from '@/core/menu-item-limit';
import CompleteContentEditor from './complete-content-editor';
import {saveEditorTemplateAction} from './actions';
import styles from './editor.module.css';
import blocks from './editor-blocks.module.css';
import EditorWorkspaceHeader from '../editor-workspace-header';

export default async function TemplateEditorPage({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{template?:string;savedContent?:string}>}){
 const {slug}=await params,query=await searchParams,{project,role}=await resolveProjectAccess(slug);
 if(project.segment==='personal-trainer')redirect(`/dashboard/${encodeURIComponent(project.slug)}/editor/trainer`);
 if(project.segment!=='food-business')redirect(`/dashboard/${encodeURIComponent(project.slug)}/content`);
 if(!can(role,'editContent'))redirect(`/dashboard/${encodeURIComponent(project.slug)}`);
 const menuLimit=await menuItemLimitForProject(project.id),data=await readV2Content(project.id),salesRetired=project.slug==='vet-se',selected=String(data.appearance.preview_template_key||project.templateKey||'commerce-main-1'),modern=selected==='commerce-modern-1',active=selected==='commerce-main-1',canSwitch=can(role,'editAppearance');
 return <div className={styles.page}>
  <EditorWorkspaceHeader eyebrow="EDITAR SITE" title={project.name} description="Altere os blocos do site e acompanhe tudo no rascunho antes de publicar." facts={salesRetired?[{label:'Modelo',value:modern?'Modern':'Clássico'},{label:'Catálogo',value:`até ${menuLimit} produtos`}]:[{label:'Versão',value:modern?'Modern':active?'Clássico':'Venda rápida'},{label:'Catálogo',value:`até ${menuLimit} produtos`}]}/>

  {query.template?<div className={styles.success}>Modelo selecionado no rascunho.</div>:null}
  {query.savedContent?<div className={styles.success}>Alterações salvas no rascunho. Confira no Preview.</div>:null}

  {!salesRetired?<section className={blocks.versionBar}>
   <div>
    <span>VERSÃO DO SITE</span>
    <strong>{modern?'Modern no rascunho':active?'Clássico no rascunho':'Venda rápida no rascunho'}</strong>
    <p>A troca preserva os dados compartilhados entre os modelos.</p>
   </div>
   <form action={saveEditorTemplateAction}>
    <input type="hidden" name="slug" value={project.slug}/>
    <input type="hidden" name="templateKey" value="commerce-main-1"/>
    <button disabled={active||!canSwitch}>{!canSwitch?'Somente owner/admin pode trocar':active?'Esta versão já está selecionada':'Alterar para esta versão e salvar'}</button>
   </form>
  </section>:null}

  <section className={styles.realEditor} id="blocks">
   <div className={blocks.editorSectionHead}>
    <div><span>CONTEÚDO</span><h2>Blocos do site</h2><p>Abra apenas o que precisa editar. Produtos são gerenciados na área Catálogo.</p></div>
    <div className={blocks.editorTips}><b>01</b><span>Edite</span><b>02</b><span>Salve</span><b>03</b><span>Confira</span></div>
   </div>
   <CompleteContentEditor projectId={project.id} slug={project.slug} modern={modern} canManageMedia={can(role,'manageMedia')} saved={Boolean(query.savedContent)} data={{identity:data.identity,content:data.content,contact:data.contact,media:data.media}}/>
  </section>
 </div>;
}
