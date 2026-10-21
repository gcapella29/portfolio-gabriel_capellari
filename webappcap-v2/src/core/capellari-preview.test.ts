import test from 'node:test';
import assert from 'node:assert/strict';
import {capellariMedia,capellariPreviewLayout,portfolioUrl,useDefaultCapellariCases} from './capellari-preview.ts';

const project={id:'PRJ-0002',slug:'capellari'};
const data={identity:{name:'Gabriel'},content:{hero_title:'Clássico',portfolio_concept_hero_title_pt:'Novo'},appearance:{preview_template_key:'portfolio-multidisciplinary-1'},contact:{},media:{hero:{url:'/classic.jpg'},portfolio_concept:{hero:{url:'/new.jpg'}}}};

test('explicit empty cases hide the cards while existing publications retain defaults',()=>{
  assert.equal(useDefaultCapellariCases({}),true);
  assert.equal(useDefaultCapellariCases({portfolio_concept_cases:[]}),true);
  assert.equal(useDefaultCapellariCases({portfolio_concept_cases:[],portfolio_concept_cases_configured:true}),false);
  assert.equal(useDefaultCapellariCases({portfolio_concept_cases:[{name:'Custom'}]}),false);
});

test('preview switches both layouts without changing Owner sections or selection',()=>{
  const before=structuredClone(data);
  const classic=capellariPreviewLayout(project,data,'classic')!;
  assert.equal(classic.templateKey,'portfolio-legacy-1');
  assert.equal(classic.data.content.hero_title,'Clássico');
  assert.equal(capellariPreviewLayout(project,classic.data,'multidisciplinary')?.templateKey,'portfolio-multidisciplinary-1');
  assert.deepEqual(data,before);
});

test('layout overrides are exclusive to Capellari and supported portfolio models',()=>{
  assert.equal(capellariPreviewLayout({id:'PRJ-0004',slug:'vet-se'},data,'multidisciplinary'),null);
  assert.equal(capellariPreviewLayout({...project,id:'other'},data,'classic'),null);
  assert.equal(capellariPreviewLayout(project,{...data,appearance:{preview_template_key:'commerce-main-1'}},'classic'),null);
  assert.equal(capellariPreviewLayout(project,data,'invalid')?.templateKey,'portfolio-multidisciplinary-1');
});

test('new media overrides preserve classic images and inherit unspecified slots',()=>{
  const before=structuredClone(data);
  assert.deepEqual(capellariMedia(data).hero,{url:'/new.jpg'});
  assert.deepEqual(capellariMedia({...data,media:{hero:data.media.hero}}).hero,{url:'/classic.jpg'});
  assert.deepEqual(data,before);
});

test('Owner links only allow web URLs, local assets and anchors',()=>{
  for(const value of ['javascript:alert(1)','data:text/html,test','//other.test','file:///test',{}])assert.equal(portfolioUrl(value),'');
  for(const value of ['https://example.com','/assets/photo.jpg','#contato'])assert.equal(portfolioUrl(value),value);
});
