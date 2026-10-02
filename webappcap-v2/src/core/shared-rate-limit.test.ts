import test from 'node:test';import assert from 'node:assert/strict';
import {consumeSharedRateLimit} from './shared-rate-limit.ts';
test('shared quotas produce a stable private identifier across instances',async()=>{
 const keys:string[]=[];const rpc=async(name:string,args:{p_key:string;p_limit:number;p_window_seconds:number})=>{assert.equal(name,'webappcap_consume_rate_limit');assert.equal(args.p_limit,6);assert.equal(args.p_window_seconds,60);keys.push(args.p_key);return {data:true,error:null}};
 assert.equal(await consumeSharedRateLimit('leads','project:192.0.2.1',6,'secret',rpc),'allowed');
 await consumeSharedRateLimit('leads','project:192.0.2.1',6,'secret',rpc);await consumeSharedRateLimit('analytics','project:192.0.2.1',6,'secret',rpc);
 assert.equal(keys[0],keys[1]);assert.notEqual(keys[0],keys[2]);assert.match(keys[0],/^[a-f0-9]{64}$/);assert.equal(keys[0].includes('192.0.2.1'),false);
});
test('shared quota failures cannot silently bypass a configured limit',async()=>{
 assert.equal(await consumeSharedRateLimit('leads','ip',6,'secret',async()=>({data:false,error:null})),'limited');
 for(const rpc of [async()=>({data:null,error:null}),async()=>({data:true,error:new Error('Database unavailable')}),async()=>{throw new Error('Network error')}])assert.equal(await consumeSharedRateLimit('leads','ip',6,'secret',rpc),'unavailable');
 assert.equal(await consumeSharedRateLimit('leads','ip',6,'',async()=>{throw new Error('Should not call')}),'unavailable');
});
