import {animatedImage} from './image-delivery.ts';

export async function optimizeImageUpload(bytes:Buffer,contentType:string,extension:string){
 const unchanged={bytes,contentType,extension};
 if(animatedImage(bytes,contentType))return unchanged;
 const {default:sharp}=await import('sharp');
 const image=sharp(bytes,{limitInputPixels:12000*12000});
 const metadata=await image.metadata();
 if(!metadata.width||!metadata.height||metadata.width>12000||metadata.height>12000)throw new Error('A imagem possui resolução excessiva. Use no máximo 12000 px por lado.');
 if((metadata.pages||1)>1)return unchanged;
 const optimized=await image.rotate().resize({width:2400,height:2400,fit:'inside',withoutEnlargement:true}).webp({quality:88}).toBuffer();
 return optimized.length<bytes.length?{bytes:optimized,contentType:'image/webp',extension:'webp'}:unchanged;
}
