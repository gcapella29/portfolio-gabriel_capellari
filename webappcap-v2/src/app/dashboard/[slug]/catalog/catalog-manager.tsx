'use client';

import {useDeferredValue,useMemo,useState} from 'react';
import DraggableImagePreview from '../content/draggable-image-preview';
import {uploadProjectImageDirect} from '@/lib/supabase/project-image-upload';
import styles from './catalog.module.css';

type Product=Record<string,string>;
type CatalogRow={id:string;item:Product};
const pageSize=18;
const makeId=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():`item-${Date.now()}-${Math.random()}`;

function emptyProduct():Product{
 return {title:'',category:'',description:'',price:'',promo_quantity:'',promo_total:'',removals:'',additions:'',image:'',image_fit:'cover',image_position:'center',image_zoom:'100'};
}

function field(item:Product,key:string){return item[key]||''}

export default function CatalogManager({projectId,initialItems,limit}:{projectId:string;initialItems:Product[];limit:number}){
 const [rows,setRows]=useState<CatalogRow[]>(()=>initialItems.map((item,index)=>({id:`saved-${index}`,item})));
 const [query,setQuery]=useState(''),[category,setCategory]=useState(''),[page,setPage]=useState(0),[openId,setOpenId]=useState<string|null>(null),[uploading,setUploading]=useState<string|null>(null),[uploadError,setUploadError]=useState('');
 const deferredQuery=useDeferredValue(query.trim().toLowerCase());
 const categories=useMemo(()=>Array.from(new Set(rows.map(row=>field(row.item,'category').trim()).filter(Boolean))).sort(),[rows]);
 const filtered=useMemo(()=>rows.filter(({item})=>{
  const categoryMatch=!category||field(item,'category')===category;
  const haystack=`${field(item,'title')} ${field(item,'description')} ${field(item,'category')}`.toLowerCase();
  return categoryMatch&&(!deferredQuery||haystack.includes(deferredQuery));
 }),[rows,category,deferredQuery]);
 const pages=Math.max(1,Math.ceil(filtered.length/pageSize)),currentPage=Math.min(page,pages-1),visible=filtered.slice(currentPage*pageSize,(currentPage+1)*pageSize);

 const update=(id:string,key:string,value:string)=>setRows(current=>current.map(row=>row.id===id?{...row,item:{...row.item,[key]:value}}:row));
 const add=()=>{
  if(rows.length>=limit)return;
  const row={id:makeId(),item:emptyProduct()};
  setRows(current=>[row,...current]);setQuery('');setCategory('');setPage(0);setOpenId(row.id);
 };
 const duplicate=(id:string)=>{
  if(rows.length>=limit)return;
  setRows(current=>{const index=current.findIndex(row=>row.id===id);if(index<0)return current;const source=current[index],copy={id:makeId(),item:{...source.item,title:`${field(source.item,'title')} — cópia`}};const next=[...current];next.splice(index+1,0,copy);setOpenId(copy.id);return next});
 };
 const remove=(id:string)=>{
  if(!window.confirm('Remover este produto do catálogo? A exclusão será confirmada quando você salvar o rascunho.'))return;
  setRows(current=>current.filter(row=>row.id!==id));if(openId===id)setOpenId(null);
 };
 const upload=async(id:string,file:File)=>{
  setUploading(id);setUploadError('');
  try{const image=await uploadProjectImageDirect(projectId,file,`catalog-${id}`);update(id,'image',image.url)}
  catch(error){setUploadError(error instanceof Error?error.message:'Não foi possível enviar a imagem.')}
  finally{setUploading(null)}
 };

 return <section className={styles.manager}>
  <input type="hidden" name="catalog" value={JSON.stringify(rows.map(row=>row.item))}/>
  <div className={styles.toolbar}>
   <div className={styles.searches}>
    <label><span>Buscar</span><input type="search" value={query} onChange={event=>{setQuery(event.target.value);setPage(0)}} placeholder="Nome, descrição ou categoria"/></label>
    <label><span>Categoria</span><select value={category} onChange={event=>{setCategory(event.target.value);setPage(0)}}><option value="">Todas</option>{categories.map(value=><option key={value} value={value}>{value}</option>)}</select></label>
   </div>
   <div className={styles.toolbarMeta}><span><strong>{filtered.length}</strong> exibidos · {rows.length}/{limit}</span><button type="button" className="action primary" onClick={add} disabled={rows.length>=limit}>+ Novo produto</button></div>
  </div>

  {uploadError?<div className="form-error" role="alert">{uploadError}</div>:null}

  {visible.length?<div className={styles.grid}>{visible.map((row)=>{
   const item=row.item,isOpen=openId===row.id,zoom=Math.max(50,Math.min(200,Number(field(item,'image_zoom'))||100));
   return <article className={styles.card} key={row.id} data-open={isOpen}>
    <button className={styles.cardSummary} type="button" onClick={()=>setOpenId(isOpen?null:row.id)}>
     <span className={styles.thumb}>{field(item,'image')?<img src={field(item,'image')} alt="" loading="lazy" decoding="async"/>:<i>Sem foto</i>}</span>
     <span className={styles.identity}><strong>{field(item,'title').trim()||'Produto sem nome'}</strong><small>{[field(item,'category').trim(),field(item,'price').trim()].filter(Boolean).join(' · ')||'Sem categoria ou preço'}</small></span>
     {field(item,'promo_total')?<span className={styles.promo}>PROMO</span>:null}
     <span className={styles.chevron}>{isOpen?'−':'+'}</span>
    </button>

    {isOpen?<div className={styles.editor}>
     <div className={styles.imageColumn}>
      <div className={styles.imageFrame} data-uploading={uploading===row.id}>
       {field(item,'image')?<DraggableImagePreview src={field(item,'image')} alt={field(item,'title')||'Produto'} position={field(item,'image_position')||'center'} fit={field(item,'image_fit')||'cover'} zoom={zoom} onPositionChange={value=>update(row.id,'image_position',value)} onZoomChange={value=>update(row.id,'image_zoom',String(value))}/>:<div className={styles.imageEmpty}>Sem imagem</div>}
      </div>
      <label className="action secondary"><b>{uploading===row.id?'Enviando…':field(item,'image')?'Trocar imagem':'Adicionar imagem'}</b><input className={styles.fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading===row.id} onChange={event=>{const file=event.currentTarget.files?.[0];if(file)void upload(row.id,file);event.currentTarget.value=''}}/></label>
      {field(item,'image')?<button type="button" className="action secondary" onClick={()=>update(row.id,'image','')}>Remover imagem</button>:null}
      <label className={styles.fit}><span>Ajuste da imagem</span><select value={field(item,'image_fit')||'cover'} onChange={event=>update(row.id,'image_fit',event.target.value)}><option value="cover">Preencher</option><option value="contain">Conter</option><option value="fill">Esticar</option></select></label>
     </div>

     <div className={styles.fields}>
      <label><span>Nome</span><input value={field(item,'title')} onChange={event=>update(row.id,'title',event.target.value)}/></label>
      <label><span>Categoria</span><input value={field(item,'category')} onChange={event=>update(row.id,'category',event.target.value)} list="catalog-categories"/></label>
      <label><span>Preço</span><input value={field(item,'price')} onChange={event=>update(row.id,'price',event.target.value)} placeholder="R$ 18,00"/></label>
      <label className={styles.full}><span>Descrição</span><textarea rows={3} value={field(item,'description')} onChange={event=>update(row.id,'description',event.target.value)}/></label>
      <label><span>Qtd. da promoção</span><input value={field(item,'promo_quantity')} onChange={event=>update(row.id,'promo_quantity',event.target.value)} placeholder="2"/></label>
      <label><span>Total promocional</span><input value={field(item,'promo_total')} onChange={event=>update(row.id,'promo_total',event.target.value)} placeholder="R$ 40,00"/></label>
      <label className={styles.full}><span>Itens que podem ser retirados</span><textarea rows={2} value={field(item,'removals')} onChange={event=>update(row.id,'removals',event.target.value)} placeholder="Um por linha"/></label>
      <label className={styles.full}><span>Adicionais e preços</span><textarea rows={2} value={field(item,'additions')} onChange={event=>update(row.id,'additions',event.target.value)} placeholder="Bacon | 5,00"/></label>
     </div>

     <div className={styles.actions}><button type="button" className="action secondary" onClick={()=>duplicate(row.id)} disabled={rows.length>=limit}>Duplicar</button><button type="button" className={styles.danger} onClick={()=>remove(row.id)}>Remover produto</button></div>
    </div>:null}
   </article>;
  })}</div>:<div className={styles.empty}><strong>Nenhum produto encontrado.</strong><span>Ajuste os filtros ou cadastre um novo produto.</span></div>}

  <datalist id="catalog-categories">{categories.map(value=><option key={value} value={value}/>)}</datalist>

  {pages>1?<div className={styles.pagination}><button type="button" className="action secondary" disabled={currentPage===0} onClick={()=>setPage(currentPage-1)}>Anterior</button><span>Página {currentPage+1} de {pages}</span><button type="button" className="action secondary" disabled={currentPage>=pages-1} onClick={()=>setPage(currentPage+1)}>Próxima</button></div>:null}
 </section>;
}
