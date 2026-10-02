import test from 'node:test';import assert from 'node:assert/strict';
import {collectMediaReferences,unreferencedMediaCandidates} from './media-audit.ts';
const origin='https://example.supabase.co',project='project';
test('media audit protects draft, public and root references across nested representations',()=>{
 const data={draft:{hero:{path:'project/a.jpg'}},published:{items:[{image:origin+'/storage/v1/object/public/webappcap-v2-sites/project/b.jpg?x=1'}]},root:{image:origin+'/storage/v1/render/image/public/webappcap-v2-sites/project/c%20d.jpg'}};
 const refs=collectMediaReferences(data,project,origin);
 assert.deepEqual([...refs],['project/a.jpg','project/b.jpg','project/c d.jpg']);
 assert.equal(collectMediaReferences(JSON.stringify(data),project,origin).size,3);
});
test('media audit rejects foreign origins/projects/traversal and handles cyclic input',()=>{
 const cyclic:Record<string,unknown>={path:'other/a.jpg'};cyclic.self=cyclic;
 assert.equal(collectMediaReferences([cyclic,'project/../a.jpg','https://attacker.example/storage/v1/object/public/webappcap-v2-sites/project/a.jpg'],project,origin).size,0);
});
test('only old unreferenced files with reliable timestamps become candidates',()=>{
 const now=Date.parse('2026-10-02T00:00:00Z'),old='2026-09-01T00:00:00Z',recent='2026-10-01T00:00:00Z';
 const files=[{path:'project/used',createdAt:old},{path:'project/unused',createdAt:old},{path:'project/new',createdAt:recent},{path:'project/edited',createdAt:old,updatedAt:recent},{path:'project/unknown'},{path:'project/bad',createdAt:'invalid'}];
 assert.deepEqual(unreferencedMediaCandidates(files,new Set(['project/used']),now).map(file=>file.path),['project/unused']);
});
