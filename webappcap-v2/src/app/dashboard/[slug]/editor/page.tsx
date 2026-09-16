import Link from 'next/link';
import {redirect} from 'next/navigation';
import {resolveProjectAccess} from '@/core/session';
import {readV2Content} from '@/core/onboarding-data';
import {templatesForSegment} from '@/core/segments';
import {editorForTemplate} from '@/core/template-editor';
import {saveTemplateAction} from '../actions';
import styles from './editor.module.css';

const v=(o:Record<string,unknown>,key:string)=>String(o[key]??'');

export default async function TemplateEditorPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params,{project}=await resolveProjectAccess(slug);
 if(project.segment!=='food-business')redirect(`/dashboard/${encodeURIComponent(project.slug)}/content`);
 const data=await readV2Content(project.id),templates=templatesForSegment('food-business').filter(item=>item.status==='ready');
 const selected=v(data.appearance,'preview_template_key')||project.templateKey||'commerce-main-1',editor=editorForTemplate(selected)||editorForTemplate('commerce-main-1')!;
 const base=`/dashboard/${encodeURIComponent(project.slug)}`;
 return <div className={styles.page}>
  <header className={styles.intro}><div><span>EDITOR DO SITE</span><h1>{project.name}</h1><p>Escolha o tipo de site e edite somente o que esse modelo utiliza.</p></div><div className={styles.headerActions}><Link href={`/preview/${encodeURIComponent(project.slug)}`} target="_blank">Abrir Preview ↗</Link></div></header>
  <section className={styles.templatePicker}><div><span>01 · MODELO</span><h2>Como este site deve funcionar?</h2><p>Ao trocar o modelo, os dados já preenchidos continuam salvos. O editor apenas mostra os campos usados pela opção escolhida.</p></div><div className={styles.templateGrid}>{templates.map(item=>{const active=item.key===selected;return <form action={saveTemplateAction} key={item.key} className={`${styles.templateCard} ${active?styles.active:''}`}><input type="hidden" name="slug" value={project.slug}/><input type="hidden" name="templateKey" value={item.key}/><div><small>{item.key==='commerce-main-1'?'SITE COMPLETO':'FOCO EM CONVERSÃO'}</small><strong>{item.name}</strong><p>{item.description}</p></div><button disabled={active}>{active?'Selecionado':'Escolher este'}</button></form>})}</div></section>
  <section className={styles.editorSequence}><div className={styles.sequenceHead}><span>02 · EDIÇÃO</span><h2>{editor.label}</h2><p>Todos os blocos desta versão aparecem abaixo, na ordem em que você precisa trabalhar.</p></div>{editor.sections.map((section,index)=><article className={styles.editBlock} key={section.key}><div className={styles.blockNumber}>{String(index+1).padStart(2,'0')}</div><div><h3>{section.label}</h3><p>{section.description}</p></div><div className={styles.blockAction}>{section.key==='appearance'?<Link href={`${base}/appearance`}>Editar</Link>:<Link href={`${base}/content#content-${section.key}`}>Editar</Link>}</div></article>)}</section>
  <div className={styles.note}><strong>Arquitetura orientada pelo template</strong><p>Esta é a nova superfície central do Comércio. Na próxima rodada, os formulários atuais serão incorporados diretamente nestes blocos para eliminar as telas laterais de Conteúdo e Aparência.</p></div>
 </div>;
}
