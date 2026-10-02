import Link from 'next/link';
import {redirect} from 'next/navigation';
import {resolveProjectAccess} from '@/core/session';
import {readV2Content} from '@/core/onboarding-data';
import {templatesForSegment} from '@/core/segments';
import {can} from '@/core/permissions';
import {saveEditorTemplateAction} from '../editor/actions';
import styles from './models.module.css';

export default async function ModelsPage({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{template?:string}>}){
 const {slug}=await params,query=await searchParams,{project,role}=await resolveProjectAccess(slug);
 if(!['food-business','personal-trainer'].includes(project.segment))redirect(`/dashboard/${encodeURIComponent(project.slug)}`);
 const data=await readV2Content(project.id);
 const selected=String(data.appearance.preview_template_key||project.templateKey||'');
 const templates=templatesForSegment(project.segment).filter(item=>item.status==='ready'&&!(project.slug==='vet-se'&&item.key==='commerce-sales-1'));
 const canApply=can(role,'editAppearance');
 return <div className={styles.page}>
  <header><span>MODELOS</span><h1>Escolha a aparência do site</h1><p>Visualize qualquer opção sem alterar o rascunho. Aplique ao rascunho somente quando quiser editar e testar aquela versão.</p></header>
  {query.template?<div className={styles.notice}>Modelo aplicado ao rascunho. Confira no Preview antes de publicar.</div>:null}
  <div className={styles.grid}>{templates.map(template=>{const active=selected===template.key,published=project.templateKey===template.key,modern=template.key==='commerce-modern-1';return <article className={styles.card} data-active={active} key={template.key}>
   <div className={modern?styles.modern:styles.classic}><i/><b/><span/><span/><span/></div>
   <div className={styles.body}><div className={styles.badges}>{active?<b>NO RASCUNHO</b>:null}{published?<em>PUBLICADO</em>:null}{modern?<span>NOVO</span>:null}</div><h2>{template.name}</h2><p>{template.description}</p><div className={styles.actions}><Link href={`/preview/${encodeURIComponent(project.slug)}?template=${encodeURIComponent(template.key)}`} target="_blank">Visualizar ↗</Link><form action={saveEditorTemplateAction}><input type="hidden" name="slug" value={project.slug}/><input type="hidden" name="templateKey" value={template.key}/><input type="hidden" name="returnTo" value="models"/><button disabled={active||!canApply}>{!canApply?'Sem permissão':active?'Aplicado ao rascunho':'Aplicar ao rascunho'}</button></form></div></div>
  </article>})}</div>
  <aside className={styles.help}><strong>Fluxo seguro:</strong><span>Visualizar não salva.</span><span>Aplicar muda só o rascunho.</span><span>Publicar coloca a versão no ar.</span></aside>
 </div>;
}
