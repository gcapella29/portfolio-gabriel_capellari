import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {renderTemplate} from '@/templates/registry';
import {readSnapshotPreviewBySlug} from '@/core/snapshot-preview';

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

  return renderTemplate({
    project:result.project,
    data:result.data,
    preview:true
  });
}
