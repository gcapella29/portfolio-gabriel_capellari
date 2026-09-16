'use client';

import {useCallback,useEffect,useRef,useState} from 'react';
import {useFormStatus} from 'react-dom';
import styles from './content.module.css';

export type ContentNavItem={id:string;label:string};

function SaveButton(){
 const {pending}=useFormStatus();
 return <button className="action primary" disabled={pending}>{pending?'Salvando…':'Salvar no rascunho'}</button>;
}

function fieldFilled(field:HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement){
 if(field instanceof HTMLInputElement&&field.type==='hidden'){
  if(!field.name.startsWith('section:'))return null;
  try{return Array.isArray(JSON.parse(field.value))&&JSON.parse(field.value).length>0}catch{return false}
 }
 return field.value.trim().length>0;
}

export default function ContentWorkspace({slug,previewUrl,saved,portfolio,nav,action,children,embedded=false}:{slug:string;previewUrl:string;saved:boolean;portfolio:boolean;nav:ContentNavItem[];action:(formData:FormData)=>Promise<void>;children:React.ReactNode;embedded?:boolean}){
 const formRef=useRef<HTMLFormElement>(null),submitting=useRef(false),[dirty,setDirty]=useState(false),[language,setLanguage]=useState<'pt'|'en'>('pt'),[completion,setCompletion]=useState<Record<string,number>>({}),[uploadWarning,setUploadWarning]=useState('');
 const calculate=useCallback(()=>{
  const next:Record<string,number>={};
  for(const item of nav){const section=document.getElementById(item.id);if(!section)continue;const fields=Array.from(section.querySelectorAll<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>('input,textarea,select')).map(fieldFilled).filter((value):value is boolean=>value!==null);next[item.id]=fields.length?Math.round(fields.filter(Boolean).length/fields.length*100):100}
  setCompletion(next);
 },[nav]);
 useEffect(()=>{calculate()},[calculate]);
 useEffect(()=>{const warn=(event:BeforeUnloadEvent)=>{if(dirty&&!submitting.current)event.preventDefault()};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn)},[dirty]);
 const changed=()=>{setDirty(true);window.setTimeout(calculate,0)};
 const openSection=(id:string)=>{const section=document.getElementById(id);if(section instanceof HTMLDetailsElement)section.open=true;window.setTimeout(()=>section?.scrollIntoView({behavior:'smooth',block:'start'}),0)};
 const values=Object.values(completion),overall=values.length?Math.round(values.reduce((sum,value)=>sum+value,0)/values.length):0;
 return <div className={styles.workspace} data-language={language} data-embedded={embedded?'true':'false'}>
  {!embedded?<aside className={styles.sectionNav}><div className={styles.navHead}><span>PROGRESSO</span><strong>{overall}% preenchido</strong><i><b style={{width:`${overall}%`}}/></i></div><nav aria-label="Seções do conteúdo">{nav.map(item=><a href={`#${item.id}`} key={item.id} onClick={event=>{event.preventDefault();openSection(item.id)}}><i data-complete={completion[item.id]===100}/><span>{item.label}</span><small>{completion[item.id]??0}%</small></a>)}</nav></aside>:null}
  <div className={styles.editorColumn}>
   {portfolio?<div className={styles.languageBar}><div><span>IDIOMA DE EDIÇÃO</span><strong>{language==='pt'?'Português':'English'}</strong></div><div role="group" aria-label="Idioma exibido no editor"><button type="button" aria-pressed={language==='pt'} onClick={()=>setLanguage('pt')}>🇧🇷 Português</button><button type="button" aria-pressed={language==='en'} onClick={()=>setLanguage('en')}>🇬🇧 English</button></div></div>:null}
   <form ref={formRef} action={action} className={styles.form} onChangeCapture={changed} onClickCapture={event=>{if((event.target as HTMLElement).closest('button[type="button"]'))changed()}} onSubmitCapture={event=>{if(formRef.current?.querySelector('[data-uploading="true"]')){event.preventDefault();setUploadWarning('Aguarde o envio da imagem terminar antes de salvar.');return}setUploadWarning('');submitting.current=true}}><input type="hidden" name="slug" value={slug}/>{embedded?<input type="hidden" name="returnTo" value="editor"/>:null}{uploadWarning?<div className="form-error" role="alert">{uploadWarning}</div>:null}{children}<div className={styles.saveBar}><div><i data-dirty={dirty}/><span>{dirty?'Alterações não salvas':saved?'Rascunho salvo':'Nenhuma alteração pendente'}</span></div><a className="action secondary" href={previewUrl} target="_blank">Abrir Preview ↗</a><SaveButton/></div></form>
  </div>
 </div>;
}
