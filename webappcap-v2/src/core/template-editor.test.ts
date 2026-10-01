import test from 'node:test';
import assert from 'node:assert/strict';
import { editorForTemplate, editorSectionsForTemplate } from './template-editor.ts';
import {getTemplate,segments} from './segments.ts';
import {initialTemplateForSegment,projectDefaultsForTemplate} from './template-defaults.ts';

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

test('Loja Digital and Comércio keep separate template choices', () => {
  assert.deepEqual(segments['food-business'].templates.map(item=>item.key),['commerce-main-1','commerce-modern-1','commerce-sales-1']);
  assert.deepEqual(segments.commerce.templates.map(item=>item.key),['commerce-bakery-1']);
  assert.equal(getTemplate('food-business','commerce-bakery-1'),null);
  assert.equal(getTemplate('commerce','commerce-main-1'),null);
  assert.equal(initialTemplateForSegment('commerce'),'commerce-bakery-1');
});

test('Modern has a compatible editor with shared catalog and contact',()=>{assert.deepEqual(editorSectionsForTemplate('commerce-modern-1').map(section=>section.key),['identity','highlights','menu','order','contact','about']);});

test('Modern defaults retain its chosen draft template',()=>{assert.equal(projectDefaultsForTemplate('commerce-modern-1','Loja').appearance?.preview_template_key,'commerce-modern-1');});
