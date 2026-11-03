import {NextRequest,NextResponse} from 'next/server';
import {createSupabaseServerClient} from '@/lib/supabase/server';
import {isPlatformOwner} from '@/core/session';

export const runtime='nodejs';
export const dynamic='force-dynamic';

const actions=new Set(['initial','questions','answer','lesson','diagnostics','finish-diagnostic','review','study']);

function fail(message:string,status:number){
 return NextResponse.json({ok:false,error:message},{status,headers:{'Cache-Control':'no-store'}});
}
export async function POST(req:NextRequest){
 try{
  const sb=await createSupabaseServerClient();
  const {data:{user},error}=await sb.auth.getUser();
  if(error||!user)return fail('Entre na sua conta WebAppCap para continuar.',401);
  if(!(await isPlatformOwner(user.id)))return fail('Acesso restrito ao proprietário.',403);
  const raw=await req.text();
  if(raw.length>24000)return fail('Requisição muito grande.',413);
  let body:Record<string,unknown>;
  try{body=JSON.parse(raw)}catch{return fail('JSON inválido.',400)}
  const action=String(body.action||'');
  if(!actions.has(action))return fail('Operação não permitida.',400);
  const url=process.env.MATH_GAS_URL;
  const token=process.env.MATH_GAS_TOKEN;
  if(!url||!token)return fail('A conexão segura com o Apps Script precisa ser ativada no servidor.',503);
  if(!/^https:\/\/script\.google\.com\/macros\/s\/[a-zA-Z0-9_-]+\/exec$/.test(url))return fail('URL do backend inválida.',503);
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),20000);
  try{
   const upstream=await fetch(url,{
    method:'POST',redirect:'follow',cache:'no-store',
    headers:{'Content-Type':'text/plain;charset=utf-8'},
    body:JSON.stringify({...body,token}),signal:controller.signal
   });
   if(!upstream.ok)return fail('Backend educacional indisponível.',502);
   const responseText=await upstream.text();
   let payload:unknown;
   try{payload=JSON.parse(responseText)}catch{return fail('Resposta inesperada do Apps Script. Confira a implantação e o acesso.',502)}
   if(!payload||typeof payload!=='object')return fail('Resposta inválida do backend.',502);
   return NextResponse.json(payload,{headers:{'Cache-Control':'no-store'}});
  }finally{clearTimeout(timeout)}
 }catch(e){
  // Não expor tokens, URLs internas ou detalhes de autenticação em respostas.
  console.error('math API failed',e instanceof Error?e.name:'unknown');
  return fail('Não foi possível comunicar com o banco de dados. Tente novamente.',502);
 }
}
