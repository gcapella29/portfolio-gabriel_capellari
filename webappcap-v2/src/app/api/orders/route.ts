import {NextResponse} from 'next/server';
import {createSupabaseServerClient} from '@/lib/supabase/server';

type Item={name:string;quantity:number;unitPrice:number;total:number};
const finite=(value:unknown)=>Number.isFinite(Number(value))?Number(value):0;
const cleanText=(value:unknown,max:number)=>String(value||'').trim().replace(/\s+/g,' ').slice(0,max);
const cleanPhone=(value:unknown)=>String(value||'').replace(/\D/g,'').slice(0,20);
const cleanItems=(value:unknown):Item[]=>Array.isArray(value)?value.slice(0,80).map(raw=>{
 const item=raw&&typeof raw==='object'?raw as Record<string,unknown>:{};
 const quantity=Math.max(1,Math.min(999,Math.floor(finite(item.quantity)||1))),unitPrice=Math.max(0,finite(item.unitPrice)),total=Math.max(0,finite(item.total));
 return{name:cleanText(item.name||'Produto',160)||'Produto',quantity,unitPrice,total};
}):[];
const fallbackMessage=(templateKey:string,items:Item[],total:number)=>{
 const compactItems=items.map(item=>[item.name.slice(0,80),item.quantity,item.unitPrice,item.total]);
 let encoded='';
 do{encoded=JSON.stringify({v:2,t:templateKey,i:compactItems,x:total});if(encoded.length<=975)break;compactItems.pop()}while(compactItems.length>1);
 return `WEBAPPCAP_ORDER_V1|${encoded}`;
};

export async function POST(request:Request){
 try{
  const raw=await request.json() as Record<string,unknown>;
  const projectId=cleanText(raw.projectId,120),templateKey=cleanText(raw.templateKey,80),items=cleanItems(raw.items),total=Math.max(0,finite(raw.total));
  const customerName=cleanText(raw.customerName,120),customerPhone=cleanPhone(raw.customerPhone);
  if(!projectId||!['commerce-main-1','commerce-sales-1'].includes(templateKey)||!items.length||customerName.length<2||customerPhone.length<8){
   return NextResponse.json({ok:false},{status:400});
  }
  const sb=await createSupabaseServerClient();
  const saved=await sb.rpc('submit_v2_public_lead',{
   p_project_id:projectId,
   p_name:customerName,
   p_phone:customerPhone,
   p_message:fallbackMessage(templateKey,items,total)
  });
  if(saved.error)return NextResponse.json({ok:false},{status:202});
  return NextResponse.json({ok:true,id:saved.data},{status:201});
 }catch{
  return NextResponse.json({ok:false},{status:202});
 }
}
