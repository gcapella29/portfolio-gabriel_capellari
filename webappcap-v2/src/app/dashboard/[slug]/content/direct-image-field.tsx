'use client';

import {useId,useState} from 'react';
import type {UploadedProjectImage} from '@/lib/supabase/project-image-upload';
import DraggableImagePreview from './draggable-image-preview';

type Props={projectId:string;name:string;slot:string;label:string;current?:string;currentPosition?:string;currentFit?:string;currentZoom?:string|number;help:string;multiple?:boolean};
const fits=['cover','contain','fill'] as const;

export default function DirectImageField({projectId,name,slot,label,current='',currentPosition='center',currentFit='cover',currentZoom=100,help,multiple=false}:Props){
 const inputId=useId(),[uploaded,setUploaded]=useState<UploadedProjectImage[]>([]),[busy,setBusy]=useState(false),[error,setError]=useState(''),[position,setPosition]=useState(currentPosition),[fit,setFit]=useState(fits.includes(currentFit as typeof fits[number])?currentFit:'cover'),[zoom,setZoom]=useState(Math.max(50,Math.min(200,Number(currentZoom)||100))),[removed,setRemoved]=useState(false);
 const previews=removed?[]:multiple?uploaded.map(item=>item.url):[uploaded.at(-1)?.url||current].filter(Boolean),hasImage=Boolean(current||uploaded.length);
 const select=async(event:React.ChangeEvent<HTMLInputElement>)=>{const input=event.currentTarget,files=Array.from(input.files||[]);if(!files.length)return;setBusy(true);setError('');try{const {uploadProjectImageDirect}=await import('@/lib/supabase/project-image-upload'),results:UploadedProjectImage[]=[];for(const [index,file] of files.slice(0,multiple?12:1).entries())results.push(await uploadProjectImageDirect(projectId,file,`${slot}-${index+1}`));setUploaded(items=>multiple?[...items,...results].slice(-12):results);setRemoved(false);input.value=''}catch(cause){setError(cause instanceof Error?cause.message:'Não foi possível enviar a imagem.');input.value=''}finally{setBusy(false)}};
 return <div className="upload-card image-editor-card" data-uploading={busy}>
  <div className="image-editor-head"><div><strong>{label}</strong><span>{help}</span></div><small>{previews.length?removed?'Oculta no rascunho':'Imagem ativa':'Sem imagem'}</small></div>
  {previews.length?<div className={multiple?'media-gallery image-editor-preview':'image-editor-preview'}>{previews.map((src,index)=>multiple?<img src={src} alt={`${label} ${index+1}`} loading="lazy" decoding="async" key={src}/>:<DraggableImagePreview src={src} alt={label} position={position} fit={fit} zoom={zoom} onPositionChange={setPosition} onZoomChange={setZoom} key={src}/>)}</div>:<div className="image-editor-empty">Nenhuma imagem selecionada</div>}
  <div className="image-editor-actions"><label className="action secondary" htmlFor={inputId} aria-disabled={busy}><b>{busy?'Enviando…':hasImage?'Trocar imagem':'Selecionar imagem'}</b></label>{!multiple&&hasImage?<button className="action secondary" type="button" onClick={()=>setRemoved(value=>!value)}>{removed?'Restaurar foto':'Remover foto'}</button>:null}</div>
  <input id={inputId} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple={multiple} disabled={busy} onChange={select} style={{display:'none'}}/>
  <input type="hidden" name={name} value={JSON.stringify(multiple?uploaded:uploaded.at(-1)||null)}/>
  {!multiple?<><input type="hidden" name={`mediaFit:${slot}`} value={fit}/><input type="hidden" name={`mediaPosition:${slot}`} value={position}/><input type="hidden" name={`mediaZoom:${slot}`} value={String(zoom)}/><input type="hidden" name={`removeMedia:${slot}`} value={removed?'yes':''}/></>:null}
  {uploaded.length?<small className="image-editor-status" role="status">Imagem enviada. Salve o rascunho para confirmar.</small>:null}
  {error?<small className="form-error" role="alert">{error}</small>:null}
 </div>;
}
