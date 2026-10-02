import {sharedRateLimit} from '@/lib/shared-rate-limit';
import {createWindowRateLimiter} from '@/core/rate-limit';
import { NextResponse } from 'next/server';
import { readPublicSiteBySlug } from '@/core/public-site';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const clean=(value:FormDataEntryValue|null,max:number)=>String(value||'').trim().replace(/[\u0000-\u001f\u007f]/g,' ').slice(0,max);
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const phone=/^[+()\-\s\d]{8,40}$/;
const limited=createWindowRateLimiter(6);

function clientKey(request:Request,projectId:string){const forwarded=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||request.headers.get('x-real-ip')||'unknown';return `${projectId}:${forwarded}`}
function json(body:Record<string,unknown>,status=200){return NextResponse.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}

export async function POST(request:Request){
  const type=request.headers.get('content-type')||'';
  if(!type.includes('multipart/form-data')&&!type.includes('application/x-www-form-urlencoded'))return json({ok:false,error:'unsupported_media_type'},415);

  let form:FormData;
  try{form=await request.formData()}catch{return json({ok:false,error:'invalid_form'},400)}
  if(clean(form.get('website'),200))return json({ok:true});

  let projectId=clean(form.get('projectId'),60);
  const projectSlug=clean(form.get('projectSlug'),60).toLowerCase();
  const name=clean(form.get('name'),120);
  const phoneValue=clean(form.get('phone'),40);
  const message=clean(form.get('message'),1000);
  const consent=clean(form.get('consent'),10).toLowerCase();
  const consentGranted=['true','1','on','yes'].includes(consent);

  if(!uuid.test(projectId)&&/^[a-z0-9-]{2,60}$/.test(projectSlug)){
    const publicSite=await readPublicSiteBySlug(projectSlug);
    projectId=publicSite?.project.id||'';
  }

  if(!uuid.test(projectId)||name.length<2||(!phone.test(phoneValue)||phoneValue.replace(/\D/g,'').length<8)||message.length<3||!consentGranted)return json({ok:false,error:'invalid_input'},400);
  if(limited(clientKey(request,projectId)))return json({ok:false,error:'rate_limited'},429);
  const shared=await sharedRateLimit('leads',clientKey(request,projectId),6);
  if(shared!=='allowed')return json({ok:false,error:shared==='limited'?'rate_limited':'temporarily_unavailable'},shared==='limited'?429:503);

  const sb=createSupabaseAdminClient();
  const result=await sb.rpc('submit_v2_public_lead',{
    p_project_id:projectId,
    p_name:name,
    p_phone:phoneValue,
    p_message:message,
    p_consent:true
  });

  if(result.error){console.error('submit_v2_public_lead',result.error.message);return json({ok:false,error:'submit_failed'},500)}
  return json({ok:true});
}
