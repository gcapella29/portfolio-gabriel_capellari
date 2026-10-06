export type BuyerTestimonial={id:string;name:string;role:string;text:string;enabled:boolean;image:unknown};
const value=(raw:unknown)=>typeof raw==='string'?raw.trim():'';
export function testimonialImageUrl(raw:unknown){
 const url=value(raw&&typeof raw==='object'?(raw as Record<string,unknown>).url:raw);
 return /^(https?:\/\/|\/(?!\/))/.test(url)?url:'';
}
export function testimonialRows(raw:unknown):BuyerTestimonial[]{
 if(!Array.isArray(raw))return [];
 return raw.slice(0,30).flatMap((row,index)=>{
  if(!row||typeof row!=='object'||Array.isArray(row))return [];
  const r=row as Record<string,unknown>;
  return [{id:value(r.id)||`legacy-${index}`,name:value(r.name).slice(0,120),role:value(r.role).slice(0,160),text:value(r.text).slice(0,3000),enabled:r.enabled!==false&&r.enabled!=='false',image:r.image||''}];
 });
}
export function visibleBuyerTestimonials(content:Record<string,unknown>){
 if(String(content.show_testimonials).toLowerCase()==='false')return [];
 return testimonialRows(content.testimonials).filter(row=>row.enabled&&row.name&&(row.text||testimonialImageUrl(row.image)));
}
// Resolve images against existing draft references or verified uploads, before any write.
export function buyerTestimonialPatch(form:FormData,current:unknown,options:{projectId:string;manageMedia:boolean;mediaUrl:(path:string)=>string}){
 if(!form.has('section:testimonials'))return undefined;
 let parsed:unknown;try{parsed=JSON.parse(String(form.get('section:testimonials')||''))}catch{throw new Error('Lista de relatos inválida. Nada foi salvo.')}
 if(!Array.isArray(parsed)||parsed.length>30||parsed.some(row=>!row||typeof row!=='object'||Array.isArray(row)))throw new Error('Os relatos devem conter até 30 itens. Nada foi salvo.');
 const rows=testimonialRows(parsed),existing=testimonialRows(current),ids=new Set<string>();
 return rows.map(row=>{
  if(!/^[a-zA-Z0-9-]{1,64}$/.test(row.id)||ids.has(row.id))throw new Error('Identificador de relato inválido. Nada foi salvo.');ids.add(row.id);
  const previous=existing.find(item=>item.id===row.id),slot=`testimonial-${row.id}`,raw=String(form.get(`uploadedMedia:${slot}`)||'');
  if(testimonialImageUrl(row.image)!==testimonialImageUrl(previous?.image))throw new Error('Imagem de relato incompatível. Nada foi salvo.');
  let image=previous?.image||'';
  if(options.manageMedia){
   if(String(form.get(`removeMedia:${slot}`))==='yes')image='';
   else if(raw&&raw!=='null'){
    let upload:Record<string,unknown>;try{upload=JSON.parse(raw)}catch{throw new Error('Imagem de relato inválida. Nada foi salvo.')}
    const path=value(upload?.path);
    if(!path.startsWith(`${options.projectId}/`)||!/^[a-zA-Z0-9._/-]+$/.test(path)||path.split('/').some(part=>!part||part==='.'||part==='..')||value(upload?.url)!==options.mediaUrl(path))throw new Error('Imagem de relato incompatível com o projeto. Nada foi salvo.');
    image={path,url:options.mediaUrl(path),fit:'contain',position:'center',zoom:100};
   }
  }else if((raw&&raw!=='null')||String(form.get(`removeMedia:${slot}`))==='yes')throw new Error('Sem permissão para editar imagens.');
  if(!row.name||(!row.text&&!testimonialImageUrl(image)))throw new Error('Informe o nome e um texto ou imagem para cada relato. Nada foi salvo.');
  return {...row,image};
 });
}
