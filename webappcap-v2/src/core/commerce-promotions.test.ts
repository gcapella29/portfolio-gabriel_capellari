import test from 'node:test';
import assert from 'node:assert/strict';
import {commerceCategories,commerceLineTotal,commercePromo,commercePromoLabel} from './commerce-promotions.ts';

test('commerce categories preserve first appearance and ignore blanks',()=>{
 const products=[{category:'Pins para Crocs'},{category:'Adesivos'},{category:'Pins para Crocs'},{category:''}];
 assert.deepEqual(commerceCategories(products),['Pins para Crocs','Adesivos']);
});

test('bundle promotion charges bundles plus remaining units',()=>{
 const product={price:'R$ 24,00',promo_quantity:'2',promo_total:'R$ 40,00'};
 assert.deepEqual(commercePromo(product),{quantity:2,total:40});
 assert.equal(commerceLineTotal(product,1),24);
 assert.equal(commerceLineTotal(product,2),40);
 assert.equal(commerceLineTotal(product,3),64);
 assert.equal(commerceLineTotal(product,4),80);
 assert.equal(commercePromoLabel(product,value=>`R$ ${value.toFixed(2)}`),'1 por R$ 24.00 · 2 por R$ 40.00');
});

test('products without valid promotion keep regular pricing',()=>{
 assert.equal(commerceLineTotal({price:'R$ 18,00'},3),54);
 assert.equal(commerceLineTotal({price:'R$ 18,00',promo_quantity:'1',promo_total:'10'},2),36);
});

test('Brazilian thousands separators and decimal prices match server totals',()=>{
 assert.equal(commerceLineTotal({price:'R$ 1.234,56'},2),2469.12);
 assert.equal(commerceLineTotal({price:'1234.56'},1),1234.56);
 assert.equal(commerceLineTotal({price:'R$ 1.234,56',promo_quantity:2,promo_total:'R$ 2.000,00'},3),3234.56);
});

test('invalid promotion quantities cannot disagree with published SQL pricing',()=>{for(const promo_quantity of ['2.5','Infinity','2.0',3000000000])assert.equal(commercePromo({price:'24',promo_quantity,promo_total:'40'}),null);});
