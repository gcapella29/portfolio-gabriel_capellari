'use client';

import {useCallback,useEffect,useRef,useState} from 'react';
import EditorDraftDock,{EditorDraftStatus} from './editor-draft-dock';
import EditorPreviewDialog from './editor-preview-dialog';

function formSnapshot(form:HTMLFormElement|null){
 if(!form)return'';
 return Array.from(new FormData(form).entries())
  .map(([key,value])=>`${key}=${value instanceof File?`${value.name}:${value.size}:${value.lastModified}`:String(value)}`)
  .join('&');
}

export default function EditorPageControls({
 formId,
 previewUrl,
 saved=false,
 saveLabel='Salvar no rascunho'
}:{
 formId:string;
 previewUrl:string;
 saved?:boolean;
 saveLabel?:string;
}){
 const [dirty,setDirty]=useState(false),[previewOpen,setPreviewOpen]=useState(false),[submitting,setSubmitting]=useState(false);
 const initial=useRef('');

 const refreshDirty=useCallback(()=>{
  const form=document.getElementById(formId);
  if(!(form instanceof HTMLFormElement))return;
  setDirty(formSnapshot(form)!==initial.current);
 },[formId]);

 useEffect(()=>{
  const form=document.getElementById(formId);
  if(!(form instanceof HTMLFormElement))return;
  initial.current=formSnapshot(form);
  const changed=()=>window.setTimeout(refreshDirty,0);
  const submit=()=>setSubmitting(true);
  form.addEventListener('input',changed);
  form.addEventListener('change',changed);
  form.addEventListener('submit',submit);
  return()=>{
   form.removeEventListener('input',changed);
   form.removeEventListener('change',changed);
   form.removeEventListener('submit',submit);
  };
 },[formId,refreshDirty]);

 useEffect(()=>{
  const warn=(event:BeforeUnloadEvent)=>{if(dirty&&!submitting)event.preventDefault()};
  window.addEventListener('beforeunload',warn);
  return()=>window.removeEventListener('beforeunload',warn);
 },[dirty,submitting]);

 const status=submitting?'Salvando…':dirty?'Alterações não salvas':saved?'Salvo no rascunho':'Sem alterações pendentes';

 return <>
  <EditorDraftDock>
   <EditorDraftStatus text={status} dirty={dirty} pending={submitting}/>
   <button type="button" className="action secondary" onClick={()=>setPreviewOpen(true)}>Preview</button>
   <button type="submit" form={formId} className="action primary" disabled={submitting}>{submitting?'Salvando…':dirty?'Salvar alterações':saveLabel}</button>
  </EditorDraftDock>
  <EditorPreviewDialog open={previewOpen} previewUrl={previewUrl} stale={dirty} onClose={()=>setPreviewOpen(false)}/>
 </>;
}
