import {createSupabaseServerClient} from '@/lib/supabase/server';

export type CommerceOrderItem={name:string;quantity:number;unitPrice:number;total:number};
export type CommerceOrder={id:string;templateKey:string;items:CommerceOrderItem[];total:number;createdAt:string};

const cleanItems=(value:unknown):CommerceOrderItem[]=>Array.isArray(value)?value.map(raw=>{
 const item=raw&&typeof raw==='object'?raw as Record<string,unknown>:{};
 return{name:String(item.name||'Produto'),quantity:Number(item.quantity)||1,unitPrice:Number(item.unitPrice)||0,total:Number(item.total)||0};
}).filter(item=>item.name):[];

function parseFallback(row:{id:number;message:string|null;created_at:string}):CommerceOrder|null{
 const message=String(row.message||'');if(!message.startsWith('WEBAPPCAP_ORDER_V1|'))return null;
 try{
  const raw=JSON.parse(message.slice('WEBAPPCAP_ORDER_V1|'.length)) as {t?:unknown;i?:unknown;x?:unknown};
  const items=Array.isArray(raw.i)?raw.i.map(value=>Array.isArray(value)?{name:String(value[0]||'Produto'),quantity:Number(value[1])||1,unitPrice:Number(value[2])||0,total:Number(value[3])||0}:null).filter((item):item is CommerceOrderItem=>Boolean(item)):[];
  if(!items.length)return null;
  return{id:`legacy-${row.id}`,templateKey:String(raw.t||'commerce-main-1'),items,total:Number(raw.x)||0,createdAt:row.created_at};
 }catch{return null}
}

export async function commerceOrdersForProject(projectId:string,options?:{since?:string;limit?:number}){
 const sb=await createSupabaseServerClient(),limit=Math.max(1,Math.min(options?.limit||500,1000));
 let query=sb.from('commerce_orders').select('id,template_key,items,total,created_at').eq('project_id',projectId).order('created_at',{ascending:false}).limit(limit);
 if(options?.since)query=query.gte('created_at',options.since);
 const dedicated=await query;
 const rows:CommerceOrder[]=dedicated.error?[]:(dedicated.data||[]).map(row=>({id:String(row.id),templateKey:String(row.template_key),items:cleanItems(row.items),total:Number(row.total)||0,createdAt:String(row.created_at)}));

 let legacy=sb.from('site_leads').select('id,message,created_at').eq('project_id',projectId).like('message','WEBAPPCAP_ORDER_V1|%').order('created_at',{ascending:false}).limit(limit);
 if(options?.since)legacy=legacy.gte('created_at',options.since);
 const fallback=await legacy;
 if(!fallback.error)rows.push(...(fallback.data||[]).map(parseFallback).filter((order):order is CommerceOrder=>Boolean(order)));

 return rows.sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()).slice(0,limit);
}
