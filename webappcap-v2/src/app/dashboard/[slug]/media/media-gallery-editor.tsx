'use client';

import {useEffect,useMemo,useState} from 'react';
import styles from './media-gallery-editor.module.css';

export type GalleryItem={url:string;path?:string};

export default function MediaGalleryEditor({
 initial,
 help
}:{
 initial:GalleryItem[];
 help:string;
}){
 const [removed,setRemoved]=useState<number[]>([]);
 const [files,setFiles]=useState<File[]>([]);
 const previews=useMemo(()=>files.map(file=>({file,url:URL.createObjectURL(file)})),[files]);

 useEffect(()=>()=>{previews.forEach(item=>URL.revokeObjectURL(item.url))},[previews]);

 const toggle=(index:number)=>setRemoved(current=>current.includes(index)?current.filter(item=>item!==index):[...current,index]);
 const activeCount=initial.length-removed.length;
 const finalCount=Math.min(12,activeCount+files.length);

 return <div className={styles.editor}>
  {removed.map(index=><input key={index} type="hidden" name="removeGallery" value={String(index)}/>)}

  <label className={`upload-card ${styles.picker}`}>
   <strong>Adicionar à galeria</strong>
   <span>{help}</span>
   <input
    name="gallery"
    type="file"
    accept="image/jpeg,image/png,image/webp,image/gif"
    multiple
    onChange={event=>setFiles(Array.from(event.target.files||[]).slice(0,12))}
   />
  </label>

  {files.length>0?<div className={styles.pending} role="status">
   <strong>{files.length} {files.length===1?'imagem selecionada':'imagens selecionadas'}</strong>
   <span>As miniaturas abaixo ainda não foram enviadas. Clique em <b>Salvar mídia</b> para concluir.</span>
  </div>:null}

  {previews.length>0?<div className={styles.grid}>
   {previews.map(({file,url},index)=><article className={styles.card} key={`${file.name}-${file.lastModified}-${index}`}>
    <img src={url} alt={`Nova imagem ${index+1}`}/>
    <div><strong>Nova imagem</strong><small>{file.name}</small><span className={styles.newBadge}>SERÁ ADICIONADA</span></div>
   </article>)}
  </div>:null}

  {initial.length>0?<div className={styles.current}>
   <div className={styles.currentHead}><div><strong>Imagens salvas</strong><span>{activeCount} ativas · {finalCount}/12 após salvar</span></div></div>
   <div className={styles.grid}>{initial.map((item,index)=>{
    const isRemoved=removed.includes(index);
    return <article className={styles.card} data-removed={isRemoved} key={`${item.url}-${index}`}>
     <img src={item.url} alt={`Galeria ${index+1}`} loading="lazy" decoding="async"/>
     <div><strong>{isRemoved?'Marcada para remoção':`Imagem ${index+1}`}</strong><small>{isRemoved?'Ela será excluída quando você salvar.':'Já salva no rascunho.'}</small><button type="button" onClick={()=>toggle(index)}>{isRemoved?'Desfazer':'Remover'}</button></div>
    </article>;
   })}</div>
  </div>:null}

  {initial.length===0&&files.length===0?<p className={styles.empty}>Nenhuma imagem na galeria ainda.</p>:null}
 </div>;
}
