import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const clean=(value:FormDataEntryValue|null,max:number)=>String(value||'').trim().replace(/[\u0000-\u001f\u007f]/g,' ').slice(0,max);
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const phone=/^[+()\-\s\d]{8,40}$/;
const buckets=new Map<string,{count:number;reset:number}>();

function clientKey(request:Request,projectId:string){const forwarded=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||request.headers.get('x-real-ip')||'unknown';return `${projectId}:${forwarded}`}
function limited(key:string){const now=Date.now(),current=buckets.get(key);if(!current||current.reset<now){buckets.set(key,{count:1,reset:now+60_000});return false}current.count+=1;return current.count>6}
function json(body:Record<string,unknown>,status=200){return NextResponse.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}

export async function POST(request:Request){
  const type=request.headers.get('content-type')||'';if(!type.includes('multipart/form-data')&&!type.includes('application/x-www-form-urlencoded'))return json({ok:false,error:'unsupported_media_type'},415);
  let form:FormData;try{form=await request.formData()}catch{return json({ok:false,error:'invalid_form'},400)}
  if(clean(form.get('website'),200))return json({ok:true});
  const projectId=clean(form.get('projectId'),60),name=clean(form.get('name'),120),phoneValue=clean(form.get('phone'),40),message=clean(form.get('message'),1000);
  if(!uuid.test(projectId)||name.length<2||!phone.test(phoneValue)||message.length<3)return json({ok:false,error:'invalid_input'},400);
  if(limited(clientKey(request,projectId)))return json({ok:false,error:'rate_limited'},429);
  const sb=await createSupabaseServerClient();
  const published=await sb.from('project_v2_state').select('project_id,lifecycle').eq('project_id',projectId).eq('lifecycle','published').maybeSingle();
  if(published.error||!published.data)return json({ok:false,error:'project_unavailable'},404);
  const result=await sb.rpc('submit_v2_public_lead',{p_project_id:projectId,p_name:name,p_phone:phoneValue,p_message:message});
  if(result.error){console.error('submit_v2_public_lead',result.error.message);return json({ok:false,error:'submit_failed'},500)}
  return json({ok:true});
}
