import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {renderTemplate} from '@/templates/registry';
import {readSnapshotPreviewBySlug} from '@/core/snapshot-preview';
import {HomeSite} from '@/app/home-site';
import {readPublishedHomeProjects} from '@/core/home-projects';
import type {RootSiteContent} from '@/core/root-site';

export const dynamic='force-dynamic';

type Props={params:Promise<{slug:string}>};

export const metadata:Metadata={
  title:{absolute:'Preview do snapshot — WebAppCap'},
  robots:{index:false,follow:false}
};

export default async function SnapshotPreviewPage({params}:Props){
  const {slug}=await params;
  const result=await readSnapshotPreviewBySlug(slug);
  if(!result)notFound();

  if(slug==='webappcap'&&result.project.templateKey==='platform-root-v1'){
    const content=Object.fromEntries(Object.entries(result.data.content||{}).filter(([,value])=>typeof value==='string')) as RootSiteContent;
    return <HomeSite content={content} publishedProjects={await readPublishedHomeProjects()} preview/>;
  }

  return renderTemplate({
    project:result.project,
    data:result.data,
    preview:true
  });
}
