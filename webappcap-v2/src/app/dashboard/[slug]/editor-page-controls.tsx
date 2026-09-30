'use client';

import {useEffect,useState} from 'react';
import EditorDraftDock,{EditorDraftStatus} from './editor-draft-dock';
import EditorPreviewDialog from './editor-preview-dialog';

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
 const [dirty,setDirty]=useState(false),[previewOpen,setPreviewOpen]=useState(false),[submitting,setSubmitting]=useState(false),[uploadBlocked,setUploadBlocked]=useState(false);
useEffect(()=>{
  const form=document.getElementById(formId);
  if(!(form instanceof HTMLFormElement))return;
  const changed=(event:Event)=>{
   const target=event.target instanceof Element?event.target:null;
   const mutates=event.type==='input'||event.type==='change'||event.type==='click'&&Boolean(target?.closest('button[type="button"]'))||event.type==='pointerup'&&Boolean(target?.closest('[data-editor-drag="true"]'));
   if(mutates)setDirty(true);
  };
  const submit=(event:SubmitEvent)=>{
   if(form.querySelector('[data-uploading="true"]')){event.preventDefault();setUploadBlocked(true);return}
   setUploadBlocked(false);setSubmitting(true);
  };
  form.addEventListener('input',changed);
  form.addEventListener('change',changed);
  form.addEventListener('click',changed);
  form.addEventListener('pointerup',changed);
  form.addEventListener('submit',submit);
  return()=>{
   form.removeEventListener('input',changed);
   form.removeEventListener('change',changed);
   form.removeEventListener('click',changed);
   form.removeEventListener('pointerup',changed);
   form.removeEventListener('submit',submit);
  };
 },[formId]);

 useEffect(()=>{
  const warn=(event:BeforeUnloadEvent)=>{if(dirty&&!submitting)event.preventDefault()};
  window.addEventListener('beforeunload',warn);
  return()=>window.removeEventListener('beforeunload',warn);
 },[dirty,submitting]);

 const status=uploadBlocked?'Aguarde o envio da imagem':submitting?'Salvando…':dirty?'Alterações não salvas':saved?'Salvo no rascunho':'Sem alterações pendentes';

 return <>
  <EditorDraftDock>
   <EditorDraftStatus text={status} dirty={dirty} pending={submitting}/>
   <button type="button" className="action secondary" onClick={()=>setPreviewOpen(true)}>Preview</button>
   <button type="submit" form={formId} className="action primary" disabled={submitting}>{submitting?'Salvando…':dirty?'Salvar alterações':saveLabel}</button>
  </EditorDraftDock>
  <EditorPreviewDialog open={previewOpen} previewUrl={previewUrl} stale={dirty} onClose={()=>setPreviewOpen(false)}/>
 </>;
}
