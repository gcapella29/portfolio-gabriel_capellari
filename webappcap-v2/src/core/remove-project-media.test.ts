import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { removeProjectMedia } from './remove-project-media.ts';

test('archive deletion policies accept valid project UUIDs and reject malformed prefixes', () => {
  for (const migration of ['022_permanent_archived_project_delete.sql', '025_fix_archived_project_media_delete.sql']) {
    const sql = readFileSync(new URL(`../../supabase/migrations/${migration}`, import.meta.url), 'utf8');
    const expression = sql.match(/~\* '([^']+)'/);
    assert.ok(expression);
    const uuid = new RegExp(expression[1], 'i');
    assert.ok(uuid.test('dbc64758-ad37-45b1-abfe-accbd18479e3'));
    assert.ok(!uuid.test('dbc64758-ad37-45b1-aaccbd18479e3'));
    assert.ok(!uuid.test('../dbc64758-ad37-45b1-abfe-accbd18479e3'));
  }
});

test('stops immediately when Storage silently retains deleted files', async () => {
  let listings = 0, removals = 0;
  await assert.rejects(removeProjectMedia(async () => { listings++; return ['project/photo']; }, async () => { removals++; }), /migração 025/);
  assert.equal(listings, 2);
  assert.equal(removals, 1);
});

test('removes multiple pages in batches and verifies empty storage', async () => {
  let paths = Array.from({ length: 1005 }, (_, i) => `project/${i}`);
  const sizes: number[] = [];
  await removeProjectMedia(async () => paths.slice(0, 1000), async batch => {
    sizes.push(batch.length);
    paths = paths.filter(path => !batch.includes(path));
  });
  assert.equal(paths.length, 0);
  assert.equal(sizes.length, 11);
  assert.ok(sizes.every(size => size <= 100));
});

test('propagates Storage failures without further requests', async () => {
  await assert.rejects(removeProjectMedia(async () => ['project/photo'], async () => { throw new Error('Storage unavailable'); }), /Storage unavailable/);
});
