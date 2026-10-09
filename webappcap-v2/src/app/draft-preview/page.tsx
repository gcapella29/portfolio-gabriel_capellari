import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {renderTemplate} from '@/templates/registry';
import {readDraftPreview} from '@/core/draft-preview';
import {HomeSite} from '@/app/home-site';
import {readPublishedHomeProjects} from '@/core/home-projects';
import type {RootSiteContent} from '@/core/root-site';

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

  if(result.project.slug==='webappcap'&&result.project.templateKey==='platform-root-v1'){
    const content=Object.fromEntries(Object.entries(result.data.content||{}).filter(([,value])=>typeof value==='string')) as RootSiteContent;
    return <HomeSite content={content} publishedProjects={await readPublishedHomeProjects()} preview/>;
  }

  return renderTemplate({
    project:result.project,
    data:result.data,
    preview:true
  });
}
