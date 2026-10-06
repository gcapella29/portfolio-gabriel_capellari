'use client';
import {useState} from 'react';
import {testimonialRows,testimonialImageUrl,type BuyerTestimonial} from '@/core/commerce-testimonials';
import DirectImageField from '../content/direct-image-field';
import styles from './editor-blocks.module.css';

export default function BuyerTestimonialsEditor({projectId,initial,canManageMedia}:{projectId:string;initial:unknown;canManageMedia:boolean}){
 const [rows,setRows]=useState(()=>testimonialRows(initial));
 const update=(id:string,field:keyof BuyerTestimonial,value:string|boolean)=>setRows(current=>current.map(row=>row.id===id?{...row,[field]:value}:row));
 const move=(index:number,direction:number)=>setRows(current=>{const next=[...current],target=index+direction;if(target<0||target>=next.length)return current;[next[index],next[target]]=[next[target],next[index]];return next});
 return <div className={styles.buyerRows}>
  <input type="hidden" name="section:testimonials" value={JSON.stringify(rows)}/>
  <p>Envie apenas o print do feedback. Não é necessário preencher nome, produto ou transcrever a mensagem. Use imagens autorizadas pelos compradores.</p>
  {!rows.length?<p>Nenhum relato cadastrado. O bloco fica oculto no site enquanto estiver vazio.</p>:null}
  {rows.map((row,index)=><fieldset className={styles.buyerRow} key={row.id}><legend>Print {index+1}</legend>
   <label className={styles.buyerEnabled}><input type="checkbox" checked={row.enabled} onChange={event=>update(row.id,'enabled',event.target.checked)}/>Exibir este relato no site</label>
   {canManageMedia?<DirectImageField projectId={projectId} name={`uploadedMedia:testimonial-${row.id}`} slot={`testimonial-${row.id}`} label="Print do feedback" current={testimonialImageUrl(row.image)} allowFraming={false} allowRemove={false} currentFit="contain" previewAspectRatio="4 / 3" previewMaxWidth={420} help="No site, a imagem aparece inteira e pode ser ampliada. Confira a imagem antes de salvar o rascunho."/>:<p>Sem permissão para enviar imagens.</p>}
   <div className={styles.buyerActions}><button type="button" className="action secondary" disabled={index===0} onClick={()=>move(index,-1)} aria-label={`Mover relato ${index+1} para cima`}>↑ Mover acima</button><button type="button" className="action secondary" disabled={index===rows.length-1} onClick={()=>move(index,1)} aria-label={`Mover relato ${index+1} para baixo`}>↓ Mover abaixo</button><button type="button" className="action secondary" onClick={()=>setRows(current=>current.filter(item=>item.id!==row.id))}>Remover relato</button></div>
  </fieldset>)}
  <button className="action secondary" type="button" disabled={!canManageMedia||rows.length>=30} onClick={()=>setRows(current=>[...current,{id:crypto.randomUUID(),name:'',role:'',text:'',enabled:true,image:''}])}>Adicionar print</button>
 </div>;
}
