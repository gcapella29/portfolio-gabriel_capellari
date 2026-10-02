import {sharedRateLimit} from '@/lib/shared-rate-limit';
import {NextResponse} from 'next/server';
import {createSupabaseServerClient} from '@/lib/supabase/server';

import {parseCommerceOrderItems} from '@/core/commerce-order-input';

const cleanText=(value:unknown,max:number)=>String(value||'').trim().replace(/\s+/g,' ').slice(0,max);
const cleanPhone=(value:unknown)=>String(value||'').replace(/\D/g,'').slice(0,20);

function json(body:Record<string,unknown>,status=200){
 return NextResponse.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}

export async function POST(request:Request){
 try{
  const raw=await request.json() as Record<string,unknown>;
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return json({ok:false,error:'invalid_input'},400);
  const projectId=cleanText(raw.projectId,120);
  const templateKey=cleanText(raw.templateKey,80);
  const items=parseCommerceOrderItems(raw.items);
  const customerName=cleanText(raw.customerName,120);
  const customerPhone=cleanPhone(raw.customerPhone);

  if(
   !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(projectId)||
   !['commerce-main-1','commerce-modern-1','commerce-sales-1','commerce-bakery-1'].includes(templateKey)||
   !items||
   customerName.length<2||
   customerPhone.length<8
  ){
   return json({ok:false,error:'invalid_input'},400);
  }

  const ip=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||request.headers.get('x-real-ip')||'unknown';
  const shared=await sharedRateLimit('orders',`${projectId}:${ip}`,10);
  if(shared!=='allowed')return json({ok:false,error:shared==='limited'?'rate_limited':'temporarily_unavailable'},shared==='limited'?429:503);
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
