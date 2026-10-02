import test from 'node:test';
import assert from 'node:assert/strict';
import {createWindowRateLimiter} from './rate-limit.ts';

test('limits independent clients and resets exactly at the window boundary',()=>{
 const limited=createWindowRateLimiter(2,100,10);
 assert.equal(limited('a',0),false);
 assert.equal(limited('a',10),false);
 assert.equal(limited('a',99),true);
 assert.equal(limited('b',99),false);
 assert.equal(limited('a',100),false);
 assert.equal(limited('a',101),false);
 assert.equal(limited('a',102),true);
});
test('capacity cannot evict an active limit; expired clients free memory',()=>{
 const limited=createWindowRateLimiter(1,100,2);
 assert.equal(limited('a',0),false);
 assert.equal(limited('b',10),false);
 assert.equal(limited('c',20),true);
 assert.equal(limited('a',30),true);
 assert.equal(limited('c',100),false);
 assert.equal(limited('b',100),true);
 assert.equal(limited('d',110),false);
});
