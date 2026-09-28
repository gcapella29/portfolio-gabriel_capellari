import {NextResponse} from 'next/server';
import {createSupabaseServerClient} from '@/lib/supabase/server';

type ItemRef={productIndex:number;quantity:number};

const cleanText=(value:unknown,max:number)=>String(value||'').trim().replace(/\s+/g,' ').slice(0,max);
const cleanPhone=(value:unknown)=>String(value||'').replace(/\D/g,'').slice(0,20);
const finiteInteger=(value:unknown)=>Number.isFinite(Number(value))?Math.floor(Number(value)):NaN;

const cleanItems=(value:unknown):ItemRef[]=>{
 if(!Array.isArray(value))return[];
 const result:ItemRef[]=[];
 for(const raw of value.slice(0,80)){
  if(!raw||typeof raw!=='object')continue;
  const item=raw as Record<string,unknown>;
  const productIndex=finiteInteger(item.productIndex);
  const quantity=finiteInteger(item.quantity);
  if(!Number.isInteger(productIndex)||productIndex<0||!Number.isInteger(quantity)||quantity<1||quantity>999)continue;
  result.push({productIndex,quantity});
 }
 return result;
};

function json(body:Record<string,unknown>,status=200){
 return NextResponse.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}

export async function POST(request:Request){
 try{
  const raw=await request.json() as Record<string,unknown>;
  const projectId=cleanText(raw.projectId,120);
  const templateKey=cleanText(raw.templateKey,80);
  const items=cleanItems(raw.items);
  const customerName=cleanText(raw.customerName,120);
  const customerPhone=cleanPhone(raw.customerPhone);

  if(
   !projectId||
   !['commerce-main-1','commerce-sales-1'].includes(templateKey)||
   !items.length||
   customerName.length<2||
   customerPhone.length<8
  ){
   return json({ok:false,error:'invalid_input'},400);
  }

  const sb=await createSupabaseServerClient();
  const saved=await sb.rpc('submit_v2_commerce_order',{
   p_project_id:projectId,
   p_template_key:templateKey,
   p_items:items,
   p_customer_name:customerName,
   p_customer_phone:customerPhone
  });

  if(saved.error){
   console.error('submit_v2_commerce_order',saved.error.message);
   return json({ok:false,error:'submit_failed'},500);
  }

  return json({ok:true,id:saved.data},201);
 }catch(error){
  console.error('orders POST',error);
  return json({ok:false,error:'invalid_request'},400);
 }
}
