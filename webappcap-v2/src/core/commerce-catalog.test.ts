import test from 'node:test';
import assert from 'node:assert/strict';
import {activeCommerceProducts,restoreModernCart} from './commerce-catalog.ts';
import {parseCommerceOrderItems} from './commerce-order-input.ts';

test('inactive and malformed catalog rows do not shift published order references',()=>{
 const catalog=[{title:'Off',active:false},null,{title:'A'},[],{title:'B',active:'false'},{title:'C'}];
 assert.deepEqual(activeCommerceProducts(catalog).map(p=>[p.raw.title,p.productIndex]),[['A',2],['C',5]]);
});
test('cart restoration rejects old or reordered catalog references and corrupt quantities',()=>{
 const ids=new Set([1,3]);
 assert.deepEqual(restoreModernCart({1:2},'new',ids),{});
 assert.deepEqual(restoreModernCart({signature:'old',items:{1:2}},'new',ids),{});
 assert.deepEqual(restoreModernCart({signature:'new',items:{1:2,3:999,4:1}},'new',ids),{'1':2,'3':999});
 for(const quantity of [-1,0,1.5,1000,'2',null,NaN,Infinity])assert.deepEqual(restoreModernCart({signature:'new',items:{1:quantity}},'new',ids),{});
 for(const value of [null,[],true,'broken'])assert.deepEqual(restoreModernCart(value,'new',ids),{});
});
test('orders preserve all references or reject the entire payload',()=>{
 assert.deepEqual(parseCommerceOrderItems([{productIndex:3,quantity:2}]),[{productIndex:3,quantity:2}]);
 for(const value of [null,[],[{productIndex:null,quantity:1}],[{productIndex:1.2,quantity:1}],[{productIndex:1,quantity:1000}],[{productIndex:'1',quantity:1}],[{productIndex:1,quantity:1},{productIndex:1,quantity:2}],[{productIndex:1,quantity:1},null]])assert.equal(parseCommerceOrderItems(value),null);
 assert.equal(parseCommerceOrderItems(Array.from({length:81},(_,productIndex)=>({productIndex,quantity:1})))?.length,81);
 assert.equal(parseCommerceOrderItems(Array.from({length:1001},(_,productIndex)=>({productIndex,quantity:1}))),null);
});
