import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';import {createHash} from 'node:crypto';
const root=new URL('../../',import.meta.url),fonts=new URL('public/fonts/',root);
test('vendored fonts retain their checked binary assets',()=>{
 const manifest=JSON.parse(readFileSync(new URL('manifest.json',fonts),'utf8')) as {sha256:Record<string,string>};
 assert.ok(Object.keys(manifest.sha256).length>0);
 for(const [file,digest] of Object.entries(manifest.sha256))assert.equal(createHash('sha256').update(readFileSync(new URL(file,fonts))).digest('hex'),digest,file);
});
test('font stylesheets resolve local assets and retain swap behavior',()=>{
 const files=[new URL('src/fonts/fonts.css',root),...readdirSync(fonts).filter(file=>file.endsWith('.css')).map(file=>new URL(file,fonts))];
 for(const file of files){
  const css=readFileSync(file,'utf8');assert.equal(/https?:\/\//.test(css),false,file.pathname);assert.match(css,/font-display:\s*swap/);
  for(const match of css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g))if(match[1].startsWith('/fonts/'))assert.ok(readFileSync(new URL('public'+match[1],root)).length>0);
 }
});
