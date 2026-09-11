import { notFound } from 'next/navigation';
import { readPublicSiteBySlug } from '@/core/public-site';
import { renderTemplate } from '@/templates/registry';

export default async function PublicSitePage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const result=await readPublicSiteBySlug(slug);
  if(!result)notFound();
  return renderTemplate({project:result.project,data:result.data});
}
