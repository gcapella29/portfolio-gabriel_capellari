import {NextResponse} from 'next/server';
import {createSupabaseServerClient} from '@/lib/supabase/server';

type Item={name:string;quantity:number;unitPrice:number;total:number};
const finite=(value:unknown)=>Number.isFinite(Number(value))?Number(value):0;
const cleanItems=(value:unknown):Item[]=>Array.isArray(value)?value.slice(0,80).map(raw=>{
 const item=raw&&typeof raw==='object'?raw as Record<string,unknown>:{};
 const quantity=Math.max(1,Math.min(999,Math.floor(finite(item.quantity)||1))),unitPrice=Math.max(0,finite(item.unitPrice)),total=Math.max(0,finite(item.total));
 return{name:String(item.name||'Produto').trim().slice(0,160)||'Produto',quantity,unitPrice,total};
}):[];
const fallbackMessage=(templateKey:string,items:Item[],total:number)=>{
 const compact={v:1,t:templateKey,i:items.map(item=>[item.name,item.quantity,item.unitPrice,item.total]),x:total};
 return `WEBAPPCAP_ORDER_V1|${JSON.stringify(compact)}`.slice(0,1000);
};

export async function POST(request:Request){
 try{
  const raw=await request.json() as Record<string,unknown>,projectId=String(raw.projectId||''),templateKey=String(raw.templateKey||''),items=cleanItems(raw.items),total=Math.max(0,finite(raw.total));
  if(!projectId||!['commerce-main-1','commerce-sales-1'].includes(templateKey)||!items.length)return NextResponse.json({ok:false},{status:400});
  const sb=await createSupabaseServerClient();
  const dedicated=await sb.rpc('submit_v2_commerce_order',{p_project_id:projectId,p_template_key:templateKey,p_items:items,p_total:total});
  if(!dedicated.error)return NextResponse.json({ok:true,id:dedicated.data},{status:201});

  const fallback=await sb.rpc('submit_v2_public_lead',{
   p_project_id:projectId,
   p_name:'Pedido enviado pelo site',
   p_phone:'pedido-whatsapp',
   p_message:fallbackMessage(templateKey,items,total)
  });
  if(fallback.error)return NextResponse.json({ok:false},{status:202});
  return NextResponse.json({ok:true,id:fallback.data,fallback:true},{status:201});
 }catch{
  return NextResponse.json({ok:false},{status:202});
 }
}
