import test from 'node:test';
import assert from 'node:assert/strict';
import {imageMediaStyle,imagePlacement,movedImagePosition,normalizeImagePosition} from './image-placement.ts';

test('existing crops retain their focal point until explicitly moved',()=>{
 for(const p of ['top','center','bottom','left','right','20% 80%'])assert.equal(normalizeImagePosition(p),p);
 assert.deepEqual(imagePlacement('20% 80%'),{position:'20% 80%',x:0,y:0});
 assert.equal(movedImagePosition('20% 80%',12,-8),'pan(12,-8)|20% 80%');
});
test('placement uses independent proportional translation at every zoom',()=>{
 for(const zoom of [50,100,200]){
 const style=imageMediaStyle({position:'pan(-25,30)|20% 80%',zoom,fit:'contain'});
 assert.equal(style.translate,'-25% 30%');assert.equal(style.objectPosition,'20% 80%');assert.equal(style.transform,`scale(${zoom/100})`);
 }
});
test('untrusted placement cannot inject CSS and movement is bounded',()=>{
 assert.equal(normalizeImagePosition('url(javascript:alert(1))'),'center');
 assert.equal(normalizeImagePosition('pan(Infinity,NaN)|center'),'center');
 assert.equal(normalizeImagePosition('pan(500,-500)|top'),'pan(100,-100)|top');
 assert.equal(normalizeImagePosition('pan(1,2)|url(evil)'),'pan(1,2)|center');
 assert.equal(normalizeImagePosition('100.5% 20%'),'center');
});
