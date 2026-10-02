import test from 'node:test';
import assert from 'node:assert/strict';
import {imageEditorFrame} from './image-editor-frame.ts';

test('framing follows the selected template rather than forcing every photo to portrait',()=>{
 assert.equal(imageEditorFrame('personal-trainer-main-1','hero').previewAspectRatio,'4 / 5');
 assert.equal(imageEditorFrame('commerce-main-1','hero').previewAspectRatio,'1440 / 360');
 assert.equal(imageEditorFrame('commerce-modern-1','product').previewAspectRatio,'1 / 1');
 assert.equal(imageEditorFrame('commerce-main-1','product').previewAspectRatio,'1.18 / 1');
});

test('independent media slots retain their proportions with a bounded editor width',()=>{
 assert.equal(imageEditorFrame('portfolio-legacy-1','about').previewAspectRatio,'4 / 5');
 assert.equal(imageEditorFrame('portfolio-legacy-1','contact').previewAspectRatio,'16 / 10');
 assert.equal(imageEditorFrame('personal-trainer-main-1','before').previewMaxWidth,420);
 assert.equal(imageEditorFrame('commerce-main-1','creator').previewAspectRatio,'1 / 1');
});
