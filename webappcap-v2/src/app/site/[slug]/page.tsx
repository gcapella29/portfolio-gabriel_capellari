import { notFound, permanentRedirect } from 'next/navigation';
import { readPublicSiteBySlug } from '@/core/public-site';

export default async function PublicSitePage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const result=await readPublicSiteBySlug(slug);
  if(!result)notFound();
  if(result.state.custom_domain&&result.state.domain_status==='active')permanentRedirect(`https://${result.state.custom_domain}`);
  permanentRedirect(`https://${result.state.native_subdomain||result.project.slug}.webappcap.com.br`);
}
