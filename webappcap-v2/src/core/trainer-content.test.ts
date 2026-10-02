import test from 'node:test';
import assert from 'node:assert/strict';
import {trainerData,trainerDefaults,trainerImage,trainerRows} from './trainer-content.ts';
import {segments} from './segments.ts';
import {editorForTemplate} from './template-editor.ts';
test('Trainer starts from independent data and cannot share arrays across new projects',()=>{
 const first=trainerDefaults('A'),second=trainerDefaults('B');first.content.trainer_results[0].name='Mudou';assert.equal(second.content.trainer_results[0].name,'Marina, 34');
 assert.equal(first.appearance.preview_template_key,'personal-trainer-main-1');assert.equal(editorForTemplate('personal-trainer-main-1')?.mode,'trainer');assert.equal(segments['personal-trainer'].templates[0].status,'ready');
});
test('Agenda changes all CTA copies consistently and explicit empty collections remain empty',()=>{
 const model=trainerData({trainer_agenda:'fechada',trainer_main_fechada_btn:'Lista de espera',trainer_results:[],faq:[]});assert.equal(model.agenda,'fechada');assert.equal(model.states[model.agenda].btn,'Lista de espera');assert.equal(model.lists.trainer_results.length,0);assert.equal(model.lists.faq.length,0);assert.equal(trainerData({trainer_agenda:'invalid'}).agenda,'aberta');
});
test('Trainer media rejects executable URLs and preserves framing for before/after editing',()=>{
 assert.equal(trainerImage('javascript:alert(1)'),'');assert.equal(trainerImage('//evil.example/img'),'');assert.equal(trainerImage('data:text/html,hello'),'');
 const rows=trainerRows([{name:'Aluno',before:{url:'https://example.com/a.jpg',position:'20% 80%',fit:'contain',zoom:120},after:'/image.jpg'},null], 'trainer_results');assert.equal(rows.length,1);assert.equal(rows[0].before,'https://example.com/a.jpg');assert.equal(rows[0].before_position,'20% 80%');assert.equal(rows[0].before_zoom,'120');
});
test('Modalities accept an optional audience without requiring migration of existing content',()=>{
 const rows=trainerRows([{title:'Online',description:'Plano individual',features:'Suporte',audience:'Quem treina em casa'},{title:'Presencial'}], 'trainer_modes');
 assert.equal(rows[0].audience,'Quem treina em casa');assert.equal(rows[1].audience,'');assert.equal(rows[1].title,'Presencial');
});
