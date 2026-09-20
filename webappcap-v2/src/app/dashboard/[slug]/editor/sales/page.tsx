import Link from 'next/link';
import {redirect} from 'next/navigation';
import {resolveProjectAccess} from '@/core/session';
import {can} from '@/core/permissions';
import {readV2Content} from '@/core/onboarding-data';
import SalesContentEditor from '../sales-content-editor';
import {saveEditorTemplateAction} from '../actions';
import styles from '../editor.module.css';
import blocks from '../editor-blocks.module.css';

export default async function SalesEditorPage({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{template?:string;savedContent?:string}>}){
 const {slug}=await params,query=await searchParams,{project,role}=await resolveProjectAccess(slug);
 if(project.segment!=='food-business')redirect(`/dashboard/${encodeURIComponent(project.slug)}/content`);
 const data=await readV2Content(project.id),selected=String(data.appearance.preview_template_key||project.templateKey||'commerce-main-1'),active=selected==='commerce-sales-1';
 return <div className={styles.page}>
  <header className={styles.intro}><div><span>EDITAR VENDA RÁPIDA</span><h1>Venda rápida</h1><p>Uma versão enxuta, focada em catálogo, personalização e pedido pelo WhatsApp.</p></div><div className={styles.headerActions}><Link href={`/preview/${encodeURIComponent(project.slug)}`} target="_blank">Abrir Preview ↗</Link></div></header>
  {query.template?<div className={styles.success}>Venda rápida selecionada no rascunho.</div>:null}
  {query.savedContent?<div className={styles.success}>Conteúdo salvo no rascunho. Confira no Preview.</div>:null}
  <section className={blocks.versionBar}><div><span>VERSÃO DO SITE</span><strong>{active?'Venda rápida ativa no Preview':'Site completo ativo no Preview'}</strong><p>A troca preserva os dados do site completo.</p></div><form action={saveEditorTemplateAction}><input type="hidden" name="slug" value={project.slug}/><input type="hidden" name="templateKey" value="commerce-sales-1"/><input type="hidden" name="returnTo" value="sales"/><button disabled={active}>{active?'Esta versão já está selecionada':'Alterar para esta versão e salvar'}</button></form></section>
  <section className={styles.realEditor}><div className={styles.sequenceHead}><span>CONTEÚDO</span><h2>Catálogo de venda</h2><p>Configure somente os dados usados nessa versão.</p></div><SalesContentEditor slug={project.slug} projectId={project.id} canManageMedia={can(role,'manageMedia')} data={{identity:data.identity,content:data.content,contact:data.contact}}/></section>
 </div>;
}
