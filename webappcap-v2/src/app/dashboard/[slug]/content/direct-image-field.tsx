'use client';

import {useId,useState} from 'react';
import type {UploadedProjectImage} from '@/lib/supabase/project-image-upload';

type Props={
  projectId:string;
  name:string;
  slot:string;
  label:string;
  current?:string;
  currentPosition?:string;
  help:string;
  multiple?:boolean;
};

export default function DirectImageField({projectId,name,slot,label,current='',currentPosition='center',help,multiple=false}:Props){
  const inputId=useId();
  const [uploaded,setUploaded]=useState<UploadedProjectImage[]>([]);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [position,setPosition]=useState(currentPosition);
  const [removed,setRemoved]=useState(false);
  const previews=removed?[]:multiple?uploaded.map(item=>item.url):[uploaded.at(-1)?.url||current].filter(Boolean);

  const select=async(event:React.ChangeEvent<HTMLInputElement>)=>{
    const input=event.currentTarget;
    const files=Array.from(input.files||[]);
    if(!files.length)return;
    setBusy(true);setError('');
    try{
      const {uploadProjectImageDirect}=await import('@/lib/supabase/project-image-upload');
      const results:UploadedProjectImage[]=[];
      for(const [index,file] of files.slice(0,multiple?12:1).entries())results.push(await uploadProjectImageDirect(projectId,file,`${slot}-${index+1}`));
      setUploaded(currentItems=>multiple?[...currentItems,...results].slice(-12):results);
      setRemoved(false);
      input.value='';
    }catch(cause){
      setError(cause instanceof Error?cause.message:'Não foi possível enviar a imagem.');
      input.value='';
    }finally{
      setBusy(false);
    }
  };

  return <div className="upload-card" data-uploading={busy}>
    <strong>{label}</strong>
    {previews.length?<div className={multiple?'media-gallery':undefined}>{previews.map((src,index)=><img src={src} alt={`${label} ${index+1}`} loading="lazy" decoding="async" style={multiple?undefined:{objectPosition:position}} key={src}/>)}</div>:null}
    <span>{help}</span>
    <label htmlFor={inputId}><b>{busy?'Enviando…':current||uploaded.length?'Escolher outra imagem':'Selecionar imagem'}</b></label>
    <input id={inputId} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple={multiple} disabled={busy} onChange={select}/>
    <input type="hidden" name={name} value={JSON.stringify(multiple?uploaded:uploaded.at(-1)||null)}/>
    {!multiple?<><label className="field"><span>Enquadramento</span><select value={position} onChange={event=>setPosition(event.target.value)}><option value="top">Mostrar mais o topo</option><option value="center">Centralizar</option><option value="bottom">Mostrar mais a base</option></select></label><input type="hidden" name={`mediaPosition:${slot}`} value={position}/><input type="hidden" name={`removeMedia:${slot}`} value={removed?'yes':''}/>{current||uploaded.length?<button className="action secondary" type="button" onClick={()=>setRemoved(value=>!value)}>{removed?'Restaurar foto':'Remover foto'}</button>:null}</>:null}
    {uploaded.length?<small role="status">Imagem enviada. Agora salve o rascunho.</small>:null}
    {error?<small className="form-error" role="alert">{error}</small>:null}
  </div>;
}
