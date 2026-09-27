'use client';

import {createSupabaseBrowserClient} from './browser';

export type UploadedProjectImage={path:string;url:string};

const bucket='webappcap-v2-sites';
const imageExtensions:Record<string,string>={
  'image/jpeg':'jpg',
  'image/png':'png',
  'image/webp':'webp',
  'image/gif':'gif'
};

function safeSlot(value:string){
  return value.replace(/[^a-z0-9-]/gi,'-').toLowerCase().slice(0,50)||'image';
}

type ImageDimensions={width:number;height:number};

async function readImageDimensions(file:File):Promise<ImageDimensions>{
  const objectUrl=URL.createObjectURL(file);
  try{
    return await new Promise<ImageDimensions>((resolve,reject)=>{
      const image=new window.Image();
      image.onload=()=>image.naturalWidth&&image.naturalHeight
        ?resolve({width:image.naturalWidth,height:image.naturalHeight})
        :reject(new Error('A imagem não possui dimensões válidas.'));
      image.onerror=()=>reject(new Error('O arquivo não pôde ser lido como imagem.'));
      image.src=objectUrl;
    });
  }finally{
    URL.revokeObjectURL(objectUrl);
  }
}

async function optimizeStaticImage(file:File,dimensions:ImageDimensions):Promise<File>{
  // GIFs may be animated; drawing them to canvas would silently discard frames.
  if(file.type==='image/gif')return file;

  const maxSide=2400;
  const scale=Math.min(1,maxSide/Math.max(dimensions.width,dimensions.height));
  const shouldResize=scale<1;
  const shouldCompress=file.size>3*1024*1024;
  if(!shouldResize&&!shouldCompress)return file;

  const objectUrl=URL.createObjectURL(file);
  try{
    const image=await new Promise<HTMLImageElement>((resolve,reject)=>{
      const element=new window.Image();
      element.onload=()=>resolve(element);
      element.onerror=()=>reject(new Error('Não foi possível preparar a imagem para otimização.'));
      element.src=objectUrl;
    });
    const width=Math.max(1,Math.round(dimensions.width*scale));
    const height=Math.max(1,Math.round(dimensions.height*scale));
    const canvas=document.createElement('canvas');
    canvas.width=width;
    canvas.height=height;
    const context=canvas.getContext('2d',{alpha:file.type==='image/png'});
    if(!context)return file;
    context.drawImage(image,0,0,width,height);

    const quality=file.type==='image/png'?undefined:.88;
    const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,file.type,quality));
    if(!blob||blob.size>=file.size)return file;
    return new File([blob],file.name,{type:file.type,lastModified:file.lastModified});
  }finally{
    URL.revokeObjectURL(objectUrl);
  }
}

export async function uploadProjectImageDirect(projectId:string,file:File,slot:string):Promise<UploadedProjectImage>{
  const extension=imageExtensions[file.type];
  if(!extension)throw new Error('Formato não permitido. Use JPG, PNG, WebP ou GIF.');
  if(file.size>10*1024*1024)throw new Error('A imagem deve ter no máximo 10 MB.');
  const dimensions=await readImageDimensions(file);
  if(dimensions.width>12000||dimensions.height>12000)throw new Error('A imagem possui resolução excessiva. Use no máximo 12000 px por lado.');
  const prepared=await optimizeStaticImage(file,dimensions);
  const path=`${projectId}/${safeSlot(slot)}-${crypto.randomUUID()}.${extension}`;
  const supabase=createSupabaseBrowserClient();
  const result=await supabase.storage.from(bucket).upload(path,prepared,{contentType:prepared.type,cacheControl:'31536000',upsert:false});
  if(result.error)throw new Error(result.error.message||'Não foi possível enviar a imagem.');
  const publicResult=supabase.storage.from(bucket).getPublicUrl(path);
  return {path,url:publicResult.data.publicUrl};
}
