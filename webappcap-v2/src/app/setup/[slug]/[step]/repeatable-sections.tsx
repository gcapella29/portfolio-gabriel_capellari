'use client';

import {useState} from 'react';
import type {RepeatableSection} from '@/core/content-schema';

type Item=Record<string,string>;
type UploadState={busy?:boolean;error?:string};

const fieldLanguage=(key:string)=>key.endsWith('_pt')?'pt':key.endsWith('_en')?'en':undefined;
const multiline=(key:string)=>key.includes('description')||key==='text'||key==='answer'||key==='removals'||key==='additions'||key.startsWith('alt_');

function normalizeItem(raw:Record<string,unknown>):Item{
  return Object.fromEntries(Object.entries(raw).map(([field,value])=>[
    field,
    value&&typeof value==='object'&&'url' in value?String((value as {url?:unknown}).url||''):String(value??'')
  ]));
}

export function RepeatableSections({definitions,initial,collapsible=false,embedded=false,numberOffset=2,projectId}:{definitions:RepeatableSection[];initial:Record<string,unknown>;collapsible?:boolean;embedded?:boolean;numberOffset?:number;projectId?:string}){
  const parse=(key:string):Item[]=>{
    const value=initial[key];
    return Array.isArray(value)?value.filter(item=>item&&typeof item==='object').map(item=>normalizeItem(item as Record<string,unknown>)):[];
  };
  const [sections,setSections]=useState<Record<string,Item[]>>(()=>Object.fromEntries(definitions.map(definition=>[definition.key,parse(definition.key)])));
  const [uploads,setUploads]=useState<Record<string,UploadState>>({});

  const add=(definition:RepeatableSection)=>setSections(current=>({...current,[definition.key]:[...(current[definition.key]||[]),Object.fromEntries(definition.fields.map(field=>[field.key,'']))]}));
  const remove=(key:string,index:number)=>setSections(current=>({...current,[key]:(current[key]||[]).filter((_,itemIndex)=>itemIndex!==index)}));
  const move=(key:string,index:number,delta:number)=>setSections(current=>{
    const list=[...(current[key]||[])],target=index+delta;
    if(target<0||target>=list.length)return current;
    [list[index],list[target]]=[list[target],list[index]];
    return {...current,[key]:list};
  });
  const update=(key:string,index:number,field:string,value:string)=>setSections(current=>{
    const list=[...(current[key]||[])];
    list[index]={...list[index],[field]:value};
    return {...current,[key]:list};
  });
  const upload=async(key:string,index:number,file:File,input:HTMLInputElement)=>{
    if(!projectId)return;
    const id=`${key}:${index}`;
    setUploads(current=>({...current,[id]:{busy:true}}));
    try{
      const {uploadProjectImageDirect}=await import('@/lib/supabase/project-image-upload');
      const image=await uploadProjectImageDirect(projectId,file,`${key}-${index+1}`);
      update(key,index,'image',image.url);
      setUploads(current=>({...current,[id]:{}}));
    }catch(cause){
      setUploads(current=>({...current,[id]:{error:cause instanceof Error?cause.message:'Não foi possível enviar a imagem.'}}));
    }finally{
      input.value='';
    }
  };

  const renderFields=(definition:RepeatableSection,items:Item[])=><>
    <input type="hidden" name={`section:${definition.key}`} value={JSON.stringify(items)}/>
    {items.length===0?<p className="help">Nenhum item ainda. Esta seção pode ficar vazia.</p>:<div className="form-stack">
      {items.map((item,index)=>{
        const uploadState=uploads[`${definition.key}:${index}`]||{};
        return <article key={index} style={{border:'1px solid rgba(17,17,17,.12)',borderRadius:14,padding:'1rem'}}>
          <div style={{display:'flex',justifyContent:'space-between',gap:'.5rem',marginBottom:'.8rem'}}><strong>Item {index+1}</strong><div style={{display:'flex',gap:'.35rem'}}><button type="button" className="action secondary" onClick={()=>move(definition.key,index,-1)} disabled={index===0}>↑</button><button type="button" className="action secondary" onClick={()=>move(definition.key,index,1)} disabled={index===items.length-1}>↓</button><button type="button" className="action secondary" onClick={()=>remove(definition.key,index)}>Remover</button></div></div>
          <div className="form-grid">{definition.fields.map(field=>field.key==='image'?<div className="upload-card" data-uploading={Boolean(uploadState.busy)} key={field.key}>
            <strong>Foto do item</strong>
            {item.image?<img src={item.image} alt={`Foto atual do item ${index+1}`} loading="lazy" decoding="async" style={{objectPosition:item.image_position||'center'}}/>:null}
            <span>{uploadState.busy?'Enviando imagem…':item.image?'Escolha outra imagem para substituir a atual.':'Envie uma foto em JPG, PNG, WebP ou GIF.'}</span>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={Boolean(uploadState.busy)||!projectId} onChange={event=>{const file=event.currentTarget.files?.[0];if(file)void upload(definition.key,index,file,event.currentTarget)}}/>
            {item.image?<button className="action secondary" type="button" onClick={()=>update(definition.key,index,'image','')}>Remover foto</button>:null}
            {uploadState.error?<small className="form-error" role="alert">{uploadState.error}</small>:null}
          </div>:<label className="field" data-language={fieldLanguage(field.key)} key={field.key}><span>{field.label}</span>{multiline(field.key)?<textarea rows={3} value={item[field.key]||''} onChange={event=>update(definition.key,index,field.key,event.target.value)} placeholder={field.placeholder}/>:<input value={item[field.key]||''} onChange={event=>update(definition.key,index,field.key,event.target.value)} placeholder={field.placeholder}/>}</label>)}</div>
        </article>;
      })}
    </div>}
  </>;

  return <div className="form-stack">{definitions.map((definition,index)=>{
    const items=sections[definition.key]||[];
    const addButton=<button type="button" className="action secondary" onClick={()=>add(definition)} disabled={Boolean(definition.max&&items.length>=definition.max)}>+ Adicionar item</button>;
    const body=<><div style={{display:'flex',justifyContent:'space-between',gap:'1rem',alignItems:'start',flexWrap:'wrap',marginBottom:'.8rem'}}><div><strong>{definition.label}</strong><p className="help" style={{margin:'.35rem 0 0'}}>{definition.description}</p></div>{addButton}</div>{renderFields(definition,items)}</>;
    if(collapsible)return <details className="repeatable-section" id={`content-${definition.key}`} data-number={String(index+numberOffset).padStart(2,'0')} key={definition.key}><summary><span><strong>{definition.label}</strong><small>{definition.description} · {items.length} {items.length===1?'item':'itens'}</small></span></summary><div className="repeatable-body"><div style={{display:'flex',justifyContent:'flex-end',marginBottom:'.8rem'}}>{addButton}</div>{renderFields(definition,items)}</div></details>;
    return embedded?<div key={definition.key}>{body}</div>:<section className="editor-section" key={definition.key}>{body}</section>;
  })}</div>;
}
