'use client';

import {useCallback,useEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
import {useFormStatus} from 'react-dom';
import styles from './content.module.css';
import EditorPreviewDialog from '../editor-preview-dialog';
import EditorDraftDock,{EditorDraftStatus} from '../editor-draft-dock';

export type ContentNavItem={id:string;label:string};

function DraftActions({dirty,saved,onPreview,compact=false,formId}:{dirty:boolean;saved:boolean;onPreview:()=>void;compact?:boolean;formId?:string}){
 const {pending}=useFormStatus();
 const status=pending?'Salvando…':dirty?'Alterações não salvas':saved?'Salvo no rascunho':'Sem alterações pendentes';
 return <>
  <EditorDraftStatus text={status} dirty={dirty} pending={pending}/>
  <button type="button" className="action secondary" onClick={onPreview}>Preview</button>
  <button type="submit" form={formId} className="action primary" disabled={pending}>{pending?'Salvando…':dirty?'Salvar alterações':'Salvar no rascunho'}</button>
 </>;
}

function fieldFilled(field:HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement){
 if(field instanceof HTMLInputElement&&field.type==='hidden'){
  if(!field.name.startsWith('section:'))return null;
  try{return Array.isArray(JSON.parse(field.value))&&JSON.parse(field.value).length>0}catch{return false}
 }
 return field.value.trim().length>0;
}

export default function ContentWorkspace({slug,previewUrl,saved,portfolio,nav,action,children,embedded=false}:{slug:string;previewUrl:string;saved:boolean;portfolio:boolean;nav:ContentNavItem[];action:(formData:FormData)=>Promise<void>;children:React.ReactNode;embedded?:boolean}){
 const pathname=usePathname(),isEmbedded=embedded||pathname.endsWith('/editor');
 const formId=`editor-form-${slug}`;
 const formRef=useRef<HTMLFormElement>(null),submitting=useRef(false),initialSnapshot=useRef('') ,[dirty,setDirty]=useState(false),[language,setLanguage]=useState<'pt'|'en'>('pt'),[completion,setCompletion]=useState<Record<string,number>>({}),[uploadWarning,setUploadWarning]=useState(''),[previewOpen,setPreviewOpen]=useState(false);
 const calculate=useCallback(()=>{
  const next:Record<string,number>={};
  for(const item of nav){const section=document.getElementById(item.id);if(!section)continue;const fields=Array.from(section.querySelectorAll<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>('input,textarea,select')).map(fieldFilled).filter((value):value is boolean=>value!==null);next[item.id]=fields.length?Math.round(fields.filter(Boolean).length/fields.length*100):100}
  setCompletion(next);
 },[nav]);
 const snapshot=useCallback(()=>{const form=formRef.current;if(!form)return'';return Array.from(new FormData(form).entries()).map(([key,value])=>`${key}=${value instanceof File?`${value.name}:${value.size}`:String(value)}`).join('&')},[]);
 useEffect(()=>{calculate();window.setTimeout(()=>{initialSnapshot.current=snapshot()},0)},[calculate,snapshot]);
 useEffect(()=>{const warn=(event:BeforeUnloadEvent)=>{if(dirty&&!submitting.current)event.preventDefault()};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn)},[dirty]);
 const changed=()=>{window.setTimeout(()=>{setDirty(snapshot()!==initialSnapshot.current);calculate()},0)};
 const openSection=(id:string)=>{const section=document.getElementById(id);if(section instanceof HTMLDetailsElement)section.open=true;window.setTimeout(()=>section?.scrollIntoView({behavior:'smooth',block:'start'}),0)};
 const openPreview=()=>setPreviewOpen(true);
 const values=Object.values(completion),overall=values.length?Math.round(values.reduce((sum,value)=>sum+value,0)/values.length):0;
 return <div className={styles.workspace} data-language={language} data-embedded={isEmbedded?'true':'false'}>
  {!isEmbedded?<aside className={styles.sectionNav}><div className={styles.navHead}><span>PROGRESSO</span><strong>{overall}% preenchido</strong><i><b style={{width:`${overall}%`}}/></i></div><nav aria-label="Seções do conteúdo">{nav.map(item=><a href={`#${item.id}`} key={item.id} onClick={event=>{event.preventDefault();openSection(item.id)}}><i data-complete={completion[item.id]===100}/><span>{item.label}</span><small>{completion[item.id]??0}%</small></a>)}</nav></aside>:null}
  <div className={styles.editorColumn}>
   {portfolio?<div className={styles.languageBar}><div><span>IDIOMA DE EDIÇÃO</span><strong>{language==='pt'?'Português':'English'}</strong></div><div role="group" aria-label="Idioma exibido no editor"><button type="button" aria-pressed={language==='pt'} onClick={()=>setLanguage('pt')}>🇧🇷 Português</button><button type="button" aria-pressed={language==='en'} onClick={()=>setLanguage('en')}>🇬🇧 English</button></div></div>:null}
   <form id={formId} ref={formRef} action={action} className={styles.form} onChangeCapture={changed} onInputCapture={changed} onClickCapture={changed} onPointerUpCapture={changed} onSubmitCapture={event=>{if(formRef.current?.querySelector('[data-uploading="true"]')){event.preventDefault();setUploadWarning('Aguarde o envio da imagem terminar antes de salvar.');return}setUploadWarning('');submitting.current=true}}><input type="hidden" name="slug" value={slug}/>{isEmbedded?<input type="hidden" name="returnTo" value="editor"/>:null}{uploadWarning?<div className="form-error" role="alert">{uploadWarning}</div>:null}{children}</form>
   <EditorDraftDock><DraftActions dirty={dirty} saved={saved} onPreview={openPreview} compact formId={formId}/></EditorDraftDock>
  </div>
  <EditorPreviewDialog open={previewOpen} previewUrl={previewUrl} stale={dirty} onClose={()=>setPreviewOpen(false)}/>
 </div>;
}
