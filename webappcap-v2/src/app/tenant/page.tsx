import { notFound } from 'next/navigation';
import { readPublicSiteByHost } from '@/core/public-site';
import { renderTemplate } from '@/templates/registry';

export const dynamic='force-dynamic';

export default async function TenantPage({searchParams}:{searchParams:Promise<{host?:string}>}){
  const {host}=await searchParams;
  if(!host)notFound();
  const result=await readPublicSiteByHost(host);
  if(!result)notFound();
  return renderTemplate({project:result.project,data:result.data});
}
