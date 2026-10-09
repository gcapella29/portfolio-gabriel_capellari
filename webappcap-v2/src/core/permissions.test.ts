import test from 'node:test';
import assert from 'node:assert/strict';
import {can,normalizeRole} from './permissions.ts';

test('content editors can prepare drafts but cannot switch models or publish',()=>{
 assert.ok(can('editor','editContent'));assert.ok(can('editor','manageMedia'));
 for(const capability of ['editAppearance','chooseTemplate','publish','inviteMembers','manageDomain','manageProject'] as const)assert.equal(can('editor',capability),false);
 for(const capability of ['editContent','manageMedia','editAppearance','chooseTemplate','publish'] as const)assert.equal(can('viewer',capability),false);
 assert.ok(can('viewer','view'));
});

test('administrators can publish while ownership-only operations stay restricted',()=>{
 for(const capability of ['editContent','manageMedia','editAppearance','chooseTemplate','publish','inviteMembers'] as const){assert.ok(can('admin',capability));assert.ok(can('owner',capability));}
 assert.equal(can('admin','manageDomain'),false);assert.equal(can('admin','manageProject'),false);
 assert.ok(can('owner','manageDomain'));assert.ok(can('owner','manageProject'));
 assert.equal(normalizeRole('ADMIN'),'admin');assert.equal(normalizeRole('administrator'),null);assert.equal(normalizeRole(undefined),null);
});
