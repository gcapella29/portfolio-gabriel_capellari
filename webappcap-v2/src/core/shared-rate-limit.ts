import {createHmac} from 'node:crypto';

export type RateLimitDecision='allowed'|'limited'|'unavailable';
type Rpc=(name:string,args:{p_key:string;p_limit:number;p_window_seconds:number})=>PromiseLike<{data:unknown;error:unknown}>;
export async function consumeSharedRateLimit(scope:string,key:string,limit:number,secret:string,rpc:Rpc):Promise<RateLimitDecision>{
 if(!secret)return 'unavailable';
 // Keep raw IP addresses out of the database. Rotation resets only short-lived quotas.
 const digest=createHmac('sha256',secret).update(JSON.stringify([scope,key])).digest('hex');
 try{
  const result=await rpc('webappcap_consume_rate_limit',{p_key:digest,p_limit:limit,p_window_seconds:60});
  if(result.error||typeof result.data!=='boolean')return 'unavailable';
  return result.data?'allowed':'limited';
 }catch{return 'unavailable'}
}
