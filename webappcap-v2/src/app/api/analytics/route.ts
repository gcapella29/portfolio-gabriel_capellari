import {sharedRateLimit} from '@/lib/shared-rate-limit';
import {createWindowRateLimiter} from '@/core/rate-limit';
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const allowed=new Set(['page_view','contact_click','whatsapp_click','instagram_click','linkedin_click','email_click','cv_click','external_click']);
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const limited=createWindowRateLimiter(40);
const clean=(value:unknown,max:number)=>String(value||'').trim().replace(/[\u0000-\u001f\u007f]/g,' ').slice(0,max);
const response=(ok:boolean,status=200)=>NextResponse.json({ok},{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});

export async function POST(request:Request){
  if(!request.headers.get('content-type')?.includes('application/json'))return response(false,415);
  let body:Record<string,unknown>;try{body=await request.json();if(!body||typeof body!=='object'||Array.isArray(body))return response(false,400)}catch{return response(false,400)}
  const projectId=clean(body.projectId,60),eventType=clean(body.eventType,40);
  if(!uuid.test(projectId)||!allowed.has(eventType))return response(false,400);
  const ip=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||request.headers.get('x-real-ip')||'unknown';
  if(limited(`${projectId}:${ip}`))return response(false,429);
  const shared=await sharedRateLimit('analytics',`${projectId}:${ip}`,40);
  if(shared!=='allowed')return response(false,shared==='limited'?429:503);
  const sb=await createSupabaseServerClient();
  const result=await sb.rpc('webappcap_track_event',{
    p_project_id:projectId,
    p_event_type:eventType,
    p_event_label:clean(body.eventLabel,160)||null,
    p_path:clean(body.path,500)||null,
    p_referrer_host:clean(body.referrerHost,255)||null,
    p_session_id:clean(body.sessionId,100)||null,
  });
  if(result.error||result.data!==true)return response(false,400);
  return response(true);
}
