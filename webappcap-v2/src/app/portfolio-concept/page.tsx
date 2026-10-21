import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {readSnapshotPreviewBySlug} from '@/core/snapshot-preview';
import {CapellariConcept} from './concept-client';

export const dynamic='force-dynamic';
export const revalidate=0;
export const metadata:Metadata={
  title:{absolute:'Gabriel Capellari · Referência visual'},
  description:'Referência visual multidisciplinar com os dados publicados de Gabriel Capellari.',
  robots:{index:false,follow:false}
};

export default async function CapellariConceptPage(){
  const published=await readSnapshotPreviewBySlug('capellari');
  if(!published||published.project.slug!=='capellari')notFound();
  return <CapellariConcept data={published.data} reference/>;
}
