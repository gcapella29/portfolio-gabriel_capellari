import test from 'node:test';
import assert from 'node:assert/strict';
import {capellariMedia,capellariPreviewLayout,portfolioUrl,useDefaultCapellariCases,portfolioCv,capellariMarquee,CAPELLARI_CV_LINKS} from './capellari-preview.ts';

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

test('curriculum matches the language and preserves the legacy fallback',()=>{
  const contact={cv:'/old.pdf',cv_pt:'https://example.test/pt.pdf',cv_en:'https://example.test/en.pdf'};
  const before=structuredClone(contact);
  assert.equal(portfolioCv(contact,'pt'),contact.cv_pt);
  assert.equal(portfolioCv(contact,'en'),contact.cv_en);
  assert.equal(portfolioCv({cv:'/old.pdf',cv_pt:'/pt.pdf'},'en'),'/old.pdf');
  assert.deepEqual(contact,before);
});
test('unsafe curriculum URLs cannot replace a safe fallback',()=>{
  assert.equal(portfolioCv({cv:'/old.pdf',cv_en:'javascript:alert(1)'},'en'),'/old.pdf');
  assert.equal(portfolioCv({},'pt','/default.pdf'),'/default.pdf');
  assert.equal(portfolioCv({cv:'//unsafe.test'},'en'),'#formacao');
});
test('yellow band has copy in both languages',()=>{
  assert.deepEqual(capellariMarquee('pt'),['NARRATIVAS','PRODUTOS DIGITAIS','PESQUISA','DADOS E AUTOMAÇÃO','EDUCAÇÃO']);
  assert.deepEqual(capellariMarquee('en'),['STORYTELLING','DIGITAL PRODUCTS','RESEARCH','DATA & AUTOMATION','EDUCATION']);
});

test('Capellari defaults use the chosen PDFs and allow a saved language override',()=>{
  const legacy={cv:'/old.pdf'};
  assert.equal(portfolioCv(legacy,'pt','#formacao',CAPELLARI_CV_LINKS),CAPELLARI_CV_LINKS.pt);
  assert.equal(portfolioCv(legacy,'en','#formacao',CAPELLARI_CV_LINKS),CAPELLARI_CV_LINKS.en);
  assert.equal(portfolioCv({...legacy,cv_en:'/custom-en.pdf'},'en','#formacao',CAPELLARI_CV_LINKS),'/custom-en.pdf');
  assert.equal(portfolioCv(legacy,'pt'),'/old.pdf');
});
