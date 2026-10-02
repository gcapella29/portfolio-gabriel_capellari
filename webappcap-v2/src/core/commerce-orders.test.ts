import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';

type Result={data:unknown[];error?:{code:string;message:string}};
function fixture(results:Record<string,Result>){
 const queried:string[]=[];
 const client={from:(table:string)=>{
  const query={select:()=>query,eq:()=>query,order:()=>query,limit:()=>query,gte:()=>query,like:()=>query,then:(resolve:(result:Result)=>unknown)=>{queried.push(table);return Promise.resolve(results[table]).then(resolve)}};
  return query;
 }};
 const exports:Record<string,unknown>={};
 const code=ts.transpileModule(readFileSync(new URL('./commerce-orders.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 runInNewContext(code,{exports,require:()=>({createSupabaseServerClient:async()=>client}),Date});
 return {queried,read:exports.commerceOrdersForProject as (id:string,options?:{limit:number})=>Promise<{id:string;items:{quantity:number}[]}[]>};
}
const legacy={id:9,name:'Cliente',phone:'11999999999',created_at:'2026-10-02T11:00:00Z',message:'WEBAPPCAP_ORDER_V1|'+JSON.stringify({t:'commerce-main-1',i:[['Produto',2,10,20]],x:20})};
const dedicated={id:'order',template_key:'commerce-modern-1',created_at:'2026-10-02T12:00:00Z',items:[{name:'Produto',quantity:3,unitPrice:10,total:30}],total:30};
test('order history combines and sorts current and legacy orders',async()=>{
 const f=fixture({commerce_orders:{data:[dedicated]},site_leads:{data:[legacy,{...legacy,id:10,message:'not an order'}]}});
 const orders=await f.read('project');
 assert.equal(f.queried.length,2);assert.equal(orders.length,2);
 assert.equal(orders[0].id,'order');assert.equal(orders[1].id,'legacy-9');assert.equal(orders[1].items[0].quantity,2);
 assert.equal((await f.read('project',{limit:1})).length,1);
});
test('a missing dedicated table retains legacy history',async()=>{
 const f=fixture({commerce_orders:{data:[],error:{code:'42P01',message:'Missing table'}},site_leads:{data:[legacy]}});
 assert.equal((await f.read('project'))[0].id,'legacy-9');
});
test('database failures must not look like an empty order history',async()=>{
 for(const table of ['commerce_orders','site_leads']){
  const error={code:'42501',message:'Permission denied'};
  const f=fixture({commerce_orders:{data:[]},site_leads:{data:[]},[table]:{data:[],error}});
  await assert.rejects(f.read('project'),value=>value===error);
 }
});
