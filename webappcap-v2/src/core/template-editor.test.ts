import test from 'node:test';
import assert from 'node:assert/strict';
import { editorForTemplate, editorSectionsForTemplate } from './template-editor.ts';

test('commerce complete exposes the full editor sequence', () => {
  const editor=editorForTemplate('commerce-main-1');
  assert.equal(editor?.mode,'complete');
  assert.deepEqual(editor?.sections.map(section=>section.key),['identity','navigation','news','highlights','menu','order','contact','social','about','appearance']);
});

test('commerce sales exposes only the lean sales sequence', () => {
  const editor=editorForTemplate('commerce-sales-1');
  assert.equal(editor?.mode,'sales');
  assert.deepEqual(editor?.sections.map(section=>section.key),['identity','menu','order','contact','appearance']);
});

test('retired commerce templates do not have editors', () => {
  assert.equal(editorForTemplate('commerce-night-1'),null);
  assert.equal(editorForTemplate('commerce-classic-1'),null);
  assert.deepEqual(editorSectionsForTemplate('commerce-night-1'),[]);
});
