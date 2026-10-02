import test from 'node:test';
import assert from 'node:assert/strict';
import {parseHomeProjectCases,mergeHomeProjectCases,safeProjectUrl,type HomeProjectCase} from './home-project-cases.ts';

test('home cases reject unsafe links and preserve fact text containing colons',()=>{
  const cases=parseHomeProjectCases('Loja | javascript:alert(1) | Loja\nCase | https://case.example | Site | Texto | CONTATO:Horário: 10h | Mobile; Painel\nSem URL');
  assert.equal(cases.length,1);
  assert.equal(cases[0].facts[0].text,'Horário: 10h');
  for(const value of ['data:text/html,test','https://user:pass@example.com','https://example.com\\bad','//example.com'])assert.equal(safeProjectUrl(value),'');
});
test('published projects supplement manual cases without replacing edited copy or duplicating aliases',()=>{
  const manual=parseHomeProjectCases('Gabriel | https://custom.example | Portfólio | Texto editado | | Jornalismo');
  const published:HomeProjectCase[]=[{name:'Gabriel',url:'https://gabriel.webappcap.com.br',category:'Portfólio',description:'Padrão',facts:[],tags:[],image:'https://images.example/hero.jpg',slug:'gabriel'},{name:'Alumni',url:'https://alumni.webappcap.com.br',category:'Institucional',description:'Instituição',facts:[],tags:[],slug:'alumni'}];
  const cases=mergeHomeProjectCases(manual,published);
  assert.equal(cases.length,2);assert.equal(cases[0].description,'Texto editado');assert.equal(cases[0].url,'https://custom.example/');assert.equal(cases[0].image,published[0].image);assert.equal(cases[1].name,'Alumni');assert.equal(manual[0].image,undefined);
});
