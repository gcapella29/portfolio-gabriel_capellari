import {consumeSharedRateLimit,type RateLimitDecision} from '@/core/shared-rate-limit';
import {createSupabaseAdminClient} from './supabase/admin';

export async function sharedRateLimit(scope:string,key:string,limit:number):Promise<RateLimitDecision>{
 // Apply migration 027 before opting in. Existing deployments keep their local quotas.
 if(process.env.WEBAPPCAP_SHARED_RATE_LIMIT!=='true')return 'allowed';
 const secret=process.env.SUPABASE_SERVICE_ROLE_KEY||'';
 if(!secret)return 'unavailable';
 try{
  const sb=createSupabaseAdminClient();
  return await consumeSharedRateLimit(scope,key,limit,secret,(name,args)=>sb.rpc(name,args));
 }catch{return 'unavailable'}
}
