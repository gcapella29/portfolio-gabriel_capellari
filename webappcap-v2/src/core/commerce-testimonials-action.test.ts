import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {buyerTestimonialPatch} from './commerce-testimonials.ts';
const require=createRequire(import.meta.url),ts=require('typescript');
const current={identity:{name:'Loja'},content:{menu_items:[{title:'Produto'}],keep:'preserved'},contact:{instagram:'loja'},media:{},appearance:{}};
async function fixture(form:FormData,writes:unknown[]=[]){
 const revalidations:string[]=[];
 const deps:Record<string,unknown>={
  '@/core/commerce-testimonials':{buyerTestimonialPatch},
  '@/core/image-placement':{normalizeImagePosition:()=> 'center'},
  'next/cache':{revalidatePath:(path:string)=>revalidations.push(path)},
  'next/navigation':{redirect:()=>{}},
  '@/core/permissions':{can:()=>true},
  '@/core/onboarding-data':{publicMediaUrl:(path:string)=>`https://storage.example/${path}`,readV2Content:async()=>structuredClone(current),saveV2Sections:async(_id:string,sections:unknown)=>writes.push(sections)},
  '@/core/session':{resolveProjectAccess:async()=>({role:'owner',project:{id:'project',segment:'food-business'}})},
  '@/core/menu-item-limit':{},
 };
 const code=ts.transpileModule(readFileSync(new URL('../app/dashboard/[slug]/editor/complete-content-action.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const exported:Record<string,(f:FormData)=>Promise<void>>={};new Function('require','exports',code)((name:string)=>{if(!(name in deps))throw Error(name);return deps[name]},exported);
 await exported.saveCompleteContentAction(form);return {writes,revalidations};
}
test('complete commerce editor saves reviews with existing catalog and contact in one draft write',async()=>{
 const form=new FormData();form.set('slug','shop');form.set('section:testimonials',JSON.stringify([{id:'review',name:'',text:'',role:'',enabled:true,image:''}]));form.set('uploadedMedia:testimonial-review',JSON.stringify({path:'project/print.webp',url:'https://storage.example/project/print.webp'}));form.set('visibility:testimonials','true');
 const {writes,revalidations}=await fixture(form);assert.equal(writes.length,1);
 const saved=writes[0] as typeof current;assert.deepEqual(saved.content.menu_items,current.content.menu_items);assert.equal(saved.content.keep,'preserved');assert.deepEqual(saved.contact,current.contact);
 assert.equal((saved.content as Record<string,unknown>).show_testimonials,true);assert(revalidations.includes('/preview/shop'));
});
test('invalid reviews reject the complete commerce form before any write',async()=>{
 const form=new FormData();form.set('slug','shop');form.set('section:testimonials','bad-json');form.set('tagline','Should not save');
 const writes:unknown[]=[];await assert.rejects(fixture(form,writes),/Nada foi salvo/);assert.equal(writes.length,0);
});
