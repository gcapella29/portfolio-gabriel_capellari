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
 if(project.segment!=='food-business')redirect(`/dashboard/${encodeURIComponent(project.slug)}/content`);
 if(!can(role,'editContent'))redirect(`/dashboard/${encodeURIComponent(project.slug)}`);
 const [menuLimit,data]=await Promise.all([menuItemLimitForProject(project.id),readV2Content(project.id)]),selected=String(data.appearance.preview_template_key||project.templateKey||'commerce-main-1'),active=selected==='commerce-bakery-1';
 return <div className={styles.page}>
  {query.template?<div className={styles.success}>Modelo Padaria selecionado no rascunho.</div>:null}
  {query.savedContent?<div className={styles.success}>Rascunho salvo. Confira no Preview.</div>:null}
  <section className={blocks.versionBar}><div><span>VERSÃO DO SITE</span><strong>{active?'Padaria ativa no Preview':'Modelo Padaria disponível'}</strong><p>Você pode voltar aos outros modelos sem apagar o conteúdo do projeto.</p></div><form action={saveEditorTemplateAction}><input type="hidden" name="slug" value={project.slug}/><input type="hidden" name="templateKey" value="commerce-bakery-1"/><input type="hidden" name="returnTo" value="bakery"/><button disabled={active||!can(role,'editAppearance')}>{active?'Esta versão já está selecionada':'Usar Padaria no Preview'}</button></form></section>
  <section className={styles.realEditor} id="blocks"><div className={styles.sequenceHead}><span>CONTEÚDO</span><h2>Blocos da Padaria</h2><p>Edite os textos e fotos. A composição e os movimentos do modelo permanecem fixos.</p></div><BakeryContentEditor slug={project.slug} projectId={project.id} menuLimit={menuLimit} canManageMedia={can(role,'manageMedia')} canEditAppearance={can(role,'editAppearance')} data={{appearance:data.appearance,identity:data.identity,content:data.content,contact:data.contact,media:data.media}}/></section>
 </div>;
}
