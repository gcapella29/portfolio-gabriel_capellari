export function optimizableProjectImage(src:string,storageUrl:string|undefined){
 if(!storageUrl)return false;
 try{
  const url=new URL(src),origin=new URL(storageUrl);
  return url.protocol==='https:'&&url.origin===origin.origin&&!url.username&&!url.password&&!url.search&&!url.hash&&url.pathname.startsWith('/storage/v1/object/public/')&&/\.(?:jpe?g|png|webp)$/i.test(url.pathname);
 }catch{return false}
}

// Never flatten GIF, APNG or animated WebP during upload optimization.
export function animatedImage(bytes:Uint8Array,type:string){
 if(type==='image/gif')return true;
 const marker=type==='image/png'?'acTL':type==='image/webp'?'ANIM':'';
 if(!marker)return false;
 // Parse container chunks rather than searching compressed image pixels.
 const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 let offset=type==='image/png'?8:12;
 while(offset+8<=bytes.length){
  const size=view.getUint32(offset,type==='image/webp');
  const name=String.fromCharCode(...bytes.subarray(offset+4,offset+8));
  // WebP chunks store the tag before their size.
  const tag=type==='image/webp'?String.fromCharCode(...bytes.subarray(offset,offset+4)):name;
  if(tag===marker)return true;
  const length=type==='image/webp'?view.getUint32(offset+4,true):size;
  const next=offset+8+length+(type==='image/png'?4:length%2);
  if(next<=offset||next>bytes.length)break;
  offset=next;
 }
 return false;
}
