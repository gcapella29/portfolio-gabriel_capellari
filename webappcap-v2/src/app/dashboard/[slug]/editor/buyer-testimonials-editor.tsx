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
  <p>Cadastre relatos reais e use textos, nomes e imagens com autorização dos compradores. Prints podem ser enviados sem transcrever a mensagem.</p>
  {!rows.length?<p>Nenhum relato cadastrado. O bloco fica oculto no site enquanto estiver vazio.</p>:null}
  {rows.map((row,index)=><fieldset className={styles.buyerRow} key={row.id}><legend>Relato {index+1}{row.name?` · ${row.name}`:''}</legend>
   <label className={styles.buyerEnabled}><input type="checkbox" checked={row.enabled} onChange={event=>update(row.id,'enabled',event.target.checked)}/>Exibir este relato no site</label>
   <div className="form-grid"><label className="field"><span>Nome do comprador</span><input value={row.name} maxLength={120} required onChange={event=>update(row.id,'name',event.target.value)} placeholder="Nome autorizado pelo comprador"/></label><label className="field"><span>Produto ou identificação (opcional)</span><input value={row.role} maxLength={160} onChange={event=>update(row.id,'role',event.target.value)} placeholder="Ex.: Ecobag personalizada"/></label></div>
   <label className="field"><span>Relato do comprador</span><textarea value={row.text} maxLength={3000} rows={4} onChange={event=>update(row.id,'text',event.target.value)} placeholder="O que o comprador contou sobre o produto"/><small>Opcional quando você enviar um print do feedback.</small></label>
   {canManageMedia?<DirectImageField projectId={projectId} name={`uploadedMedia:testimonial-${row.id}`} slot={`testimonial-${row.id}`} label="Foto ou print do feedback (opcional)" current={testimonialImageUrl(row.image)} allowFraming={false} currentFit="contain" previewAspectRatio="4 / 3" previewMaxWidth={420} help="No site, a imagem aparece inteira e pode ser ampliada. Confira a imagem antes de salvar o rascunho."/>:null}
   <div className={styles.buyerActions}><button type="button" className="action secondary" disabled={index===0} onClick={()=>move(index,-1)} aria-label={`Mover relato ${index+1} para cima`}>↑ Mover acima</button><button type="button" className="action secondary" disabled={index===rows.length-1} onClick={()=>move(index,1)} aria-label={`Mover relato ${index+1} para baixo`}>↓ Mover abaixo</button><button type="button" className="action secondary" onClick={()=>setRows(current=>current.filter(item=>item.id!==row.id))}>Remover relato</button></div>
  </fieldset>)}
  <button className="action secondary" type="button" disabled={rows.length>=30} onClick={()=>setRows(current=>[...current,{id:crypto.randomUUID(),name:'',role:'',text:'',enabled:true,image:''}])}>Adicionar relato</button>
 </div>;
}
