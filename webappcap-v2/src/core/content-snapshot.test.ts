import test from 'node:test';
import assert from 'node:assert/strict';
import { mergeV2Section, normalizeV2Content, publicationFlags, selectedTemplateKey } from './content-snapshot.ts';

test('normalizes independent draft/public snapshots without sharing objects', () => {
  const draft = normalizeV2Content({ identity: { name: 'Novo nome' }, content: { hero_title: 'Rascunho' } });
  const live = normalizeV2Content({ identity: { name: 'Nome publicado' }, content: { hero_title: 'Publicado' } });
  draft.identity.name = 'Alterado novamente';
  assert.equal(live.identity.name, 'Nome publicado');
  assert.equal(live.content.hero_title, 'Publicado');
});

test('merge preserves untouched fields and allows explicit clearing', () => {
  const current = normalizeV2Content({ contact: { phone: '14999999999', local_business: 'Ibitinga', instagram: '@teste' } });
  const merged = mergeV2Section(current, 'contact', { phone: '', local_business: null });
  assert.deepEqual(merged, { phone: '', local_business: null, instagram: '@teste' });
});

test('preview template wins over currently published template', () => {
  assert.equal(selectedTemplateKey({ preview_template_key: 'commerce-night-1' }, 'commerce-main-1'), 'commerce-night-1');
  assert.equal(selectedTemplateKey({}, 'commerce-main-1'), 'commerce-main-1');
});

test('publication flags detect unpublished and pending draft changes', () => {
  assert.deepEqual(publicationFlags('2026-09-16T12:00:00.000Z', null), {
    hasPublished: false,
    hasPendingChanges: true,
    draftUpdatedAt: '2026-09-16T12:00:00.000Z',
    publishedAt: null,
  });
  assert.equal(publicationFlags('2026-09-16T12:01:00.000Z', '2026-09-16T12:00:00.000Z').hasPendingChanges, true);
  assert.equal(publicationFlags('2026-09-16T12:00:00.000Z', '2026-09-16T12:01:00.000Z').hasPendingChanges, false);
});
