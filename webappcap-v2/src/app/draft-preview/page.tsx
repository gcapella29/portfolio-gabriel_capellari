import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {renderTemplate} from '@/templates/registry';
import {readDraftPreview} from '@/core/draft-preview';

export const dynamic='force-dynamic';

type Props={
  searchParams:Promise<{
    file?:string;
    token?:string;
  }>;
};

export const metadata:Metadata={
  title:{absolute:'Preview do rascunho — WebAppCap'},
  robots:{index:false,follow:false}
};

export default async function DraftPreviewPage({searchParams}:Props){
  const {file='',token=''}=await searchParams;
  const result=await readDraftPreview(file,token);
  if(!result)notFound();

  return renderTemplate({
    project:result.project,
    data:result.data,
    preview:true
  });
}
