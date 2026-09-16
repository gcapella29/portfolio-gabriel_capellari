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

async function assertDecodableImage(file:File){
  const objectUrl=URL.createObjectURL(file);
  try{
    await new Promise<void>((resolve,reject)=>{
      const image=new window.Image();
      image.onload=()=>image.naturalWidth&&image.naturalHeight?resolve():reject(new Error('A imagem não possui dimensões válidas.'));
      image.onerror=()=>reject(new Error('O arquivo não pôde ser lido como imagem.'));
      image.src=objectUrl;
    });
  }finally{
    URL.revokeObjectURL(objectUrl);
  }
}

export async function uploadProjectImageDirect(projectId:string,file:File,slot:string):Promise<UploadedProjectImage>{
  const extension=imageExtensions[file.type];
  if(!extension)throw new Error('Formato não permitido. Use JPG, PNG, WebP ou GIF.');
  if(file.size>10*1024*1024)throw new Error('A imagem deve ter no máximo 10 MB.');
  await assertDecodableImage(file);
  const path=`${projectId}/${safeSlot(slot)}-${crypto.randomUUID()}.${extension}`;
  const supabase=createSupabaseBrowserClient();
  const result=await supabase.storage.from(bucket).upload(path,file,{contentType:file.type,cacheControl:'31536000',upsert:false});
  if(result.error)throw new Error(result.error.message||'Não foi possível enviar a imagem.');
  const publicResult=supabase.storage.from(bucket).getPublicUrl(path);
  return {path,url:publicResult.data.publicUrl};
}
