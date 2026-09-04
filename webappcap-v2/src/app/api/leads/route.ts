import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const clean=(value:FormDataEntryValue|null,max:number)=>String(value||'').trim().slice(0,max);
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request:Request){
  const form=await request.formData();
  if(clean(form.get('website'),200))return NextResponse.json({ok:true});
  const projectId=clean(form.get('projectId'),60);
  const name=clean(form.get('name'),120);
  const phone=clean(form.get('phone'),40);
  const message=clean(form.get('message'),1000);
  if(!uuid.test(projectId)||!name||!phone||!message)return NextResponse.json({ok:false,error:'invalid_input'},{status:400});
  const sb=await createSupabaseServerClient();
  const result=await sb.rpc('submit_v2_public_lead',{p_project_id:projectId,p_name:name,p_phone:phone,p_message:message});
  if(result.error){console.error('submit_v2_public_lead',result.error.message);return NextResponse.json({ok:false,error:'submit_failed'},{status:500})}
  return NextResponse.json({ok:true});
}
