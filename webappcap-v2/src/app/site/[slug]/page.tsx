import { notFound, permanentRedirect } from 'next/navigation';
import { readPublicSiteBySlug } from '@/core/public-site';
import { renderTemplate } from '@/templates/registry';

export default async function PublicSitePage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const result=await readPublicSiteBySlug(slug);
  if(!result)notFound();
  if(result.state.custom_domain&&result.state.domain_status==='active')permanentRedirect(`https://${result.state.custom_domain}`);
  if(result.state.native_subdomain)permanentRedirect(`https://${result.state.native_subdomain}.webappcap.com.br`);
  return renderTemplate({project:result.project,data:result.data});
}
