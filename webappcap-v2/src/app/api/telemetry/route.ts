import {NextResponse} from 'next/server';

const kinds=new Set(['client_error','unhandled_rejection','web_vital']);
const buckets=new Map<string,{count:number;reset:number}>();
const clean=(value:unknown,max:number)=>String(value||'').trim().replace(/[\u0000-\u001f\u007f]/g,' ').slice(0,max);
const response=(ok:boolean,status=200)=>NextResponse.json({ok},{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});

export async function POST(request:Request){
  if(!request.headers.get('content-type')?.includes('application/json'))return response(false,415);

  let body:Record<string,unknown>;
  try{body=await request.json()}catch{return response(false,400)}

  const kind=clean(body.kind,40);
  const name=clean(body.name,80);
  const message=clean(body.message,500);
  const digest=clean(body.digest,120);
  const path=clean(body.path,500);
  const rating=clean(body.rating,20);
  const value=Number(body.value);

  if(!kinds.has(kind)||!name||!path)return response(false,400);

  const ip=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||
    request.headers.get('x-real-ip')||'unknown';
  const now=Date.now(),bucket=buckets.get(ip);
  if(!bucket||bucket.reset<now)buckets.set(ip,{count:1,reset:now+60_000});
  else{
    bucket.count+=1;
    if(bucket.count>24)return response(false,429);
  }

  const event={
    source:'webappcap-client',
    kind,
    name,
    ...(message?{message}:{}),
    ...(digest?{digest}:{}),
    ...(Number.isFinite(value)?{value}:{}),
    ...(rating?{rating}:{}),
    path,
    userAgent:clean(request.headers.get('user-agent'),220),
    timestamp:new Date().toISOString()
  };

  if(kind==='web_vital')console.warn('[webappcap.telemetry]',event);
  else console.error('[webappcap.telemetry]',event);

  return response(true,202);
}
