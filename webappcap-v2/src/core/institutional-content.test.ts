import test from 'node:test';
import assert from 'node:assert/strict';
import {
  institutionalInstagram,
  institutionalDefaults,
  institutionalData,
  institutionalRows,
  institutionalImage,
  campaignProgress,
} from './institutional-content.ts';
import {editorForTemplate} from './template-editor.ts';
import {segments} from './segments.ts';
test('institutional defaults are independent and do not seed real contact destinations', () => {
  const a = institutionalDefaults('A'),
    b = institutionalDefaults('B');
  a.content.institutional_projects[0].title = 'Changed';
  assert.notEqual(b.content.institutional_projects[0].title, 'Changed');
  assert.equal(a.contact.whatsapp, '');
  assert.equal(a.contact.pix, '');
  assert.equal(a.appearance.preview_template_key, 'institutional-main-1');
  assert.equal(
    editorForTemplate('institutional-main-1')?.mode,
    'institutional',
  );
  assert.equal(segments.institutional.templates[0].status, 'ready');
});
test('empty existing projects remain empty and template copy changes are isolated', () => {
  const model = institutionalData({
    institutional_demo: false,
    institutional_main_nav_history: 'Nossa trajetória',
  });
  assert.equal(model.lists.institutional_projects.length, 0);
  assert.equal(model.lists.institutional_albums.length, 0);
  assert.equal(model.demo, false);
  assert.equal(model.copy.institutional_main_nav_history, 'Nossa trajetória');
});
test('unsafe media URLs and invalid albums are excluded while framing survives', () => {
  for (const value of [
    'javascript:alert(1)',
    '//evil.example/a.jpg',
    'data:text/html,test',
    'https://example.com\\@evil/a',
  ])
    assert.equal(institutionalImage(value), '');
  const photo = {
    url: 'https://example.com/a.jpg',
    position: '20% 80%',
    zoom: 120,
  };
  const [album] = institutionalRows(
    [{id: 'a', photos: [photo, 'javascript:evil', null], count: 999}],
    'institutional_albums',
  );
  assert.deepEqual(album.photos, [photo]);
  assert.equal(album.count, 30);
});
test('campaign progress bounds visual and accessible values and handles nonfinite inputs', () => {
  assert.deepEqual(campaignProgress({id: 'a', goal: 100, raised: 150}), {
    goal: 100,
    raised: 150,
    value: 100,
    percent: 100,
  });
  assert.deepEqual(campaignProgress({id: 'a', goal: 'NaN', raised: -20}), {
    goal: 0,
    raised: 0,
    value: 0,
    percent: 0,
  });
  assert.equal(
    campaignProgress({id: 'a', goal: Infinity, raised: 4}).percent,
    0,
  );
});
test('stable IDs survive list reordering and malformed rows are ignored', () => {
  const rows = institutionalRows(
    [{id: 'second', name: 'B'}, null, {id: 'first', name: 'A'}],
    'institutional_current_board',
  );
  assert.deepEqual(
    rows.map((row) => row.id),
    ['second', 'first'],
  );
  assert.equal(
    new Set(
      institutionalRows(
        [{id: 'same'}, {id: 'same'}],
        'institutional_current_members',
      ).map((row) => row.id),
    ).size,
    2,
  );
});

test('individual Instagram accepts handles and Instagram URLs without external destinations', () => {
  assert.equal(
    institutionalInstagram('@gabriel.capellari'),
    'https://www.instagram.com/gabriel.capellari/',
  );
  assert.equal(
    institutionalInstagram('https://instagram.com/gabriel/'),
    'https://instagram.com/gabriel/',
  );
  for (const value of [
    'javascript:alert(1)',
    'https://evil.example/person',
    'https://instagram.com.evil.example/person',
    'https://user:pass@instagram.com/person',
    '',
  ])
    assert.equal(institutionalInstagram(value), '');
  assert.equal(
    institutionalRows(
      [{id: 'p', name: 'Pessoa', instagram: '@pessoa'}],
      'institutional_current_members',
    )[0].instagram,
    '@pessoa',
  );
});

test('block visibility defaults to active and accepts stored boolean or legacy strings',()=>{
 const active=institutionalData({}).visible;
 assert.ok(Object.values(active).every(Boolean));
 const hidden=institutionalData({institutional_visible_projetos:false,institutional_visible_gestao:'false',institutional_visible_hero:true}).visible;
 assert.equal(hidden.projetos,false);assert.equal(hidden.gestao,false);assert.equal(hidden.hero,true);assert.equal(hidden.contato,true);
});
