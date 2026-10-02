import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';

// Load the real server module with a database adapter, without cookies or credentials.
function fixture(options:{ensureError?:Error;saveError?:Error}={}){
 const requests:{operation:string;value:unknown;options?:unknown}[]=[];
 let clients=0;
 const client={from:(table:string)=>{
  assert.equal(table,'project_v2_content');
  return {
   upsert:async(value:unknown,settings:unknown)=>{requests.push({operation:'ensure',value,options:settings});return {error:options.ensureError}},
   update:(value:unknown)=>({eq:async(column:string,id:string)=>{
    assert.equal(column,'project_id');assert.equal(id,'project');requests.push({operation:'update',value});return {error:options.saveError};
   }})
  };
 }};
 const exports:Record<string,unknown>={};
 const code=ts.transpileModule(readFileSync(new URL('./onboarding-data.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 runInNewContext(code,{exports,require:(name:string)=>{
  if(name==='@/lib/supabase/server')return {createSupabaseServerClient:async()=>{clients++;return client}};
  if(name==='./segments'||name==='./content-snapshot')return {};
  throw new Error(`Unexpected dependency: ${name}`);
 },Date});
 return {requests,clients:()=>clients,save:exports.saveV2Sections as (id:string,sections:Record<string,unknown>)=>Promise<void>};
}

test('a complete draft form uses one client and one update for all sections',async()=>{
 const f=fixture();const sections={identity:{name:'Nome'},content:{hero_title:'Título'},contact:{whatsapp:'5511999999999'},media:{hero:{url:'/foto.jpg'}}};
 await f.save('project',sections);
 assert.equal(f.clients(),1);assert.equal(f.requests.length,2);
 assert.equal(f.requests[0].operation,'ensure');
 assert.equal((f.requests[0].options as {ignoreDuplicates:boolean}).ignoreDuplicates,true);
 const payload=f.requests[1].value as Record<string,unknown>;
 for(const [section,value] of Object.entries(sections))assert.deepEqual(payload[section],value);
 assert.equal('appearance' in payload,false); // Unsubmitted sections cannot be reset.
 assert.equal(typeof payload.updated_at,'string');
});
test('an initialization failure prevents any draft update',async()=>{
 const error=new Error('Database unavailable'),f=fixture({ensureError:error});
 await assert.rejects(f.save('project',{identity:{name:'Nome'}}),error);
 assert.equal(f.requests.length,1);
});
test('draft update errors propagate instead of reporting a successful save',async()=>{
 const error=new Error('Permission denied'),f=fixture({saveError:error});
 await assert.rejects(f.save('project',{identity:{name:'Nome'},contact:{}}),error);
 assert.equal(f.requests.filter(r=>r.operation==='update').length,1);
});
