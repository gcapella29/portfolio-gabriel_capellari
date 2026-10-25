import test from 'node:test';import assert from 'node:assert/strict';import sharp from 'sharp';
import {animatedImage,optimizableProjectImage} from './image-delivery.ts';
import {optimizeImageUpload} from './image-upload-optimization.ts';
const origin='https://owned.supabase.co';
test('delivery optimizes public raster files from configured storage and Drive thumbnails',()=>{
 assert.equal(optimizableProjectImage(`${origin}/storage/v1/object/public/bucket/a.png`,origin),true);
 assert.equal(optimizableProjectImage('https://drive.google.com/thumbnail?id=1QKpWWXBHR2gtByiJz1R6eGJQsQcF_7Sv&sz=w1600',origin),true);
 assert.equal(optimizableProjectImage('https://drive.google.com/thumbnail?id=1QKpWWXBHR2gtByiJz1R6eGJQsQcF_7Sv&sz=w1600',undefined),true);
 for(const src of [`${origin}/storage/v1/object/sign/b/a.png?token=secret`,`${origin}/storage/v1/object/public/b/a.svg`,`${origin}/storage/v1/object/public/b/a.gif`,'https://other.supabase.co/storage/v1/object/public/b/a.png','data:image/png;base64,abc','/assets/a.png',`${origin}/storage/v1/object/public/b/a.png?v=1`,`${origin}/storage/v1/object/public/b/a.png#x`,'https://drive.google.com/thumbnail?id=short','https://drive.google.com/file/d/1QKpWWXBHR2gtByiJz1R6eGJQsQcF_7Sv/view'])assert.equal(optimizableProjectImage(src,origin),false);
 assert.equal(optimizableProjectImage(`${origin}/storage/v1/object/public/b/a.jpg`,undefined),false);
});
test('animation detection parses chunks and ignores marker text inside pixel payloads',()=>{
 const png=(tag:string)=>{const b=Buffer.alloc(20);Buffer.from([137,80,78,71,13,10,26,10]).copy(b);b.write(tag,12);return b};
 assert.equal(animatedImage(png('acTL'),'image/png'),true);assert.equal(animatedImage(png('IDAT'),'image/png'),false);
 const webp=Buffer.alloc(20);webp.write('RIFF');webp.write('WEBPANIM',8);assert.equal(animatedImage(webp,'image/webp'),true);
 assert.equal(animatedImage(Buffer.from('GIF89a'),'image/gif'),true);
 assert.equal(animatedImage(Buffer.alloc(0),'image/png'),false);
});
test('uploads below the old 3 MB threshold are compressed without flattening transparency',async()=>{
 const input=await sharp({create:{width:1000,height:700,channels:4,background:{r:50,g:80,b:120,alpha:.4}}}).png().toBuffer();
 const output=await optimizeImageUpload(input,'image/png','png');assert.ok(output.bytes.length<=input.length);
 const meta=await sharp(output.bytes).metadata();assert.equal(meta.width,1000);assert.equal(meta.height,700);assert.equal(meta.hasAlpha,true);
});
test('large uploads preserve proportions, use at most 2400 px and do not enlarge small images',async()=>{
 const input=await sharp({create:{width:4800,height:2400,channels:3,background:'#123456'}}).png().toBuffer();
 const output=await optimizeImageUpload(input,'image/png','png');const meta=await sharp(output.bytes).metadata();assert.equal(meta.width,2400);assert.equal(meta.height,1200);
 const small=await sharp({create:{width:40,height:20,channels:3,background:'#123456'}}).png().toBuffer();const m=await sharp((await optimizeImageUpload(small,'image/png','png')).bytes).metadata();assert.equal(m.width,40);assert.equal(m.height,20);
});
test('animated GIF uploads retain their exact bytes and type',async()=>{
 const bytes=Buffer.from('GIF89a');assert.deepEqual(await optimizeImageUpload(bytes,'image/gif','gif'),{bytes,contentType:'image/gif',extension:'gif'});
});
