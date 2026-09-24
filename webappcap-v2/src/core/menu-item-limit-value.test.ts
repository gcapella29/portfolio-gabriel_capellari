import test from 'node:test';
import assert from 'node:assert/strict';
import {parseMenuItemLimit,validatedMenuItems} from './menu-item-limit-value.ts';

test('uses the project limit and falls back safely for absent or invalid values',()=>{
 assert.equal(parseMenuItemLimit(200),200);
 assert.equal(parseMenuItemLimit('120'),120);
 for(const value of [undefined,null,0,-1,2.5,'',1000])assert.equal(parseMenuItemLimit(value),80);
});

test('does not silently truncate products and preserves an existing catalog after a limit reduction',()=>{
 const items=Array.from({length:81},(_,index)=>({title:`Produto ${index}`}));
 assert.throws(()=>validatedMenuItems(items,80,80),/limite de 80/);
 assert.equal(validatedMenuItems(items,200,80).length,81);
 assert.equal(validatedMenuItems(items,80,81).length,81);
 assert.throws(()=>validatedMenuItems([...items,{title:'Novo'}],80,81),/limite de 80/);
});
