import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';
const exports:Record<string,unknown>={};
const source=ts.transpileModule(readFileSync(new URL('./capellari-editor.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
runInNewContext(source,{exports,require:(name:string)=>{assert.equal(name,'./capellari-editor-schema.json');return JSON.parse(readFileSync(new URL('./capellari-editor-schema.json',import.meta.url),'utf8'));},Map,JSON,String,Object});
const {capellariCopy,capellariRows,capellariEditorSchema}=exports as typeof import('./capellari-editor');
const data={identity:{},content:{},media:{},appearance:{},contact:{}};
test('focus presentation has bilingual defaults and independent editable overrides',()=>{
  assert.match(capellariCopy(data,'focus_intro','pt'),/Minha trajetória não cabe em um único cargo/);
  const changed={...data,content:{portfolio_concept_copy:{focus_intro_pt:'Novo texto'}}};
  assert.equal(capellariCopy(changed,'focus_intro','pt'),'Novo texto');
  assert.equal(capellariCopy(changed,'focus_intro','en'),capellariCopy(data,'focus_intro','en'));
});
test('existing concept text remains authoritative until a new copy override is saved',()=>{
  const changed={...data,content:{portfolio_concept_hero_title_pt:'Título existente'}};
  assert.equal(capellariCopy(changed,'hero_title','pt'),'Título existente');
  assert.equal(capellariCopy({...data,content:{portfolio_concept_copy:{hero_title_pt:''}}},'hero_title','pt'),'');
});
test('editable lists preserve empty choices and do not mutate input',()=>{
  const changed={...data,content:{portfolio_concept_focus:[]}};const before=structuredClone(changed);
  assert.deepEqual(capellariRows(changed,'portfolio_concept_focus'),[]);
  assert.equal(capellariRows(data,'portfolio_concept_focus').length,4);
  assert.deepEqual(changed,before);
});
test('every copy reference in both renderers has an Owner field in both languages',()=>{
  const sources=[['concept',new URL('../app/portfolio-concept/concept-client.tsx',import.meta.url)],['classic',new URL('../templates/portfolio/native.tsx',import.meta.url)]];
  const ids=new Set(capellariEditorSchema.fields.map(field=>field.id));
  assert.equal(ids.size,capellariEditorSchema.fields.length);
  for(const [variant,path] of sources){const source=readFileSync(path as URL,'utf8');for(const match of source.matchAll(/(?:copy|classicCopy)\('([^']+)'\)/g)){for(const lang of ['pt','en'])assert.ok(ids.has(`${variant}_copy_${match[1]}_${lang}`),`${variant}: ${match[1]} ${lang}`);}}
});
