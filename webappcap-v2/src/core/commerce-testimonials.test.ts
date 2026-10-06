import test from 'node:test';
import assert from 'node:assert/strict';
import {buyerTestimonialPatch,visibleBuyerTestimonials,testimonialImageUrl} from './commerce-testimonials.ts';
const mediaUrl=(path:string)=>`https://example.supabase.co/storage/v1/object/public/webappcap-v2-sites/${path}`;
const options={projectId:'project',manageMedia:true,mediaUrl};
const first={id:'first',name:'Ana',role:'Ecobag',text:'Adorei!',enabled:true,image:''};
const form=(rows:unknown)=>{const f=new FormData();f.set('section:testimonials',JSON.stringify(rows));return f};
test('empty, hidden, disabled and incomplete reviews are absent from every commerce renderer',()=>{
 assert.deepEqual(visibleBuyerTestimonials({}),[]);
 assert.deepEqual(visibleBuyerTestimonials({show_testimonials:false,testimonials:[first]}),[]);
 assert.deepEqual(visibleBuyerTestimonials({testimonials:[{...first,enabled:'false'},{...first,name:''},{...first,text:''}]}),[]);
 assert.equal(visibleBuyerTestimonials({testimonials:[{...first,image:mediaUrl('project/feedback.webp')}]}).length,1);
});
test('screenshots are accepted without name, product or text; unsupported image URL schemes are excluded',()=>{
 const image=mediaUrl('project/feedback.webp');assert.equal(visibleBuyerTestimonials({testimonials:[{...first,name:'',role:'',text:'',image}]}).length,1);
 for(const src of ['javascript:alert(1)','data:image/svg+xml,test','//external.example/img'])assert.equal(testimonialImageUrl(src),'');
 const f=form([{...first,name:'',role:'',text:''}]);f.set('uploadedMedia:testimonial-first',JSON.stringify({path:'project/feedback.webp',url:image}));
 const saved=buyerTestimonialPatch(f,[],options)!;assert.equal(testimonialImageUrl(saved[0].image),image);
});
test('reordering retains images by stable ID; deleting rows persists and empty prints are rejected',()=>{
 const image={url:mediaUrl('project/feedback.webp'),path:'project/feedback.webp'};
 const a={...first,image},b={...first,id:'second',name:'Bia',image:{url:mediaUrl('project/second.webp')}};
 const f=form([b,a]);assert.equal(testimonialImageUrl(buyerTestimonialPatch(f,[a,b],options)![1].image),image.url);
 f.set('removeMedia:testimonial-first','yes');assert.throws(()=>buyerTestimonialPatch(f,[a,b],options),/Envie um print/);
 assert.deepEqual(buyerTestimonialPatch(form([]),[a,b],options),[]);
 assert.equal(buyerTestimonialPatch(new FormData(),[a,b],options),undefined);
});
test('rejects foreign uploads, path traversal, forged existing images and denied media writes',()=>{
 for(const path of ['another/photo.webp','project/../another/photo.webp','project//photo.webp','project/%2e%2e/another/photo.webp']){
  const f=form([first]);f.set('uploadedMedia:testimonial-first',JSON.stringify({path,url:mediaUrl(path)}));assert.throws(()=>buyerTestimonialPatch(f,[],options));
 }
 const f=form([first]);f.set('uploadedMedia:testimonial-first',JSON.stringify({path:'project/photo.webp',url:'https://attacker.example/photo.webp'}));assert.throws(()=>buyerTestimonialPatch(f,[],options));
 assert.throws(()=>buyerTestimonialPatch(form([{...first,image:mediaUrl('project/forged.webp')}]),[],options));
 f.set('uploadedMedia:testimonial-first',JSON.stringify({path:'project/photo.webp',url:mediaUrl('project/photo.webp')}));assert.throws(()=>buyerTestimonialPatch(f,[],{...options,manageMedia:false}));
 const existing={...first,image:mediaUrl('project/existing.webp')};assert.equal(testimonialImageUrl(buyerTestimonialPatch(form([existing]),[existing],{...options,manageMedia:false})![0].image),existing.image);
});
test('rejects invalid, duplicate, excessive and unfinished rows before saving',()=>{
 for(const rows of [{},[null],[[]],[first,first],Array.from({length:31},(_,i)=>({...first,id:`row-${i}`})),[{...first,name:''}],[{...first,text:''}]])assert.throws(()=>buyerTestimonialPatch(form(rows),[],options));
 const f=new FormData();f.set('section:testimonials','bad json');assert.throws(()=>buyerTestimonialPatch(f,[],options));
});
