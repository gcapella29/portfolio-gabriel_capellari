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
